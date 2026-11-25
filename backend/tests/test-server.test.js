
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const request = require("supertest");

// Ambiente isolado para os testes
const testDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), "energysolutions-tests-")
);

process.env.ADMIN_EMAIL = "admin@test.local";
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync("TestPassword123!", 10);
process.env.JWT_SECRET = "test-secret-key-with-more-than-32-characters";
process.env.FRONTEND_ORIGINS = "http://localhost:5500";
process.env.CONTACTS_FILE = path.join(testDirectory, "dados.json");

const app = require("../server");

const email = "admin@test.local";
const senha = "TestPassword123!";

after(() => {
  fs.rmSync(testDirectory, { recursive: true, force: true });
});

test("GET /health deve retornar HTTP 200", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("API deve enviar cabeçalhos de segurança", async () => {
  const response = await request(app).get("/health");

  assert.ok(response.headers["x-content-type-options"]);
  assert.equal(response.headers["x-powered-by"], undefined);
});

test("CORS deve aceitar a origem autorizada", async () => {
  const response = await request(app)
    .get("/health")
    .set("Origin", "http://localhost:5500");

  assert.equal(
    response.headers["access-control-allow-origin"],
    "http://localhost:5500"
  );
});

test("CORS deve bloquear origem não autorizada", async () => {
  const response = await request(app)
    .get("/health")
    .set("Origin", "https://site-malicioso.example");

  assert.equal(response.status, 403);
});

test("POST /login deve autenticar administrador válido", async () => {
  const response = await request(app)
    .post("/login")
    .send({ email, senha });

  assert.equal(response.status, 200);
  assert.equal(response.body.autorizado, true);
  assert.ok(response.body.token);
});

test("POST /login deve rejeitar senha incorreta", async () => {
  const response = await request(app)
    .post("/login")
    .send({ email, senha: "SenhaErrada123!" });

  assert.equal(response.status, 401);
});

test("GET /contatos deve bloquear acesso sem token", async () => {
  const response = await request(app).get("/contatos");

  assert.equal(response.status, 401);
});

test("GET /contatos deve aceitar token válido", async () => {
  const login = await request(app)
    .post("/login")
    .send({ email, senha });

  const response = await request(app)
    .get("/contatos")
    .set("Authorization", `Bearer ${login.body.token}`);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

test("POST /contato deve aceitar formulário válido", async () => {
  const response = await request(app)
    .post("/contato")
    .send({
      nome: "Contato Automatizado",
      telefone: "61999999999",
      mensagem: "Teste automatizado."
    });

  assert.equal(response.status, 201);
});

test("POST /contato deve rejeitar formulário vazio", async () => {
  const response = await request(app)
    .post("/contato")
    .send({});

  assert.equal(response.status, 400);
});

test("Contato salvo deve ser recuperado com autenticação", async () => {
  const login = await request(app)
    .post("/login")
    .send({ email, senha });

  const response = await request(app)
    .get("/contatos")
    .set("Authorization", `Bearer ${login.body.token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].nome, "Contato Automatizado");
});

test("GET /contatos deve rejeitar token inválido", async () => {
  const response = await request(app)
    .get("/contatos")
    .set("Authorization", "Bearer token-invalido");

  assert.equal(response.status, 401);
});

test("GET /contatos deve rejeitar token adulterado", async () => {
  const login = await request(app)
    .post("/login")
    .send({ email, senha });

  const tokenAdulterado = login.body.token + "adulterado";

  const response = await request(app)
    .get("/contatos")
    .set("Authorization", `Bearer ${tokenAdulterado}`);

  assert.equal(response.status, 401);
});

test("POST /contato deve rejeitar nome acima de 100 caracteres", async () => {
  const response = await request(app)
    .post("/contato")
    .send({
      nome: "A".repeat(101),
      telefone: "61999999999",
      mensagem: "Teste de validação."
    });

  assert.equal(response.status, 400);
});

test("POST /contato deve preservar conteúdo HTML como texto", async () => {
  const conteudo = "<script>alert('teste')</script>";

  const envio = await request(app)
    .post("/contato")
    .send({
      nome: "Teste XSS",
      telefone: "61999999999",
      mensagem: conteudo
    });

  assert.equal(envio.status, 201);

  const login = await request(app)
    .post("/login")
    .send({ email, senha });

  const consulta = await request(app)
    .get("/contatos")
    .set("Authorization", `Bearer ${login.body.token}`);

  const contato = consulta.body.find(
    (item) => item.nome === "Teste XSS"
  );

  assert.ok(contato);
  assert.equal(contato.mensagem, conteudo);
});
test("POST /contato deve bloquear excesso de requisições", async () => {
  let bloqueio = false;

  for (let i = 0; i < 12; i++) {
    const response = await request(app)
      .post("/contato")
      .send({
        nome: "Teste Rate Limit",
        telefone: "61999999999",
        mensagem: "Teste automatizado."
      });

    if (response.status === 429) {
      bloqueio = true;
      break;
    }
  }

  assert.equal(bloqueio, true);
});

test("API deve rejeitar JSON inválido com HTTP 400", async () => {
  const response = await request(app)
    .post("/contato")
    .set("Content-Type", "application/json")
    .send('{"nome":');

  assert.equal(response.status, 400);
});

test("API deve rejeitar requisição acima de 10 KB com HTTP 413", async () => {
  const response = await request(app)
    .post("/contato")
    .set("Content-Type", "application/json")
    .send(JSON.stringify({
      nome: "Teste",
      telefone: "61999999999",
      mensagem: "A".repeat(12000)
    }));

  assert.equal(response.status, 413);
});
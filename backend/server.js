require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3001);
const DATA_FILE = path.join(__dirname, "dados.json");

const requiredEnv = ["ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "JWT_SECRET", "FRONTEND_ORIGINS"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres.");
}

const allowedOrigins = process.env.FRONTEND_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origem não autorizada pelo CORS."));
  }
}));
app.use(express.json({ limit: "10kb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." }
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitos envios. Tente novamente mais tarde." }
});

function readContacts() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const content = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeContacts(contacts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2), { mode: 0o600 });
}

function authenticateToken(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Autenticação necessária." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "energysolutions-api",
      audience: "energysolutions-admin"
    });
    return next();
  } catch {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/login", loginLimiter, async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.senha === "string" ? req.body.senha : "";

  if (!email || !password || email.length > 254 || password.length > 200) {
    return res.status(400).json({ error: "Informe email e senha válidos." });
  }

  const emailMatches = email === process.env.ADMIN_EMAIL.trim().toLowerCase();
  const passwordMatches = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ error: "Email ou senha inválidos." });
  }

  const token = jwt.sign(
    { sub: email, role: "admin" },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
      issuer: "energysolutions-api",
      audience: "energysolutions-admin"
    }
  );

  return res.json({ autorizado: true, token, expiresIn: 7200 });
});

// Rota pública do formulário: validação e limite de envios; não exige login do visitante.
app.post("/contato", contactLimiter, (req, res) => {
  const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
  const telefone = typeof req.body?.telefone === "string" ? req.body.telefone.trim() : "";
  const mensagem = typeof req.body?.mensagem === "string" ? req.body.mensagem.trim() : "";

  if (!nome || nome.length > 100 || !telefone || telefone.length > 30 || mensagem.length > 2000) {
    return res.status(400).json({ error: "Revise os campos do formulário." });
  }

  const contacts = readContacts();
  contacts.push({
    id: crypto.randomUUID(),
    nome,
    telefone,
    mensagem,
    data: new Date().toISOString()
  });

  try {
    writeContacts(contacts);
    return res.status(201).json({ message: "Contato enviado com sucesso." });
  } catch {
    return res.status(500).json({ error: "Não foi possível salvar o contato." });
  }
});

app.get("/contatos", authenticateToken, (_req, res) => {
  return res.json(readContacts());
});

app.use((err, _req, res, _next) => {
  if (err.message === "Origem não autorizada pelo CORS.") {
    return res.status(403).json({ error: "Origem não autorizada." });
  }
  return res.status(500).json({ error: "Erro interno do servidor." });
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EnergySolutions API ativa na porta ${PORT}`);
  });
}

module.exports = app;

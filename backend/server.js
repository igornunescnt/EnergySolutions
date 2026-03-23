const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// 👤 usuário fixo
const usuario = {
  email: "admin@email.com",
  senha: "123456"
};

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (email === usuario.email && senha === usuario.senha) {
    return res.json({ autorizado: true, token: "123" });
  }

  res.status(401).json({ autorizado: false });
});

// 📩 SALVAR CONTATO
app.post("/contato", (req, res) => {
  const { nome, telefone, mensagem } = req.body;

  const novo = {
    nome,
    telefone,
    mensagem,
    data: new Date()
  };

  fs.readFile("dados.json", "utf8", (err, data) => {
    let lista = [];

    try {
      lista = JSON.parse(data);
    } catch {}

    lista.push(novo);

    fs.writeFile("dados.json", JSON.stringify(lista, null, 2), () => {
      res.json({ message: "Salvo com sucesso!" });
    });
  });
});

// 📋 LISTAR CONTATOS (PROTEGIDO)
app.get("/contatos", (req, res) => {
  const token = req.headers.authorization;

  if (token !== "123") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  fs.readFile("dados.json", "utf8", (err, data) => {
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json([]);
    }
  });
});

// 🚀 START
app.listen(3001, () => {
  console.log("Rodando em http://localhost:3001");
});
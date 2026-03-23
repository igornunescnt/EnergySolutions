# ⚡ EnergySolutions: LANDING PAGE COM CAPTAÇÃO DE CLIENTES

Este projeto é um sistema completo com:
- Landing page profissional
- Formulário de contato funcional
- Backend com Node.js
- Armazenamento em JSON
- Painel administrativo com login

---

## 🚀 Tecnologias utilizadas

### Frontend
- HTML
- TailwindCSS
- JavaScript

### Backend
- Node.js
- Express
- CORS
- File System (fs)

---

## 📁 Estrutura do projeto


eletrica-system/
├── backend/
│ ├── server.js
│ └── dados.json
└── frontend/
├── index.html
├── login.html
└── painel.html


---

## 🔧 Como rodar o projeto

### 1. Clonar o repositório


git clone https://github.com/seu-usuario/eletrica-system.git


---

### 2. Rodar o backend


cd backend
npm install
node server.js


Servidor rodando em:
http://localhost:3001

---

### 3. Rodar o frontend

Abra o arquivo:


frontend/login.html


---

## 🔐 Acesso ao sistema


Email: admin@email.com

Senha: 123456


---

## 📩 Funcionalidades

- Cadastro de contatos via formulário
- Armazenamento em arquivo JSON
- Login de administrador
- Visualização dos contatos em painel
- Proteção de rotas com token simples

---

## 🌐 API

### 🔑 Login

POST /login


{
"email": "admin@email.com
",
"senha": "123456"
}


---

### 📩 Enviar contato

POST /contato


{
"nome": "teste",
"telefone": "61999999999",
"mensagem": "Preciso de instalação elétrica"
}


---

### 📋 Listar contatos

GET /contatos

Headers:

Authorization: 123


---

## ⚠️ Observações

- Este projeto utiliza autenticação simples (token fixo)
- Não é recomendado para produção sem melhorias de segurança

---

## 🚀 Melhorias futuras

- Autenticação com JWT
- Banco de dados (MongoDB)
- Envio de email automático
- Integração com WhatsApp
- Deploy completo

---

## 💰 Objetivo do projeto

Este sistema foi desenvolvido para:
- Aprendizado prático de fullstack
- Criação de portfólio profissional
- Base para venda de serviços web

---

## 👨‍💻 Autor

Ygor Vinícius Pereira Nunes  
Desenvolvedor Web 🚀
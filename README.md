# EnergySolutions

Sistema demonstrativo de captação de contatos para serviços elétricos, com landing page, API Node.js e painel administrativo.

> **Status de segurança:** a versão antiga utilizava credenciais e token fixos. Esta branch substitui essa implementação. Mantenha o serviço hospedado suspenso até configurar as variáveis de ambiente e validar os testes.

## Tecnologias

- Frontend: HTML, Tailwind CSS e JavaScript
- Backend: Node.js 20+, Express
- Segurança: bcryptjs, JWT, Helmet, CORS com allowlist e rate limiting
- Armazenamento atual: arquivo JSON local (apenas demonstração)

## Estrutura

```text
backend/
  server.js
  package.json
  .env.example
frontend/
  index.html
  login.html
  painel.html
.gitignore
```

## Configuração local

1. Instale Node.js 20 ou superior.
2. Entre em `backend/` e execute `npm install`.
3. Copie `.env.example` para `.env`.
4. Gere um hash bcrypt para a senha administrativa:

```bash
node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" "SUA_SENHA_FORTE"
```

5. Preencha `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET` e `FRONTEND_ORIGINS` no arquivo `.env`.
6. Gere um segredo JWT com:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

7. Inicie a API com `npm start`.

Nunca envie o arquivo `.env` ao GitHub.

## Variáveis de ambiente

| Variável | Finalidade |
|---|---|
| `PORT` | Porta fornecida pelo host (padrão local: 3001) |
| `ADMIN_EMAIL` | Email administrativo |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt da senha administrativa |
| `JWT_SECRET` | Segredo aleatório com pelo menos 32 caracteres |
| `FRONTEND_ORIGINS` | Origens autorizadas, separadas por vírgula |

No Render, configure essas variáveis em Environment. Não use os valores de exemplo como segredos reais.

## Endpoints

- `GET /health`: verificação de disponibilidade.
- `POST /login`: autentica o administrador e retorna JWT com validade de 2 horas.
- `POST /contato`: rota pública do formulário, com validação e limite de requisições.
- `GET /contatos`: rota administrativa protegida por `Authorization: Bearer <token>`.

## Limitações conhecidas

O arquivo JSON não é armazenamento adequado para produção e pode ser perdido em reinicializações ou novos deploys em hosts com filesystem efêmero. Antes de uso real, migre os contatos para PostgreSQL, implemente backup e monitore erros. O token no navegador usa localStorage; uma arquitetura de produção deve preferir cookie Secure, HttpOnly e SameSite com proteção CSRF.

## Segurança

- Não existem credenciais padrão documentadas.
- Segredos são fornecidos por variáveis de ambiente.
- O painel renderiza os dados com `textContent` para evitar injeção de HTML.
- Login e formulário possuem limitação de requisições.
- CORS aceita somente as origens configuradas.

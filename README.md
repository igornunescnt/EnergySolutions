# EnergySolutions

Aplicação demonstrativa de captação e gerenciamento de contatos para serviços elétricos. O projeto reúne uma landing page pública, uma API REST em Node.js/Express e um painel administrativo protegido por autenticação JWT.

> **Projeto de portfólio / demonstração.** Não utilize dados pessoais reais. Os contatos são gravados em um arquivo JSON no filesystem local do serviço. Em hospedagens com filesystem efêmero, como a configuração padrão de serviços web gratuitos do Render, esses dados podem ser perdidos quando a instância reinicia ou um novo deploy é realizado. A aplicação não oferece persistência adequada para uso comercial.

## Demonstração

- **Frontend:** https://energy-solutions-eta.vercel.app/
- **API:** https://energysolutions-12af.onrender.com
- **Health check:** https://energysolutions-12af.onrender.com/health

O primeiro acesso à API em uma instância gratuita pode levar alguns instantes enquanto o serviço inicia após um período sem tráfego.

## Funcionalidades

- Landing page responsiva para apresentação de serviços elétricos.
- Formulário público para envio de solicitações de orçamento.
- Login administrativo com verificação de senha usando bcrypt.
- Emissão e validação de JWT com expiração de duas horas, issuer e audience.
- Painel administrativo para consultar contatos autenticados.
- Validação de campos e limites de tamanho de requisição.
- Proteções HTTP com Helmet, política CORS por allowlist e rate limiting.
- Testes automatizados da API com Node.js Test Runner e Supertest.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | HTML, Tailwind CSS via CDN, JavaScript |
| Backend | Node.js 20+, Express 5 |
| Autenticação | bcryptjs, jsonwebtoken |
| Segurança HTTP | Helmet, CORS, express-rate-limit |
| Testes | node:test, Supertest |
| Hospedagem | Vercel (frontend), Render (API) |
| Persistência demonstrativa | Arquivo JSON local |

## Arquitetura

```text
EnergySolutions/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── tests/
│       └── test-server.test.js
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── painel.html
│   └── img/
└── .gitignore
```

O navegador carrega o frontend hospedado na Vercel e realiza chamadas HTTP para a API hospedada no Render. O formulário utiliza `POST /contato`; o login administrativo utiliza `POST /login`; o painel consulta `GET /contatos` enviando o JWT no cabeçalho Authorization.

## Executar localmente

Requisitos: Node.js 20 ou superior e npm.

1. Clone o repositório e entre na pasta do backend:

   ```bash
   git clone https://github.com/igornunescnt/EnergySolutions.git
   cd EnergySolutions/backend
   ```

2. Instale as dependências:

   ```bash
   npm ci
   ```

3. Crie o arquivo local de ambiente a partir do modelo:

   ```bash
   cp .env.example .env
   ```

   No Windows PowerShell, use `Copy-Item .env.example .env`.

4. Edite `.env` e configure:
   - `ADMIN_EMAIL`: e-mail administrativo.
   - `ADMIN_PASSWORD_HASH`: hash bcrypt da senha administrativa.
   - `JWT_SECRET`: segredo aleatório com pelo menos 32 caracteres.
   - `FRONTEND_ORIGINS`: origens locais autorizadas, por exemplo `http://127.0.0.1:5500,http://localhost:5500`.

   Não use os valores ilustrativos do `.env.example` como credenciais. Gere segredos exclusivos para cada ambiente e nunca os envie ao Git.

5. Inicie a API:

   ```bash
   npm start
   ```

   A API local utiliza a porta 3001 por padrão. Para executar em modo de desenvolvimento com reinicialização automática:

   ```bash
   npm run dev
   ```

6. Execute os testes automatizados:

   ```bash
   npm test
   npm audit
   ```

O arquivo `.env` é ignorado pelo Git. Não compartilhe valores de segredos, hashes de senha ou tokens em issues, commits ou capturas de tela.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `ADMIN_EMAIL` | Sim | E-mail usado no login administrativo. |
| `ADMIN_PASSWORD_HASH` | Sim | Hash bcrypt da senha administrativa. |
| `JWT_SECRET` | Sim | Segredo de assinatura JWT; mínimo de 32 caracteres. |
| `FRONTEND_ORIGINS` | Sim | Lista de origens autorizadas separadas por vírgula, sem caminhos. |
| `PORT` | Não | Porta de escuta; usa 3001 localmente e a porta fornecida pela plataforma quando hospedado. |
| `CONTACTS_FILE` | Não | Caminho alternativo para o arquivo JSON de contatos; padrão: `backend/dados.json`. |

## API

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/health` | Público | Retorna o status da API. |
| POST | `/login` | Público, limitado por taxa | Recebe `email` e `senha`; retorna JWT quando autenticado. |
| POST | `/contato` | Público, limitado por taxa | Valida e registra uma solicitação de contato. |
| GET | `/contatos` | JWT administrativo | Lista os contatos registrados. |

Para acessar `GET /contatos`, envie:

```http
Authorization: Bearer <token>
```

O token emitido pelo login expira em duas horas. A API aceita JSON e limita o tamanho do corpo da requisição a 10 KB.

## Deploy

### Frontend — Vercel

O frontend está publicado em:

`https://energy-solutions-eta.vercel.app/`

A URL de origem autorizada pela API deve ser configurada em `FRONTEND_ORIGINS` exatamente como:

```text
https://energy-solutions-eta.vercel.app
```

Não inclua caminho nem barra final na origem.

### Backend — Render

Configuração esperada para o serviço web conectado ao repositório:

| Configuração | Valor |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path (se configurado) | `/health` |

Configure no painel do Render as variáveis `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET` e `FRONTEND_ORIGINS`. Não coloque segredos no repositório nem em arquivos versionados.

A aplicação escuta em `0.0.0.0` e utiliza a variável `PORT` fornecida pelo Render.

## Segurança implementada

- Senha administrativa armazenada como hash bcrypt, não em texto puro.
- JWT com expiração, issuer e audience verificados.
- Helmet para cabeçalhos HTTP de segurança.
- CORS restrito às origens configuradas.
- Rate limiting nas rotas de login e envio de contato.
- Limite de 10 KB no corpo JSON e validação dos campos.
- Painel renderiza conteúdo recebido usando APIs de texto do DOM, evitando interpretar os contatos como HTML.
- Arquivos de ambiente, dados locais e dependências instaladas excluídos do versionamento.

## Limitações e melhorias futuras

Este projeto é uma demonstração técnica e não deve ser usado para processar contatos reais ou dados pessoais em produção.

- **Persistência:** o arquivo JSON é local e pode ser perdido em reinicializações ou deploys. Uma evolução seria migrar para PostgreSQL.
- **Sessão no navegador:** o frontend armazena o JWT em localStorage. Para uma aplicação de produção, avaliar cookies Secure, HttpOnly e SameSite, com proteção CSRF adequada.
- **Rate limiting:** o limitador utiliza armazenamento em memória; em múltiplas instâncias seria necessário um armazenamento compartilhado.
- **Operação:** adicionar monitoramento, logs estruturados, backups e alertas antes de qualquer uso real.
- **Privacidade:** utilizar apenas dados fictícios na demonstração pública.

## Objetivo do projeto

Demonstrar conhecimentos de desenvolvimento web full stack, construção de API REST, autenticação e autorização, proteção de endpoints, configuração por ambiente, testes automatizados, integração entre frontend e backend e publicação em plataformas cloud.

---

Desenvolvido como projeto de portfólio.

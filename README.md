# Mudacity
Bem-vindo ao app Mudacity.

## Requisitos

Para instalar o app é necessário verificar alguns requisitos antes.

01. Verifique se seu computador possuí o `Git` instalado.
Abra o `terminal` e digite:
```
git -v
```

Caso nao esteja instalado, acesso o link: https://git-scm.com/downloads

02. Verifique se seu computador possuí o `Node` instalado.
Abra o `terminal` e digite:
```
node -v
```

Caso nao esteja instalado, acesso o link: https://nodejs.org/en/download/

03. Caso nao tenha, instale o editor de código `VSCODE` da Microsoft. https://code.visualstudio.com/download


## Instalacao

01. Clone o repositório em seu computador local.

02. Agora, é necessário instalar as dependencias do projeto. Para isso, vá até a pasta onde o projeto foi clonado e digite o seguinte comando no terminal.
```
npm install
```

## Rodando a aplicacao

01. Com as dependencias instaladas, agora é necessário rodar a aplicacao.
Abra o `terminal` e digite:
```
npm run dev
```

02. Abra o seu navegador no URL indicado no terminal. Ex. localhost:3000

## Autenticação (Email & Senha)

O projeto agora suporta autenticação manual usando tabela `Users` no Supabase e hashing de senha com `bcrypt`.

### Tabela
```
CREATE TABLE Users (
	id SERIAL PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW()
);
```

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz com:
```
NEXT_PUBLIC_SUPABASE_URL=SEU_URL_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SEU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY # NUNCA exponha no client
AUTH_SESSION_SECRET=uma-string-secreta-bem-grande
```

- `SUPABASE_SERVICE_ROLE_KEY`: usada somente no servidor para inserir/consultar usuários.
- `AUTH_SESSION_SECRET`: usada para assinar HMAC dos tokens de sessão.

### Fluxo
1. Registro: POST `/api/auth/register` `{ email, password }` cria usuário e define cookie de sessão.
2. Login: POST `/api/auth/login` `{ email, password }` valida credenciais e define cookie de sessão.
3. Logout: POST `/api/auth/logout` remove cookie.

Rotas protegidas: `/pesquisa`, `/favoritos` (via `middleware.ts`). Usuário autenticado indo para `/` será redirecionado para `/pesquisa`.

### Segurança
- Hash de senha com `bcrypt` (custo 10).
- Cookie HttpOnly `mudacity_session` com validade de 7 dias (SameSite=Lax).
- Token de sessão assinado (HMAC SHA-256) contendo `uid`, `email`, `iat`, `exp`.

### Próximos Passos (opcional)
- Rotação de segredo de sessão.
- Rate limiting em rotas de login/registro.
- Recurso de reset de senha.
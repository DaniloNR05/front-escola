# Porteirinha Joga Frontend

Frontend React + Vite do sistema Porteirinha Joga.

## Rodando localmente

```bash
npm install
npm run dev
```

Aplicacao local:

- `http://localhost:8080`

## Variaveis de ambiente

Crie um arquivo `.env` com base no `.env.example`.

Exemplo:

```env
VITE_API_URL=https://seu-backend.onrender.com
```

Observacao:

- em desenvolvimento local, se `VITE_API_URL` nao existir, o frontend usa `/api` com proxy do Vite
- em producao, defina `VITE_API_URL` apontando para a URL publica do backend

## Deploy recomendado

### Vercel

Configuracao sugerida:

- Framework: `Vite`
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `dist`

Variavel obrigatoria:

- `VITE_API_URL=https://seu-backend.onrender.com`

O arquivo [vercel.json](file:///c:/Users/Danilo/Desktop/port/porteirinha-play-hub/frontend/vercel.json) ja faz o fallback das rotas para `index.html`, o que permite usar React Router em producao.

## Login

- Admin padrao:
  - email: `admin@porteirinhajoga.com`
  - senha: `admin123`
- Professor/Capitao:
  - o cadastro inicial gera acesso automaticamente
  - a senha inicial e o CPF informado na inscricao

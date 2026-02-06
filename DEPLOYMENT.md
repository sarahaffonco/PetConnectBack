# PetConnect Backend - Guia de Deployment

## URLs em Produção

- **Backend (Render)**: https://petconnectback.onrender.com
- **Frontend (Vercel)**: https://pet-connect-front-livid.vercel.app

---

## Passo 1: Configurar Variáveis de Ambiente no Render

1. Acesse o dashboard do Render: https://render.com/dashboard
2. Clique no seu serviço "petconnectback"
3. Vá para "Environment" (ou "Settings" → "Environment Variables")
4. Adicione/atualize as seguintes variáveis:

```
PORT=3000
NODE_ENV=production
JWT_SECRET=seu_secret_super_seguro_aleatorio_aqui
DB_PATH=./database/petconnect.db
CORS_ORIGIN=https://pet-connect-front-livid.vercel.app
```

**⚠️ IMPORTANTE**: Gere um `JWT_SECRET` forte e aleatório (use um gerador online ou execute no terminal):
```powershell
# No PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

5. Clique em "Save Changes" (o Render fará auto-deploy)

---

## Passo 2: Aguardar o Deploy

1. Vá para "Deployments" na página do seu serviço
2. Aguarde o status ficar "Live" (verde) ✅
3. Copie a URL: https://petconnectback.onrender.com

---

## Passo 3: Testar o Backend

No PowerShell, teste se está funcionando:

```powershell
# Health check
Invoke-RestMethod -Uri "https://petconnectback.onrender.com/" | ConvertTo-Json

# Listar pets (não requer autenticação)
Invoke-RestMethod -Uri "https://petconnectback.onrender.com/api/pets" | ConvertTo-Json -Depth 3
```

---

## Passo 4: Configurar Frontend no Vercel

1. Acesse seu projeto no Vercel: https://vercel.com/dashboard
2. Clique no projeto "pet-connect-front"
3. Vá para "Settings" → "Environment Variables"
4. Adicione/atualize:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://petconnectback.onrender.com/api` |

5. Clique em "Save"
6. Faça um novo deployment:
   - Vá para "Deployments"
   - Clique em "Redeploy" ou faça um `git push` para a branch main

---

## Passo 5: Verificar Integração

1. Acesse a aplicação no Vercel: https://pet-connect-front-livid.vercel.app
2. Teste as operações CRUD (criar, listar, atualizar animais)
3. Faça login e verifique se a autenticação funciona

---

## Troubleshooting

### Frontend não conecta ao backend

**Erro típico**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solução**:
1. Verifique se `CORS_ORIGIN` no Render está correto
2. Confirme que `VITE_API_URL` no Vercel aponta para o Render
3. Reinicie o deploy no Render (vá em "Deployments" → "Redeploy")

### Backend responde com erro 500

1. Acesse o Render e verifique os logs
2. Procure por mensagens de erro na seção "Logs"
3. Verifique se o banco de dados foi inicializado (rode `npm run init-db` localmente e commit)

### Banco de dados vazio em produção

1. O banco precisa ser inicializado uma vez
2. Opções:
   - Fazer um deploy completo com dados iniciais
   - Usar a API para inserir dados manualmente
   - Implementar um seed automático no server.js

---

## Variáveis de Ambiente - Referência Completa

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente (development/production) | `production` |
| `JWT_SECRET` | Chave para assinar tokens JWT | `seu_secret_aleatorio_aqui` |
| `DB_PATH` | Caminho do banco SQLite | `./database/petconnect.db` |
| `CORS_ORIGIN` | URL do frontend permitida | `https://pet-connect-front-livid.vercel.app` |

---

## Endpoints Disponíveis

```
GET    /                          - Health check
GET    /api                       - Info dos endpoints
GET    /api/pets                  - Listar pets
POST   /api/pets                  - Criar pet
GET    /api/pets/:id              - Buscar pet por ID
PUT    /api/pets/:id              - Atualizar pet
DELETE /api/pets/:id              - Deletar pet

POST   /api/adotantes/login       - Login
POST   /api/adotantes/signup      - Cadastro
GET    /api/adotantes             - Listar adotantes
...
```

---

## Comandos Úteis

```bash
# Inicializar banco localmente com dados de exemplo
npm run init-db

# Iniciar servidor em desenvolvimento
npm run dev

# Iniciar servidor em produção
npm start

# Verificar status do npm
npm list
```

---

## Monitoramento em Produção

### Acessar Logs do Render
1. Dashboard Render → seu serviço → "Logs"
2. Filtre por data/hora para ver erros recentes

### Acessar Logs do Vercel
1. Dashboard Vercel → seu projeto → "Deployments" → clique no deployment
2. Vá para "Logs" (Runtime Logs) para ver erros do lado do cliente

---

**Última atualização**: 06 de fevereiro de 2026
**Status**: ✅ Backend e Frontend prontos para produção

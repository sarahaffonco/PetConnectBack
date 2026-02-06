# Guia de Desenvolvimento - PetConnect Backend

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env conforme necessário
```

### 3. Inicializar Banco de Dados
```bash
npm run init-db
```

### 4. Iniciar Servidor
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
PetConnectBack/
├── database/              # Banco de dados SQLite
│   └── petconnect.db    
├── src/
│   ├── config/           # Configurações
│   │   ├── database.js   # Conexão com banco
│   │   └── initDatabase.js # Script de inicialização
│   ├── controllers/      # Lógica de negócio
│   │   ├── petController.js
│   │   ├── adotanteController.js
│   │   ├── adocaoController.js
│   │   └── favoritoController.js
│   ├── routes/           # Rotas da API
│   │   ├── petRoutes.js
│   │   ├── adotanteRoutes.js
│   │   ├── adocaoRoutes.js
│   │   └── favoritoRoutes.js
│   └── middlewares/      # Middlewares
│       ├── auth.js       # Autenticação JWT
│       ├── errorHandler.js
│       └── logger.js
├── server.js             # Arquivo principal
├── package.json
├── .env                  # Variáveis de ambiente
├── .env.example
└── README.md
```

---

## 🧪 Testando a API

### Usando cURL

#### 1. Testar Health Check
```bash
curl http://localhost:3000/
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/api/adotantes/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@petconnect.com\",\"senha\":\"admin123\"}"
```

#### 3. Listar Pets
```bash
curl http://localhost:3000/api/pets
```

#### 4. Buscar Cachorros Grandes
```bash
curl "http://localhost:3000/api/pets?especie=Cachorro&tamanho=grande"
```

#### 5. Criar Adoção (requer token)
```bash
# Substitua SEU_TOKEN pelo token recebido no login
curl -X POST http://localhost:3000/api/adocoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d "{\"petId\":1,\"adotanteId\":1,\"observacoes\":\"Teste\"}"
```

### Usando PowerShell

```powershell
# Login
$response = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/adotantes/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@petconnect.com","senha":"admin123"}'

$token = $response.token

# Listar pets
Invoke-RestMethod -Uri "http://localhost:3000/api/pets"

# Criar adoção com autenticação
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/adocoes" `
  -Headers $headers `
  -Body '{"petId":1,"adotanteId":1,"observacoes":"Teste"}'
```

### Usando Insomnia/Postman

1. Importe a coleção (veja arquivo `insomnia_collection.json` se disponível)
2. Configure a variável de ambiente `base_url` para `http://localhost:3000`
3. Faça login e copie o token
4. Use o token no header `Authorization: Bearer TOKEN` para requisições protegidas

---

## 🛠️ Desenvolvimento

### Conectar com Frontend

1. Certifique-se que o backend está rodando na porta 3000
2. Configure o frontend para apontar para `http://localhost:3000`
3. O CORS já está configurado para aceitar requisições de `http://localhost:5173` (Vite default)

### Alterar Porta

Edite o arquivo `.env`:
```env
PORT=3001
```

### Adicionar Novos Endpoints

1. Criar controlador em `src/controllers/`
2. Criar rota em `src/routes/`
3. Registrar rota no `server.js`

Exemplo:
```javascript
// src/controllers/exemploController.js
export const listarItens = async (req, res) => {
  try {
    // lógica aqui
    res.json({ itens: [] });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar' });
  }
};

// src/routes/exemploRoutes.js
import express from 'express';
import { listarItens } from '../controllers/exemploController.js';

const router = express.Router();
router.get('/', listarItens);
export default router;

// server.js
import exemploRoutes from './src/routes/exemploRoutes.js';
app.use('/api/exemplos', exemploRoutes);
```

---

## 🔒 Segurança

### JWT Secret

**IMPORTANTE:** Altere o `JWT_SECRET` no arquivo `.env` em produção!

```env
JWT_SECRET=sua_chave_secreta_super_forte_aqui
```

### CORS

Para aceitar requisições de outros domínios, edite `CORS_ORIGIN` no `.env`:

```env
CORS_ORIGIN=https://seu-frontend.com
```

Ou aceite múltiplas origens editando `server.js`:

```javascript
const corsOptions = {
  origin: ['http://localhost:5173', 'https://seu-frontend.com'],
  credentials: true
};
```

---

## 🗄️ Banco de Dados

### Localização

O banco de dados SQLite fica em `database/petconnect.db`

### Reinicializar Banco

```bash
# Deletar banco existente
rm database/petconnect.db

# Recriar com dados de exemplo
npm run init-db
```

### Backup

```bash
# Criar backup
cp database/petconnect.db database/petconnect.db.backup

# Restaurar backup
cp database/petconnect.db.backup database/petconnect.db
```

### Visualizar Dados

Use ferramentas como:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLiteStudio](https://sqlitestudio.pl/)
- Extensão VSCode: SQLite Viewer

---

## 📝 Logs

Os logs aparecem no console e incluem:
- Timestamp
- Método HTTP
- Rota
- Status Code
- Tempo de resposta

Exemplo:
```
[2024-01-15T10:30:45.123Z] GET /api/pets - Status: 200 - 45ms
```

---

## 🐛 Troubleshooting

### Erro de Porta em Uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:** Altere a porta no `.env` ou mate o processo usando a porta 3000

### Erro ao Instalar Dependências

Se houver erros ao instalar `bcrypt` ou `sqlite3`:

1. Certifique-se de ter o Node.js atualizado
2. No Windows, pode precisar das Build Tools:
   ```bash
   npm install --global windows-build-tools
   ```

### Banco de Dados Corrompido

Reinicialize o banco:
```bash
rm database/petconnect.db
npm run init-db
```

### CORS Error no Frontend

Certifique-se que `CORS_ORIGIN` no `.env` inclui a URL do seu frontend

---

## 📚 Recursos Úteis

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT.io](https://jwt.io/) - Decodificar tokens JWT
- [REST API Best Practices](https://restfulapi.net/)

---

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

## 📧 Suporte

Para issues e dúvidas:
- GitHub Issues
- Email: petconnect@pets.com

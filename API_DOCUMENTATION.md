# Documentação da API PetConnect

## Base URL
```
http://localhost:3000
```

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Após fazer login ou cadastro, você receberá um token que deve ser incluído no header das requisições protegidas:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## Endpoints

### 🐾 Pets

#### Listar Pets
```http
GET /api/pets
```

**Query Parameters:**
- `especie` (string): Filtrar por espécie (`Cachorro` ou `Gato`)
- `personalidade` (string): Filtrar por personalidade (`brincalhao` ou `calmo`). Múltiplos valores separados por vírgula
- `tamanho` (string): Filtrar por tamanho (`pequeno`, `medio` ou `grande`)
- `idadeMin` (number): Idade mínima em anos
- `idadeMax` (number): Idade máxima em anos
- `status` (string): Filtrar por status (`disponivel` ou `adotado`) - padrão: `disponivel`
- `pagina` (number): Número da página - padrão: 1
- `limite` (number): Itens por página - padrão: 8

**Exemplo:**
```http
GET /api/pets?especie=Cachorro&tamanho=grande&pagina=1
```

**Resposta:**
```json
{
  "pets": [
    {
      "id": 1,
      "nome": "Rex",
      "descricao": "Cachorro muito amigável e brincalhão",
      "especie": "Cachorro",
      "raca": "Labrador",
      "tamanho": "grande",
      "personalidade": "brincalhao",
      "dataNascimento": "2020-05-15",
      "status": "disponivel",
      "fotoUrl": "https://...",
      "createdAt": "2024-01-01 10:00:00",
      "updatedAt": "2024-01-01 10:00:00"
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 8,
    "total": 10,
    "paginas": 2
  }
}
```

#### Buscar Pet por ID
```http
GET /api/pets/:id
```

**Resposta:**
```json
{
  "id": 1,
  "nome": "Rex",
  "descricao": "Cachorro muito amigável e brincalhão",
  "especie": "Cachorro",
  "raca": "Labrador",
  "tamanho": "grande",
  "personalidade": "brincalhao",
  "dataNascimento": "2020-05-15",
  "status": "disponivel",
  "fotoUrl": "https://...",
  "createdAt": "2024-01-01 10:00:00",
  "updatedAt": "2024-01-01 10:00:00"
}
```

#### Criar Pet
```http
POST /api/pets
```

**Body:**
```json
{
  "nome": "Totó",
  "descricao": "Cachorro muito carinhoso",
  "especie": "Cachorro",
  "raca": "Vira-lata",
  "tamanho": "medio",
  "personalidade": "calmo",
  "dataNascimento": "2021-03-15",
  "status": "disponivel",
  "fotoUrl": "https://..."
}
```

**Resposta:** Objeto do pet criado com status `201`

#### Atualizar Pet
```http
PUT /api/pets/:id
```

**Body:** Mesma estrutura do POST

**Resposta:** Objeto do pet atualizado

#### Deletar Pet
```http
DELETE /api/pets/:id
```

**Resposta:**
```json
{
  "mensagem": "Pet deletado com sucesso"
}
```

---

### 👤 Adotantes

#### Listar Adotantes
```http
GET /api/adotantes
```

**Resposta:**
```json
{
  "adotantes": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@email.com",
      "telefone": "(85) 98888-8888",
      "endereco": "Fortaleza, CE",
      "createdAt": "2024-01-01 10:00:00"
    }
  ]
}
```

#### Buscar Adotante por ID
```http
GET /api/adotantes/:id
```

#### Cadastrar Adotante
```http
POST /api/adotantes
```

**Body:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "senha": "senha123",
  "telefone": "(85) 97777-7777",
  "endereco": "Sobral, CE"
}
```

**Resposta:**
```json
{
  "adotante": {
    "id": 3,
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "telefone": "(85) 97777-7777",
    "endereco": "Sobral, CE",
    "createdAt": "2024-01-01 10:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/adotantes/login
```

**Body:**
```json
{
  "email": "admin@petconnect.com",
  "senha": "admin123"
}
```

**Resposta:** Mesma estrutura do cadastro

#### Atualizar Adotante
```http
PUT /api/adotantes/:id
```

**Body:**
```json
{
  "nome": "João Silva Junior",
  "email": "joao@email.com",
  "telefone": "(85) 98888-8888",
  "endereco": "Fortaleza, CE"
}
```

Obs: O campo `senha` é opcional. Se fornecido, será atualizado.

#### Deletar Adotante
```http
DELETE /api/adotantes/:id
```

---

### 🏠 Adoções

#### Listar Adoções
```http
GET /api/adocoes
```

**Query Parameters:**
- `adotanteId` (number): Filtrar por adotante
- `petId` (number): Filtrar por pet

**Resposta:**
```json
{
  "adocoes": [
    {
      "id": 1,
      "petId": 1,
      "adotanteId": 2,
      "dataAdocao": "2024-01-15 14:30:00",
      "observacoes": "Primeira adoção",
      "createdAt": "2024-01-15 14:30:00",
      "pet": {
        "nome": "Rex",
        "especie": "Cachorro",
        "raca": "Labrador",
        "tamanho": "grande",
        "fotoUrl": "https://..."
      },
      "adotante": {
        "nome": "João Silva",
        "email": "joao@email.com",
        "telefone": "(85) 98888-8888"
      }
    }
  ]
}
```

#### Buscar Adoção por ID
```http
GET /api/adocoes/:id
```

#### Criar Adoção
```http
POST /api/adocoes
```

**Body:**
```json
{
  "petId": 1,
  "adotanteId": 2,
  "observacoes": "Pet muito saudável"
}
```

**Resposta:** Objeto da adoção criada com status `201`

**Nota:** Ao criar uma adoção, o status do pet é automaticamente alterado para "adotado"

#### Atualizar Adoção
```http
PUT /api/adocoes/:id
```

**Body:**
```json
{
  "observacoes": "Observações atualizadas"
}
```

#### Deletar Adoção
```http
DELETE /api/adocoes/:id
```

**Nota:** Ao deletar uma adoção, o status do pet é revertido para "disponivel"

---

### ⭐ Favoritos

#### Listar Favoritos do Usuário
```http
GET /api/favoritos/usuario/:usuarioId
```

**Resposta:**
```json
[
  {
    "id": 1,
    "usuarioId": 2,
    "petId": 3,
    "createdAt": "2024-01-15 10:00:00",
    "pet": {
      "nome": "Luna",
      "descricao": "Gatinha tranquila e carinhosa",
      "especie": "Gato",
      "raca": "Siamês",
      "tamanho": "pequeno",
      "personalidade": "calmo",
      "dataNascimento": "2021-03-20",
      "status": "disponivel",
      "fotoUrl": "https://..."
    }
  }
]
```

#### Adicionar aos Favoritos
```http
POST /api/favoritos
```

**Body:**
```json
{
  "usuarioId": 2,
  "petId": 5
}
```

**Resposta:** Objeto do favorito criado com status `201`

#### Remover dos Favoritos
```http
DELETE /api/favoritos/:usuarioId/:petId
```

**Exemplo:**
```http
DELETE /api/favoritos/2/5
```

**Resposta:**
```json
{
  "mensagem": "Favorito removido com sucesso"
}
```

---

## Códigos de Status HTTP

- `200` - OK: Requisição bem-sucedida
- `201` - Created: Recurso criado com sucesso
- `400` - Bad Request: Dados inválidos ou faltando
- `401` - Unauthorized: Token inválido ou não fornecido
- `404` - Not Found: Recurso não encontrado
- `500` - Internal Server Error: Erro no servidor

---

## Erros

Todas as respostas de erro seguem o formato:

```json
{
  "erro": "Descrição do erro"
}
```

---

## Dados de Teste

Após executar `npm run init-db`, você terá:

**Usuários:**
- Admin: `admin@petconnect.com` / `admin123`
- João: `joao@email.com` / `123456`
- Maria: `maria@email.com` / `123456`

**Pets:** 10 pets de exemplo (5 cachorros e 5 gatos) com status "disponivel"

---

## Exemplo de Uso com Fetch

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3000/api/adotantes/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@petconnect.com',
      senha: 'admin123'
    })
  });
  
  const data = await response.json();
  const token = data.token;
  
  // Salvar token para usar em requisições futuras
  localStorage.setItem('token', token);
};

// Buscar pets
const buscarPets = async () => {
  const response = await fetch('http://localhost:3000/api/pets?especie=Cachorro&pagina=1');
  const data = await response.json();
  console.log(data.pets);
};

// Criar adoção (com autenticação)
const criarAdocao = async (petId, adotanteId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/adocoes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      petId,
      adotanteId,
      observacoes: 'Adoção via frontend'
    })
  });
  
  const data = await response.json();
  return data;
};
```

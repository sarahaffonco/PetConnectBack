# Integração Frontend - PetConnect

## Configuração do Frontend para Conectar com o Backend

### 1. Atualizar URLs da API no Frontend

No seu frontend React, crie ou atualize o arquivo de configuração da API:

```javascript
// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  pets: `${API_BASE_URL}/pets`,
  adotantes: `${API_BASE_URL}/adotantes`,
  adocoes: `${API_BASE_URL}/adocoes`,
  favoritos: `${API_BASE_URL}/favoritos`,
  login: `${API_BASE_URL}/adotantes/login`,
};

export default API_BASE_URL;
```

### 2. Criar Arquivo .env no Frontend

```env
# .env
VITE_API_URL=http://localhost:3000/api
```

### 3. Atualizar Chamadas de API Existentes

#### Antes (mock/hardcoded):
```javascript
const response = await axios.get('http://localhost:3000/api/pets');
```

#### Depois (usando configuração):
```javascript
import { API_ENDPOINTS } from './config/api';

const response = await axios.get(API_ENDPOINTS.pets, {
  params: {
    especie: 'Cachorro',
    pagina: 1,
    limite: 8
  }
});
```

---

## ✅ Checklist de Integração

### Backend
- [ ] Servidor backend rodando em `http://localhost:3000`
- [ ] Banco de dados inicializado (`npm run init-db`)
- [ ] CORS configurado para aceitar requisições do frontend
- [ ] Variável `CORS_ORIGIN=http://localhost:5173` no `.env`

### Frontend
- [ ] URLs da API atualizadas para apontar para `http://localhost:3000`
- [ ] Tratamento de erros implementado para respostas da API
- [ ] Autenticação JWT implementada (salvar/enviar token)
- [ ] Loading states durante chamadas da API

---

## 📝 Exemplos de Integração

### 1. Sistema de Login/Cadastro

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar usuário do localStorage ao montar
    const usuarioSalvo = localStorage.getItem('usuario');
    const tokenSalvo = localStorage.getItem('token');
    
    if (usuarioSalvo && tokenSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await axios.post(API_ENDPOINTS.login, {
        email,
        senha
      });

      const { adotante, token } = response.data;

      // Salvar no localStorage
      localStorage.setItem('usuario', JSON.stringify(adotante));
      localStorage.setItem('token', token);

      // Configurar header padrão do axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUsuario(adotante);
      return { success: true, usuario: adotante };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return {
        success: false,
        erro: error.response?.data?.erro || 'Erro ao fazer login'
      };
    }
  };

  const cadastrar = async (dados) => {
    try {
      const response = await axios.post(API_ENDPOINTS.adotantes, dados);

      const { adotante, token } = response.data;

      localStorage.setItem('usuario', JSON.stringify(adotante));
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUsuario(adotante);
      return { success: true, usuario: adotante };
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      return {
        success: false,
        erro: error.response?.data?.erro || 'Erro ao cadastrar'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUsuario(null);
  };

  return { usuario, login, cadastrar, logout, loading };
};
```

### 2. Listagem de Pets com Filtros

```javascript
// src/pages/adocaoCaes.jsx (atualizado)
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export default function AdocaoCaes() {
  const [caes, setCaes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState({
    personalidade: [],
    tamanho: '',
    idadeMin: '',
    idadeMax: ''
  });

  useEffect(() => {
    carregarCaes();
  }, [paginaAtual, filtros]);

  const carregarCaes = async () => {
    try {
      setLoading(true);
      
      const params = {
        especie: 'Cachorro',
        pagina: paginaAtual,
        limite: 8,
        status: 'disponivel'
      };

      if (filtros.personalidade.length > 0) {
        params.personalidade = filtros.personalidade.join(',');
      }
      if (filtros.tamanho) {
        params.tamanho = filtros.tamanho;
      }
      if (filtros.idadeMin) {
        params.idadeMin = filtros.idadeMin;
      }
      if (filtros.idadeMax) {
        params.idadeMax = filtros.idadeMax;
      }

      const response = await axios.get(API_ENDPOINTS.pets, { params });
      
      setCaes(response.data.pets);
      setTotalPaginas(response.data.paginacao.paginas);
    } catch (error) {
      console.error('Erro ao carregar cães:', error);
      setCaes([]);
    } finally {
      setLoading(false);
    }
  };

  // ... resto do componente
}
```

### 3. Sistema de Adoção

```javascript
// src/models/modalAdocao.jsx (atualizado)
import { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../hooks/useAuth';

export default function ModalAdocao({ isOpen, onClose, pet, onAdocaoSucesso }) {
  const { usuario } = useAuth();
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleAdotar = async (e) => {
    e.preventDefault();

    if (!usuario) {
      setMensagem('❌ Você precisa estar logado para adotar');
      return;
    }

    try {
      setLoading(true);
      setMensagem('');

      const response = await axios.post(API_ENDPOINTS.adocoes, {
        petId: pet.id,
        adotanteId: usuario.id,
        observacoes
      });

      setMensagem('✅ Adoção realizada com sucesso!');
      
      setTimeout(() => {
        onAdocaoSucesso(response.data);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao realizar adoção:', error);
      setMensagem(
        `❌ ${error.response?.data?.erro || 'Erro ao realizar adoção'}`
      );
    } finally {
      setLoading(false);
    }
  };

  // ... resto do componente
}
```

### 4. Sistema de Favoritos

```javascript
// src/hooks/useFavoritos.js (atualizado)
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from './useAuth';

export const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();

  const carregarFavoritos = useCallback(async () => {
    if (!usuario?.id) {
      setFavoritos([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ENDPOINTS.favoritos}/usuario/${usuario.id}`
      );
      setFavoritos(response.data);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    carregarFavoritos();
  }, [carregarFavoritos]);

  const alternarFavorito = async (petId) => {
    if (!usuario?.id) {
      console.error('Usuário não autenticado');
      return false;
    }

    try {
      const ehFav = ehFavorito(petId);

      if (ehFav) {
        // Remover
        await axios.delete(
          `${API_ENDPOINTS.favoritos}/${usuario.id}/${petId}`
        );
        setFavoritos(prev => prev.filter(f => f.petId !== petId));
      } else {
        // Adicionar
        const response = await axios.post(API_ENDPOINTS.favoritos, {
          usuarioId: usuario.id,
          petId
        });
        setFavoritos(prev => [...prev, response.data]);
      }

      return true;
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      return false;
    }
  };

  const ehFavorito = (petId) => {
    return favoritos.some(f => f.petId === petId);
  };

  return {
    favoritos,
    loading,
    alternarFavorito,
    ehFavorito,
    carregarFavoritos
  };
};
```

### 5. Página de Gerenciamento de Usuário

```javascript
// src/pages/usuario.jsx (atualizado)
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../hooks/useAuth';

export default function Usuario({ onUsuarioUpdate }) {
  const { usuario } = useAuth();
  const [adocoes, setAdocoes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario?.id) {
      carregarAdocoes();
    }
  }, [usuario]);

  const carregarAdocoes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.adocoes, {
        params: {
          adotanteId: usuario.id
        }
      });

      setAdocoes(response.data.adocoes);
    } catch (error) {
      console.error('Erro ao carregar adoções:', error);
      setAdocoes([]);
    } finally {
      setLoading(false);
    }
  };

  const atualizarDados = async (novosDados) => {
    try {
      const response = await axios.put(
        `${API_ENDPOINTS.adotantes}/${usuario.id}`,
        novosDados
      );

      // Atualizar localStorage
      const usuarioAtualizado = response.data;
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      
      // Notificar App.jsx para atualizar estado global
      onUsuarioUpdate(usuarioAtualizado);

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      return {
        success: false,
        erro: error.response?.data?.erro || 'Erro ao atualizar dados'
      };
    }
  };

  // ... resto do componente
}
```

---

## 🧪 Testando a Integração

### 1. Verificar Conexão

Adicione um teste de conexão na inicialização do app:

```javascript
// src/App.jsx
useEffect(() => {
  const testarConexao = async () => {
    try {
      const response = await axios.get('http://localhost:3000/');
      console.log('✅ Conectado ao backend:', response.data);
    } catch (error) {
      console.error('❌ Erro ao conectar com backend:', error);
      alert('Não foi possível conectar ao backend. Certifique-se que está rodando na porta 3000.');
    }
  };

  testarConexao();
}, []);
```

### 2. Console de Desenvolvimento

Monitore as requisições no console do navegador (F12):
- Network tab para ver todas as chamadas HTTP
- Console tab para ver logs e erros

### 3. Ferramentas de Debug

- **React DevTools**: Inspecionar estado dos componentes
- **Redux DevTools**: Se usar Redux
- **Network Tab**: Monitorar requisições e respostas

---

## 🐛 Problemas Comuns

### CORS Error
```
Access to XMLHttpRequest at 'http://localhost:3000/api/pets' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solução:** Verifique o `.env` do backend:
```env
CORS_ORIGIN=http://localhost:5173
```

### 401 Unauthorized
```
{erro: "Token inválido ou expirado"}
```

**Solução:** 
1. Verifique se o token está sendo enviado no header
2. Faça login novamente para obter um novo token
3. Verifique se o token não expirou (válido por 7 dias)

### 404 Not Found
```
GET http://localhost:3000/api/pets 404 (Not Found)
```

**Solução:**
1. Certifique-se que o backend está rodando
2. Verifique se a URL está correta
3. Verifique se a rota existe no backend

---

## 📦 Package.json - Scripts Úteis

Adicione ao `package.json` do frontend:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:full": "concurrently \"npm run dev\" \"cd ../PetConnectBack && npm start\"",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Isso permite iniciar frontend e backend juntos:
```bash
npm run dev:full
```

(Requer instalação de `concurrently`: `npm install --save-dev concurrently`)

---

## 🚀 Deploy

### Backend

1. Escolha um servidor (Heroku, Railway, AWS, etc.)
2. Configure variáveis de ambiente
3. Faça deploy do código

### Frontend

1. Atualize `VITE_API_URL` para a URL do backend em produção
2. Build: `npm run build`
3. Deploy do diretório `dist/`

---

## 📚 Próximos Passos

- [ ] Implementar upload de imagens para pets
- [ ] Adicionar paginação no frontend
- [ ] Implementar busca por nome de pet
- [ ] Adicionar filtros avançados
- [ ] Implementar sistema de mensagens entre adotantes
- [ ] Adicionar dashboard administrativo
- [ ] Implementar notificações em tempo real
- [ ] Adicionar sistema de avaliações/comentários

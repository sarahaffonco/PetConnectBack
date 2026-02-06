import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger, securityHeaders } from './src/middlewares/logger.js';
import { tratarErros, rotaNaoEncontrada } from './src/middlewares/errorHandler.js';
import petRoutes from './src/routes/petRoutes.js';
import adotanteRoutes from './src/routes/adotanteRoutes.js';
import adocaoRoutes from './src/routes/adocaoRoutes.js';
import favoritoRoutes from './src/routes/favoritoRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares globais
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(securityHeaders);

// Rota de health check
app.get('/', (req, res) => {
  res.json({
    mensagem: '🐾 PetConnect API está funcionando!',
    versao: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    mensagem: 'API PetConnect',
    endpoints: {
      pets: '/api/pets',
      adotantes: '/api/adotantes',
      adocoes: '/api/adocoes',
      favoritos: '/api/favoritos'
    }
  });
});

// Rotas da API
app.use('/api/pets', petRoutes);
app.use('/api/adotantes', adotanteRoutes);
app.use('/api/adocoes', adocaoRoutes);
app.use('/api/favoritos', favoritoRoutes);

// Middlewares de erro (devem estar no final)
app.use(rotaNaoEncontrada);
app.use(tratarErros);

// Iniciar servidor
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║                                        ║');
  console.log('║      🐾 PetConnect API Server 🐾      ║');
  console.log('║                                        ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
  console.log('');
  console.log('📋 Endpoints disponíveis:');
  console.log(`   - Pets:      http://localhost:${PORT}/api/pets`);
  console.log(`   - Adotantes: http://localhost:${PORT}/api/adotantes`);
  console.log(`   - Adoções:   http://localhost:${PORT}/api/adocoes`);
  console.log(`   - Favoritos: http://localhost:${PORT}/api/favoritos`);
  console.log('');
  console.log('💡 Dica: Execute "npm run init-db" para inicializar o banco de dados');
  console.log('');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;

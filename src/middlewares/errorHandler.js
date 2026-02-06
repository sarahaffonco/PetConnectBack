// Middleware global de tratamento de erros
export const tratarErros = (err, req, res, next) => {
  console.error('Erro:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      erro: 'Erro de validação',
      detalhes: err.message
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      erro: 'Token inválido'
    });
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      erro: 'Token expirado'
    });
  }

  // Erro de banco de dados
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      erro: 'Violação de restrição do banco de dados'
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor'
  });
};

// Middleware para rotas não encontradas
export const rotaNaoEncontrada = (req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    path: req.originalUrl
  });
};

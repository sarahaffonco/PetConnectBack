// Middleware de logging de requisições
export const logger = (req, res, next) => {
  const inicio = Date.now();
  
  // Log quando a resposta é enviada
  res.on('finish', () => {
    const duracao = Date.now() - inicio;
    const timestamp = new Date().toISOString();
    
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duracao}ms`
    );
  });

  next();
};

// Middleware para adicionar headers de segurança básicos
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

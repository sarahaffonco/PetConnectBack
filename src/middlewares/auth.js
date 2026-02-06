import jwt from 'jsonwebtoken';

// Middleware para verificar autenticação JWT
export const verificarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_super_seguro');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

// Middleware opcional - verifica token se fornecido, mas não exige
export const verificarTokenOpcional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_super_seguro');
      req.usuario = decoded;
    }
    
    next();
  } catch (error) {
    // Se o token for inválido, continua sem usuário
    next();
  }
};

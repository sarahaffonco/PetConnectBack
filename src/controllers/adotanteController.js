import db from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Listar todos os adotantes
export const listarAdotantes = async (req, res) => {
  try {
    const adotantes = await db.allAsync('SELECT id, nome, email, telefone, endereco, createdAt FROM adotantes ORDER BY nome');
    res.json({ adotantes });
  } catch (error) {
    console.error('Erro ao listar adotantes:', error);
    res.status(500).json({ erro: 'Erro ao listar adotantes' });
  }
};

// Buscar adotante por ID
export const buscarAdotantePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const adotante = await db.getAsync('SELECT id, nome, email, telefone, endereco, createdAt FROM adotantes WHERE id = ?', [id]);

    if (!adotante) {
      return res.status(404).json({ erro: 'Adotante não encontrado' });
    }

    res.json(adotante);
  } catch (error) {
    console.error('Erro ao buscar adotante:', error);
    res.status(500).json({ erro: 'Erro ao buscar adotante' });
  }
};

// Criar novo adotante (cadastro)
export const criarAdotante = async (req, res) => {
  try {
    const { nome, email, senha, telefone, endereco } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se o email já existe
    const adotanteExistente = await db.getAsync('SELECT id FROM adotantes WHERE email = ?', [email]);
    if (adotanteExistente) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await db.runAsync(`
      INSERT INTO adotantes (nome, email, senha, telefone, endereco)
      VALUES (?, ?, ?, ?, ?)
    `, [nome, email, senhaHash, telefone, endereco]);

    const novoAdotante = await db.getAsync('SELECT id, nome, email, telefone, endereco, createdAt FROM adotantes WHERE id = ?', [result.lastID]);

    // Gerar token JWT
    const token = jwt.sign(
      { id: novoAdotante.id, email: novoAdotante.email },
      process.env.JWT_SECRET || 'seu_secret_super_seguro',
      { expiresIn: '7d' }
    );

    res.status(201).json({ adotante: novoAdotante, token });
  } catch (error) {
    console.error('Erro ao criar adotante:', error);
    res.status(500).json({ erro: 'Erro ao criar adotante' });
  }
};

// Login de adotante
export const loginAdotante = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // Buscar adotante
    const adotante = await db.getAsync('SELECT * FROM adotantes WHERE email = ?', [email]);
    if (!adotante) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, adotante.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    // Remover senha do objeto
    delete adotante.senha;

    // Gerar token JWT
    const token = jwt.sign(
      { id: adotante.id, email: adotante.email },
      process.env.JWT_SECRET || 'seu_secret_super_seguro',
      { expiresIn: '7d' }
    );

    res.json({ adotante, token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
};

// Atualizar adotante
export const atualizarAdotante = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, telefone, endereco } = req.body;

    // Verificar se o adotante existe
    const adotanteExistente = await db.getAsync('SELECT * FROM adotantes WHERE id = ?', [id]);
    if (!adotanteExistente) {
      return res.status(404).json({ erro: 'Adotante não encontrado' });
    }

    // Se o email foi alterado, verificar se já existe
    if (email && email !== adotanteExistente.email) {
      const emailEmUso = await db.getAsync('SELECT id FROM adotantes WHERE email = ? AND id != ?', [email, id]);
      if (emailEmUso) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }
    }

    let query = 'UPDATE adotantes SET nome = ?, email = ?, telefone = ?, endereco = ?';
    let params = [nome, email, telefone, endereco];

    // Se a senha foi fornecida, atualizar também
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      query += ', senha = ?';
      params.push(senhaHash);
    }

    query += ', updatedAt = datetime(\'now\', \'localtime\') WHERE id = ?';
    params.push(id);

    await db.runAsync(query, params);

    const adotanteAtualizado = await db.getAsync('SELECT id, nome, email, telefone, endereco, createdAt FROM adotantes WHERE id = ?', [id]);

    res.json(adotanteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar adotante:', error);
    res.status(500).json({ erro: 'Erro ao atualizar adotante' });
  }
};

// Deletar adotante
export const deletarAdotante = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o adotante existe
    const adotante = await db.getAsync('SELECT * FROM adotantes WHERE id = ?', [id]);
    if (!adotante) {
      return res.status(404).json({ erro: 'Adotante não encontrado' });
    }

    await db.runAsync('DELETE FROM adotantes WHERE id = ?', [id]);

    res.json({ mensagem: 'Adotante deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar adotante:', error);
    res.status(500).json({ erro: 'Erro ao deletar adotante' });
  }
};

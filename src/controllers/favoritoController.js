import db from '../config/database.js';

// Listar favoritos de um usuário
export const listarFavoritosUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const favoritos = await db.allAsync(`
      SELECT 
        f.id, f.usuarioId, f.petId, f.createdAt,
        p.nome, p.descricao, p.especie, p.raca, p.tamanho, 
        p.personalidade, p.dataNascimento, p.status, p.fotoUrl
      FROM favoritos f
      LEFT JOIN pets p ON f.petId = p.id
      WHERE f.usuarioId = ?
      ORDER BY f.createdAt DESC
    `, [usuarioId]);

    // Formatar resposta
    const favoritosFormatados = favoritos.map(fav => ({
      id: fav.id,
      usuarioId: fav.usuarioId,
      petId: fav.petId,
      createdAt: fav.createdAt,
      pet: {
        nome: fav.nome,
        descricao: fav.descricao,
        especie: fav.especie,
        raca: fav.raca,
        tamanho: fav.tamanho,
        personalidade: fav.personalidade,
        dataNascimento: fav.dataNascimento,
        status: fav.status,
        fotoUrl: fav.fotoUrl
      }
    }));

    res.json(favoritosFormatados);
  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    res.status(500).json({ erro: 'Erro ao listar favoritos' });
  }
};

// Adicionar aos favoritos
export const adicionarFavorito = async (req, res) => {
  try {
    const { usuarioId, petId } = req.body;

    // Validações
    if (!usuarioId || !petId) {
      return res.status(400).json({ erro: 'Usuário e pet são obrigatórios' });
    }

    // Verificar se o usuário existe
    const usuario = await db.getAsync('SELECT id FROM adotantes WHERE id = ?', [usuarioId]);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar se o pet existe
    const pet = await db.getAsync('SELECT * FROM pets WHERE id = ?', [petId]);
    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    // Verificar se já está nos favoritos
    const favoritoExistente = await db.getAsync('SELECT id FROM favoritos WHERE usuarioId = ? AND petId = ?', [usuarioId, petId]);
    if (favoritoExistente) {
      return res.status(400).json({ erro: 'Pet já está nos favoritos' });
    }

    // Adicionar aos favoritos
    const result = await db.runAsync(`
      INSERT INTO favoritos (usuarioId, petId)
      VALUES (?, ?)
    `, [usuarioId, petId]);

    const novoFavorito = await db.getAsync(`
      SELECT 
        f.id, f.usuarioId, f.petId, f.createdAt,
        p.nome, p.descricao, p.especie, p.raca, p.tamanho, 
        p.personalidade, p.dataNascimento, p.status, p.fotoUrl
      FROM favoritos f
      LEFT JOIN pets p ON f.petId = p.id
      WHERE f.id = ?
    `, [result.lastID]);

    const favoritoFormatado = {
      id: novoFavorito.id,
      usuarioId: novoFavorito.usuarioId,
      petId: novoFavorito.petId,
      createdAt: novoFavorito.createdAt,
      pet: {
        nome: novoFavorito.nome,
        descricao: novoFavorito.descricao,
        especie: novoFavorito.especie,
        raca: novoFavorito.raca,
        tamanho: novoFavorito.tamanho,
        personalidade: novoFavorito.personalidade,
        dataNascimento: novoFavorito.dataNascimento,
        status: novoFavorito.status,
        fotoUrl: novoFavorito.fotoUrl
      }
    };

    res.status(201).json(favoritoFormatado);
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ erro: 'Erro ao adicionar favorito' });
  }
};

// Remover dos favoritos
export const removerFavorito = async (req, res) => {
  try {
    const { usuarioId, petId } = req.params;

    // Verificar se o favorito existe
    const favorito = await db.getAsync('SELECT id FROM favoritos WHERE usuarioId = ? AND petId = ?', [usuarioId, petId]);
    if (!favorito) {
      return res.status(404).json({ erro: 'Favorito não encontrado' });
    }

    await db.runAsync('DELETE FROM favoritos WHERE usuarioId = ? AND petId = ?', [usuarioId, petId]);

    res.json({ mensagem: 'Favorito removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ erro: 'Erro ao remover favorito' });
  }
};

import db from '../config/database.js';

// Listar todas as adoções
export const listarAdocoes = async (req, res) => {
  try {
    const { adotanteId, petId } = req.query;

    let query = `
      SELECT 
        a.id, a.petId, a.adotanteId, a.dataAdocao, a.observacoes, a.createdAt,
        p.nome as petNome, p.especie, p.raca, p.tamanho, p.fotoUrl,
        ad.nome as adotanteNome, ad.email as adotanteEmail, ad.telefone as adotanteTelefone
      FROM adocoes a
      LEFT JOIN pets p ON a.petId = p.id
      LEFT JOIN adotantes ad ON a.adotanteId = ad.id
      WHERE 1=1
    `;
    const params = [];

    // Filtro por adotante
    if (adotanteId) {
      query += ' AND a.adotanteId = ?';
      params.push(adotanteId);
    }

    // Filtro por pet
    if (petId) {
      query += ' AND a.petId = ?';
      params.push(petId);
    }

    query += ' ORDER BY a.dataAdocao DESC';

    const adocoes = await db.allAsync(query, params);

    // Formatar resposta para incluir objeto pet completo
    const adocoesFormatadas = adocoes.map(adocao => ({
      id: adocao.id,
      petId: adocao.petId,
      adotanteId: adocao.adotanteId,
      dataAdocao: adocao.dataAdocao,
      observacoes: adocao.observacoes,
      createdAt: adocao.createdAt,
      pet: {
        nome: adocao.petNome,
        especie: adocao.especie,
        raca: adocao.raca,
        tamanho: adocao.tamanho,
        fotoUrl: adocao.fotoUrl
      },
      adotante: {
        nome: adocao.adotanteNome,
        email: adocao.adotanteEmail,
        telefone: adocao.adotanteTelefone
      }
    }));

    res.json({ adocoes: adocoesFormatadas });
  } catch (error) {
    console.error('Erro ao listar adoções:', error);
    res.status(500).json({ erro: 'Erro ao listar adoções' });
  }
};

// Buscar adoção por ID
export const buscarAdocaoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const adocao = await db.getAsync(`
      SELECT 
        a.id, a.petId, a.adotanteId, a.dataAdocao, a.observacoes, a.createdAt,
        p.nome as petNome, p.especie, p.raca, p.tamanho, p.fotoUrl,
        ad.nome as adotanteNome, ad.email as adotanteEmail, ad.telefone as adotanteTelefone
      FROM adocoes a
      LEFT JOIN pets p ON a.petId = p.id
      LEFT JOIN adotantes ad ON a.adotanteId = ad.id
      WHERE a.id = ?
    `, [id]);

    if (!adocao) {
      return res.status(404).json({ erro: 'Adoção não encontrada' });
    }

    const adocaoFormatada = {
      id: adocao.id,
      petId: adocao.petId,
      adotanteId: adocao.adotanteId,
      dataAdocao: adocao.dataAdocao,
      observacoes: adocao.observacoes,
      createdAt: adocao.createdAt,
      pet: {
        nome: adocao.petNome,
        especie: adocao.especie,
        raca: adocao.raca,
        tamanho: adocao.tamanho,
        fotoUrl: adocao.fotoUrl
      },
      adotante: {
        nome: adocao.adotanteNome,
        email: adocao.adotanteEmail,
        telefone: adocao.adotanteTelefone
      }
    };

    res.json(adocaoFormatada);
  } catch (error) {
    console.error('Erro ao buscar adoção:', error);
    res.status(500).json({ erro: 'Erro ao buscar adoção' });
  }
};

// Criar nova adoção
export const criarAdocao = async (req, res) => {
  try {
    const { petId, adotanteId, observacoes } = req.body;

    // Validações
    if (!petId || !adotanteId) {
      return res.status(400).json({ erro: 'Pet e adotante são obrigatórios' });
    }

    // Verificar se o pet existe e está disponível
    const pet = await db.getAsync('SELECT * FROM pets WHERE id = ?', [petId]);
    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }
    if (pet.status === 'adotado') {
      return res.status(400).json({ erro: 'Pet já foi adotado' });
    }

    // Verificar se o adotante existe
    const adotante = await db.getAsync('SELECT * FROM adotantes WHERE id = ?', [adotanteId]);
    if (!adotante) {
      return res.status(404).json({ erro: 'Adotante não encontrado' });
    }

    // Criar a adoção
    const result = await db.runAsync(`
      INSERT INTO adocoes (petId, adotanteId, observacoes)
      VALUES (?, ?, ?)
    `, [petId, adotanteId, observacoes]);

    // Atualizar status do pet para adotado
    await db.runAsync('UPDATE pets SET status = ?, updatedAt = datetime(\'now\', \'localtime\') WHERE id = ?', ['adotado', petId]);

    const novaAdocao = await db.getAsync(`
      SELECT 
        a.id, a.petId, a.adotanteId, a.dataAdocao, a.observacoes, a.createdAt,
        p.nome as petNome, p.especie, p.raca, p.tamanho, p.fotoUrl,
        ad.nome as adotanteNome, ad.email as adotanteEmail, ad.telefone as adotanteTelefone
      FROM adocoes a
      LEFT JOIN pets p ON a.petId = p.id
      LEFT JOIN adotantes ad ON a.adotanteId = ad.id
      WHERE a.id = ?
    `, [result.lastID]);

    const adocaoFormatada = {
      id: novaAdocao.id,
      petId: novaAdocao.petId,
      adotanteId: novaAdocao.adotanteId,
      dataAdocao: novaAdocao.dataAdocao,
      observacoes: novaAdocao.observacoes,
      createdAt: novaAdocao.createdAt,
      pet: {
        nome: novaAdocao.petNome,
        especie: novaAdocao.especie,
        raca: novaAdocao.raca,
        tamanho: novaAdocao.tamanho,
        fotoUrl: novaAdocao.fotoUrl
      },
      adotante: {
        nome: novaAdocao.adotanteNome,
        email: novaAdocao.adotanteEmail,
        telefone: novaAdocao.adotanteTelefone
      }
    };

    res.status(201).json(adocaoFormatada);
  } catch (error) {
    console.error('Erro ao criar adoção:', error);
    res.status(500).json({ erro: 'Erro ao criar adoção' });
  }
};

// Atualizar adoção
export const atualizarAdocao = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    // Verificar se a adoção existe
    const adocaoExistente = await db.getAsync('SELECT * FROM adocoes WHERE id = ?', [id]);
    if (!adocaoExistente) {
      return res.status(404).json({ erro: 'Adoção não encontrada' });
    }

    await db.runAsync(`
      UPDATE adocoes 
      SET observacoes = ?, updatedAt = datetime('now', 'localtime')
      WHERE id = ?
    `, [observacoes, id]);

    const adocaoAtualizada = await db.getAsync(`
      SELECT 
        a.id, a.petId, a.adotanteId, a.dataAdocao, a.observacoes, a.createdAt,
        p.nome as petNome, p.especie, p.raca, p.tamanho, p.fotoUrl,
        ad.nome as adotanteNome, ad.email as adotanteEmail, ad.telefone as adotanteTelefone
      FROM adocoes a
      LEFT JOIN pets p ON a.petId = p.id
      LEFT JOIN adotantes ad ON a.adotanteId = ad.id
      WHERE a.id = ?
    `, [id]);

    const adocaoFormatada = {
      id: adocaoAtualizada.id,
      petId: adocaoAtualizada.petId,
      adotanteId: adocaoAtualizada.adotanteId,
      dataAdocao: adocaoAtualizada.dataAdocao,
      observacoes: adocaoAtualizada.observacoes,
      createdAt: adocaoAtualizada.createdAt,
      pet: {
        nome: adocaoAtualizada.petNome,
        especie: adocaoAtualizada.especie,
        raca: adocaoAtualizada.raca,
        tamanho: adocaoAtualizada.tamanho,
        fotoUrl: adocaoAtualizada.fotoUrl
      },
      adotante: {
        nome: adocaoAtualizada.adotanteNome,
        email: adocaoAtualizada.adotanteEmail,
        telefone: adocaoAtualizada.adotanteTelefone
      }
    };

    res.json(adocaoFormatada);
  } catch (error) {
    console.error('Erro ao atualizar adoção:', error);
    res.status(500).json({ erro: 'Erro ao atualizar adoção' });
  }
};

// Deletar adoção
export const deletarAdocao = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a adoção existe
    const adocao = await db.getAsync('SELECT * FROM adocoes WHERE id = ?', [id]);
    if (!adocao) {
      return res.status(404).json({ erro: 'Adoção não encontrada' });
    }

    // Reverter status do pet para disponível
    await db.runAsync('UPDATE pets SET status = ?, updatedAt = datetime(\'now\', \'localtime\') WHERE id = ?', ['disponivel', adocao.petId]);

    // Deletar adoção
    await db.runAsync('DELETE FROM adocoes WHERE id = ?', [id]);

    res.json({ mensagem: 'Adoção deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar adoção:', error);
    res.status(500).json({ erro: 'Erro ao deletar adoção' });
  }
};

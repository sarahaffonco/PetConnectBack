import db from '../config/database.js';

// Listar todos os pets com filtros e paginação
export const listarPets = async (req, res) => {
  try {
    const {
      especie,
      personalidade,
      tamanho,
      idadeMin,
      idadeMax,
      status = 'disponivel',
      pagina = 1,
      limite = 8
    } = req.query;

    let query = 'SELECT * FROM pets WHERE 1=1';
    const params = [];

    // Filtro por espécie
    if (especie) {
      query += ' AND especie = ?';
      params.push(especie);
    }

    // Filtro por status
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Filtro por personalidade (pode ser múltiplo)
    if (personalidade) {
      const personalidades = personalidade.split(',');
      const placeholders = personalidades.map(() => '?').join(',');
      query += ` AND personalidade IN (${placeholders})`;
      params.push(...personalidades);
    }

    // Filtro por tamanho
    if (tamanho) {
      query += ' AND tamanho = ?';
      params.push(tamanho);
    }

    // Filtro por idade (calculado a partir da data de nascimento)
    if (idadeMin || idadeMax) {
      const hoje = new Date();
      
      if (idadeMax) {
        const dataMaxima = new Date(hoje.getFullYear() - parseInt(idadeMax), hoje.getMonth(), hoje.getDate());
        query += ' AND dataNascimento >= ?';
        params.push(dataMaxima.toISOString().split('T')[0]);
      }
      
      if (idadeMin) {
        const dataMinima = new Date(hoje.getFullYear() - parseInt(idadeMin), hoje.getMonth(), hoje.getDate());
        query += ' AND dataNascimento <= ?';
        params.push(dataMinima.toISOString().split('T')[0]);
      }
    }

    // Contar total de resultados
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = await db.getAsync(countQuery, params);

    // Adicionar ordenação e paginação
    query += ' ORDER BY createdAt DESC';
    
    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limite), offset);

    // Buscar pets
    const pets = await db.allAsync(query, params);

    const totalPaginas = Math.ceil(total / parseInt(limite));

    res.json({
      pets,
      paginacao: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total,
        paginas: totalPaginas
      }
    });
  } catch (error) {
    console.error('Erro ao listar pets:', error);
    res.status(500).json({ erro: 'Erro ao listar pets' });
  }
};

// Buscar pet por ID
export const buscarPetPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await db.getAsync('SELECT * FROM pets WHERE id = ?', [id]);

    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Erro ao buscar pet:', error);
    res.status(500).json({ erro: 'Erro ao buscar pet' });
  }
};

// Criar novo pet
export const criarPet = async (req, res) => {
  try {
    console.log('📥 Recebendo dados do pet:', req.body);
    
    const {
      nome,
      descricao,
      especie,
      raca,
      tamanho,
      personalidade,
      dataNascimento,
      status = 'disponivel',
      fotoUrl
    } = req.body;

    // Validações básicas
    if (!nome || !especie) {
      console.log('❌ Validação falhou: nome ou espécie faltando');
      return res.status(400).json({ erro: 'Nome e espécie são obrigatórios' });
    }

    console.log('✅ Validações OK, inserindo no banco...');

    const result = await db.runAsync(`
      INSERT INTO pets (nome, descricao, especie, raca, tamanho, personalidade, dataNascimento, status, fotoUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nome, descricao, especie, raca, tamanho, personalidade, dataNascimento, status, fotoUrl]);

    console.log('✅ Pet inserido com ID:', result.lastID);

    const novoPet = await db.getAsync('SELECT * FROM pets WHERE id = ?', [result.lastID]);

    console.log('✅ Pet criado com sucesso:', novoPet);
    res.status(201).json(novoPet);
  } catch (error) {
    console.error('❌ Erro detalhado ao criar pet:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      erro: 'Erro ao criar pet',
      detalhes: error.message,
      tipo: error.name
    });
  }
};

// Atualizar pet
export const atualizarPet = async (req, res) => {
  console.log('📝 Atualizando pet ID:', req.params.id);
  console.log('📥 Dados recebidos:', req.body);

  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      especie,
      raca,
      tamanho,
      personalidade,
      dataNascimento,
      status,
      fotoUrl
    } = req.body;

    // Verificar se o pet existe
    const petExistente = await db.getAsync('SELECT * FROM pets WHERE id = ?', [id]);
    console.log('🔍 Pet existente:', petExistente);

    if (!petExistente) {
      console.log('❌ Pet não encontrado');
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    // Usar valores do pet existente se não forem fornecidos novos valores
    const dadosAtualizados = {
      nome: nome !== undefined ? nome : petExistente.nome,
      descricao: descricao !== undefined ? descricao : petExistente.descricao,
      especie: especie !== undefined ? especie : petExistente.especie,
      raca: raca !== undefined ? raca : petExistente.raca,
      tamanho: tamanho !== undefined ? tamanho : petExistente.tamanho,
      personalidade: personalidade !== undefined ? personalidade : petExistente.personalidade,
      dataNascimento: dataNascimento !== undefined ? dataNascimento : petExistente.dataNascimento,
      status: status !== undefined ? status : petExistente.status,
      fotoUrl: fotoUrl !== undefined ? fotoUrl : petExistente.fotoUrl
    };

    console.log('✅ Dados para atualizar:', dadosAtualizados);

    await db.runAsync(`
      UPDATE pets 
      SET nome = ?, descricao = ?, especie = ?, raca = ?, tamanho = ?, 
          personalidade = ?, dataNascimento = ?, status = ?, fotoUrl = ?,
          updatedAt = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      dadosAtualizados.nome,
      dadosAtualizados.descricao,
      dadosAtualizados.especie,
      dadosAtualizados.raca,
      dadosAtualizados.tamanho,
      dadosAtualizados.personalidade,
      dadosAtualizados.dataNascimento,
      dadosAtualizados.status,
      dadosAtualizados.fotoUrl,
      id
    ]);

    const petAtualizado = await db.getAsync('SELECT * FROM pets WHERE id = ?', [id]);
    console.log('✅ Pet atualizado com sucesso:', petAtualizado);

    res.json(petAtualizado);
  } catch (error) {
    console.error('❌ Erro detalhado ao atualizar pet:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      erro: 'Erro ao atualizar pet',
      detalhes: error.message,
      tipo: error.name
    });
  }
};

// Deletar pet
export const deletarPet = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o pet existe
    const pet = await db.getAsync('SELECT * FROM pets WHERE id = ?', [id]);
    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    await db.runAsync('DELETE FROM pets WHERE id = ?', [id]);

    res.json({ mensagem: 'Pet deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pet:', error);
    res.status(500).json({ erro: 'Erro ao deletar pet' });
  }
};

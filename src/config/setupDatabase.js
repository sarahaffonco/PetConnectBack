import db from './database.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para verificar se as tabelas existem
async function tabelasExistem() {
  try {
    const result = await db.getAsync(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='pets'"
    );
    return result.count > 0;
  } catch (error) {
    return false;
  }
}

// Função para contar pets
async function contarPets() {
  try {
    const result = await db.getAsync('SELECT COUNT(*) as count FROM pets');
    return result.count;
  } catch (error) {
    return 0;
  }
}

// Função assíncrona para configurar banco de dados
export async function setupDatabase() {
  try {
    console.log('🔄 Verificando banco de dados...');

    // Verificar se o diretório database existe
    const dbDir = path.join(process.cwd(), 'database');
    if (!fs.existsSync(dbDir)) {
      console.log('📁 Criando diretório database...');
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const existem = await tabelasExistem();

    if (existem) {
      const numPets = await contarPets();
      console.log(`✅ Banco de dados já existe (${numPets} pets cadastrados)`);
      return;
    }

    console.log('🔨 Criando estrutura do banco de dados...');

    // Criar tabela de pets
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        especie TEXT NOT NULL,
        raca TEXT,
        tamanho TEXT,
        personalidade TEXT,
        dataNascimento TEXT,
        status TEXT DEFAULT 'disponivel',
        fotoUrl TEXT,
        createdAt TEXT DEFAULT (datetime('now', 'localtime')),
        updatedAt TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);

    console.log('✅ Tabela pets criada');

    // Criar tabela de adotantes
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS adotantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        telefone TEXT,
        endereco TEXT,
        createdAt TEXT DEFAULT (datetime('now', 'localtime')),
        updatedAt TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);

    console.log('✅ Tabela adotantes criada');

    // Criar tabela de adoções
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS adocoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        petId INTEGER NOT NULL,
        adotanteId INTEGER NOT NULL,
        dataAdocao TEXT DEFAULT (datetime('now', 'localtime')),
        status TEXT DEFAULT 'pendente',
        observacoes TEXT,
        createdAt TEXT DEFAULT (datetime('now', 'localtime')),
        updatedAt TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE,
        FOREIGN KEY (adotanteId) REFERENCES adotantes(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tabela adocoes criada');

    // Criar tabela de favoritos
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        petId INTEGER NOT NULL,
        adotanteId INTEGER NOT NULL,
        createdAt TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE,
        FOREIGN KEY (adotanteId) REFERENCES adotantes(id) ON DELETE CASCADE,
        UNIQUE(petId, adotanteId)
      )
    `);

    console.log('✅ Tabela favoritos criada');

    // Inserir dados de exemplo apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log('📦 Inserindo dados de exemplo...');
      await inserirDadosExemplo();
    }

    console.log('✅ Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    throw error;
  }
}

// Função para inserir dados de exemplo
async function inserirDadosExemplo() {
  // Inserir pets de exemplo
  const pets = [
    {
      nome: 'Max',
      descricao: 'Um cachorro alegre e brincalhão, perfeito para famílias com crianças.',
      especie: 'Cachorro',
      raca: 'Labrador',
      tamanho: 'Grande',
      personalidade: 'Amigável',
      dataNascimento: '2020-05-15',
      fotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb'
    },
    {
      nome: 'Luna',
      descricao: 'Gata carinhosa que adora colos e carinho.',
      especie: 'Gato',
      raca: 'Siamês',
      tamanho: 'Médio',
      personalidade: 'Calma',
      dataNascimento: '2021-08-20',
      fotoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006'
    },
    {
      nome: 'Rex',
      descricao: 'Cachorro protetor e leal, ideal para quem busca segurança.',
      especie: 'Cachorro',
      raca: 'Pastor Alemão',
      tamanho: 'Grande',
      personalidade: 'Protetor',
      dataNascimento: '2019-03-10',
      fotoUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117'
    },
    {
      nome: 'Mia',
      descricao: 'Gata independente mas muito afetuosa com quem conhece.',
      especie: 'Gato',
      raca: 'Persa',
      tamanho: 'Pequeno',
      personalidade: 'Independente',
      dataNascimento: '2022-01-05',
      fotoUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987'
    },
    {
      nome: 'Buddy',
      descricao: 'Cachorro amigo de todos, adora passeios e brincadeiras.',
      especie: 'Cachorro',
      raca: 'Beagle',
      tamanho: 'Médio',
      personalidade: 'Brincalhão',
      dataNascimento: '2020-11-22',
      fotoUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530'
    },
    {
      nome: 'Nala',
      descricao: 'Gata ativa e curiosa, perfeita para apartamentos.',
      especie: 'Gato',
      raca: 'Vira-lata',
      tamanho: 'Pequeno',
      personalidade: 'Ativa',
      dataNascimento: '2021-06-18',
      fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'
    },
    {
      nome: 'Thor',
      descricao: 'Cachorro forte e energético, precisa de espaço para correr.',
      especie: 'Cachorro',
      raca: 'Rottweiler',
      tamanho: 'Grande',
      personalidade: 'Energético',
      dataNascimento: '2018-09-30',
      fotoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8'
    },
    {
      nome: 'Mel',
      descricao: 'Gata tranquila e dorminhoca, ideal para quem tem rotina calma.',
      especie: 'Gato',
      raca: 'Vira-lata',
      tamanho: 'Médio',
      personalidade: 'Tranquila',
      dataNascimento: '2020-04-12',
      fotoUrl: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2'
    },
    {
      nome: 'Toby',
      descricao: 'Cachorro pequeno e adorável, perfeito para apartamentos.',
      especie: 'Cachorro',
      raca: 'Poodle',
      tamanho: 'Pequeno',
      personalidade: 'Brincalhão',
      dataNascimento: '2021-12-01',
      fotoUrl: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a'
    },
    {
      nome: 'Nina',
      descricao: 'Gata sociável que se dá bem com outros animais.',
      especie: 'Gato',
      raca: 'Maine Coon',
      tamanho: 'Grande',
      personalidade: 'Sociável',
      dataNascimento: '2019-07-25',
      fotoUrl: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803'
    }
  ];

  for (const pet of pets) {
    await db.runAsync(
      `INSERT INTO pets (nome, descricao, especie, raca, tamanho, personalidade, dataNascimento, fotoUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [pet.nome, pet.descricao, pet.especie, pet.raca, pet.tamanho, pet.personalidade, pet.dataNascimento, pet.fotoUrl]
    );
  }

  console.log(`✅ ${pets.length} pets inseridos`);

  // Inserir adotantes de exemplo
  const senhaHash = await bcrypt.hash('senha123', 10);

  const adotantes = [
    { nome: 'Admin', email: 'admin@petconnect.com', senha: await bcrypt.hash('admin123', 10), telefone: '11999999999' },
    { nome: 'João Silva', email: 'joao@email.com', senha: senhaHash, telefone: '11988888888' },
    { nome: 'Maria Santos', email: 'maria@email.com', senha: senhaHash, telefone: '11977777777' }
  ];

  for (const adotante of adotantes) {
    await db.runAsync(
      'INSERT INTO adotantes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
      [adotante.nome, adotante.email, adotante.senha, adotante.telefone]
    );
  }

  console.log(`✅ ${adotantes.length} adotantes inseridos`);
}

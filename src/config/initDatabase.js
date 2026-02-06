import db from './database.js';
import bcrypt from 'bcrypt';

console.log('🔄 Inicializando banco de dados...');

// Função assíncrona principal
async function inicializar() {
  try {
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
        usuarioId INTEGER NOT NULL,
        petId INTEGER NOT NULL,
        createdAt TEXT DEFAULT (datetime('now', 'localtime')),
        UNIQUE(usuarioId, petId),
        FOREIGN KEY (usuarioId) REFERENCES adotantes(id) ON DELETE CASCADE,
        FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tabela favoritos criada');

    // Inserir dados de exemplo
    console.log('🔄 Inserindo dados de exemplo...');

    // Verificar se já existem pets
    const countPets = await db.getAsync('SELECT COUNT(*) as count FROM pets');

    if (countPets.count === 0) {
      // Inserir pets de exemplo
      const pets = [
        ['Rex', 'Cachorro muito amigável e brincalhão', 'Cachorro', 'Labrador', 'grande', 'brincalhao', '2020-05-15', 'disponivel', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb'],
        ['Luna', 'Gatinha tranquila e carinhosa', 'Gato', 'Siamês', 'pequeno', 'calmo', '2021-03-20', 'disponivel', 'https://images.unsplash.com/photo-1573865526739-10c1de0fa19d'],
        ['Max', 'Cachorro de porte médio, ótimo para apartamentos', 'Cachorro', 'Beagle', 'medio', 'brincalhao', '2019-08-10', 'disponivel', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'],
        ['Mia', 'Gata independente mas muito amorosa', 'Gato', 'Persa', 'pequeno', 'calmo', '2022-01-05', 'disponivel', 'https://images.unsplash.com/photo-1574158622682-e40e69881006'],
        ['Thor', 'Cachorro grande e protetor, ideal para casas', 'Cachorro', 'Pastor Alemão', 'grande', 'calmo', '2018-11-25', 'disponivel', 'https://images.unsplash.com/photo-1568572933382-74d440642117'],
        ['Bella', 'Cachorrinha pequena e muito enérgica', 'Cachorro', 'Chihuahua', 'pequeno', 'brincalhao', '2021-06-30', 'disponivel', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8'],
        ['Simba', 'Gato amarelo, muito brincalhão e curioso', 'Gato', 'Laranja', 'medio', 'brincalhao', '2020-09-12', 'disponivel', 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8'],
        ['Nina', 'Gatinha preta, calma e carinhosa', 'Gato', 'Vira-lata', 'pequeno', 'calmo', '2021-12-01', 'disponivel', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131'],
        ['Bobby', 'Cachorro de porte médio, muito leal', 'Cachorro', 'Bulldog', 'medio', 'calmo', '2019-04-18', 'disponivel', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'],
        ['Mel', 'Gatinha dourada, adora brincar', 'Gato', 'Pelo curto', 'pequeno', 'brincalhao', '2022-02-14', 'disponivel', 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6'],
      ];

      for (const pet of pets) {
        await db.runAsync(`
          INSERT INTO pets (nome, descricao, especie, raca, tamanho, personalidade, dataNascimento, status, fotoUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, pet);
      }

      console.log('✅ Pets de exemplo inseridos');
    }

    // Verificar se já existem adotantes
    const countAdotantes = await db.getAsync('SELECT COUNT(*) as count FROM adotantes');

    if (countAdotantes.count === 0) {
      // Inserir adotante admin de exemplo
      const senhaHash = await bcrypt.hash('admin123', 10);
      
      await db.runAsync(`
        INSERT INTO adotantes (nome, email, senha, telefone, endereco)
        VALUES (?, ?, ?, ?, ?)
      `, ['Administrador', 'admin@petconnect.com', senhaHash, '(85) 99999-9999', 'Ceará, Brasil']);

      // Inserir mais alguns usuários de exemplo
      const senhaUser = await bcrypt.hash('123456', 10);
      
      await db.runAsync(`
        INSERT INTO adotantes (nome, email, senha, telefone, endereco)
        VALUES (?, ?, ?, ?, ?)
      `, ['João Silva', 'joao@email.com', senhaUser, '(85) 98888-8888', 'Fortaleza, CE']);

      await db.runAsync(`
        INSERT INTO adotantes (nome, email, senha, telefone, endereco)
        VALUES (?, ?, ?, ?, ?)
      `, ['Maria Santos', 'maria@email.com', senhaUser, '(85) 97777-7777', 'Sobral, CE']);

      console.log('✅ Adotantes de exemplo inseridos');
    }

    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('📝 Credenciais de teste:');
    console.log('   Email: admin@petconnect.com');
    console.log('   Senha: admin123');

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

// Executar a inicialização
inicializar();

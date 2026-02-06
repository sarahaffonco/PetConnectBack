import axios from 'axios';

const testarCriacaoPet = async () => {
  try {
    console.log('🧪 Testando criação de pet...\n');

    const dadosPet = {
      nome: 'Thor Teste',
      descricao: 'Cachorro teste',
      especie: 'Cachorro',
      raca: 'Labrador',
      tamanho: 'grande',
      personalidade: 'brincalhao',
      dataNascimento: '2020-05-15',
      fotoUrl: 'https://exemplo.com/foto.jpg'
    };

    console.log('📤 Enviando dados:', dadosPet);

    const response = await axios.post('http://localhost:3000/api/pets', dadosPet);

    console.log('✅ Sucesso!');
    console.log('📥 Resposta:', response.data);
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
};

testarCriacaoPet();

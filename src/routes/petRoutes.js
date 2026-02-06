import express from 'express';
import {
  listarPets,
  buscarPetPorId,
  criarPet,
  atualizarPet,
  deletarPet
} from '../controllers/petController.js';

const router = express.Router();

// Rotas de pets
router.get('/', listarPets);
router.get('/:id', buscarPetPorId);
router.post('/', criarPet);
router.put('/:id', atualizarPet);
router.delete('/:id', deletarPet);

export default router;

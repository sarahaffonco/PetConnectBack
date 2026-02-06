import express from 'express';
import {
  listarAdotantes,
  buscarAdotantePorId,
  criarAdotante,
  loginAdotante,
  atualizarAdotante,
  deletarAdotante
} from '../controllers/adotanteController.js';

const router = express.Router();

// Rotas de adotantes
router.get('/', listarAdotantes);
router.get('/:id', buscarAdotantePorId);
router.post('/', criarAdotante);
router.post('/login', loginAdotante);
router.put('/:id', atualizarAdotante);
router.delete('/:id', deletarAdotante);

export default router;

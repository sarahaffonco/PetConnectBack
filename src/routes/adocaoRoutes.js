import express from 'express';
import {
  listarAdocoes,
  buscarAdocaoPorId,
  criarAdocao,
  atualizarAdocao,
  deletarAdocao
} from '../controllers/adocaoController.js';

const router = express.Router();

// Rotas de adoções
router.get('/', listarAdocoes);
router.get('/:id', buscarAdocaoPorId);
router.post('/', criarAdocao);
router.put('/:id', atualizarAdocao);
router.delete('/:id', deletarAdocao);

export default router;

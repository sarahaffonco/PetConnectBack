import express from 'express';
import {
  listarFavoritosUsuario,
  adicionarFavorito,
  removerFavorito
} from '../controllers/favoritoController.js';

const router = express.Router();

// Rotas de favoritos
router.get('/usuario/:usuarioId', listarFavoritosUsuario);
router.post('/', adicionarFavorito);
router.delete('/:usuarioId/:petId', removerFavorito);

export default router;

import { Router } from 'express';
import * as provinciaController from '../controllers/provincia.controller'; //
import { validate } from '../middlewares/validate'; //
import { createProvinciaSchema, updateProvinciaSchema } from '../schemas/provincia.schema'; //
import { validateId } from '../middlewares/validateId'; //
// Considere adicionar o middleware de autenticação se necessário
// import { authenticate } from '../middlewares/auth'; //

const router = Router();

// --- Rotas para Provincias ---

// Criar uma nova província
// Se necessário, adicione 'authenticate' antes de 'validate'
router.post('/', validate(createProvinciaSchema), provinciaController.createProvincia); //

// Criar múltiplas províncias (em massa)
// Se necessário, adicione 'authenticate' antes de 'validate'
// Nota: O controller já usa um schema específico para validação do array no body
router.post('/batch', provinciaController.createProvinciasEmMassa); //

// Obter todas as províncias (com paginação via query params ?page=1&limit=10)
// Se necessário, adicione 'authenticate'
router.get('/', provinciaController.getAllProvincias); //

// Buscar províncias por termo (query param ?q=termo)
// Se necessário, adicione 'authenticate'
router.get('/search', provinciaController.searchProvincias); //

// Obter uma província pelo ID
// Se necessário, adicione 'authenticate' antes de 'validateId'
router.get('/:id', validateId(), provinciaController.getProvinciaById); //

// Atualizar uma província pelo ID
// Se necessário, adicione 'authenticate' antes de 'validateId'
router.put('/:id', validateId(), validate(updateProvinciaSchema), provinciaController.updateProvincia); //

// Remover uma província pelo ID
// Se necessário, adicione 'authenticate' antes de 'validateId'
router.delete('/:id', validateId(), provinciaController.deleteProvincia); //


export default router;
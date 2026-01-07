// src/routes/workspaceRoutes.js
import express from 'express';
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  assignUserToWorkspace,
  removeUserFromWorkspace,
  getUsersByWorkspace
} from '../controllers/workspaceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getWorkspaces);
router.get('/:uuid', authMiddleware, getWorkspaceById);
router.post('/', authMiddleware, createWorkspace);
router.put('/:uuid', authMiddleware, updateWorkspace);
router.delete('/:uuid', authMiddleware, deleteWorkspace);

// Asignar un workspace a otro usuario
router.post('/:uuid_workspace/assign', authMiddleware, assignUserToWorkspace);
// Eliminar un usuario de un workspace (excepto el propietario)
router.delete('/:uuid_workspace/remove-user', authMiddleware, removeUserFromWorkspace);
// Consultar Quienes tienen acceso al workspace
router.get('/:uuid_workspace/users', authMiddleware, getUsersByWorkspace);

export default router;

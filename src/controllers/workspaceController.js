// src/controllers/workspaceController.js
import Workspace from '../models/workspaceModel.js';
import User from '../models/userModel.js';
import { createJSONResponse } from '../utils/responseUtils.js';

// 📘 Obtener todos los workspaces del usuario autenticado
export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaces = await Workspace.getByUserId(userId);

    res.json(createJSONResponse(200, 'Lista de workspaces del usuario', workspaces));
  } catch (error) {
    console.error('❌ Error al obtener workspaces:', error);
    res.status(500).json(createJSONResponse(500, 'Error interno del servidor'));
  }
};

// 📗 Obtener un workspace específico (verificando pertenencia del usuario)
export const getWorkspaceById = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.uuid;

    const workspace = await Workspace.getByUuidForUser(workspaceId, userId);
    if (!workspace) {
      return res.status(403).json(createJSONResponse(403, 'No tienes acceso a este workspace'));
    }

    res.json(createJSONResponse(200, 'Workspace encontrado', workspace));
  } catch (error) {
    console.error('❌ Error en getWorkspaceById:', error);
    res.status(500).json(createJSONResponse(500, 'Error interno del servidor'));
  }
};

// 📙 Crear un nuevo workspace y asignarlo al usuario autenticado
export const createWorkspace = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const user_id = req.user.id;

    const workspace = await Workspace.create({ name, icon, user_id });
    res.status(201).json(createJSONResponse(201, 'Workspace creado con éxito', workspace));
  } catch (error) {
    console.error('❌ Error en createWorkspace:', error);
    res.status(500).json(createJSONResponse(500, 'Error interno del servidor', { error: error.message }));
  }
};

// 📒 Actualizar un workspace solo si pertenece al usuario
export const updateWorkspace = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceUuid = req.params.uuid;

    const workspace = await Workspace.findByUUID(workspaceUuid);
    if (!workspace) {
      return res.status(404).json(createJSONResponse(404, 'Workspace no encontrado'));
    }

    const hasAccess = await Workspace.userHasAccess(userId, workspace.id);
    if (!hasAccess) {
      return res.status(403).json(createJSONResponse(403, 'No tienes permiso para editar este workspace'));
    }

    const updated = await Workspace.update(workspace.id, req.body);

    res.json(createJSONResponse(200, 'Workspace actualizado correctamente', updated));
  } catch (error) {
    console.error('❌ Error en updateWorkspace:', error);
    res.status(500).json(createJSONResponse(500, 'Error al actualizar workspace'));
  }
};

// 📕 Eliminar un workspace solo si pertenece al usuario
export const deleteWorkspace = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceUuid = req.params.uuid;

    const workspace = await Workspace.findByUUID(workspaceUuid);

    if (!workspace) {
      return res.status(404).json(createJSONResponse(404, 'Workspace no encontrado'));
    }

    const hasAccess = await Workspace.userHasAccess(userId, workspace.id);
    if (!hasAccess) {
      return res.status(403).json(createJSONResponse(403, 'No tienes permiso para eliminar este workspace'));
    }

    await Workspace.delete(workspace.id);

    res.json(createJSONResponse(200, 'Workspace eliminado correctamente'));
  } catch (error) {
    console.error('❌ Error en deleteWorkspace:', error);
    res.status(500).json(createJSONResponse(500, 'Error al eliminar workspace'));
  }
};



export const assignUserToWorkspace = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const workspaceUuid = req.params.uuid_workspace; // UUID del workspace
    const { targetUserEmail } = req.body; // email del usuario a invitar

    const workspace = await Workspace.findByUUID(workspaceUuid);
    if (!workspace) {
      return res.status(404).json(createJSONResponse(404, 'Workspace no encontrado'));
    }

    const targetUser = await User.findByEmail(targetUserEmail);
    if (!targetUser) {
      return res.status(404).json(createJSONResponse(404, 'No existe un usuario con ese correo'));
    }

    const isOwner = await Workspace.isUserOwner(ownerId, workspace.id);
    if (!isOwner) {
      return res
        .status(403)
        .json(createJSONResponse(403, 'Solo el propietario puede asignar usuarios a este workspace'));
    }

    const assigned = await Workspace.assignUser(workspace.id, targetUser.id);
    if (!assigned) {
      return res
        .status(200)
        .json(createJSONResponse(200, 'El usuario ya está asignado a este workspace'));
    }

    res
      .status(200)
      .json(createJSONResponse(200, 'Usuario asignado correctamente al workspace', assigned));
  } catch (error) {
    console.error('❌ Error en assignUserToWorkspace:', error);
    res
      .status(500)
      .json(createJSONResponse(500, 'Error interno del servidor', { error: error.message }));
  }
};


export const removeUserFromWorkspace = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const workspaceUuid = req.params.uuid_workspace; // UUID del workspace
    const { targetUserEmail } = req.body; // Email del usuario a eliminar

    const workspace = await Workspace.findByUUID(workspaceUuid);
    if (!workspace) {
      return res.status(404).json(createJSONResponse(404, 'Workspace no encontrado'));
    }

    const targetUser = await User.findByEmail(targetUserEmail);
    if (!targetUser) {
      return res.status(404).json(createJSONResponse(404, 'No existe un usuario con ese correo'));
    }

    const isOwner = await Workspace.isUserOwner(ownerId, workspace.id);
    if (!isOwner) {
      return res
        .status(403)
        .json(createJSONResponse(403, 'Solo el propietario puede eliminar usuarios de este workspace'));
    }

    const targetIsOwner = await Workspace.isUserOwner(targetUser.id, workspace.id);
    if (targetIsOwner) {
      return res
        .status(400)
        .json(createJSONResponse(400, 'No puedes eliminar al propietario del workspace'));
    }

    // 5️⃣ Eliminar al usuario del workspace
    const removed = await Workspace.removeUser(workspace.id, targetUser.id);
    if (!removed) {
      return res
        .status(404)
        .json(createJSONResponse(404, 'El usuario no pertenece a este workspace'));
    }

    res
      .status(200)
      .json(createJSONResponse(200, 'Usuario eliminado correctamente del workspace'));
  } catch (error) {
    console.error('❌ Error en removeUserFromWorkspace:', error);
    res
      .status(500)
      .json(createJSONResponse(500, 'Error interno del servidor', { error: error.message }));
  }
};


export const getUsersByWorkspace = async (req, res) => {
  try {
    const workspaceUuid = req.params.uuid_workspace; // UUID del workspace
    const userId = req.user.id;

    const workspace = await Workspace.findByUUID(workspaceUuid);
    if (!workspace) {
      return res.status(404).json(createJSONResponse(404, 'Workspace no encontrado'));
    }

    const hasAccess = await Workspace.userHasAccess(userId, workspace.id);
    if (!hasAccess) {
      return res.status(403).json(createJSONResponse(403, 'No tienes acceso a este workspace'));
    }

    const users = await Workspace.getUsersByWorkspace(workspace.id);
    res
      .status(200)
      .json(createJSONResponse(200, 'Usuarios del workspace obtenidos correctamente', users));
  } catch (error) {
    console.error('❌ Error en getUsersByWorkspace:', error);
    res
      .status(500)
      .json(createJSONResponse(500, 'Error interno del servidor', { error: error.message }));
  }
};

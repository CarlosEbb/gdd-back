// src/routes/authRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { registerUser, loginUser, googleAuth, githubLogin, githubCallback, resetPasswordRequest, changePassword, getMyProfile, updateMyProfile  } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const storage = multer.diskStorage({
  destination: './src/public/uploads/img_perfil/',   // misma carpeta que ya usas
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);     // obtiene .png, .jpg, etc.
    const randomName = crypto.randomUUID();          // nombre aleatorio
    cb(null, randomName + ext);                      // ej: 9dd8f...1b2c.png
  }
});

const upload = multer({ storage });

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resetPassword', resetPasswordRequest);
router.post('/changePassword', changePassword);
// router.post('/google', googleAuth);
// router.get('/github', githubLogin);
// router.get('/github/callback', githubCallback);
router.get('/getMyProfile', authMiddleware, getMyProfile);
router.put('/updateMyProfile', authMiddleware, upload.single('img_profile_file'), updateMyProfile);

export default router;
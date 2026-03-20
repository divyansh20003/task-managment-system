import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  refresh
);

router.post('/logout', logout);

router.get('/me', authenticate, getMe);

export default router;

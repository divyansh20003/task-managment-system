import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', getTasks);

router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Task ID is required')],
  validate,
  getTask
);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  createTask
);

router.patch(
  '/:id',
  [
    param('id').notEmpty().withMessage('Task ID is required'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional({ nullable: true }).isString(),
    body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  updateTask
);

router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('Task ID is required')],
  validate,
  deleteTask
);

router.patch(
  '/:id/toggle',
  [param('id').notEmpty().withMessage('Task ID is required')],
  validate,
  toggleTask
);

export default router;

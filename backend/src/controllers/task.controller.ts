import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      page = '1',
      limit = '10',
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where: {
      userId: string;
      status?: string;
      priority?: string;
      OR?: Array<{ title?: { contains: string }; description?: { contains: string } }>;
    } = { userId };

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    if (status && validStatuses.includes(status as string)) {
      where.status = status as string;
    }

    if (priority && validPriorities.includes(priority as string)) {
      where.priority = priority as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const validSortFields = ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: order },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const task = await prisma.task.findFirst({ where: { id, userId } });

    if (!task) {
      return next(createError('Task not found', 404));
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, description, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId,
      },
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return next(createError('Task not found', 404));
    }

    const { title, description, status, priority, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return next(createError('Task not found', 404));
    }

    await prisma.task.delete({ where: { id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const toggleTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return next(createError('Task not found', 404));
    }

    const newStatus =
      existing.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    const task = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

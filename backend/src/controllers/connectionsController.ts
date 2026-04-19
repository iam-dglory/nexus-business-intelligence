// nexus/backend/src/controllers/connectionsController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { getIO } from '../services/socket';

export async function sendConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, role, message } = req.body;
    const senderId = req.userId!;

    // Check company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, ownerId: true },
    });
    if (!company) throw new AppError('Company not found', 404);

    // Prevent duplicate
    const existing = await prisma.connection.findUnique({
      where: { senderId_companyId: { senderId, companyId } },
    });
    if (existing) throw new AppError('Connection request already sent', 409);

    // Prevent self-connection
    if (company.ownerId === senderId) {
      throw new AppError('Cannot connect with your own company', 400);
    }

    const connection = await prisma.connection.create({
      data: {
        senderId,
        companyId,
        role,
        message,
        receiverId: company.ownerId ?? undefined,
      },
      include: {
        company: { select: { id: true, name: true, slug: true } },
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    // Real-time notification to company owner if they're online
    if (company.ownerId) {
      const io = getIO();
      io.to(`user:${company.ownerId}`).emit('connection:new', {
        connectionId: connection.id,
        from: connection.sender.name,
        role,
        companyName: company.name,
      });

      // Email notification (fire-and-forget)
      const owner = await prisma.user.findUnique({
        where: { id: company.ownerId },
        select: { email: true, name: true },
      });
      if (owner) {
        import('../services/email').then(({ sendConnectionNotification }) =>
          sendConnectionNotification({
            toEmail: owner.email,
            toName: owner.name,
            fromName: connection.sender.name,
            companyName: company.name,
            role,
            message: message || undefined,
          })
        );
      }
    }

    res.status(201).json(connection);
  } catch (err) {
    next(err);
  }
}

export async function listConnections(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const connections = await prisma.connection.findMany({
      where: { senderId: userId },
      include: {
        company: {
          select: { id: true, name: true, slug: true, industry: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(connections);
  } catch (err) {
    next(err);
  }
}

export async function respondToConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId!;

    const connection = await prisma.connection.findUnique({
      where: { id },
      include: { company: { select: { ownerId: true } } },
    });

    if (!connection) throw new AppError('Connection not found', 404);
    if (connection.company.ownerId !== userId) {
      throw new AppError('Not authorised to respond to this request', 403);
    }
    if (connection.status !== 'PENDING') {
      throw new AppError('Connection already responded to', 400);
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status, respondedAt: new Date() },
    });

    // Notify sender
    const io = getIO();
    io.to(`user:${connection.senderId}`).emit('connection:updated', {
      connectionId: id,
      status,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

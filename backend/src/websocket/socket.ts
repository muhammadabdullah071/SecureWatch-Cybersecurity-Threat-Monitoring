import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types';
import logger from '@/utils/logger';

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next(new Error('JWT secret not configured'));
      }

      const decoded = jwt.verify(token as string, jwtSecret) as JwtPayload;
      (socket as any).user = decoded;
      next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as JwtPayload;
    logger.info(`Socket connected: user ${user.userId}`);

    socket.join(`user:${user.userId}`);

    socket.emit('authenticated', { userId: user.userId, role: user.role });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${user.userId}`);
      socket.leave(`user:${user.userId}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for user ${user.userId}:`, error);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function getIO(): Server | null {
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToAll(event: string, data: unknown): void {
  if (io) {
    io.emit(event, data);
  }
}

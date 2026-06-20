import bcrypt from 'bcryptjs';
import prisma from '@/utils/prisma';
import { ApiError } from '@/utils/ApiError';
import { CreateUserDTO, UpdateUserDTO, UpdateProfileDTO } from '@/types';
import { calculatePagination } from '@/utils/helpers';

export class UserService {
  private readonly SALT_ROUNDS = 12;

  async findAll(query: any) {
    const { page, limit, search, role, isActive, sortBy, sortOrder } = query;

    const where: any = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const total = await prisma.user.count({ where });
    const pagination = calculatePagination(page || 1, limit || 10, total);

    const users = await prisma.user.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedThreats: true,
            incidents: true,
            notifications: true,
          },
        },
      },
    });

    return { data: users, pagination };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedThreats: true,
            incidents: true,
            createdIncidents: true,
            notifications: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async create(data: CreateUserDTO) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'VIEWER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, data: UpdateUserDTO) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'User not found');
    }

    if (data.email && data.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailExists) {
        throw new ApiError(409, 'Email already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async delete(id: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'User not found');
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            assignedThreats: true,
            incidents: true,
            notifications: { where: { read: false } },
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new ApiError(404, 'User not found');
    }

    if (data.email && data.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailExists) {
        throw new ApiError(409, 'Email already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return user;
  }
}

export const userService = new UserService();

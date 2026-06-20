import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '@/utils/prisma';

type PrismaModel = {
  findMany(args: any): Promise<any[]>;
  findUnique(args: any): Promise<any>;
  findFirst(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
  count(args: any): Promise<number>;
};

export class BaseRepository<T extends Record<string, any>> {
  protected model: PrismaModel;
  protected modelName: string;

  constructor(model: PrismaModel, modelName: string) {
    this.model = model;
    this.modelName = modelName;
  }

  async findAll(params: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    include?: any;
  } = {}): Promise<T[]> {
    return this.model.findMany(params) as Promise<T[]>;
  }

  async findById(id: string, include?: any): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include,
    }) as Promise<T | null>;
  }

  async findFirst(where: any, include?: any): Promise<T | null> {
    return this.model.findFirst({ where, include }) as Promise<T | null>;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create({ data }) as Promise<T>;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    }) as Promise<T>;
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } }) as Promise<T>;
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where }) as Promise<number>;
  }

  protected getPrisma(): PrismaClient {
    return prisma;
  }
}

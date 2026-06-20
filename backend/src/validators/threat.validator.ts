import { z } from 'zod';

export const createThreatSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  sourceIP: z.string().min(1, 'Source IP is required').max(45),
  destinationIP: z.string().ip().optional().or(z.literal('')),
  attackType: z.string().min(1, 'Attack type is required').max(100),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED']).optional(),
  assignedToId: z.string().uuid().optional().or(z.literal('')),
  assignedAnalyst: z.string().max(100).optional().or(z.literal('')),
});

export const updateThreatSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  sourceIP: z.string().min(1).max(45).optional(),
  destinationIP: z.string().ip().optional().or(z.literal('')),
  attackType: z.string().min(1).max(100).optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED']).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  assignedAnalyst: z.string().max(100).optional().nullable(),
});

export const threatQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED']).optional(),
  attackType: z.string().optional(),
  sourceIP: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

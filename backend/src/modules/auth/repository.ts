import prisma from '../../config/database';
import { RegisterInput } from './validator';
import { User } from '@prisma/client';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: RegisterInput, hashedPassword: string, role: 'ADMIN' | 'MANAGER' | 'STAFF' = 'STAFF'): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role,
      },
    });
  }
}

export const authRepository = new AuthRepository();

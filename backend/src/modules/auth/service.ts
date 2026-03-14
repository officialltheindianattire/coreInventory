import { authRepository } from './repository';
import { RegisterInput, LoginInput } from './validator';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    
    // For this project, if it's the first user, let's make them ADMIN
    const userCount = await import('../../config/database').then((m) => m.default.user.count());
    const role = userCount === 0 ? 'ADMIN' : 'STAFF';

    const user = await authRepository.create(data, hashedPassword, role);
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}

export const authService = new AuthService();

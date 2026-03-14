import api from './api';
import { AuthResponse } from '../types/auth';

export const authService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    return api.post('/auth/login', credentials);
  },

  register: async (userData: any): Promise<AuthResponse> => {
    return api.post('/auth/register', userData);
  },
};

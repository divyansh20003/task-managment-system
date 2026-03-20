import { api, setAuthTokens, clearAuthTokens } from '@/lib/api';
import { AuthResponse, User } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
    setAuthTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    setAuthTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      clearAuthTokens();
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },
};

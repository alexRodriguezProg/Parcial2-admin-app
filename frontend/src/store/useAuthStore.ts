import { create } from 'zustand';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT';
}

interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  setUser: (user: Usuario | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
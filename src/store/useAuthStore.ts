import { create } from 'zustand';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT';
}

/** Estado global de autenticación con usuario, token y helpers. */
interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: Usuario | null, token?: string | null) => void;
  logout: () => void;
}

/** Store de Zustand para sesión del admin. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user, token = null) => set({ user, token, isAuthenticated: !!user }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
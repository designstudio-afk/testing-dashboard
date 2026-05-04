export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

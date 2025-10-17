export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  address: string;
  role: UserRole;
  active: boolean;
}

export type UserPayload = Omit<User, 'id'>;

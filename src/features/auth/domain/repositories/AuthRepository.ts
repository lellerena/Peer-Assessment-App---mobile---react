import { AuthUser } from "../entities/AuthUser";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthUser>;
  signup(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}

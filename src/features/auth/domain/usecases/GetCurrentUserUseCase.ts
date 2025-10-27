import { AuthUser } from "../entities/AuthUser";
import { AuthRepository } from "../repositories/AuthRepository";


export class GetCurrentUserUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(): Promise<AuthUser | null> {
    return this.repository.getCurrentUser();
  }
}

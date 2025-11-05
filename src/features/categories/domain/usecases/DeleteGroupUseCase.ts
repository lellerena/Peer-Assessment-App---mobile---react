import { CategoryRepository } from "../repositories/CategoryRepository";

export class DeleteGroupUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(groupId: string): Promise<void> {
    return this.repo.deleteGroup(groupId);
  }
}



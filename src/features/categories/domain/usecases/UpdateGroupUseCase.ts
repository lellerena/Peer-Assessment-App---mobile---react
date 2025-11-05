import { UpdateGroup } from "../entities/Category";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class UpdateGroupUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(group: UpdateGroup): Promise<void> {
    return this.repo.updateGroup(group);
  }
}



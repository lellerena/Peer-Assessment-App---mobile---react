import { Group, NewGroup } from "../entities/Category";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class CreateGroupUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(group: NewGroup): Promise<Group> {
    return this.repo.createGroup(group);
  }
}



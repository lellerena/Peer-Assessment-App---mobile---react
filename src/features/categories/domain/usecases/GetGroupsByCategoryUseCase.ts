import { Group } from "../entities/Category";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class GetGroupsByCategoryUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(categoryId: string): Promise<Group[]> {
    return this.repo.getGroupsByCategory(categoryId);
  }
}



import { UpdateCategory } from "../entities/Category";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class UpdateCategoryUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(category: UpdateCategory): Promise<void> {
    return this.repo.updateCategory(category);
  }
}



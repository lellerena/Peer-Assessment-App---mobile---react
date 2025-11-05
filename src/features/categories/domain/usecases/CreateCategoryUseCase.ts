import { Category, NewCategory } from "../entities/Category";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class CreateCategoryUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(category: NewCategory): Promise<Category> {
    return this.repo.createCategory(category);
  }
}



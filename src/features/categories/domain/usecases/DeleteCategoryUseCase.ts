import { CategoryRepository } from "../repositories/CategoryRepository";

export class DeleteCategoryUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(categoryId: string): Promise<void> {
    return this.repo.deleteCategory(categoryId);
  }
}



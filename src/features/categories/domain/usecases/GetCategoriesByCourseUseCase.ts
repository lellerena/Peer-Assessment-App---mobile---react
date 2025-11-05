import { Category } from "../entities/Category";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class GetCategoriesByCourseUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(courseId: string): Promise<Category[]> {
    return this.repo.getCategoriesByCourse(courseId);
  }
}



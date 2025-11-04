import { Activity } from "../entities/Activity";
import { ActivityRepository } from "../repositories/ActivityRepository";

export class GetActivitiesByCategoryUseCase {
  constructor(private repo: ActivityRepository) {}
  execute(categoryId: string): Promise<Activity[]> {
    return this.repo.getActivitiesByCategory(categoryId);
  }
}


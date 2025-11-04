import { ActivityRepository } from "../repositories/ActivityRepository";

export class DeleteActivityUseCase {
  constructor(private repo: ActivityRepository) {}
  execute(activityId: string): Promise<void> {
    return this.repo.deleteActivity(activityId);
  }
}


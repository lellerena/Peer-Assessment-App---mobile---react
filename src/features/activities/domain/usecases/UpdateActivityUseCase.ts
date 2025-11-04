import { UpdateActivity } from "../entities/Activity";
import { ActivityRepository } from "../repositories/ActivityRepository";

export class UpdateActivityUseCase {
  constructor(private repo: ActivityRepository) {}
  execute(activity: UpdateActivity): Promise<void> {
    return this.repo.updateActivity(activity);
  }
}


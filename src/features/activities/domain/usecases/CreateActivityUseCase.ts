import { Activity, NewActivity } from "../entities/Activity";
import { ActivityRepository } from "../repositories/ActivityRepository";

export class CreateActivityUseCase {
  constructor(private repo: ActivityRepository) {}
  execute(activity: NewActivity): Promise<Activity> {
    return this.repo.createActivity(activity);
  }
}


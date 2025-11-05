import { Activity } from "../entities/Activity";
import { ActivityRepository } from "../repositories/ActivityRepository";

export class GetActivitiesByCourseUseCase {
  constructor(private repo: ActivityRepository) {}
  execute(courseId: string): Promise<Activity[]> {
    return this.repo.getActivitiesByCourse(courseId);
  }
}


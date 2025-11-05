import { Activity, NewActivity, UpdateActivity } from "../../domain/entities/Activity";
import { ActivityRepository } from "../../domain/repositories/ActivityRepository";
import { ActivityDataSource } from "../datasources/ActivityDataSource";

export class ActivityRepositoryImpl implements ActivityRepository {
  constructor(private ds: ActivityDataSource) {}

  getActivitiesByCourse(courseId: string): Promise<Activity[]> {
    return this.ds.getActivitiesByCourse(courseId);
  }
  getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
    return this.ds.getActivitiesByCategory(categoryId);
  }
  createActivity(activity: NewActivity): Promise<Activity> {
    return this.ds.createActivity(activity);
  }
  updateActivity(activity: UpdateActivity): Promise<void> {
    return this.ds.updateActivity(activity);
  }
  deleteActivity(activityId: string): Promise<void> {
    return this.ds.deleteActivity(activityId);
  }
}


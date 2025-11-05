import { Activity, NewActivity, UpdateActivity } from "../../domain/entities/Activity";

export interface ActivityDataSource {
  getActivitiesByCourse(courseId: string): Promise<Activity[]>;
  getActivitiesByCategory(categoryId: string): Promise<Activity[]>;
  createActivity(activity: NewActivity): Promise<Activity>;
  updateActivity(activity: UpdateActivity): Promise<void>;
  deleteActivity(activityId: string): Promise<void>;
}


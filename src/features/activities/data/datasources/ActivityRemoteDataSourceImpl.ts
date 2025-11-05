import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Activity, NewActivity, UpdateActivity } from "../../domain/entities/Activity";
import { ActivityDataSource } from "./ActivityDataSource";

export class ActivityRemoteDataSourceImpl implements ActivityDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly activitiesTable = "activities";

  private prefs: ILocalPreferences;

  constructor(private authService: AuthRemoteDataSourceImpl, projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
  }

  private async authorizedFetch(url: string, options: RequestInit, retry = true): Promise<Response> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) throw new Error("No authentication token available - Please log in again");
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 && retry) {
      const refreshed = await this.authService.refreshToken();
      if (refreshed) {
        const newToken = await this.prefs.retrieveData<string>("token");
        const retryHeaders = { ...(options.headers || {}), Authorization: `Bearer ${newToken}` };
        return await fetch(url, { ...options, headers: retryHeaders });
      }
    }
    return response;
  }

  async getActivitiesByCourse(courseId: string): Promise<Activity[]> {
    const url = `${this.baseUrl}/read?tableName=${this.activitiesTable}&courseId=${courseId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching activities: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as Activity[]) : [];
  }

  async getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
    const url = `${this.baseUrl}/read?tableName=${this.activitiesTable}&categoryId=${categoryId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching activities: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as Activity[]) : [];
  }

  async createActivity(activity: NewActivity): Promise<Activity> {
    const url = `${this.baseUrl}/insert`;
    const body = JSON.stringify({ tableName: this.activitiesTable, records: [activity] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error creating activity: ${r.status}`);
    const data = await r.json();
    return data.inserted?.[0] as Activity;
  }

  async updateActivity(activity: UpdateActivity): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = activity as any;
    const body = JSON.stringify({ tableName: this.activitiesTable, idColumn: "_id", idValue: _id, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error updating activity: ${r.status}`);
  }

  async deleteActivity(activityId: string): Promise<void> {
    const url = `${this.baseUrl}/delete`;
    const body = JSON.stringify({ tableName: this.activitiesTable, idColumn: "_id", idValue: activityId });
    const r = await this.authorizedFetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error deleting activity: ${r.status}`);
  }
}


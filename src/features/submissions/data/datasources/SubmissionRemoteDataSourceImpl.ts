import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Submission, NewSubmission, UpdateSubmission } from "../../domain/entities/Submission";
import { SubmissionDataSource } from "./SubmissionDataSource";

export class SubmissionRemoteDataSourceImpl implements SubmissionDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly submissionsTable = "submissions";

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

  async getSubmissionByActivityAndStudent(activityId: string, studentId: string): Promise<Submission | null> {
    const url = `${this.baseUrl}/read?tableName=${this.submissionsTable}&activityId=${activityId}&studentId=${studentId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching submission: ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? (data as Submission[]) : [];
    return list.length > 0 ? list[0] : null;
  }

  async createSubmission(submission: NewSubmission): Promise<Submission> {
    const url = `${this.baseUrl}/insert`;
    const body = JSON.stringify({ tableName: this.submissionsTable, records: [submission] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error creating submission: ${r.status}`);
    const data = await r.json();
    return data.inserted?.[0] as Submission;
  }

  async updateSubmission(submission: UpdateSubmission): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = submission as any;
    const body = JSON.stringify({ tableName: this.submissionsTable, idColumn: "_id", idValue: _id, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error updating submission: ${r.status}`);
  }

  async getSubmissionsByActivity(activityId: string): Promise<Submission[]> {
    const url = `${this.baseUrl}/read?tableName=${this.submissionsTable}&activityId=${activityId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching submissions: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as Submission[]) : [];
  }
}


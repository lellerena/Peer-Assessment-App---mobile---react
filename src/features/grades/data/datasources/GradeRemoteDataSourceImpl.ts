import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Grade, NewGrade, UpdateGrade } from "../../domain/entities/Grade";
import { GradeDataSource } from "./GradeDataSource";

export class GradeRemoteDataSourceImpl implements GradeDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly gradesTable = "grades";

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

  async getGradeByActivityAndStudent(activityId: string, studentId: string): Promise<Grade | null> {
    const url = `${this.baseUrl}/read?tableName=${this.gradesTable}&activityId=${activityId}&studentId=${studentId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching grade: ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? (data as any[]) : [];
    if (list.length === 0) return null;
    const grade = list[0];
    // Parse criterias if it comes as a string
    if (grade.criterias && typeof grade.criterias === 'string') {
      try {
        grade.criterias = JSON.parse(grade.criterias);
      } catch {
        // If parsing fails, keep as is
      }
    }
    return grade as Grade;
  }

  async getGradesByCourse(courseId: string): Promise<Grade[]> {
    const url = `${this.baseUrl}/read?tableName=${this.gradesTable}&courseId=${courseId}`;
    console.log('Fetching grades from Roble - URL:', url);
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) {
      const errorText = await r.text();
      console.error('Error fetching grades from Roble:', r.status, errorText);
      throw new Error(`Error fetching grades: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    console.log('Raw grades data from Roble:', data);
    const list = Array.isArray(data) ? (data as any[]) : [];
    console.log('Parsed grades list:', list.length, list);
    return list.map((grade) => {
      // Parse criterias if it comes as a string
      if (grade.criterias && typeof grade.criterias === 'string') {
        try {
          grade.criterias = JSON.parse(grade.criterias);
        } catch {
          // If parsing fails, keep as is
        }
      }
      return grade as Grade;
    });
  }

  async getGradesByActivity(activityId: string): Promise<Grade[]> {
    const url = `${this.baseUrl}/read?tableName=${this.gradesTable}&activityId=${activityId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching grades: ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? (data as any[]) : [];
    return list.map((grade) => {
      // Parse criterias if it comes as a string
      if (grade.criterias && typeof grade.criterias === 'string') {
        try {
          grade.criterias = JSON.parse(grade.criterias);
        } catch {
          // If parsing fails, keep as is
        }
      }
      return grade as Grade;
    });
  }

  async createGrade(grade: NewGrade): Promise<Grade> {
    const url = `${this.baseUrl}/insert`;
    const body = JSON.stringify({ tableName: this.gradesTable, records: [grade] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) {
      const errorText = await r.text();
      throw new Error(`Error creating grade: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    const inserted = data.inserted?.[0];
    // Parse criterias if it comes as a string
    if (inserted?.criterias && typeof inserted.criterias === 'string') {
      try {
        inserted.criterias = JSON.parse(inserted.criterias);
      } catch {
        // If parsing fails, keep as is
      }
    }
    return inserted as Grade;
  }

  async updateGrade(grade: UpdateGrade): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = grade as any;
    const body = JSON.stringify({ tableName: this.gradesTable, idColumn: "_id", idValue: _id, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) {
      const errorText = await r.text();
      throw new Error(`Error updating grade: ${r.status} - ${errorText}`);
    }
  }
}


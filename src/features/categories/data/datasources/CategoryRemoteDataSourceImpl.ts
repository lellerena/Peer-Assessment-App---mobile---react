import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Category, Group, NewCategory, NewGroup, UpdateCategory, UpdateGroup } from "../../domain/entities/Category";
import { CategoryDataSource } from "./CategoryDataSource";

export class CategoryRemoteDataSourceImpl implements CategoryDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly categoriesTable = "category"; // Roble: tabla singular
  private readonly groupsTable = "groups";

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

  // Categories
  async getCategoriesByCourse(courseId: string): Promise<Category[]> {
    const url = `${this.baseUrl}/read?tableName=${this.categoriesTable}&courseId=${courseId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching categories: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as Category[]) : [];
  }

  async createCategory(category: NewCategory): Promise<Category> {
    const url = `${this.baseUrl}/insert`;
    const body = JSON.stringify({ tableName: this.categoriesTable, records: [category] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error creating category: ${r.status}`);
    const data = await r.json();
    return data.inserted?.[0] as Category;
  }

  async updateCategory(category: UpdateCategory): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = category as any;
    const body = JSON.stringify({ tableName: this.categoriesTable, idColumn: "_id", idValue: _id, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error updating category: ${r.status}`);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const url = `${this.baseUrl}/delete`;
    const body = JSON.stringify({ tableName: this.categoriesTable, idColumn: "_id", idValue: categoryId });
    const r = await this.authorizedFetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error deleting category: ${r.status}`);
  }

  // Grupo funciones fueron movidas a feature 'groups'
}



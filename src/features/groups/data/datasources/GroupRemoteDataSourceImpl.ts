import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Group, NewGroup, UpdateGroup } from "../../domain/entities/Group";
import { GroupDataSource } from "./GroupDataSource";

export class GroupRemoteDataSourceImpl implements GroupDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
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

  async getGroupsByCategory(categoryId: string): Promise<Group[]> {
    const url = `${this.baseUrl}/read?tableName=${this.groupsTable}&categoryIds=${categoryId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching groups: ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? (data as Group[]) : [];
    return list.map(g => {
      const raw = (g as any).studentIds;
      let ids: any[] = [];
      if (Array.isArray(raw?.data)) ids = raw.data; else if (Array.isArray(raw)) ids = raw;
      const cleanIds = ids.map((id) => (typeof id === 'string' ? id.replace(/\n/g, '').trim() : id));
      return { ...g, studentIds: cleanIds } as Group;
    });
  }

  async createGroup(group: NewGroup): Promise<Group> {
    const url = `${this.baseUrl}/insert`;
    const robleGroup: any = { ...group, categoryIds: group.categoryId, studentIds: { data: group.studentIds || [] } };
    delete robleGroup.categoryId;
    const body = JSON.stringify({ tableName: this.groupsTable, records: [robleGroup] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error creating group: ${r.status}`);
    const data = await r.json();
    return data.inserted?.[0] as Group;
  }

  async updateGroup(group: UpdateGroup): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = group as any;
    if (updates.categoryId) { updates.categoryIds = updates.categoryId; delete updates.categoryId; }
    if (updates.studentIds) updates.studentIds = { data: updates.studentIds };
    const body = JSON.stringify({ tableName: this.groupsTable, idColumn: "_id", idValue: _id, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error updating group: ${r.status}`);
  }

  async deleteGroup(groupId: string): Promise<void> {
    const url = `${this.baseUrl}/delete`;
    const body = JSON.stringify({ tableName: this.groupsTable, idColumn: "_id", idValue: groupId });
    const r = await this.authorizedFetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error deleting group: ${r.status}`);
  }

  async addStudentToGroup(groupId: string, studentId: string): Promise<void> {
    const read = await this.authorizedFetch(`${this.baseUrl}/read?tableName=${this.groupsTable}&_id=${groupId}`, { method: "GET" });
    if (!read.ok) throw new Error(`Error fetching group: ${read.status}`);
    const groups: any[] = await read.json();
    const group = groups[0];
    const current: string[] = Array.isArray(group?.studentIds?.data) ? group.studentIds.data : [];
    if (current.includes(studentId)) return;
    const updates = { studentIds: { data: [...current, studentId] } };
    const url = `${this.baseUrl}/update`;
    const body = JSON.stringify({ tableName: this.groupsTable, idColumn: "_id", idValue: groupId, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error adding student to group: ${r.status}`);
  }

  async removeStudentFromGroup(groupId: string, studentId: string): Promise<void> {
    const read = await this.authorizedFetch(`${this.baseUrl}/read?tableName=${this.groupsTable}&_id=${groupId}`, { method: "GET" });
    if (!read.ok) throw new Error(`Error fetching group: ${read.status}`);
    const groups: any[] = await read.json();
    const group = groups[0];
    const current: string[] = Array.isArray(group?.studentIds?.data) ? group.studentIds.data : [];
    const updates = { studentIds: { data: current.filter((id) => id !== studentId) } };
    const url = `${this.baseUrl}/update`;
    const body = JSON.stringify({ tableName: this.groupsTable, idColumn: "_id", idValue: groupId, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error removing student from group: ${r.status}`);
  }
}



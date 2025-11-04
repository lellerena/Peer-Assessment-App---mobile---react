import { Group, NewGroup, UpdateGroup } from "../../domain/entities/Group";

export interface GroupDataSource {
  getGroupsByCategory(categoryId: string): Promise<Group[]>;
  createGroup(group: NewGroup): Promise<Group>;
  updateGroup(group: UpdateGroup): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;
  addStudentToGroup(groupId: string, studentId: string): Promise<void>;
  removeStudentFromGroup(groupId: string, studentId: string): Promise<void>;
}



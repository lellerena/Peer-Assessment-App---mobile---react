import { Group, NewGroup, UpdateGroup } from "../../domain/entities/Group";
import { GroupRepository } from "../../domain/repositories/GroupRepository";
import { GroupDataSource } from "../datasources/GroupDataSource";

export class GroupRepositoryImpl implements GroupRepository {
  constructor(private ds: GroupDataSource) {}

  getGroupsByCategory(categoryId: string): Promise<Group[]> {
    return this.ds.getGroupsByCategory(categoryId);
  }
  createGroup(group: NewGroup): Promise<Group> {
    return this.ds.createGroup(group);
  }
  updateGroup(group: UpdateGroup): Promise<void> {
    return this.ds.updateGroup(group);
  }
  deleteGroup(groupId: string): Promise<void> {
    return this.ds.deleteGroup(groupId);
  }
  addStudentToGroup(groupId: string, studentId: string): Promise<void> {
    return this.ds.addStudentToGroup(groupId, studentId);
  }
  removeStudentFromGroup(groupId: string, studentId: string): Promise<void> {
    return this.ds.removeStudentFromGroup(groupId, studentId);
  }
}



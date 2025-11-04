import { GroupRepository } from "../repositories/GroupRepository";

export class AddStudentToGroupUseCase_v2 {
  constructor(private repo: GroupRepository) {}
  execute(groupId: string, studentId: string): Promise<void> {
    return this.repo.addStudentToGroup(groupId, studentId);
  }
}



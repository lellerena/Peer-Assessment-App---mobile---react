import { GroupRepository } from "../repositories/GroupRepository";

export class RemoveStudentFromGroupUseCase_v2 {
  constructor(private repo: GroupRepository) {}
  execute(groupId: string, studentId: string): Promise<void> {
    return this.repo.removeStudentFromGroup(groupId, studentId);
  }
}



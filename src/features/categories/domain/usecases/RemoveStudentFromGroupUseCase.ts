import { CategoryRepository } from "../repositories/CategoryRepository";

export class RemoveStudentFromGroupUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(groupId: string, studentId: string): Promise<void> {
    return this.repo.removeStudentFromGroup(groupId, studentId);
  }
}



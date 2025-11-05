import { CategoryRepository } from "../repositories/CategoryRepository";

export class AddStudentToGroupUseCase {
  constructor(private repo: CategoryRepository) {}
  execute(groupId: string, studentId: string): Promise<void> {
    return this.repo.addStudentToGroup(groupId, studentId);
  }
}



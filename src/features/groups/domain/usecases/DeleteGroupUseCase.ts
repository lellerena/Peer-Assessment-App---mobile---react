import { GroupRepository } from "../repositories/GroupRepository";

export class DeleteGroupUseCase_v2 {
  constructor(private repo: GroupRepository) {}
  execute(groupId: string): Promise<void> {
    return this.repo.deleteGroup(groupId);
  }
}



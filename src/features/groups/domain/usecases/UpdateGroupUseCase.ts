import { UpdateGroup } from "../../domain/entities/Group";
import { GroupRepository } from "../repositories/GroupRepository";

export class UpdateGroupUseCase_v2 {
  constructor(private repo: GroupRepository) {}
  execute(group: UpdateGroup): Promise<void> {
    return this.repo.updateGroup(group);
  }
}



import { Group, NewGroup } from "../../domain/entities/Group";
import { GroupRepository } from "../repositories/GroupRepository";

export class CreateGroupUseCase_v2 {
  constructor(private repo: GroupRepository) {}
  execute(group: NewGroup): Promise<Group> {
    return this.repo.createGroup(group);
  }
}



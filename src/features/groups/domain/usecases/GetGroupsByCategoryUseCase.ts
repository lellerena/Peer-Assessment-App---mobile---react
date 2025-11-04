import { Group } from "../../domain/entities/Group";
import { GroupRepository } from "../repositories/GroupRepository";

export class GetGroupsByCategoryUseCase_v2 {
  constructor(private repo: GroupRepository) {}
  execute(categoryId: string): Promise<Group[]> {
    return this.repo.getGroupsByCategory(categoryId);
  }
}



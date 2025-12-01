import { GradeRepository } from "../repositories/GradeRepository";

export class GetGradesByActivityUseCase {
  constructor(private repo: GradeRepository) {}

  async execute(activityId: string) {
    return await this.repo.getGradesByActivity(activityId);
  }
}


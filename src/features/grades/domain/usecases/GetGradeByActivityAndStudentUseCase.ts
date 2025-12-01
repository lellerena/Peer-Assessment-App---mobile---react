import { GradeRepository } from "../repositories/GradeRepository";

export class GetGradeByActivityAndStudentUseCase {
  constructor(private repo: GradeRepository) {}

  async execute(activityId: string, studentId: string) {
    return await this.repo.getGradeByActivityAndStudent(activityId, studentId);
  }
}


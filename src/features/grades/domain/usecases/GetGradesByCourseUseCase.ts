import { GradeRepository } from "../repositories/GradeRepository";

export class GetGradesByCourseUseCase {
  constructor(private repo: GradeRepository) {}

  async execute(courseId: string) {
    return await this.repo.getGradesByCourse(courseId);
  }
}


import { Assessment } from "../entities/Assessment";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class GetAssessmentsByCourseUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(courseId: string): Promise<Assessment[]> {
    return this.repo.getAssessmentsByCourse(courseId);
  }
}


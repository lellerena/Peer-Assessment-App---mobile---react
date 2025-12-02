import { Assessment, NewAssessment } from "../entities/Assessment";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class CreateAssessmentUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessment: NewAssessment): Promise<Assessment> {
    return this.repo.createAssessment(assessment);
  }
}


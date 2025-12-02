import { Assessment } from "../entities/Assessment";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class GetAssessmentByIdUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessmentId: string): Promise<Assessment | null> {
    return this.repo.getAssessmentById(assessmentId);
  }
}


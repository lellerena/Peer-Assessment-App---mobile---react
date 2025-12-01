import { Assessment } from "../entities/Assessment";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class ActivateAssessmentUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessmentId: string): Promise<Assessment> {
    return this.repo.activateAssessment(assessmentId);
  }
}


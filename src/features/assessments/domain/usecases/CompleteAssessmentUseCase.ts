import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class CompleteAssessmentUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessmentId: string): Promise<void> {
    return this.repo.completeAssessment(assessmentId);
  }
}


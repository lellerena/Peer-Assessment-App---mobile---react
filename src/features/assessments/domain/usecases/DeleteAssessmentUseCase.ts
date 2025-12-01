import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class DeleteAssessmentUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessmentId: string): Promise<void> {
    return this.repo.deleteAssessment(assessmentId);
  }
}


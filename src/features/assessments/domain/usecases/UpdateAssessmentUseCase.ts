import { UpdateAssessment } from "../entities/Assessment";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class UpdateAssessmentUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessment: UpdateAssessment): Promise<void> {
    return this.repo.updateAssessment(assessment);
  }
}


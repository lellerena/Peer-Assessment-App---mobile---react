import { Assessment } from "../entities/Assessment";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class GetAssessmentsByActivityUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(activityId: string): Promise<Assessment[]> {
    return this.repo.getAssessmentsByActivity(activityId);
  }
}


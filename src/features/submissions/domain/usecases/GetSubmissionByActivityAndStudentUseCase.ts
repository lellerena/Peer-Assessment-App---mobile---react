import { Submission } from "../entities/Submission";
import { SubmissionRepository } from "../repositories/SubmissionRepository";

export class GetSubmissionByActivityAndStudentUseCase {
  constructor(private repo: SubmissionRepository) {}
  execute(activityId: string, studentId: string): Promise<Submission | null> {
    return this.repo.getSubmissionByActivityAndStudent(activityId, studentId);
  }
}


import { Submission } from "../entities/Submission";
import { SubmissionRepository } from "../repositories/SubmissionRepository";

export class GetSubmissionsByActivityUseCase {
  constructor(private repo: SubmissionRepository) {}

  execute(activityId: string): Promise<Submission[]> {
    return this.repo.getSubmissionsByActivity(activityId);
  }
}



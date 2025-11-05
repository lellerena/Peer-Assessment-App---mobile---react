import { UpdateSubmission } from "../entities/Submission";
import { SubmissionRepository } from "../repositories/SubmissionRepository";

export class UpdateSubmissionUseCase {
  constructor(private repo: SubmissionRepository) {}
  execute(submission: UpdateSubmission): Promise<void> {
    return this.repo.updateSubmission(submission);
  }
}


import { Submission, NewSubmission } from "../entities/Submission";
import { SubmissionRepository } from "../repositories/SubmissionRepository";

export class CreateSubmissionUseCase {
  constructor(private repo: SubmissionRepository) {}
  execute(submission: NewSubmission): Promise<Submission> {
    return this.repo.createSubmission(submission);
  }
}


import { Submission, NewSubmission, UpdateSubmission } from "../../domain/entities/Submission";
import { SubmissionRepository } from "../../domain/repositories/SubmissionRepository";
import { SubmissionDataSource } from "../datasources/SubmissionDataSource";

export class SubmissionRepositoryImpl implements SubmissionRepository {
  constructor(private ds: SubmissionDataSource) {}

  getSubmissionByActivityAndStudent(activityId: string, studentId: string): Promise<Submission | null> {
    return this.ds.getSubmissionByActivityAndStudent(activityId, studentId);
  }
  createSubmission(submission: NewSubmission): Promise<Submission> {
    return this.ds.createSubmission(submission);
  }
  updateSubmission(submission: UpdateSubmission): Promise<void> {
    return this.ds.updateSubmission(submission);
  }
  getSubmissionsByActivity(activityId: string): Promise<Submission[]> {
    return this.ds.getSubmissionsByActivity(activityId);
  }
}


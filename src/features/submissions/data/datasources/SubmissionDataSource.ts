import { Submission, NewSubmission, UpdateSubmission } from "../../domain/entities/Submission";

export interface SubmissionDataSource {
  getSubmissionByActivityAndStudent(activityId: string, studentId: string): Promise<Submission | null>;
  createSubmission(submission: NewSubmission): Promise<Submission>;
  updateSubmission(submission: UpdateSubmission): Promise<void>;
  getSubmissionsByActivity(activityId: string): Promise<Submission[]>;
}


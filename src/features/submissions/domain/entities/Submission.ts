export type Submission = {
  _id?: string;
  studentId: string;
  activityId: string;
  groupId?: string;
  content?: string;
  submissionDate?: string; // formato date de Roble
  grade?: string;
  feedback?: string;
  courseId?: string;
};

export type NewSubmission = Omit<Submission, "_id">;
export type UpdateSubmission = Partial<Omit<Submission, "_id" | "studentId" | "activityId">> & { _id: string };


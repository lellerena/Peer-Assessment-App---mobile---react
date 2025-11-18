export type Grade = {
  _id?: string;
  assessmentId: string;
  activityId: string;
  courseId: string;
  groupId: string;
  studentId: string;
  criterias: Record<string, number>;
  finalGrade: number;
  feedback?: string;
  gradedBy: string;
  gradedAt?: string;
};

export type NewGrade = Omit<Grade, "_id">;
export type UpdateGrade = Partial<Omit<Grade, "_id">> & { _id: string };


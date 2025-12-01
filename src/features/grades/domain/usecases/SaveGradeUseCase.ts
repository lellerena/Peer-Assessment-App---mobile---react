import { GradeRepository } from "../repositories/GradeRepository";

export type SaveGradeInput = {
  gradeId?: string;
  assessmentId?: string;
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

export class SaveGradeUseCase {
  constructor(private repo: GradeRepository) {}

  async execute(input: SaveGradeInput): Promise<void> {
    const normalizedAssessmentId = input.assessmentId ?? input.activityId;
    const payload = {
      assessmentId: normalizedAssessmentId,
      activityId: input.activityId,
      courseId: input.courseId,
      groupId: input.groupId,
      studentId: input.studentId,
      criterias: input.criterias,
      finalGrade: input.finalGrade,
      feedback: input.feedback,
      gradedBy: input.gradedBy,
      gradedAt: input.gradedAt,
    };

    if (input.gradeId) {
      await this.repo.updateGrade({
        _id: input.gradeId,
        ...payload,
      });
      return;
    }

    const existing = await this.repo.getGradeByActivityAndStudent(input.activityId, input.studentId);
    if (existing?._id) {
      await this.repo.updateGrade({
        _id: existing._id,
        ...payload,
      });
      return;
    }

    await this.repo.createGrade(payload);
  }
}


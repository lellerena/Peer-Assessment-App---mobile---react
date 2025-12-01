import { Grade, NewGrade, UpdateGrade } from "../entities/Grade";

export interface GradeRepository {
  getGradeByActivityAndStudent(activityId: string, studentId: string): Promise<Grade | null>;
  getGradesByCourse(courseId: string): Promise<Grade[]>;
  getGradesByActivity(activityId: string): Promise<Grade[]>;
  createGrade(grade: NewGrade): Promise<Grade>;
  updateGrade(grade: UpdateGrade): Promise<void>;
}


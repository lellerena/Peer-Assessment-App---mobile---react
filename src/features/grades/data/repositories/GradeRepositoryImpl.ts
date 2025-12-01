import { Grade, NewGrade, UpdateGrade } from "../../domain/entities/Grade";
import { GradeRepository } from "../../domain/repositories/GradeRepository";
import { GradeDataSource } from "../datasources/GradeDataSource";

export class GradeRepositoryImpl implements GradeRepository {
  constructor(private ds: GradeDataSource) {}

  getGradeByActivityAndStudent(activityId: string, studentId: string): Promise<Grade | null> {
    return this.ds.getGradeByActivityAndStudent(activityId, studentId);
  }
  getGradesByCourse(courseId: string): Promise<Grade[]> {
    return this.ds.getGradesByCourse(courseId);
  }
  getGradesByActivity(activityId: string): Promise<Grade[]> {
    return this.ds.getGradesByActivity(activityId);
  }
  createGrade(grade: NewGrade): Promise<Grade> {
    return this.ds.createGrade(grade);
  }
  updateGrade(grade: UpdateGrade): Promise<void> {
    return this.ds.updateGrade(grade);
  }
}


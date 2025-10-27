import { CourseRepository } from "../repositories/CourseRepository";

export class JoinCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(courseId: string, studentId: string): Promise<void> {
    return this.repo.joinCourse(courseId, studentId);
  }
}


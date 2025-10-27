import { Course } from "../entities/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export class GetEnrolledCoursesUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(studentId: string): Promise<Course[]> {
    return this.repo.getEnrolledCourses(studentId);
  }
}


import { Course } from "../entities/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export class GetCreatedCoursesUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(teacherId: string): Promise<Course[]> {
    return this.repo.getCreatedCourses(teacherId);
  }
}


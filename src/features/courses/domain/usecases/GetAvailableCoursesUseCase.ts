import { Course } from "../entities/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export class GetAvailableCoursesUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(userId: string): Promise<Course[]> {
    return this.repo.getAvailableCourses(userId);
  }
}


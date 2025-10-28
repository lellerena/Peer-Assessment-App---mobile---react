import { Course, NewCourse } from "../entities/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export class CreateCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(course: NewCourse): Promise<Course> {
    return this.repo.createCourse(course);
  }
}


import { Course, NewCourse } from "../../domain/entities/Course";

export interface CourseDataSource {
  getAllCourses(): Promise<Course[]>;
  joinCourse(courseId: string, studentId: string): Promise<void>;
  createCourse(course: NewCourse): Promise<Course>;
}


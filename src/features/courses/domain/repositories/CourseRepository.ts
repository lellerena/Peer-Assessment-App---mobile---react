import { Course, NewCourse } from "../entities/Course";

export interface CourseRepository {
  getAvailableCourses(userId: string): Promise<Course[]>;
  getCreatedCourses(teacherId: string): Promise<Course[]>;
  getEnrolledCourses(studentId: string): Promise<Course[]>;
  joinCourse(courseId: string, studentId: string): Promise<void>;
  createCourse(course: NewCourse): Promise<Course>;
}


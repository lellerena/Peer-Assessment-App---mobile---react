import { Course, NewCourse } from "../../domain/entities/Course";
import { CourseRepository } from "../../domain/repositories/CourseRepository";
import { CourseDataSource } from "../datasources/CourseDataSource";

export class CourseRepositoryImpl implements CourseRepository {
  constructor(private dataSource: CourseDataSource) {}

  // Helper function to clean IDs (remove newlines and trim)
  private cleanId(id: string): string {
    if (typeof id !== 'string') return id;
    return id.replace(/\n/g, '').trim();
  }

  // Helper function to normalize studentIds to array
  private normalizeStudentIds(course: any): Course {
    let studentIds = course.studentIds;
    
    // If it's a string, try to parse it
    if (typeof studentIds === 'string') {
      try {
        studentIds = JSON.parse(studentIds);
      } catch (error) {
        studentIds = [];
      }
    }
    
    // If it's an object with a "data" property (Roble format)
    if (studentIds && typeof studentIds === 'object' && studentIds.data) {
      studentIds = studentIds.data;
    }
    
    // If it's still an object but not an array
    if (!Array.isArray(studentIds) && typeof studentIds === 'object' && studentIds !== null) {
      if (Array.isArray(studentIds.data)) {
        studentIds = studentIds.data;
      } else {
        studentIds = [];
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(studentIds)) {
      studentIds = [];
    }
    
    // Clean all studentIds
    studentIds = studentIds.map((id: any) => this.cleanId(id));
    
    return {
      ...course,
      studentIds: studentIds,
      teacherId: this.cleanId(course.teacherId)
    };
  }

  async getAvailableCourses(userId: string): Promise<Course[]> {
    const allCourses = await this.dataSource.getAllCourses();
    const normalizedCourses = allCourses.map(c => this.normalizeStudentIds(c));
    
    return normalizedCourses.filter((course) => {
      const isEnrolled = course.studentIds.includes(userId);
      const isTeacher = course.teacherId === userId;
      return !isEnrolled && !isTeacher;
    });
  }

  async getCreatedCourses(teacherId: string): Promise<Course[]> {
    const allCourses = await this.dataSource.getAllCourses();
    const normalizedCourses = allCourses.map(c => this.normalizeStudentIds(c));
    return normalizedCourses.filter((course) => course.teacherId === teacherId);
  }

  async getEnrolledCourses(studentId: string): Promise<Course[]> {
    const allCourses = await this.dataSource.getAllCourses();
    const normalizedCourses = allCourses.map(c => this.normalizeStudentIds(c));
    return normalizedCourses.filter((course) => course.studentIds.includes(studentId));
  }

  async joinCourse(courseId: string, studentId: string): Promise<void> {
    return this.dataSource.joinCourse(courseId, studentId);
  }

  async createCourse(course: NewCourse): Promise<Course> {
    return this.dataSource.createCourse(course);
  }
}


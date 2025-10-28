import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Course, NewCourse } from "../../domain/entities/Course";
import { CourseDataSource } from "./CourseDataSource";

export class CourseRemoteDataSourceImpl implements CourseDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly table = "courses"; // Cambia este nombre si tu tabla se llama diferente

  private prefs: ILocalPreferences;

  constructor(
    private authService: AuthRemoteDataSourceImpl,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID
  ) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
  }

  private async authorizedFetch(
    url: string,
    options: RequestInit,
    retry = true
  ): Promise<Response> {
    const token = await this.prefs.retrieveData<string>("token");
    
    if (!token) {
      throw new Error("No authentication token available - Please log in again");
    }
    
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && retry) {
      try {
        const refreshed = await this.authService.refreshToken();
        if (refreshed) {
          const newToken = await this.prefs.retrieveData<string>("token");
          const retryHeaders = {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          return await fetch(url, { ...options, headers: retryHeaders });
        }
      } catch (e) {
        console.error("Token refresh failed", e);
      }
    }

    return response;
  }

  async getAllCourses(): Promise<Course[]> {
    const url = `${this.baseUrl}/read?tableName=${this.table}`;

    const response = await this.authorizedFetch(url, { method: "GET" });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to fetch courses. Status: ${response.status}`);
      console.error(`❌ Error details: ${errorText}`);
      
      if (response.status === 401) {
        throw new Error("Unauthorized (token issue) - Please try logging in again");
      }
      throw new Error(`Error fetching courses: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data as Course[];
  }

  async joinCourse(courseId: string, studentId: string): Promise<void> {
    // First get the course
    const url = `${this.baseUrl}/read?tableName=${this.table}&_id=${courseId}`;
    const response = await this.authorizedFetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Error fetching course: ${response.status}`);
    }

    const courses: Course[] = await response.json();
    const course = courses[0];

    if (!course) {
      throw new Error("Course not found");
    }

    // Normalize studentIds to array
    let currentStudentIds: string[];
    if (Array.isArray(course.studentIds)) {
      currentStudentIds = course.studentIds;
    } else if (typeof course.studentIds === 'object' && course.studentIds !== null && 'data' in course.studentIds) {
      currentStudentIds = (course.studentIds as any).data || [];
    } else {
      currentStudentIds = [];
    }

    // Check if already enrolled
    if (currentStudentIds.includes(studentId)) {
      console.log("Already enrolled in this course");
      return; // Already enrolled
    }

    // Update course with new student in Roble format
    const updatedStudentIds = { data: [...currentStudentIds, studentId] };
    const updateUrl = `${this.baseUrl}/update`;

    const body = JSON.stringify({
      tableName: this.table,
      idColumn: "_id",
      idValue: courseId,
      updates: { studentIds: updatedStudentIds },
    });

    const updateResponse = await this.authorizedFetch(updateUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!updateResponse.ok) {
      if (updateResponse.status === 401) {
        throw new Error("Unauthorized (token issue)");
      }
      throw new Error(`Error joining course: ${updateResponse.status}`);
    }
  }

  async createCourse(course: NewCourse): Promise<Course> {
    const url = `${this.baseUrl}/insert`;
    
    // Format studentIds as Roble expects: {"data": [...]}
    const robleStudentIds = {
      data: course.studentIds || []
    };
    
    const robleCourse = {
      ...course,
      studentIds: robleStudentIds
    };

    const body = JSON.stringify({
      tableName: this.table,
      records: [robleCourse]
    });

    const response = await this.authorizedFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 401) {
        throw new Error("Unauthorized (token issue) - Please try logging in again");
      }
      throw new Error(`Error creating course: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Return the first inserted course
    if (data.inserted && data.inserted.length > 0) {
      return data.inserted[0] as Course;
    }
    
    throw new Error("No course was returned from the API");
  }
}

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Course, NewCourse } from "../../domain/entities/Course";
import { CreateCourseUseCase } from "../../domain/usecases/CreateCourseUseCase";
import { GetAvailableCoursesUseCase } from "../../domain/usecases/GetAvailableCoursesUseCase";
import { GetCreatedCoursesUseCase } from "../../domain/usecases/GetCreatedCoursesUseCase";
import { GetEnrolledCoursesUseCase } from "../../domain/usecases/GetEnrolledCoursesUseCase";
import { JoinCourseUseCase } from "../../domain/usecases/JoinCourseUseCase";

type CourseContextType = {
  availableCourses: Course[];
  createdCourses: Course[];
  enrolledCourses: Course[];
  loading: boolean;
  error: string | null;
  refreshCourses: () => Promise<void>;
  createCourse: (course: NewCourse) => Promise<void>;
  joinCourse: (courseId: string) => Promise<void>;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const { user } = useAuth();

  const getAvailableCoursesUC = di.resolve<GetAvailableCoursesUseCase>(
    TOKENS.GetAvailableCoursesUC
  );
  const getCreatedCoursesUC = di.resolve<GetCreatedCoursesUseCase>(
    TOKENS.GetCreatedCoursesUC
  );
  const getEnrolledCoursesUC = di.resolve<GetEnrolledCoursesUseCase>(
    TOKENS.GetEnrolledCoursesUC
  );
  const createCourseUC = di.resolve<CreateCourseUseCase>(
    TOKENS.CreateCourseUC
  );
  const joinCourseUC = di.resolve<JoinCourseUseCase>(
    TOKENS.JoinCourseUC
  );

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCourses = async () => {
    if (!user?.email) {
      console.error("No user available");
      setError("No user available");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get user ID - Roble returns it as 'id' not '_id'
      const userId = (user as any).id || (user as any)._id || user.email;
      
      if (!userId) {
        console.error("No ID available for user!", user);
        setError("No se pudo obtener el ID del usuario");
        return;
      }
      
      const [available, created, enrolled] = await Promise.all([
        getAvailableCoursesUC.execute(userId),
        getCreatedCoursesUC.execute(userId),
        getEnrolledCoursesUC.execute(userId),
      ]);

      console.log("✅ Available courses:", available.length);
      console.log("✅ Created courses:", created.length);
      console.log("✅ Enrolled courses:", enrolled.length);

      setAvailableCourses(available);
      setCreatedCourses(created);
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error("❌ Error loading courses:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: NewCourse) => {
    if (!user?.email) {
      throw new Error("No user logged in");
    }

    setLoading(true);
    setError(null);
    try {
      console.log("🎨 Creating new course:", courseData);
      await createCourseUC.execute(courseData);
      console.log("✅ Course created, refreshing list...");
      await refreshCourses();
    } catch (error) {
      console.error("❌ Error creating course:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinCourse = async (courseId: string) => {
    if (!user?.email) {
      throw new Error("No user logged in");
    }

    setLoading(true);
    setError(null);
    try {
      const studentId = (user as any).id || (user as any)._id;
      
      if (!studentId) {
        throw new Error("No se pudo obtener el ID del estudiante");
      }

      console.log("🎓 Joining course:", courseId, "as student:", studentId);
      await joinCourseUC.execute(courseId, studentId);
      console.log("✅ Course joined successfully, refreshing list...");
      await refreshCourses();
    } catch (error) {
      console.error("❌ Error joining course:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("CourseContext - User changed:", user);
    console.log("CourseContext - User email:", user?.email);
    console.log("CourseContext - User _id:", user?._id);
    
    if (user?.email) {
      console.log("CourseContext - Refreshing courses...");
      refreshCourses().catch(error => {
        console.error("CourseContext - Error in refreshCourses:", error);
      });
    } else {
      console.log("CourseContext - No user, skipping refresh");
      setError("No user logged in");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <CourseContext.Provider
      value={{
        availableCourses,
        createdCourses,
        enrolledCourses,
        loading,
        error,
        refreshCourses,
        createCourse,
        joinCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used inside CourseProvider");
  return ctx;
}


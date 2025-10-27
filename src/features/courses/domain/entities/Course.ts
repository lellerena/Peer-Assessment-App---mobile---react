export type Course = {
  _id?: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  categoryIds?: string[];
};

export type NewCourse = Omit<Course, "_id">;



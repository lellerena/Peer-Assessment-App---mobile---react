export type Activity = {
  _id?: string;
  title: string;
  description?: string;
  date?: string; // formato date de Roble
  courseId: string;
  categoryId: string;
  groupId?: string; // opcional: si está asignada a un grupo específico
};

export type NewActivity = Omit<Activity, "_id">;
export type UpdateActivity = Partial<Omit<Activity, "_id" | "courseId">> & { _id: string };


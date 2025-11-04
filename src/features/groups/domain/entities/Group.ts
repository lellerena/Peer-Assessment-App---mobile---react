export type Group = {
  _id?: string;
  categoryId: string;
  name: string;
  studentIds: string[];
  courseId?: string;
};

export type NewGroup = Omit<Group, "_id">;
export type UpdateGroup = Partial<Omit<Group, "_id" | "categoryId">> & { _id: string };



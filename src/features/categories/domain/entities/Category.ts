export type GroupingMethod = "manual" | "random" | "selfAssigned";

export type Category = {
  _id?: string;
  courseId: string;
  name: string;
  groupingMethod: GroupingMethod;
  groupSize: number;
};

export type Group = {
  _id?: string;
  categoryId: string;
  name: string;
  studentIds: string[];
  courseId?: string;
};

export type NewCategory = Omit<Category, "_id">;
export type UpdateCategory = Partial<Omit<Category, "_id" | "courseId">> & { _id: string };
export type NewGroup = Omit<Group, "_id">;
export type UpdateGroup = Partial<Omit<Group, "_id" | "categoryId">> & { _id: string };



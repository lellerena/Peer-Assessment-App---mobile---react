import { Category, Group, NewCategory, NewGroup, UpdateCategory, UpdateGroup } from "../entities/Category";

export interface CategoryRepository {
  getCategoriesByCourse(courseId: string): Promise<Category[]>;
  createCategory(category: NewCategory): Promise<Category>;
  updateCategory(category: UpdateCategory): Promise<void>;
  deleteCategory(categoryId: string): Promise<void>;

  getGroupsByCategory(categoryId: string): Promise<Group[]>;
  createGroup(group: NewGroup): Promise<Group>;
  updateGroup(group: UpdateGroup): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;
  addStudentToGroup(groupId: string, studentId: string): Promise<void>;
  removeStudentFromGroup(groupId: string, studentId: string): Promise<void>;
}



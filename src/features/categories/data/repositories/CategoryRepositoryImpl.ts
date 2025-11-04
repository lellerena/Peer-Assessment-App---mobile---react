import { Category, Group, NewCategory, NewGroup, UpdateCategory, UpdateGroup } from "../../domain/entities/Category";
import { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import { CategoryDataSource } from "../datasources/CategoryDataSource";

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(private ds: CategoryDataSource) {}

  getCategoriesByCourse(courseId: string): Promise<Category[]> {
    return this.ds.getCategoriesByCourse(courseId);
  }
  createCategory(category: NewCategory): Promise<Category> {
    return this.ds.createCategory(category);
  }
  updateCategory(category: UpdateCategory): Promise<void> {
    return this.ds.updateCategory(category);
  }
  deleteCategory(categoryId: string): Promise<void> {
    return this.ds.deleteCategory(categoryId);
  }
  getGroupsByCategory(categoryId: string): Promise<Group[]> {
    return this.ds.getGroupsByCategory(categoryId);
  }
  createGroup(group: NewGroup): Promise<Group> {
    return this.ds.createGroup(group);
  }
  updateGroup(group: UpdateGroup): Promise<void> {
    return this.ds.updateGroup(group);
  }
  deleteGroup(groupId: string): Promise<void> {
    return this.ds.deleteGroup(groupId);
  }
  addStudentToGroup(groupId: string, studentId: string): Promise<void> {
    return this.ds.addStudentToGroup(groupId, studentId);
  }
  removeStudentFromGroup(groupId: string, studentId: string): Promise<void> {
    return this.ds.removeStudentFromGroup(groupId, studentId);
  }
}



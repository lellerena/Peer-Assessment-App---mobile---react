import { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";
import { CourseRemoteDataSourceImpl } from "@/src/features/courses/data/datasources/CourseRemoteDataSourceImpl";
import { CourseRepositoryImpl } from "@/src/features/courses/data/repositories/CourseRepositoryImpl";
import { CreateCourseUseCase } from "@/src/features/courses/domain/usecases/CreateCourseUseCase";
import { GetAvailableCoursesUseCase } from "@/src/features/courses/domain/usecases/GetAvailableCoursesUseCase";
import { GetCreatedCoursesUseCase } from "@/src/features/courses/domain/usecases/GetCreatedCoursesUseCase";
import { GetEnrolledCoursesUseCase } from "@/src/features/courses/domain/usecases/GetEnrolledCoursesUseCase";
import { JoinCourseUseCase } from "@/src/features/courses/domain/usecases/JoinCourseUseCase";
import { ProductRemoteDataSourceImp } from "@/src/features/products/data/datasources/ProductRemoteDataSourceImp";
import { ProductRepositoryImpl } from "@/src/features/products/data/repositories/ProductRepositoryImpl";
import { AddProductUseCase } from "@/src/features/products/domain/usecases/AddProductUseCase";
import { DeleteProductUseCase } from "@/src/features/products/domain/usecases/DeleteProductUseCase";
import { GetProductByIdUseCase } from "@/src/features/products/domain/usecases/GetProductByIdUseCase";
import { GetProductsUseCase } from "@/src/features/products/domain/usecases/GetProductsUseCase";
import { UpdateProductUseCase } from "@/src/features/products/domain/usecases/UpdateProductUseCase";
import { Container } from "./container";
// Category module imports
import { CategoryRemoteDataSourceImpl } from "@/src/features/categories/data/datasources/CategoryRemoteDataSourceImpl";
import { CategoryRepositoryImpl } from "@/src/features/categories/data/repositories/CategoryRepositoryImpl";
import { GetCategoriesByCourseUseCase } from "@/src/features/categories/domain/usecases/GetCategoriesByCourseUseCase";
import { CreateCategoryUseCase } from "@/src/features/categories/domain/usecases/CreateCategoryUseCase";
import { UpdateCategoryUseCase } from "@/src/features/categories/domain/usecases/UpdateCategoryUseCase";
import { DeleteCategoryUseCase } from "@/src/features/categories/domain/usecases/DeleteCategoryUseCase";
import { GetGroupsByCategoryUseCase } from "@/src/features/categories/domain/usecases/GetGroupsByCategoryUseCase";
import { CreateGroupUseCase } from "@/src/features/categories/domain/usecases/CreateGroupUseCase";
import { UpdateGroupUseCase } from "@/src/features/categories/domain/usecases/UpdateGroupUseCase";
import { DeleteGroupUseCase } from "@/src/features/categories/domain/usecases/DeleteGroupUseCase";
import { AddStudentToGroupUseCase } from "@/src/features/categories/domain/usecases/AddStudentToGroupUseCase";
import { RemoveStudentFromGroupUseCase } from "@/src/features/categories/domain/usecases/RemoveStudentFromGroupUseCase";
// Groups separate feature
import { GroupRemoteDataSourceImpl } from "@/src/features/groups/data/datasources/GroupRemoteDataSourceImpl";
import { GroupRepositoryImpl } from "@/src/features/groups/data/repositories/GroupRepositoryImpl";
import { GetGroupsByCategoryUseCase_v2 } from "@/src/features/groups/domain/usecases/GetGroupsByCategoryUseCase";
import { CreateGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/CreateGroupUseCase";
import { UpdateGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/UpdateGroupUseCase";
import { DeleteGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/DeleteGroupUseCase";
import { AddStudentToGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/AddStudentToGroupUseCase";
import { RemoveStudentFromGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/RemoveStudentFromGroupUseCase";
// Activities module
import { ActivityRemoteDataSourceImpl } from "@/src/features/activities/data/datasources/ActivityRemoteDataSourceImpl";
import { ActivityRepositoryImpl } from "@/src/features/activities/data/repositories/ActivityRepositoryImpl";
import { GetActivitiesByCourseUseCase } from "@/src/features/activities/domain/usecases/GetActivitiesByCourseUseCase";
import { GetActivitiesByCategoryUseCase } from "@/src/features/activities/domain/usecases/GetActivitiesByCategoryUseCase";
import { CreateActivityUseCase } from "@/src/features/activities/domain/usecases/CreateActivityUseCase";
import { UpdateActivityUseCase } from "@/src/features/activities/domain/usecases/UpdateActivityUseCase";
import { DeleteActivityUseCase } from "@/src/features/activities/domain/usecases/DeleteActivityUseCase";
// Submissions module
import { SubmissionRemoteDataSourceImpl } from "@/src/features/submissions/data/datasources/SubmissionRemoteDataSourceImpl";
import { SubmissionRepositoryImpl } from "@/src/features/submissions/data/repositories/SubmissionRepositoryImpl";
import { CreateSubmissionUseCase } from "@/src/features/submissions/domain/usecases/CreateSubmissionUseCase";
import { UpdateSubmissionUseCase } from "@/src/features/submissions/domain/usecases/UpdateSubmissionUseCase";
import { GetSubmissionByActivityAndStudentUseCase } from "@/src/features/submissions/domain/usecases/GetSubmissionByActivityAndStudentUseCase";
import { GetSubmissionsByActivityUseCase } from "@/src/features/submissions/domain/usecases/GetSubmissionsByActivityUseCase";
// Grades module
import { GradeRemoteDataSourceImpl } from "@/src/features/grades/data/datasources/GradeRemoteDataSourceImpl";
import { GradeRepositoryImpl } from "@/src/features/grades/data/repositories/GradeRepositoryImpl";
import { GetGradeByActivityAndStudentUseCase } from "@/src/features/grades/domain/usecases/GetGradeByActivityAndStudentUseCase";
import { GetGradesByCourseUseCase } from "@/src/features/grades/domain/usecases/GetGradesByCourseUseCase";
import { GetGradesByActivityUseCase } from "@/src/features/grades/domain/usecases/GetGradesByActivityUseCase";
import { SaveGradeUseCase } from "@/src/features/grades/domain/usecases/SaveGradeUseCase";

const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
    //useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
    const container = useMemo(() => {
        const c = new Container();

        const authDS = new AuthRemoteDataSourceImpl();
        const authRepo = new AuthRepositoryImpl(authDS);

        c.register(TOKENS.AuthRemoteDS, authDS)
            .register(TOKENS.AuthRepo, authRepo)
            .register(TOKENS.LoginUC, new LoginUseCase(authRepo))
            .register(TOKENS.SignupUC, new SignupUseCase(authRepo))
            .register(TOKENS.LogoutUC, new LogoutUseCase(authRepo))
            .register(TOKENS.GetCurrentUserUC, new GetCurrentUserUseCase(authRepo));


        const remoteDS = new ProductRemoteDataSourceImp(authDS);
        const productRepo = new ProductRepositoryImpl(remoteDS);

        c.register(TOKENS.ProductRemoteDS, remoteDS)
            .register(TOKENS.ProductRepo, productRepo).register(TOKENS.AddProductUC, new AddProductUseCase(productRepo))
            .register(TOKENS.UpdateProductUC, new UpdateProductUseCase(productRepo))
            .register(TOKENS.DeleteProductUC, new DeleteProductUseCase(productRepo))
            .register(TOKENS.GetProductsUC, new GetProductsUseCase(productRepo))
            .register(TOKENS.GetProductByIdUC, new GetProductByIdUseCase(productRepo));

        const courseRemoteDS = new CourseRemoteDataSourceImpl(authDS);
        const courseRepo = new CourseRepositoryImpl(courseRemoteDS);

        c.register(TOKENS.CourseRemoteDS, courseRemoteDS)
            .register(TOKENS.CourseRepo, courseRepo)
            .register(TOKENS.GetAvailableCoursesUC, new GetAvailableCoursesUseCase(courseRepo))
            .register(TOKENS.GetCreatedCoursesUC, new GetCreatedCoursesUseCase(courseRepo))
            .register(TOKENS.GetEnrolledCoursesUC, new GetEnrolledCoursesUseCase(courseRepo))
            .register(TOKENS.CreateCourseUC, new CreateCourseUseCase(courseRepo))
            .register(TOKENS.JoinCourseUC, new JoinCourseUseCase(courseRepo));

        // Categories wiring
        const categoryRemoteDS = new CategoryRemoteDataSourceImpl(authDS);
        const categoryRepo = new CategoryRepositoryImpl(categoryRemoteDS);
        c.register(TOKENS.CategoryRemoteDS, categoryRemoteDS)
            .register(TOKENS.CategoryRepo, categoryRepo)
            .register(TOKENS.GetCategoriesByCourseUC, new GetCategoriesByCourseUseCase(categoryRepo))
            .register(TOKENS.CreateCategoryUC, new CreateCategoryUseCase(categoryRepo))
            .register(TOKENS.UpdateCategoryUC, new UpdateCategoryUseCase(categoryRepo))
            .register(TOKENS.DeleteCategoryUC, new DeleteCategoryUseCase(categoryRepo))
            .register(TOKENS.GetGroupsByCategoryUC, new GetGroupsByCategoryUseCase(categoryRepo))
            .register(TOKENS.CreateGroupUC, new CreateGroupUseCase(categoryRepo))
            .register(TOKENS.UpdateGroupUC, new UpdateGroupUseCase(categoryRepo))
            .register(TOKENS.DeleteGroupUC, new DeleteGroupUseCase(categoryRepo))
            .register(TOKENS.AddStudentToGroupUC, new AddStudentToGroupUseCase(categoryRepo))
            .register(TOKENS.RemoveStudentFromGroupUC, new RemoveStudentFromGroupUseCase(categoryRepo));

        // Groups DI
        const groupRemoteDS = new GroupRemoteDataSourceImpl(authDS);
        const groupRepo = new GroupRepositoryImpl(groupRemoteDS);
        c.register(TOKENS.GroupRemoteDS, groupRemoteDS)
            .register(TOKENS.GroupRepo, groupRepo)
            .register(TOKENS.GetGroupsByCategoryUC_v2, new GetGroupsByCategoryUseCase_v2(groupRepo))
            .register(TOKENS.CreateGroupUC_v2, new CreateGroupUseCase_v2(groupRepo))
            .register(TOKENS.UpdateGroupUC_v2, new UpdateGroupUseCase_v2(groupRepo))
            .register(TOKENS.DeleteGroupUC_v2, new DeleteGroupUseCase_v2(groupRepo))
            .register(TOKENS.AddStudentToGroupUC_v2, new AddStudentToGroupUseCase_v2(groupRepo))
            .register(TOKENS.RemoveStudentFromGroupUC_v2, new RemoveStudentFromGroupUseCase_v2(groupRepo));

        // Activities DI
        const activityRemoteDS = new ActivityRemoteDataSourceImpl(authDS);
        const activityRepo = new ActivityRepositoryImpl(activityRemoteDS);
        c.register(TOKENS.ActivityRemoteDS, activityRemoteDS)
            .register(TOKENS.ActivityRepo, activityRepo)
            .register(TOKENS.GetActivitiesByCourseUC, new GetActivitiesByCourseUseCase(activityRepo))
            .register(TOKENS.GetActivitiesByCategoryUC, new GetActivitiesByCategoryUseCase(activityRepo))
            .register(TOKENS.CreateActivityUC, new CreateActivityUseCase(activityRepo))
            .register(TOKENS.UpdateActivityUC, new UpdateActivityUseCase(activityRepo))
            .register(TOKENS.DeleteActivityUC, new DeleteActivityUseCase(activityRepo));

        // Submissions DI
        const submissionRemoteDS = new SubmissionRemoteDataSourceImpl(authDS);
        const submissionRepo = new SubmissionRepositoryImpl(submissionRemoteDS);
        c.register(TOKENS.SubmissionRemoteDS, submissionRemoteDS)
            .register(TOKENS.SubmissionRepo, submissionRepo)
            .register(TOKENS.CreateSubmissionUC, new CreateSubmissionUseCase(submissionRepo))
            .register(TOKENS.UpdateSubmissionUC, new UpdateSubmissionUseCase(submissionRepo))
            .register(TOKENS.GetSubmissionByActivityAndStudentUC, new GetSubmissionByActivityAndStudentUseCase(submissionRepo))
            .register(TOKENS.GetSubmissionsByActivityUC, new GetSubmissionsByActivityUseCase(submissionRepo));

        // Grades DI
        const gradeRemoteDS = new GradeRemoteDataSourceImpl(authDS);
        const gradeRepo = new GradeRepositoryImpl(gradeRemoteDS);
        c.register(TOKENS.GradeRemoteDS, gradeRemoteDS)
            .register(TOKENS.GradeRepo, gradeRepo)
            .register(TOKENS.GetGradeByActivityAndStudentUC, new GetGradeByActivityAndStudentUseCase(gradeRepo))
            .register(TOKENS.GetGradesByCourseUC, new GetGradesByCourseUseCase(gradeRepo))
            .register(TOKENS.GetGradesByActivityUC, new GetGradesByActivityUseCase(gradeRepo))
            .register(TOKENS.SaveGradeUC, new SaveGradeUseCase(gradeRepo));

        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}

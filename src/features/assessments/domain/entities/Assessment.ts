export type AssessmentStatus = 'draft' | 'active' | 'completed';

export type AssessmentVisibility = 'public' | 'private';

export type AssessmentCriteria = 'punctuality' | 'contributions' | 'commitment' | 'attitude';

export type Assessment = {
  _id?: string;
  name: string;
  activityId: string;
  courseId: string;
  categoryId: string;
  groupId?: string;
  duration: number; // en minutos
  durationUnit: 'minutes' | 'hours';
  visibility: AssessmentVisibility;
  status: AssessmentStatus;
  startDate?: string; // fecha de inicio cuando se activa
  endDate?: string; // fecha de fin calculada (startDate + duration)
  activatedAt?: string; // cuando el profesor la activó
  completedAt?: string; // cuando se completó
  activeCriteria: AssessmentCriteria[]; // criterios activos para esta evaluación
  description?: string;
};

export type NewAssessment = Omit<Assessment, "_id" | "status" | "startDate" | "endDate" | "activatedAt" | "completedAt">;
export type UpdateAssessment = Partial<Omit<Assessment, "_id" | "courseId" | "activityId">> & { _id: string };


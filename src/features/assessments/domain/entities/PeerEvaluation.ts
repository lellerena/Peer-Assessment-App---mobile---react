import { AssessmentCriteria } from "./Assessment";

export type PeerEvaluation = {
  _id?: string;
  assessmentId: string;
  activityId: string;
  courseId: string;
  groupId: string;
  evaluatorId: string; // ID del estudiante que evalúa
  evaluatedId: string; // ID del estudiante evaluado
  criterias: Record<AssessmentCriteria, number>; // puntuación por criterio (2.0, 3.0, 4.0, 5.0)
  averageScore: number; // promedio de los criterios
  comment?: string; // comentario opcional del evaluador
  evaluatedAt: string; // fecha/hora de la evaluación
};

export type NewPeerEvaluation = Omit<PeerEvaluation, "_id" | "averageScore" | "evaluatedAt">;
export type UpdatePeerEvaluation = Partial<Omit<PeerEvaluation, "_id">> & { _id: string };


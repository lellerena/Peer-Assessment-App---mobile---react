import { Assessment, NewAssessment, UpdateAssessment } from "../entities/Assessment";
import { PeerEvaluation, NewPeerEvaluation } from "../entities/PeerEvaluation";

export interface AssessmentRepository {
  getAssessmentsByActivity(activityId: string): Promise<Assessment[]>;
  getAssessmentsByCourse(courseId: string): Promise<Assessment[]>;
  getAssessmentById(assessmentId: string): Promise<Assessment | null>;
  createAssessment(assessment: NewAssessment): Promise<Assessment>;
  updateAssessment(assessment: UpdateAssessment): Promise<void>;
  deleteAssessment(assessmentId: string): Promise<void>;
  activateAssessment(assessmentId: string): Promise<Assessment>;
  completeAssessment(assessmentId: string): Promise<void>;
  
  // Peer Evaluations
  createPeerEvaluation(evaluation: NewPeerEvaluation): Promise<PeerEvaluation>;
  getPeerEvaluationsByAssessment(assessmentId: string): Promise<PeerEvaluation[]>;
  getPeerEvaluationsByEvaluator(assessmentId: string, evaluatorId: string): Promise<PeerEvaluation[]>;
  getPeerEvaluationsByEvaluated(assessmentId: string, evaluatedId: string): Promise<PeerEvaluation[]>;
  getPeerEvaluationByEvaluatorAndEvaluated(assessmentId: string, evaluatorId: string, evaluatedId: string): Promise<PeerEvaluation | null>;
  updatePeerEvaluation(evaluation: UpdatePeerEvaluation): Promise<void>;
}


import { Assessment, NewAssessment, UpdateAssessment } from "../../domain/entities/Assessment";
import { AssessmentRepository } from "../../domain/repositories/AssessmentRepository";
import { PeerEvaluation, NewPeerEvaluation, UpdatePeerEvaluation } from "../../domain/entities/PeerEvaluation";
import { AssessmentDataSource } from "../datasources/AssessmentDataSource";

export class AssessmentRepositoryImpl implements AssessmentRepository {
  constructor(private ds: AssessmentDataSource) {}

  getAssessmentsByActivity(activityId: string): Promise<Assessment[]> {
    return this.ds.getAssessmentsByActivity(activityId);
  }

  getAssessmentsByCourse(courseId: string): Promise<Assessment[]> {
    return this.ds.getAssessmentsByCourse(courseId);
  }

  getAssessmentById(assessmentId: string): Promise<Assessment | null> {
    return this.ds.getAssessmentById(assessmentId);
  }

  createAssessment(assessment: NewAssessment): Promise<Assessment> {
    return this.ds.createAssessment(assessment);
  }

  updateAssessment(assessment: UpdateAssessment): Promise<void> {
    return this.ds.updateAssessment(assessment);
  }

  deleteAssessment(assessmentId: string): Promise<void> {
    return this.ds.deleteAssessment(assessmentId);
  }

  activateAssessment(assessmentId: string): Promise<Assessment> {
    return this.ds.activateAssessment(assessmentId);
  }

  completeAssessment(assessmentId: string): Promise<void> {
    return this.ds.completeAssessment(assessmentId);
  }

  // Peer Evaluations
  createPeerEvaluation(evaluation: NewPeerEvaluation): Promise<PeerEvaluation> {
    return this.ds.createPeerEvaluation(evaluation);
  }

  getPeerEvaluationsByAssessment(assessmentId: string): Promise<PeerEvaluation[]> {
    return this.ds.getPeerEvaluationsByAssessment(assessmentId);
  }

  getPeerEvaluationsByEvaluator(assessmentId: string, evaluatorId: string): Promise<PeerEvaluation[]> {
    return this.ds.getPeerEvaluationsByEvaluator(assessmentId, evaluatorId);
  }

  getPeerEvaluationsByEvaluated(assessmentId: string, evaluatedId: string): Promise<PeerEvaluation[]> {
    return this.ds.getPeerEvaluationsByEvaluated(assessmentId, evaluatedId);
  }

  getPeerEvaluationByEvaluatorAndEvaluated(assessmentId: string, evaluatorId: string, evaluatedId: string): Promise<PeerEvaluation | null> {
    return this.ds.getPeerEvaluationByEvaluatorAndEvaluated(assessmentId, evaluatorId, evaluatedId);
  }

  updatePeerEvaluation(evaluation: UpdatePeerEvaluation): Promise<void> {
    return this.ds.updatePeerEvaluation(evaluation);
  }
}


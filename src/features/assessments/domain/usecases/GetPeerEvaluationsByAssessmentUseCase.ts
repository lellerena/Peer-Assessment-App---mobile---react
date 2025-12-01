import { PeerEvaluation } from "../entities/PeerEvaluation";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class GetPeerEvaluationsByAssessmentUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessmentId: string): Promise<PeerEvaluation[]> {
    return this.repo.getPeerEvaluationsByAssessment(assessmentId);
  }
}


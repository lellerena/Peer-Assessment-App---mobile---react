import { PeerEvaluation } from "../entities/PeerEvaluation";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class GetPeerEvaluationsByEvaluatorUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessmentId: string, evaluatorId: string): Promise<PeerEvaluation[]> {
    return this.repo.getPeerEvaluationsByEvaluator(assessmentId, evaluatorId);
  }
}


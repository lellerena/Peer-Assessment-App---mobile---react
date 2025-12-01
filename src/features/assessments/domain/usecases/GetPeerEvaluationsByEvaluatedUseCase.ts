import { PeerEvaluation } from "../entities/PeerEvaluation";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class GetPeerEvaluationsByEvaluatedUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessmentId: string, evaluatedId: string): Promise<PeerEvaluation[]> {
    return this.repo.getPeerEvaluationsByEvaluated(assessmentId, evaluatedId);
  }
}


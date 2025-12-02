import { PeerEvaluation } from "../entities/PeerEvaluation";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class GetPeerEvaluationByEvaluatorAndEvaluatedUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(assessmentId: string, evaluatorId: string, evaluatedId: string): Promise<PeerEvaluation | null> {
    return this.repo.getPeerEvaluationByEvaluatorAndEvaluated(assessmentId, evaluatorId, evaluatedId);
  }
}


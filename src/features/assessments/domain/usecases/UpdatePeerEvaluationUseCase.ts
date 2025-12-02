import { UpdatePeerEvaluation } from "../entities/PeerEvaluation";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class UpdatePeerEvaluationUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(evaluation: UpdatePeerEvaluation): Promise<void> {
    return this.repo.updatePeerEvaluation(evaluation);
  }
}


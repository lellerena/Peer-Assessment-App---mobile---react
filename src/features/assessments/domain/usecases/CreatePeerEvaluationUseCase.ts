import { PeerEvaluation, NewPeerEvaluation } from "../entities/PeerEvaluation";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export class CreatePeerEvaluationUseCase {
  constructor(private repo: AssessmentRepository) {}
  execute(evaluation: NewPeerEvaluation): Promise<PeerEvaluation> {
    return this.repo.createPeerEvaluation(evaluation);
  }
}


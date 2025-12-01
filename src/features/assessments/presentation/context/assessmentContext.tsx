import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import React, { createContext, useContext, useState } from "react";
import { Assessment, NewAssessment } from "../../domain/entities/Assessment";
import { PeerEvaluation, NewPeerEvaluation } from "../../domain/entities/PeerEvaluation";
import { ActivateAssessmentUseCase } from "../../domain/usecases/ActivateAssessmentUseCase";
import { CompleteAssessmentUseCase } from "../../domain/usecases/CompleteAssessmentUseCase";
import { CreateAssessmentUseCase } from "../../domain/usecases/CreateAssessmentUseCase";
import { CreatePeerEvaluationUseCase } from "../../domain/usecases/CreatePeerEvaluationUseCase";
import { DeleteAssessmentUseCase } from "../../domain/usecases/DeleteAssessmentUseCase";
import { GetAssessmentByIdUseCase } from "../../domain/usecases/GetAssessmentByIdUseCase";
import { GetAssessmentsByActivityUseCase } from "../../domain/usecases/GetAssessmentsByActivityUseCase";
import { GetAssessmentsByCourseUseCase } from "../../domain/usecases/GetAssessmentsByCourseUseCase";
import { GetPeerEvaluationByEvaluatorAndEvaluatedUseCase } from "../../domain/usecases/GetPeerEvaluationByEvaluatorAndEvaluatedUseCase";
import { GetPeerEvaluationsByAssessmentUseCase } from "../../domain/usecases/GetPeerEvaluationsByAssessmentUseCase";
import { GetPeerEvaluationsByEvaluatorUseCase } from "../../domain/usecases/GetPeerEvaluationsByEvaluatorUseCase";
import { UpdateAssessmentUseCase } from "../../domain/usecases/UpdateAssessmentUseCase";
import { UpdatePeerEvaluationUseCase } from "../../domain/usecases/UpdatePeerEvaluationUseCase";

type AssessmentContextType = {
  assessments: Assessment[];
  loading: boolean;
  error: string | null;
  refreshAssessments: (courseId: string) => Promise<void>;
  refreshAssessmentsByActivity: (activityId: string) => Promise<void>;
  createAssessment: (assessment: NewAssessment) => Promise<Assessment>;
  updateAssessment: (assessment: Partial<Assessment> & { _id: string }) => Promise<void>;
  deleteAssessment: (assessmentId: string) => Promise<void>;
  activateAssessment: (assessmentId: string) => Promise<Assessment>;
  completeAssessment: (assessmentId: string) => Promise<void>;
  getAssessmentById: (assessmentId: string) => Promise<Assessment | null>;
  // Peer Evaluations
  createPeerEvaluation: (evaluation: NewPeerEvaluation) => Promise<PeerEvaluation>;
  getPeerEvaluationsByAssessment: (assessmentId: string) => Promise<PeerEvaluation[]>;
  getPeerEvaluationsByEvaluator: (assessmentId: string, evaluatorId: string) => Promise<PeerEvaluation[]>;
  getPeerEvaluationByEvaluatorAndEvaluated: (assessmentId: string, evaluatorId: string, evaluatedId: string) => Promise<PeerEvaluation | null>;
  updatePeerEvaluation: (evaluation: Partial<PeerEvaluation> & { _id: string }) => Promise<void>;
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const getAssessmentsByCourseUC = di.resolve<GetAssessmentsByCourseUseCase>(TOKENS.GetAssessmentsByCourseUC);
  const getAssessmentsByActivityUC = di.resolve<GetAssessmentsByActivityUseCase>(TOKENS.GetAssessmentsByActivityUC);
  const getAssessmentByIdUC = di.resolve<GetAssessmentByIdUseCase>(TOKENS.GetAssessmentByIdUC);
  const createAssessmentUC = di.resolve<CreateAssessmentUseCase>(TOKENS.CreateAssessmentUC);
  const updateAssessmentUC = di.resolve<UpdateAssessmentUseCase>(TOKENS.UpdateAssessmentUC);
  const deleteAssessmentUC = di.resolve<DeleteAssessmentUseCase>(TOKENS.DeleteAssessmentUC);
  const activateAssessmentUC = di.resolve<ActivateAssessmentUseCase>(TOKENS.ActivateAssessmentUC);
  const completeAssessmentUC = di.resolve<CompleteAssessmentUseCase>(TOKENS.CompleteAssessmentUC);
  const createPeerEvaluationUC = di.resolve<CreatePeerEvaluationUseCase>(TOKENS.CreatePeerEvaluationUC);
  const getPeerEvaluationsByAssessmentUC = di.resolve<GetPeerEvaluationsByAssessmentUseCase>(TOKENS.GetPeerEvaluationsByAssessmentUC);
  const getPeerEvaluationsByEvaluatorUC = di.resolve<GetPeerEvaluationsByEvaluatorUseCase>(TOKENS.GetPeerEvaluationsByEvaluatorUC);
  const getPeerEvaluationByEvaluatorAndEvaluatedUC = di.resolve<GetPeerEvaluationByEvaluatorAndEvaluatedUseCase>(TOKENS.GetPeerEvaluationByEvaluatorAndEvaluatedUC);
  const updatePeerEvaluationUC = di.resolve<UpdatePeerEvaluationUseCase>(TOKENS.UpdatePeerEvaluationUC);

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAssessments = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssessmentsByCourseUC.execute(courseId);
      setAssessments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const refreshAssessmentsByActivity = async (activityId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssessmentsByActivityUC.execute(activityId);
      setAssessments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async (assessment: NewAssessment): Promise<Assessment> => {
    setLoading(true);
    setError(null);
    try {
      const created = await createAssessmentUC.execute(assessment);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAssessment = async (assessment: Partial<Assessment> & { _id: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await updateAssessmentUC.execute(assessment as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (assessmentId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteAssessmentUC.execute(assessmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateAssessment = async (assessmentId: string): Promise<Assessment> => {
    setLoading(true);
    setError(null);
    try {
      const activated = await activateAssessmentUC.execute(assessmentId);
      return activated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeAssessment = async (assessmentId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await completeAssessmentUC.execute(assessmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentById = async (assessmentId: string): Promise<Assessment | null> => {
    try {
      return await getAssessmentByIdUC.execute(assessmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  };

  // Peer Evaluations
  const createPeerEvaluation = async (evaluation: NewPeerEvaluation): Promise<PeerEvaluation> => {
    setLoading(true);
    setError(null);
    try {
      return await createPeerEvaluationUC.execute(evaluation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPeerEvaluationsByAssessment = async (assessmentId: string): Promise<PeerEvaluation[]> => {
    try {
      return await getPeerEvaluationsByAssessmentUC.execute(assessmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return [];
    }
  };

  const getPeerEvaluationsByEvaluator = async (assessmentId: string, evaluatorId: string): Promise<PeerEvaluation[]> => {
    try {
      return await getPeerEvaluationsByEvaluatorUC.execute(assessmentId, evaluatorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return [];
    }
  };

  const getPeerEvaluationByEvaluatorAndEvaluated = async (assessmentId: string, evaluatorId: string, evaluatedId: string): Promise<PeerEvaluation | null> => {
    try {
      return await getPeerEvaluationByEvaluatorAndEvaluatedUC.execute(assessmentId, evaluatorId, evaluatedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  };

  const updatePeerEvaluation = async (evaluation: Partial<PeerEvaluation> & { _id: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await updatePeerEvaluationUC.execute(evaluation as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessments,
        loading,
        error,
        refreshAssessments,
        refreshAssessmentsByActivity,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        activateAssessment,
        completeAssessment,
        getAssessmentById,
        createPeerEvaluation,
        getPeerEvaluationsByAssessment,
        getPeerEvaluationsByEvaluator,
        getPeerEvaluationByEvaluatorAndEvaluated,
        updatePeerEvaluation,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessments() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessments must be used inside AssessmentProvider");
  return ctx;
}


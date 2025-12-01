import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Assessment, NewAssessment, UpdateAssessment } from "../../domain/entities/Assessment";
import { PeerEvaluation, NewPeerEvaluation, UpdatePeerEvaluation } from "../../domain/entities/PeerEvaluation";
import { AssessmentDataSource } from "./AssessmentDataSource";

export class AssessmentRemoteDataSourceImpl implements AssessmentDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly assessmentsTable = "assessments";
  private readonly peerEvaluationsTable = "peerEvaluations";

  private prefs: ILocalPreferences;

  constructor(private authService: AuthRemoteDataSourceImpl, projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
  }

  private async authorizedFetch(url: string, options: RequestInit, retry = true): Promise<Response> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) throw new Error("No authentication token available - Please log in again");
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 && retry) {
      const refreshed = await this.authService.refreshToken();
      if (refreshed) {
        const newToken = await this.prefs.retrieveData<string>("token");
        const retryHeaders = { ...(options.headers || {}), Authorization: `Bearer ${newToken}` };
        return await fetch(url, { ...options, headers: retryHeaders });
      }
    }
    return response;
  }

  async getAssessmentsByActivity(activityId: string): Promise<Assessment[]> {
    const url = `${this.baseUrl}/read?tableName=${this.assessmentsTable}&activityId=${activityId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching assessments: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as Assessment[]) : [];
  }

  async getAssessmentsByCourse(courseId: string): Promise<Assessment[]> {
    const url = `${this.baseUrl}/read?tableName=${this.assessmentsTable}&courseId=${courseId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) {
      const errorText = await r.text();
      // Si es 500 y la tabla no existe, retornar array vacío sin mostrar error
      if (r.status === 500) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message && errorJson.message.includes('does not exist')) {
            // Tabla no existe aún, retornar array vacío silenciosamente
            return [];
          }
        } catch {
          // Si no se puede parsear, asumir que es error de tabla no existente
          return [];
        }
      }
      // Para otros errores, lanzar excepción
      console.error('Error fetching assessments:', errorText);
      throw new Error(`Error fetching assessments: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    const assessments = Array.isArray(data) ? (data as any[]) : [];
    // Normalizar activeCriteria si viene como objeto de Roble
    return assessments.map(assessment => {
      if (assessment.activeCriteria && typeof assessment.activeCriteria === 'object' && (assessment.activeCriteria as any).data) {
        return { ...assessment, activeCriteria: (assessment.activeCriteria as any).data };
      } else if (!Array.isArray(assessment.activeCriteria)) {
        return { ...assessment, activeCriteria: [] };
      }
      return assessment;
    }) as Assessment[];
  }

  async getAssessmentById(assessmentId: string): Promise<Assessment | null> {
    const url = `${this.baseUrl}/read?tableName=${this.assessmentsTable}&_id=${assessmentId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching assessment: ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? (data as Assessment[]) : [];
    return list.length > 0 ? list[0] : null;
  }

  async createAssessment(assessment: NewAssessment): Promise<Assessment> {
    const url = `${this.baseUrl}/insert`;
    // Preparar el assessment para Roble - mantener activeCriteria como array simple
    const robleAssessment = {
      name: assessment.name,
      activityId: assessment.activityId,
      courseId: assessment.courseId,
      categoryId: assessment.categoryId,
      groupId: assessment.groupId,
      duration: assessment.duration,
      durationUnit: assessment.durationUnit,
      visibility: assessment.visibility,
      status: 'draft', // siempre se crea como borrador
      activeCriteria: assessment.activeCriteria || [],
      description: assessment.description
    };
    const body = JSON.stringify({ tableName: this.assessmentsTable, records: [robleAssessment] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) {
      const errorText = await r.text();
      console.error('Error creating assessment:', errorText);
      throw new Error(`Error creating assessment: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    const inserted = data.inserted?.[0] as any;
    
    // Verificar que inserted existe
    if (!inserted) {
      console.error('No data returned from create assessment:', data);
      throw new Error('No data returned from server after creating assessment');
    }
    
    // Normalizar activeCriteria si viene como objeto de Roble
    const normalizedAssessment = { ...inserted };
    if (normalizedAssessment.activeCriteria && typeof normalizedAssessment.activeCriteria === 'object' && (normalizedAssessment.activeCriteria as any).data) {
      normalizedAssessment.activeCriteria = (normalizedAssessment.activeCriteria as any).data;
    } else if (!Array.isArray(normalizedAssessment.activeCriteria)) {
      normalizedAssessment.activeCriteria = [];
    }
    
    return normalizedAssessment as Assessment;
  }

  async updateAssessment(assessment: UpdateAssessment): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = assessment as any;
    // Mantener activeCriteria como array simple (Roble lo maneja así)
    // No serializar como { data: [...] }
    const body = JSON.stringify({ tableName: this.assessmentsTable, idColumn: "_id", idValue: _id, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) {
      const errorText = await r.text();
      console.error('Error updating assessment:', errorText);
      throw new Error(`Error updating assessment: ${r.status} - ${errorText}`);
    }
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    const url = `${this.baseUrl}/delete`;
    const body = JSON.stringify({ tableName: this.assessmentsTable, idColumn: "_id", idValue: assessmentId });
    const r = await this.authorizedFetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error deleting assessment: ${r.status}`);
  }

  async activateAssessment(assessmentId: string): Promise<Assessment> {
    const assessment = await this.getAssessmentById(assessmentId);
    if (!assessment) throw new Error("Assessment not found");
    
    const now = new Date();
    const startDate = now.toISOString();
    const durationMs = assessment.durationUnit === 'hours' 
      ? assessment.duration * 60 * 60 * 1000 
      : assessment.duration * 60 * 1000;
    const endDate = new Date(now.getTime() + durationMs).toISOString();
    
    const updates = {
      status: 'active' as const,
      startDate,
      endDate,
      activatedAt: startDate
    };
    
    await this.updateAssessment({ _id: assessmentId, ...updates });
    return { ...assessment, ...updates };
  }

  async completeAssessment(assessmentId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.updateAssessment({ 
      _id: assessmentId, 
      status: 'completed',
      completedAt: now 
    });
  }

  // Peer Evaluations
  async createPeerEvaluation(evaluation: NewPeerEvaluation): Promise<PeerEvaluation> {
    const url = `${this.baseUrl}/insert`;
    // Calcular promedio
    const criteriaValues = Object.values(evaluation.criterias);
    const averageScore = criteriaValues.length > 0
      ? criteriaValues.reduce((sum, val) => sum + val, 0) / criteriaValues.length
      : 0;
    
    const robleEvaluation = {
      ...evaluation,
      averageScore: Number(averageScore.toFixed(2)),
      evaluatedAt: new Date().toISOString()
    };
    
    const body = JSON.stringify({ tableName: this.peerEvaluationsTable, records: [robleEvaluation] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error creating peer evaluation: ${r.status}`);
    const data = await r.json();
    return data.inserted?.[0] as PeerEvaluation;
  }

  async getPeerEvaluationsByAssessment(assessmentId: string): Promise<PeerEvaluation[]> {
    const url = `${this.baseUrl}/read?tableName=${this.peerEvaluationsTable}&assessmentId=${assessmentId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching peer evaluations: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as PeerEvaluation[]) : [];
  }

  async getPeerEvaluationsByEvaluator(assessmentId: string, evaluatorId: string): Promise<PeerEvaluation[]> {
    const url = `${this.baseUrl}/read?tableName=${this.peerEvaluationsTable}&assessmentId=${assessmentId}&evaluatorId=${evaluatorId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching peer evaluations: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as PeerEvaluation[]) : [];
  }

  async getPeerEvaluationsByEvaluated(assessmentId: string, evaluatedId: string): Promise<PeerEvaluation[]> {
    const url = `${this.baseUrl}/read?tableName=${this.peerEvaluationsTable}&assessmentId=${assessmentId}&evaluatedId=${evaluatedId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching peer evaluations: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as PeerEvaluation[]) : [];
  }

  async getPeerEvaluationByEvaluatorAndEvaluated(assessmentId: string, evaluatorId: string, evaluatedId: string): Promise<PeerEvaluation | null> {
    const url = `${this.baseUrl}/read?tableName=${this.peerEvaluationsTable}&assessmentId=${assessmentId}&evaluatorId=${evaluatorId}&evaluatedId=${evaluatedId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching peer evaluation: ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? (data as PeerEvaluation[]) : [];
    return list.length > 0 ? list[0] : null;
  }

  async updatePeerEvaluation(evaluation: UpdatePeerEvaluation): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = evaluation as any;
    // Recalcular promedio si se actualizan criterios
    if (updates.criterias) {
      const criteriaValues = Object.values(updates.criterias);
      updates.averageScore = criteriaValues.length > 0
        ? Number((criteriaValues.reduce((sum: number, val: number) => sum + val, 0) / criteriaValues.length).toFixed(2))
        : 0;
    }
    const body = JSON.stringify({ tableName: this.peerEvaluationsTable, idColumn: "_id", idValue: _id, updates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error updating peer evaluation: ${r.status}`);
  }
}


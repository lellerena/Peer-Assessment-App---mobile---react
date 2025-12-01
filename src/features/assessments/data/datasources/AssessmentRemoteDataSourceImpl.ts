import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Assessment, NewAssessment, UpdateAssessment } from "../../domain/entities/Assessment";
import { NewPeerEvaluation, PeerEvaluation, UpdatePeerEvaluation } from "../../domain/entities/PeerEvaluation";
import { AssessmentDataSource } from "./AssessmentDataSource";

export class AssessmentRemoteDataSourceImpl implements AssessmentDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly assessmentsTable = "assessment";
  private readonly peerEvaluationsTable = "assessment_responses";

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
    // Mapear de formato Roble a formato del código
    return assessments.map(roble => this.mapRobleToAssessment(roble));
  }

  async getAssessmentById(assessmentId: string): Promise<Assessment | null> {
    const url = `${this.baseUrl}/read?tableName=${this.assessmentsTable}&_id=${assessmentId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching assessment: ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? (data as any[]) : [];
    return list.length > 0 ? this.mapRobleToAssessment(list[0]) : null;
  }

  // Mapear de Assessment (código) a formato Roble
  private mapAssessmentToRoble(assessment: any): any {
    // Serializar activeCriteria como string JSON para Roble
    const activeCriteriaArray = assessment.activeCriteria || [];
    const activeCriteriaJson = Array.isArray(activeCriteriaArray) 
      ? JSON.stringify(activeCriteriaArray)
      : (typeof activeCriteriaArray === 'string' ? activeCriteriaArray : JSON.stringify([]));
    
    const status = assessment.status || 'draft';
    
    // Si está en draft y no tiene startDate, usar un placeholder (fecha muy lejana)
    // Roble requiere startDate como NOT NULL, pero en draft aún no se ha activado
    const startDate = assessment.startDate || (status === 'draft' 
      ? new Date('2099-12-31T23:59:59.000Z').toISOString() // Placeholder para drafts
      : new Date().toISOString());
    
    // Calcular endDate si no existe (solo si tenemos duration)
    let endDate = assessment.endDate;
    if (!endDate && assessment.duration && assessment.durationUnit) {
      const start = new Date(startDate);
      const durationMs = assessment.durationUnit === 'hours' 
        ? assessment.duration * 60 * 60 * 1000 
        : assessment.duration * 60 * 1000;
      endDate = new Date(start.getTime() + durationMs).toISOString();
    } else if (!endDate && status === 'draft') {
      // Placeholder para drafts
      endDate = new Date('2099-12-31T23:59:59.000Z').toISOString();
    }
    
    // Fecha actual para campos de auditoría que Roble requiere como NOT NULL
    const now = new Date().toISOString();
    
    const roble: any = {
      name: assessment.name,
      activityId: assessment.activityId,
      courseId: assessment.courseId,
      visibility: assessment.visibility,
      status: status,
      description: assessment.description || '',
      activeCriteria: activeCriteriaJson,
      startDate: startDate,
      endDate: endDate,
      // Campos de auditoría que Roble requiere como NOT NULL
      createdAt: assessment.createdAt || now,
      updatedAt: assessment.updatedAt || now
    };
    
    // Campos opcionales
    if (assessment.categoryId) roble.categoryId = assessment.categoryId;
    if (assessment.groupId) roble.groupId = assessment.groupId;
    if (assessment.duration !== undefined) roble.duration = assessment.duration;
    if (assessment.durationUnit) roble.durationUnit = assessment.durationUnit;
    if (assessment.activatedAt) roble.activatedAt = assessment.activatedAt;
    if (assessment.completedAt) roble.completedAt = assessment.completedAt;
    
    return roble;
  }

  // Mapear de formato Roble a Assessment
  private mapRobleToAssessment(roble: any): Assessment {
    const duration = roble.duration !== undefined && roble.duration !== null 
      ? Number(roble.duration) 
      : (roble.duration_value !== undefined ? Number(roble.duration_value) : 60);
    
    const durationUnit = roble.durationUnit || roble.duration_unit || 'minutes';
    
    return {
      _id: roble._id,
      name: roble.name,
      activityId: roble.activityId,
      courseId: roble.courseId,
      categoryId: roble.categoryId,
      groupId: roble.groupId,
      duration: duration,
      durationUnit: durationUnit as 'minutes' | 'hours',
      visibility: roble.visibility,
      status: roble.status,
      startDate: roble.startDate,
      endDate: roble.endDate,
      activatedAt: roble.activatedAt,
      completedAt: roble.completedAt,
      // Deserializar activeCriteria si viene como string JSON de Roble
      activeCriteria: (() => {
        if (Array.isArray(roble.activeCriteria)) {
          return roble.activeCriteria;
        }
        if (Array.isArray(roble.criteria)) {
          return roble.criteria;
        }
        if (typeof roble.activeCriteria === 'string') {
          try {
            return JSON.parse(roble.activeCriteria);
          } catch {
            return [];
          }
        }
        if (typeof roble.criteria === 'string') {
          try {
            return JSON.parse(roble.criteria);
          } catch {
            return [];
          }
        }
        return [];
      })(),
      description: roble.description
    };
  }

  async createAssessment(assessment: NewAssessment): Promise<Assessment> {
    const url = `${this.baseUrl}/insert`;
    const robleAssessment = this.mapAssessmentToRoble({
      ...assessment,
      status: 'draft'
    });
    
    const body = JSON.stringify({ tableName: this.assessmentsTable, records: [robleAssessment] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) {
      const errorText = await r.text();
      console.error('Error creating assessment:', errorText);
      throw new Error(`Error creating assessment: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    
    // Verificar si hay errores en la respuesta de Roble (cuando la tabla no existe o columnas inválidas)
    if (data.skipped && data.skipped.length > 0) {
      const errorReason = data.skipped[0].reason || 'Unknown error';
      console.error('Assessment creation skipped by Roble:', data);
      
      // Manejo de errores
      if (errorReason.includes('Columnas inválidas') || errorReason.includes('does not exist')) {
        throw new Error('La tabla "assessments" no existe en la base de datos. Por favor, créala primero en Roble con las columnas: name, activityId, courseId, categoryId, duration, durationUnit, visibility, status, activeCriteria, description, groupId (opcional), startDate (opcional), endDate (opcional), activatedAt (opcional), completedAt (opcional)');
      }
      
      throw new Error(`Error al crear evaluación: ${errorReason}`);
    }
    
    const inserted = data.inserted?.[0] as any;
    
    // Verificar que inserted existe
    if (!inserted) {
      console.error('No data returned from create assessment:', data);
      throw new Error('No data returned from server after creating assessment');
    }
    
    // Mapear de vuelta al formato del código
    return this.mapRobleToAssessment(inserted);
  }

  async updateAssessment(assessment: UpdateAssessment): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = assessment as any;
    
    const robleUpdates: any = {};
    if (updates.name !== undefined) robleUpdates.name = updates.name;
    if (updates.description !== undefined) robleUpdates.description = updates.description;
    if (updates.visibility !== undefined) robleUpdates.visibility = updates.visibility;
    if (updates.status !== undefined) robleUpdates.status = updates.status;
    if (updates.startDate !== undefined) robleUpdates.startDate = updates.startDate;
    if (updates.endDate !== undefined) robleUpdates.endDate = updates.endDate;
    if (updates.activatedAt !== undefined) robleUpdates.activatedAt = updates.activatedAt;
    if (updates.completedAt !== undefined) robleUpdates.completedAt = updates.completedAt;
    if (updates.categoryId !== undefined) robleUpdates.categoryId = updates.categoryId;
    if (updates.groupId !== undefined) robleUpdates.groupId = updates.groupId;
    if (updates.duration !== undefined) robleUpdates.duration = updates.duration;
    if (updates.durationUnit !== undefined) robleUpdates.durationUnit = updates.durationUnit;
    // Serializar activeCriteria como string JSON si se actualiza
    if (updates.activeCriteria !== undefined) {
      const activeCriteriaArray = updates.activeCriteria;
      robleUpdates.activeCriteria = Array.isArray(activeCriteriaArray)
        ? JSON.stringify(activeCriteriaArray)
        : (typeof activeCriteriaArray === 'string' ? activeCriteriaArray : JSON.stringify([]));
    }
    // Actualizar updatedAt siempre que se modifique un registro
    robleUpdates.updatedAt = new Date().toISOString();
    
    const body = JSON.stringify({ tableName: this.assessmentsTable, idColumn: "_id", idValue: _id, updates: robleUpdates });
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
    
    // Usar fecha local en lugar de UTC para evitar problemas de zona horaria
    const now = new Date();
    // Obtener componentes de fecha local
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Crear fecha ISO string con hora local (sin conversión UTC)
    const startDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    
    // Calcular endDate sumando la duración
    const durationMs = assessment.durationUnit === 'hours' 
      ? assessment.duration * 60 * 60 * 1000 
      : assessment.duration * 60 * 1000;
    const endDateObj = new Date(now.getTime() + durationMs);
    const endYear = endDateObj.getFullYear();
    const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDateObj.getDate()).padStart(2, '0');
    const endHours = String(endDateObj.getHours()).padStart(2, '0');
    const endMinutes = String(endDateObj.getMinutes()).padStart(2, '0');
    const endSeconds = String(endDateObj.getSeconds()).padStart(2, '0');
    const endDate = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:${endSeconds}`;
    
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

  // PeerEvaluation a formato Roble
  private mapPeerEvaluationToRoble(evaluation: any): any {
    // Serializar criterias como string JSON para Roble
    const criteriasObj = evaluation.criterias || {};
    const criteriasJson = typeof criteriasObj === 'object' && !Array.isArray(criteriasObj)
      ? JSON.stringify(criteriasObj)
      : (typeof criteriasObj === 'string' ? criteriasObj : JSON.stringify({}));
    
    // Fecha actual
    const now = new Date().toISOString();
    
    // NO enviar createdAt/updatedAt al crear - Roble los maneja automáticamente o la tabla no los tiene
    // Similar a cómo funcionan otras tablas (courses, groups, activities, etc.)
    return {
      assessmentId: evaluation.assessmentId,
      activityId: evaluation.activityId,
      courseId: evaluation.courseId,
      groupId: evaluation.groupId,
      evaluatorId: evaluation.evaluatorId,
      evaluatedId: evaluation.evaluatedId,
      // Serializar criterias como string JSON
      criterias: criteriasJson,
      comment: evaluation.comment,
      evaluatedAt: evaluation.evaluatedAt || now,
      averageScore: evaluation.averageScore
    };
  }

  // Mapear de formato Roble a PeerEvaluation (código)
  private mapRobleToPeerEvaluation(roble: any): PeerEvaluation {
    if (!roble) {
      throw new Error('No se recibió datos de la evaluación desde Roble');
    }
    
    return {
      _id: roble._id,
      assessmentId: roble.assessmentId,
      activityId: roble.activityId,
      courseId: roble.courseId,
      groupId: roble.groupId,
      evaluatorId: roble.evaluatorId,
      evaluatedId: roble.evaluatedId,
      // Deserializar criterias si viene como string JSON de Roble
      criterias: (() => {
        if (typeof roble.criterias === 'object' && roble.criterias !== null && !Array.isArray(roble.criterias)) {
          return roble.criterias;
        }
        if (typeof roble.criterias === 'string') {
          try {
            return JSON.parse(roble.criterias);
          } catch {
            return {};
          }
        }
        if (typeof roble.criteriaResponses === 'object' && roble.criteriaResponses !== null) {
          return roble.criteriaResponses;
        }
        if (typeof roble.criteriaResponses === 'string') {
          try {
            return JSON.parse(roble.criteriaResponses);
          } catch {
            return {};
          }
        }
        return {};
      })(),
      averageScore: roble.averageScore || 0,
      comment: roble.comment,
      evaluatedAt: roble.evaluatedAt || new Date().toISOString()
    };
  }

  // Peer Evaluations
  async createPeerEvaluation(evaluation: NewPeerEvaluation): Promise<PeerEvaluation> {
    const url = `${this.baseUrl}/insert`;
    // Calcular promedio
    const criteriaValues = Object.values(evaluation.criterias);
    const averageScore = criteriaValues.length > 0
      ? criteriaValues.reduce((sum, val) => sum + val, 0) / criteriaValues.length
      : 0;
    
    // Mapear al formato de Roble
    const robleEvaluation = this.mapPeerEvaluationToRoble({
      ...evaluation,
      averageScore: Number(averageScore.toFixed(2)),
      evaluatedAt: new Date().toISOString()
    });
    
    const body = JSON.stringify({ tableName: this.peerEvaluationsTable, records: [robleEvaluation] });
    const r = await this.authorizedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) {
      const errorText = await r.text();
      console.error('Error creating peer evaluation:', errorText);
      throw new Error(`Error creating peer evaluation: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    
    // Verificar si hay errores en la respuesta de Roble
    if (data.skipped && data.skipped.length > 0) {
      const errorReason = data.skipped[0].reason || 'Unknown error';
      console.error('Peer evaluation creation skipped by Roble:', data);
      throw new Error(`Error al crear evaluación: ${errorReason}`);
    }
    
    const inserted = data.inserted?.[0];
    if (!inserted) {
      console.error('No data returned from create peer evaluation:', data);
      throw new Error('No data returned from server after creating peer evaluation');
    }
    
    return this.mapRobleToPeerEvaluation(inserted);
  }

  async getPeerEvaluationsByAssessment(assessmentId: string): Promise<PeerEvaluation[]> {
    const url = `${this.baseUrl}/read?tableName=${this.peerEvaluationsTable}&assessmentId=${assessmentId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching peer evaluations: ${r.status}`);
    const data = await r.json();
    const evaluations = Array.isArray(data) ? (data as any[]) : [];
    return evaluations.map(roble => this.mapRobleToPeerEvaluation(roble));
  }

  async getPeerEvaluationsByEvaluator(assessmentId: string, evaluatorId: string): Promise<PeerEvaluation[]> {
    const url = `${this.baseUrl}/read?tableName=${this.peerEvaluationsTable}&assessmentId=${assessmentId}&evaluatorId=${evaluatorId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching peer evaluations: ${r.status}`);
    const data = await r.json();
    const evaluations = Array.isArray(data) ? (data as any[]) : [];
    return evaluations.map(roble => this.mapRobleToPeerEvaluation(roble));
  }

  async getPeerEvaluationsByEvaluated(assessmentId: string, evaluatedId: string): Promise<PeerEvaluation[]> {
    const url = `${this.baseUrl}/read?tableName=${this.peerEvaluationsTable}&assessmentId=${assessmentId}&evaluatedId=${evaluatedId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching peer evaluations: ${r.status}`);
    const data = await r.json();
    const evaluations = Array.isArray(data) ? (data as any[]) : [];
    return evaluations.map(roble => this.mapRobleToPeerEvaluation(roble));
  }

  async getPeerEvaluationByEvaluatorAndEvaluated(assessmentId: string, evaluatorId: string, evaluatedId: string): Promise<PeerEvaluation | null> {
    const url = `${this.baseUrl}/read?tableName=${this.peerEvaluationsTable}&assessmentId=${assessmentId}&evaluatorId=${evaluatorId}&evaluatedId=${evaluatedId}`;
    const r = await this.authorizedFetch(url, { method: "GET" });
    if (!r.ok) throw new Error(`Error fetching peer evaluation: ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? (data as any[]) : [];
    return list.length > 0 ? this.mapRobleToPeerEvaluation(list[0]) : null;
  }

  async updatePeerEvaluation(evaluation: UpdatePeerEvaluation): Promise<void> {
    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = evaluation as any;
    // Mapear updates al formato de Roble (ya están con los nombres correctos)
    const robleUpdates: any = {};
    if (updates.comment !== undefined) robleUpdates.comment = updates.comment;
    // Recalcular promedio si se actualizan criterios
    if (updates.criterias) {
      const criteriaValues = Object.values(updates.criterias) as number[];
      robleUpdates.averageScore = criteriaValues.length > 0
        ? Number((criteriaValues.reduce((sum: number, val: number) => sum + val, 0) / criteriaValues.length).toFixed(2))
        : 0;
      // Serializar criterias como string JSON
      const criteriasObj = updates.criterias;
      robleUpdates.criterias = typeof criteriasObj === 'object' && !Array.isArray(criteriasObj)
        ? JSON.stringify(criteriasObj)
        : (typeof criteriasObj === 'string' ? criteriasObj : JSON.stringify({}));
    }
    if (updates.averageScore !== undefined) robleUpdates.averageScore = updates.averageScore;
    if (updates.evaluatedAt !== undefined) robleUpdates.evaluatedAt = updates.evaluatedAt;
    // NO enviar updatedAt - Roble lo maneja automáticamente o la tabla no lo tiene
    // Si Roble requiere updatedAt, se puede agregar después de verificar en Roble
    
    const body = JSON.stringify({ tableName: this.peerEvaluationsTable, idColumn: "_id", idValue: _id, updates: robleUpdates });
    const r = await this.authorizedFetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    if (!r.ok) throw new Error(`Error updating peer evaluation: ${r.status}`);
  }
}


import { useDI } from '@/src/core/di/DIProvider'
import { TOKENS } from '@/src/core/di/tokens'
import { useAuth } from '@/src/features/auth/presentation/context/authContext'
import { Assessment, AssessmentCriteria } from '../../domain/entities/Assessment'
import { PeerEvaluation } from '../../domain/entities/PeerEvaluation'
import { CreatePeerEvaluationUseCase } from '../../domain/usecases/CreatePeerEvaluationUseCase'
import { GetPeerEvaluationByEvaluatorAndEvaluatedUseCase } from '../../domain/usecases/GetPeerEvaluationByEvaluatorAndEvaluatedUseCase'
import { GetPeerEvaluationsByEvaluatorUseCase } from '../../domain/usecases/GetPeerEvaluationsByEvaluatorUseCase'
import { UpdatePeerEvaluationUseCase } from '../../domain/usecases/UpdatePeerEvaluationUseCase'
import { Group } from '@/src/features/groups/domain/entities/Group'
import { GetGroupsByCategoryUseCase_v2 } from '@/src/features/groups/domain/usecases/GetGroupsByCategoryUseCase'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Alert } from 'react-native'
import {
    Avatar,
    Button,
    Card,
    Chip,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper'

const criteriaLabels: Record<AssessmentCriteria, string> = {
    punctuality: 'Puntualidad',
    contributions: 'Contribuciones',
    commitment: 'Compromiso',
    attitude: 'Actitud'
}

const criteriaDescriptions: Record<AssessmentCriteria, { [key: number]: string }> = {
    punctuality: {
        2.0: 'Llegó tarde a todas las sesiones o se estuvo ausentando constantemente',
        3.0: 'Llegó tarde con mucha frecuencia y se ausentó varias veces del trabajo del equipo',
        4.0: 'En la mayoría de las sesiones llegó puntualmente y no se ausentó con frecuencia',
        5.0: 'Acudió puntualmente a todas las sesiones de trabajo'
    },
    contributions: {
        2.0: 'En todo momento estuvo como observador y no aportó al trabajo del equipo',
        3.0: 'En algunas ocasiones participó dentro del equipo y en los intercambios generales',
        4.0: 'Hizo varios aportes al equipo; sin embargo, puede ser más crítico y propositivo',
        5.0: 'Sus aportes fueron muy acertados y enriquecieron en todo momento el trabajo del equipo'
    },
    commitment: {
        2.0: 'Mostró poco compromiso con las tareas y roles asignados tanto por el profesor como por los miembros del equipo',
        3.0: 'En algunos momentos observamos que su compromiso con el trabajo disminuyó, y le afectó para afrontar las tareas propuestas',
        4.0: 'La mayor parte del tiempo asumió tareas con responsabilidad y compromiso pero pudo haber aportado más al trabajo del equipo',
        5.0: 'Mostró en todo momento un compromiso serio con las tareas asignadas y los roles que tuvo en el equipo'
    },
    attitude: {
        2.0: 'Mantuvo una actitud negativa hacia las actividades del taller y a las tareas del equipo',
        3.0: 'En algunas oportunidades tuvo una actitud abierta y positiva; pero no lo suficiente para beneficiar significativamente',
        4.0: 'La mayor parte del tiempo muestra apertura y actitud positiva hacia el trabajo, pero puede ser más constante',
        5.0: 'Su actitud es positiva y demuestra deseos de realizar el trabajo con calidad'
    }
}

const scoreOptions = [2.0, 3.0, 4.0, 5.0] as const

export default function PeerEvaluationScreen() {
    const route = useRoute<any>()
    const navigation = useNavigation<any>()
    const assessment: Assessment = route.params?.assessment
    const group: Group = route.params?.group
    const di = useDI()
    const theme = useTheme()
    const { user } = useAuth()

    const studentId = (user as any)?.id || (user as any)?._id
    const getGroupsByCategoryUC = di.resolve<GetGroupsByCategoryUseCase_v2>(
        TOKENS.GetGroupsByCategoryUC_v2
    )
    const createPeerEvaluationUC = di.resolve<CreatePeerEvaluationUseCase>(
        TOKENS.CreatePeerEvaluationUC
    )
    const updatePeerEvaluationUC = di.resolve<UpdatePeerEvaluationUseCase>(
        TOKENS.UpdatePeerEvaluationUC
    )
    const getPeerEvaluationByEvaluatorAndEvaluatedUC = di.resolve<GetPeerEvaluationByEvaluatorAndEvaluatedUseCase>(
        TOKENS.GetPeerEvaluationByEvaluatorAndEvaluatedUC
    )
    const getPeerEvaluationsByEvaluatorUC = di.resolve<GetPeerEvaluationsByEvaluatorUseCase>(
        TOKENS.GetPeerEvaluationsByEvaluatorUC
    )

    const [groupMembers, setGroupMembers] = useState<string[]>([])
    const [evaluations, setEvaluations] = useState<Record<string, Record<AssessmentCriteria, number>>>({})
    const [comments, setComments] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!group?.studentIds || !studentId) return
        
        // Filtrar miembros del grupo excluyendo al estudiante actual (no auto-evaluación)
        const members = group.studentIds.filter(id => id !== studentId)
        setGroupMembers(members)
        
        // Cargar evaluaciones existentes
        loadExistingEvaluations(members)
    }, [group, studentId])

    const loadExistingEvaluations = async (members: string[]) => {
        if (!assessment?._id || !studentId) return
        
        setLoading(true)
        try {
            const existingEvaluations = await getPeerEvaluationsByEvaluatorUC.execute(assessment._id, studentId)
            const evaluationsMap: Record<string, Record<AssessmentCriteria, number>> = {}
            const commentsMap: Record<string, string> = {}
            
            existingEvaluations.forEach(evaluation => {
                evaluationsMap[evaluation.evaluatedId] = evaluation.criterias as Record<AssessmentCriteria, number>
                if (evaluation.comment) {
                    commentsMap[evaluation.evaluatedId] = evaluation.comment
                }
            })
            
            setEvaluations(evaluationsMap)
            setComments(commentsMap)
        } catch (error) {
            console.error('Error loading evaluations:', error)
        } finally {
            setLoading(false)
        }
    }

    const setScore = (evaluatedId: string, criterion: AssessmentCriteria, score: number) => {
        setEvaluations(prev => ({
            ...prev,
            [evaluatedId]: {
                ...(prev[evaluatedId] || {}),
                [criterion]: score
            }
        }))
    }

    const setComment = (evaluatedId: string, comment: string) => {
        setComments(prev => ({
            ...prev,
            [evaluatedId]: comment
        }))
    }

    const isEvaluationComplete = (evaluatedId: string): boolean => {
        const evalScores = evaluations[evaluatedId]
        if (!evalScores) return false
        
        const activeCriteria = assessment.activeCriteria || []
        return activeCriteria.every(criterion => 
            evalScores[criterion] !== undefined && evalScores[criterion] > 0
        )
    }

    const saveEvaluation = async (evaluatedId: string) => {
        if (!assessment?._id || !studentId || !group?._id) return
        
        const evalScores = evaluations[evaluatedId]
        if (!isEvaluationComplete(evaluatedId)) {
            Alert.alert('Evaluación incompleta', 'Por favor califica todos los criterios activos')
            return
        }

        setSaving(true)
        try {
            // Verificar si ya existe una evaluación
            const existing = await getPeerEvaluationByEvaluatorAndEvaluatedUC.execute(
                assessment._id,
                studentId,
                evaluatedId
            )

            const evaluationData = {
                assessmentId: assessment._id,
                activityId: assessment.activityId,
                courseId: assessment.courseId,
                groupId: group._id,
                evaluatorId: studentId,
                evaluatedId,
                criterias: evalScores,
                comment: comments[evaluatedId]?.trim() || undefined
            }

            if (existing?._id) {
                await updatePeerEvaluationUC.execute({
                    _id: existing._id,
                    ...evaluationData
                })
            } else {
                await createPeerEvaluationUC.execute(evaluationData)
            }

            Alert.alert('Éxito', 'Evaluación guardada correctamente')
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Error al guardar la evaluación')
        } finally {
            setSaving(false)
        }
    }

    const renderCriterionSelector = (evaluatedId: string, criterion: AssessmentCriteria) => {
        const currentScore = evaluations[evaluatedId]?.[criterion]
        return (
            <View style={styles.criterionContainer}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                    {criteriaLabels[criterion]}
                </Text>
                <View style={styles.scoreOptionsContainer}>
                    {scoreOptions.map(score => (
                        <Button
                            key={score}
                            mode={currentScore === score ? 'contained' : 'outlined'}
                            onPress={() => setScore(evaluatedId, criterion, score)}
                            style={styles.scoreButton}
                        >
                            {score}
                        </Button>
                    ))}
                </View>
                {currentScore && (
                    <Text
                        variant="bodySmall"
                        style={{
                            marginTop: 8,
                            color: theme.colors.onSurfaceVariant,
                            fontStyle: 'italic'
                        }}
                    >
                        {criteriaDescriptions[criterion][currentScore]}
                    </Text>
                )}
            </View>
        )
    }

    const renderStudentEvaluation = (evaluatedId: string) => {
        const isComplete = isEvaluationComplete(evaluatedId)
        const activeCriteria = assessment.activeCriteria || []
        
        return (
            <Card key={evaluatedId} style={styles.evaluationCard}>
                <Card.Content>
                    <View style={styles.studentHeader}>
                        <Avatar.Text
                            label={evaluatedId.charAt(0).toUpperCase()}
                            size={48}
                            style={{ marginRight: 12 }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text variant="titleLarge">
                                Usuario {evaluatedId.slice(0, 8)}
                            </Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {evaluatedId}
                            </Text>
                        </View>
                        {isComplete && (
                            <Chip icon="check-circle" style={{ backgroundColor: theme.colors.secondaryContainer }}>
                                Completa
                            </Chip>
                        )}
                    </View>

                    <View style={styles.criteriaSection}>
                        {activeCriteria.map(criterion => (
                            <View key={criterion} style={styles.criterionWrapper}>
                                {renderCriterionSelector(evaluatedId, criterion)}
                            </View>
                        ))}
                    </View>

                    <TextInput
                        label="Comentario adicional (opcional)"
                        value={comments[evaluatedId] || ''}
                        onChangeText={(text) => setComment(evaluatedId, text)}
                        multiline
                        numberOfLines={3}
                        style={{ marginTop: 16 }}
                        mode="outlined"
                    />

                    <Button
                        mode="contained"
                        onPress={() => saveEvaluation(evaluatedId)}
                        disabled={!isComplete || saving}
                        loading={saving}
                        style={{ marginTop: 16 }}
                    >
                        {evaluations[evaluatedId] ? 'Actualizar evaluación' : 'Guardar evaluación'}
                    </Button>
                </Card.Content>
            </Card>
        )
    }

    if (!assessment || !group) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>No se recibió la información necesaria</Text>
                <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
                    Volver
                </Button>
            </View>
        )
    }

    if (assessment.status !== 'active') {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
                <Card>
                    <Card.Content style={{ alignItems: 'center' }}>
                        <Avatar.Icon icon="lock" size={64} style={{ marginBottom: 16 }} />
                        <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
                            Esta evaluación no está activa
                        </Text>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                            {assessment.status === 'draft' 
                                ? 'El profesor aún no ha activado esta evaluación.'
                                : 'Esta evaluación ya ha sido completada.'}
                        </Text>
                        <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
                            Volver
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        )
    }

    if (!studentId || !group.studentIds?.includes(studentId)) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
                <Card>
                    <Card.Content style={{ alignItems: 'center' }}>
                        <Avatar.Icon icon="alert-circle" size={64} style={{ marginBottom: 16 }} />
                        <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
                            No perteneces a este grupo
                        </Text>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                            Solo los miembros del grupo pueden realizar esta evaluación.
                        </Text>
                        <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
                            Volver
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        )
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <Card style={styles.headerCard}>
                <Card.Content>
                    <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
                        {assessment.name}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Evalúa a tus compañeros de grupo según los criterios establecidos.
                        No puedes evaluarte a ti mismo.
                    </Text>
                    {assessment.endDate && (
                        <Chip icon="clock" style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                            Fecha límite: {new Date(assessment.endDate).toLocaleString('es-ES')}
                        </Chip>
                    )}
                </Card.Content>
            </Card>

            {groupMembers.length === 0 ? (
                <Card>
                    <Card.Content style={{ alignItems: 'center', padding: 24 }}>
                        <Avatar.Icon icon="account-group-outline" size={64} style={{ marginBottom: 16 }} />
                        <Text variant="titleMedium" style={{ textAlign: 'center' }}>
                            No hay compañeros para evaluar
                        </Text>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                            Eres el único miembro del grupo o no hay otros estudiantes asignados.
                        </Text>
                    </Card.Content>
                </Card>
            ) : (
                groupMembers.map(evaluatedId => renderStudentEvaluation(evaluatedId))
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 40 },
    headerCard: {
        borderRadius: 16,
        marginBottom: 20,
        elevation: 3
    },
    evaluationCard: {
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    criteriaSection: {
        marginTop: 16
    },
    criterionWrapper: {
        marginBottom: 20
    },
    criterionContainer: {
        marginBottom: 12
    },
    scoreOptionsContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap'
    },
    scoreButton: {
        minWidth: 60
    }
})


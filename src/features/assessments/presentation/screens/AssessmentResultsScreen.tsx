import { useDI } from '@/src/core/di/DIProvider'
import { TOKENS } from '@/src/core/di/tokens'
import { Assessment, AssessmentCriteria } from '../../domain/entities/Assessment'
import { PeerEvaluation } from '../../domain/entities/PeerEvaluation'
import { GetPeerEvaluationsByAssessmentUseCase } from '../../domain/usecases/GetPeerEvaluationsByAssessmentUseCase'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Alert } from 'react-native'
import {
    Avatar,
    Card,
    Chip,
    Text,
    useTheme,
    Divider,
    ActivityIndicator
} from 'react-native-paper'
import { Course } from '@/src/features/courses/domain/entities/Course'

const criteriaLabels: Record<AssessmentCriteria, string> = {
    punctuality: 'Puntualidad',
    contributions: 'Contribuciones',
    commitment: 'Compromiso',
    attitude: 'Actitud'
}

export default function AssessmentResultsScreen() {
    const route = useRoute<any>()
    const navigation = useNavigation<any>()
    const assessment: Assessment = route.params?.assessment
    const course: Course = route.params?.course
    const di = useDI()
    const theme = useTheme()

    const getPeerEvaluationsByAssessmentUC = di.resolve<GetPeerEvaluationsByAssessmentUseCase>(
        TOKENS.GetPeerEvaluationsByAssessmentUC
    )

    const [evaluations, setEvaluations] = useState<PeerEvaluation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (assessment?._id) {
            loadResults()
        }
    }, [assessment?._id])

    const loadResults = async () => {
        if (!assessment?._id) return
        setLoading(true)
        try {
            const results = await getPeerEvaluationsByAssessmentUC.execute(assessment._id)
            setEvaluations(results)
        } catch (error) {
            console.error('Error loading results:', error)
            Alert.alert('Error', 'No se pudieron cargar los resultados')
        } finally {
            setLoading(false)
        }
    }

    // Agrupar evaluaciones por estudiante evaluado
    const evaluationsByStudent = evaluations.reduce((acc, evaluation) => {
        if (!acc[evaluation.evaluatedId]) {
            acc[evaluation.evaluatedId] = []
        }
        acc[evaluation.evaluatedId].push(evaluation)
        return acc
    }, {} as Record<string, PeerEvaluation[]>)

    // Calcular promedios por estudiante
    const studentAverages = Object.entries(evaluationsByStudent).map(([studentId, studentEvaluations]) => {
        const totalAverage = studentEvaluations.reduce((sum, evaluation) => sum + evaluation.averageScore, 0) / studentEvaluations.length
        const criteriaAverages: Record<AssessmentCriteria, number> = {
            punctuality: 0,
            contributions: 0,
            commitment: 0,
            attitude: 0
        }
        
        // Calcular promedio por criterio
        const activeCriteria = assessment.activeCriteria || []
        activeCriteria.forEach(criterion => {
            const criterionScores = studentEvaluations
                .map(evaluation => evaluation.criterias[criterion])
                .filter(score => score !== undefined && score > 0)
            if (criterionScores.length > 0) {
                criteriaAverages[criterion] = criterionScores.reduce((sum, score) => sum + score, 0) / criterionScores.length
            }
        })

        return {
            studentId,
            totalAverage: Number(totalAverage.toFixed(2)),
            criteriaAverages,
            evaluationCount: studentEvaluations.length,
            evaluations: studentEvaluations
        }
    })

    // Ordenar por promedio total descendente
    studentAverages.sort((a, b) => b.totalAverage - a.totalAverage)

    if (!assessment) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>No se recibió la información necesaria</Text>
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
                        Resultados: {assessment.name}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {course?.name || 'Curso'}
                    </Text>
                    <Chip
                        icon="chart-bar"
                        style={{ marginTop: 12, alignSelf: 'flex-start' }}
                    >
                        {evaluations.length} evaluaciones recibidas
                    </Chip>
                </Card.Content>
            </Card>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 16 }}>Cargando resultados...</Text>
                </View>
            ) : studentAverages.length === 0 ? (
                <Card>
                    <Card.Content style={{ alignItems: 'center', padding: 24 }}>
                        <Text variant="titleMedium" style={{ textAlign: 'center' }}>
                            No hay resultados disponibles
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={{
                                textAlign: 'center',
                                color: theme.colors.onSurfaceVariant,
                                marginTop: 8
                            }}
                        >
                            Aún no se han recibido evaluaciones de los estudiantes.
                        </Text>
                    </Card.Content>
                </Card>
            ) : (
                studentAverages.map(({ studentId, totalAverage, criteriaAverages, evaluationCount, evaluations: studentEvals }) => (
                    <Card key={studentId} style={styles.studentCard}>
                        <Card.Content>
                            <View style={styles.studentHeader}>
                                <Avatar.Text
                                    label={studentId.charAt(0).toUpperCase()}
                                    size={48}
                                    style={{ marginRight: 12 }}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text variant="titleLarge">
                                        Estudiante {studentId.slice(0, 8)}
                                    </Text>
                                    <Text
                                        variant="bodySmall"
                                        style={{ color: theme.colors.onSurfaceVariant }}
                                    >
                                        {evaluationCount} evaluación{evaluationCount !== 1 ? 'es' : ''} recibida{evaluationCount !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                                <Chip
                                    style={{
                                        backgroundColor: theme.colors.primaryContainer
                                    }}
                                    textStyle={{ color: theme.colors.onPrimaryContainer }}
                                >
                                    Promedio: {totalAverage}
                                </Chip>
                            </View>

                            <Divider style={{ marginVertical: 16 }} />

                            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                                Promedio por criterio:
                            </Text>
                            {assessment.activeCriteria?.map(criterion => (
                                <View
                                    key={criterion}
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 8
                                    }}
                                >
                                    <Text variant="bodyMedium">
                                        {criteriaLabels[criterion]}:
                                    </Text>
                                    <Chip compact>
                                        {criteriaAverages[criterion].toFixed(2)}
                                    </Chip>
                                </View>
                            ))}

                            <Divider style={{ marginVertical: 16 }} />

                            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                                Evaluaciones individuales:
                            </Text>
                            {studentEvals.map((evaluation, index) => (
                                <Card
                                    key={evaluation._id || index}
                                    style={{
                                        marginBottom: 12,
                                        backgroundColor: theme.colors.surfaceVariant
                                    }}
                                >
                                    <Card.Content>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginBottom: 8
                                            }}
                                        >
                                            <Text variant="bodySmall">
                                                Evaluador: {evaluation.evaluatorId.slice(0, 8)}
                                            </Text>
                                            <Chip compact>
                                                Promedio: {evaluation.averageScore.toFixed(2)}
                                            </Chip>
                                        </View>
                                        {assessment.activeCriteria?.map(criterion => (
                                            <View
                                                key={criterion}
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4
                                                }}
                                            >
                                                <Text variant="bodySmall">
                                                    {criteriaLabels[criterion]}:
                                                </Text>
                                                <Text variant="bodySmall">
                                                    {evaluation.criterias[criterion]?.toFixed(1) || 'N/A'}
                                                </Text>
                                            </View>
                                        ))}
                                        {evaluation.comment && (
                                            <>
                                                <Divider style={{ marginVertical: 8 }} />
                                                <Text variant="bodySmall" style={{ fontStyle: 'italic' }}>
                                                    "{evaluation.comment}"
                                                </Text>
                                            </>
                                        )}
                                    </Card.Content>
                                </Card>
                            ))}
                        </Card.Content>
                    </Card>
                ))
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
    studentCard: {
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
    }
})


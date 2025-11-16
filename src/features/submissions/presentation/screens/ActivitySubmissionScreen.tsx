import { useDI } from '@/src/core/di/DIProvider'
import { TOKENS } from '@/src/core/di/tokens'
import { Activity } from '@/src/features/activities/domain/entities/Activity'
import { useAuth } from '@/src/features/auth/presentation/context/authContext'
import { Group } from '@/src/features/groups/domain/entities/Group'
import { CreateSubmissionUseCase } from '@/src/features/submissions/domain/usecases/CreateSubmissionUseCase'
import { GetSubmissionByActivityAndStudentUseCase } from '@/src/features/submissions/domain/usecases/GetSubmissionByActivityAndStudentUseCase'
import { UpdateSubmissionUseCase } from '@/src/features/submissions/domain/usecases/UpdateSubmissionUseCase'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import {
    Avatar,
    Button,
    Card,
    Chip,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper'

export default function ActivitySubmissionScreen() {
    const route = useRoute<any>()
    const activity: Activity = route.params?.activity
    const group: Group = route.params?.group
    const navigation = useNavigation<any>()
    const di = useDI()
    const { user } = useAuth()
    const theme = useTheme()

    const studentId = (user as any)?.id || (user as any)?._id
    const createSubmissionUC = di.resolve<CreateSubmissionUseCase>(
        TOKENS.CreateSubmissionUC
    )
    const updateSubmissionUC = di.resolve<UpdateSubmissionUseCase>(
        TOKENS.UpdateSubmissionUC
    )
    const getSubmissionUC =
        di.resolve<GetSubmissionByActivityAndStudentUseCase>(
            TOKENS.GetSubmissionByActivityAndStudentUC
        )

    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [submissionDate, setSubmissionDate] = useState<string | null>(null)
    const [hasSubmission, setHasSubmission] = useState(false)

    useEffect(() => {
        if (!studentId || !activity._id) return
        getSubmissionUC
            .execute(activity._id, studentId)
            .then((sub) => {
                if (sub) {
                    setContent(sub.content || '')
                    setSubmissionDate(sub.submissionDate || null)
                    setHasSubmission(true)
                }
            })
            .catch(() => {})
    }, [activity._id, studentId])

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return ''
        try {
            const d = new Date(dateStr)
            return `${String(d.getDate()).padStart(2, '0')}/${String(
                d.getMonth() + 1
            ).padStart(2, '0')}/${d.getFullYear()}`
        } catch {
            return dateStr
        }
    }

    const handleSubmit = async () => {
        if (!studentId || !activity._id || !group._id) return
        setLoading(true)
        try {
            const payload = {
                studentId,
                activityId: activity._id,
                groupId: group._id,
                content: content.trim(),
                courseId: activity.courseId,
                submissionDate: new Date().toISOString().slice(0, 10)
            }

            if (hasSubmission) {
                const existing = await getSubmissionUC.execute(
                    activity._id,
                    studentId
                )
                if (existing?._id) {
                    await updateSubmissionUC.execute({
                        _id: existing._id,
                        ...payload
                    })
                }
            } else {
                await createSubmissionUC.execute(payload)
            }

            navigation.goBack()
        } catch (error) {
            alert('Error al guardar la entrega')
        } finally {
            setLoading(false)
        }
    }

    const belongsToGroup = group.studentIds?.includes(studentId || '')

    if (!belongsToGroup) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.background,
                        padding: 20,
                        justifyContent: 'center'
                    }
                ]}
            >
                <Card style={styles.errorCard}>
                    <Card.Content style={{ alignItems: 'center', padding: 24 }}>
                        <Avatar.Icon
                            icon="alert-circle"
                            size={80}
                            style={{
                                backgroundColor: theme.colors.errorContainer,
                                marginBottom: 16
                            }}
                        />
                        <Text
                            variant="headlineSmall"
                            style={{
                                marginBottom: 12,
                                color: theme.colors.onSurface,
                                textAlign: 'center'
                            }}
                        >
                            No puedes realizar esta actividad
                        </Text>
                        <Text
                            style={{
                                color: theme.colors.onSurfaceVariant,
                                textAlign: 'center'
                            }}
                        >
                            Debes pertenecer al grupo para poder entregar esta
                            actividad.
                        </Text>
                        <Button
                            mode="contained"
                            icon="arrow-left"
                            onPress={() => navigation.goBack()}
                            style={{ marginTop: 20 }}
                        >
                            Volver
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        )
    }

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background }
            ]}
            contentContainerStyle={styles.contentContainer}
        >
            <Card style={styles.headerCard}>
                <Card.Content>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 12
                        }}
                    >
                        <Avatar.Icon
                            icon="clipboard-text"
                            size={48}
                            style={{
                                backgroundColor: theme.colors.primaryContainer,
                                marginRight: 12
                            }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text
                                variant="headlineSmall"
                                style={{
                                    marginBottom: 4,
                                    color: theme.colors.onSurface
                                }}
                            >
                                {activity.title}
                            </Text>
                            <Text
                                variant="bodySmall"
                                style={{ color: theme.colors.onSurfaceVariant }}
                            >
                                Grupo: {group.name}
                            </Text>
                        </View>
                    </View>
                    {activity.description && (
                        <Text
                            variant="bodyMedium"
                            style={{
                                marginTop: 8,
                                color: theme.colors.onSurfaceVariant
                            }}
                        >
                            {activity.description}
                        </Text>
                    )}
                    {activity.date && (
                        <Chip
                            icon="calendar"
                            style={{ marginTop: 12, alignSelf: 'flex-start' }}
                        >
                            Fecha límite: {formatDate(activity.date)}
                        </Chip>
                    )}
                </Card.Content>
            </Card>

            <Card style={[styles.headerCard, { marginBottom: 0 }]}>
                <Card.Content>
                    <Text
                        variant="titleLarge"
                        style={{
                            marginBottom: 12,
                            color: theme.colors.onSurface
                        }}
                    >
                        📝 Tu entrega
                    </Text>
                    {submissionDate && (
                        <Chip
                            icon="check-circle"
                            style={{
                                marginBottom: 12,
                                alignSelf: 'flex-start',
                                backgroundColor: theme.colors.secondaryContainer
                            }}
                        >
                            Última entrega: {formatDate(submissionDate)}
                        </Chip>
                    )}
                    <TextInput
                        mode="outlined"
                        label="Escribe tu entrega aquí..."
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={10}
                        style={styles.textArea}
                        placeholder="Describe tu trabajo, adjunta enlaces o escribe tus respuestas..."
                    />
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                icon={hasSubmission ? 'update' : 'send'}
                onPress={handleSubmit}
                disabled={loading || !content.trim()}
                loading={loading}
                style={styles.submitButton}
            >
                {hasSubmission ? 'Actualizar entrega' : 'Enviar entrega'}
            </Button>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { padding: 20 },
    headerCard: {
        borderRadius: 16,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10
    },
    submissionSection: { marginBottom: 20 },
    textArea: { minHeight: 220, borderRadius: 12 },
    submitButton: {
        marginTop: 12,
        paddingVertical: 6,
        borderRadius: 12,
        elevation: 2
    },
    errorCard: { borderRadius: 16, margin: 20, elevation: 2 }
})

import React from 'react';
import { View, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import { XStack, YStack } from '~/components/ui/stack';
import { Progress } from '~/components/ui/progress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Importando o hook de tema
import { useTheme } from '~/lib/theme/useTheme';

export default function HomeScreen() {
    const [progresso, setProgresso] = React.useState(65);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Usando o hook de tema
    const { colors, tw, isDark } = useTheme();

    // Estilo do container principal
    const viewStyle = {
        ...tw.style('flex-1'),
        backgroundColor: colors.background
    };

    // Funções de navegação
    const navegarParaAvaliacoes = () => {
        router.push('/(app)/avaliacoes');
    };

    const navegarParaQuizzes = () => {
        router.push('/(app)/quizzes');
    };

    const navegarParaEstatisticas = () => {
        router.push('/(app)/estatisticas');
    };

    const navegarParaPerfil = () => {
        router.push('/(app)/perfil');
    };

    const navegarParaAvaliacao = (id: string | number) => {
        router.push({
            pathname: "/(app)/avaliacoes/[id]",
            params: { id }
        });
    };

    const navegarParaQuiz = (id: string | number) => {
        router.push({
            pathname: "/(app)/quizzes/[id]",
            params: { id }
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={viewStyle}
        >
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header com nome do app e opções */}
            <View style={{
                paddingTop: insets.top + 10,
                paddingHorizontal: 20,
                paddingBottom: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.accent }}>
                    Eureka
                </Text>

                <TouchableOpacity onPress={navegarParaPerfil}>
                    <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.primary[100],
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Ionicons name="person" size={22} color={colors.primary[600]} />
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={tw.style('px-5 pb-20')}
                showsVerticalScrollIndicator={false}
            >
                {/* Card de boas-vindas e progresso */}
                <Card style={{ backgroundColor: colors.card, borderRadius: 16, marginBottom: 24 }}>
                    <YStack p="$4" gap="$3">
                        <XStack justifyContent="space-between" alignItems="center">
                            <YStack>
                                <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                                    Bem-vindo(a) de volta
                                </Text>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                                    João Silva
                                </Text>
                            </YStack>

                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 8,
                                    backgroundColor: colors.primary[50]
                                }}
                                onPress={() => setProgresso(Math.floor(Math.random() * 100))}
                            >
                                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary[600] }}>
                                    Atualizar
                                </Text>
                            </TouchableOpacity>
                        </XStack>

                        <Separator style={{ backgroundColor: colors.separator }} />

                        <YStack gap="$2">
                            <XStack justifyContent="space-between">
                                <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                                    Seu progresso
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                                    {progresso}%
                                </Text>
                            </XStack>

                            <Progress value={progresso} style={{ height: 8 }} />

                            <Text style={{ fontSize: 12, color: colors.text.muted }}>
                                Você completou {progresso}% das avaliações disponíveis
                            </Text>
                        </YStack>
                    </YStack>
                </Card>

                {/* Seção de Avaliações Recentes */}
                <YStack gap="$4" mb="$6">
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.accent }}>
                        Avaliações Recentes
                    </Text>

                    {/* Cartão de Avaliação 1 */}
                    <Card style={{ backgroundColor: colors.card, borderRadius: 16 }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navegarParaAvaliacao(1)}
                        >
                            <YStack p="$4" gap="$3">
                                <View style={{
                                    alignSelf: 'flex-start',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 20,
                                    backgroundColor: colors.primary[100]
                                }}>
                                    <Text style={{
                                        fontSize: 12,
                                        fontWeight: '600',
                                        color: colors.primary[600]
                                    }}>
                                        Matemática
                                    </Text>
                                </View>

                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text.primary }}>
                                    Exame Nacional - 12ª Classe
                                </Text>

                                <XStack gap="$2" alignItems="center">
                                    <Ionicons name="time-outline" size={16} color={colors.text.muted} />
                                    <Text style={{ fontSize: 14, color: colors.text.muted }}>
                                        45 questões • 3h30 de duração
                                    </Text>
                                </XStack>

                                <Separator style={{ backgroundColor: colors.separator }} />

                                <XStack justifyContent="space-between" alignItems="center">
                                    <XStack gap="$2" alignItems="center">
                                        <Ionicons name="star" size={16} color="#f59e0b" />
                                        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                                            Dificuldade média
                                        </Text>
                                    </XStack>

                                    <XStack alignItems="center">
                                        <Text style={{ fontSize: 14, color: colors.primary[600], fontWeight: '600', marginRight: 4 }}>
                                            Iniciar
                                        </Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={colors.primary[600]}
                                        />
                                    </XStack>
                                </XStack>
                            </YStack>
                        </TouchableOpacity>
                    </Card>

                    {/* Cartão de Avaliação 2 */}
                    <Card style={{ backgroundColor: colors.card, borderRadius: 16 }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navegarParaAvaliacao(2)}
                        >
                            <YStack p="$4" gap="$3">
                                <View style={{
                                    alignSelf: 'flex-start',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 20,
                                    backgroundColor: '#e5f6fd'
                                }}>
                                    <Text style={{
                                        fontSize: 12,
                                        fontWeight: '600',
                                        color: '#0284c7'
                                    }}>
                                        Física
                                    </Text>
                                </View>

                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text.primary }}>
                                    Avaliação Provincial - 11ª Classe
                                </Text>

                                <XStack gap="$2" alignItems="center">
                                    <Ionicons name="time-outline" size={16} color={colors.text.muted} />
                                    <Text style={{ fontSize: 14, color: colors.text.muted }}>
                                        30 questões • 2h de duração
                                    </Text>
                                </XStack>

                                <Separator style={{ backgroundColor: colors.separator }} />

                                <XStack justifyContent="space-between" alignItems="center">
                                    <XStack gap="$2" alignItems="center">
                                        <Ionicons name="star" size={16} color="#f59e0b" />
                                        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                                            Dificuldade alta
                                        </Text>
                                    </XStack>

                                    <XStack alignItems="center">
                                        <Text style={{ fontSize: 14, color: colors.primary[600], fontWeight: '600', marginRight: 4 }}>
                                            Iniciar
                                        </Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={colors.primary[600]}
                                        />
                                    </XStack>
                                </XStack>
                            </YStack>
                        </TouchableOpacity>
                    </Card>
                </YStack>

                {/* Seção de Quizzes Rápidos */}
                <YStack gap="$4">
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.accent }}>
                        Quizzes Rápidos
                    </Text>

                    {/* Lista horizontal de quizzes */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                    >
                        {/* Quiz 1 */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navegarParaQuiz(1)}
                            style={{ marginRight: 12, width: 200 }}
                        >
                            <Card style={{
                                backgroundColor: colors.card,
                                borderRadius: 16,
                                overflow: 'hidden',
                                height: 200,
                            }}>
                                <YStack p="$3" gap="$2" style={{ flex: 1, justifyContent: 'space-between' }}>
                                    <View style={{
                                        alignSelf: 'flex-start',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        backgroundColor: '#ecfdf5'
                                    }}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '600',
                                            color: '#059669'
                                        }}>
                                            Geografia
                                        </Text>
                                    </View>

                                    <YStack>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text.primary }}>
                                            Capitais do Mundo
                                        </Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
                                            10 questões • 10 min
                                        </Text>
                                    </YStack>

                                    <XStack justifyContent="flex-end">
                                        <TouchableOpacity
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                backgroundColor: colors.primary[600],
                                                borderRadius: 8
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                                                Jogar
                                            </Text>
                                        </TouchableOpacity>
                                    </XStack>
                                </YStack>
                            </Card>
                        </TouchableOpacity>

                        {/* Quiz 2 */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navegarParaQuiz(2)}
                            style={{ marginRight: 12, width: 200 }}
                        >
                            <Card style={{
                                backgroundColor: colors.card,
                                borderRadius: 16,
                                overflow: 'hidden',
                                height: 200,
                            }}>
                                <YStack p="$3" gap="$2" style={{ flex: 1, justifyContent: 'space-between' }}>
                                    <View style={{
                                        alignSelf: 'flex-start',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        backgroundColor: '#f5f3ff'
                                    }}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '600',
                                            color: '#8b5cf6'
                                        }}>
                                            História
                                        </Text>
                                    </View>

                                    <YStack>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text.primary }}>
                                            Independência de Angola
                                        </Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
                                            15 questões • 15 min
                                        </Text>
                                    </YStack>

                                    <XStack justifyContent="flex-end">
                                        <TouchableOpacity
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                backgroundColor: colors.primary[600],
                                                borderRadius: 8
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                                                Jogar
                                            </Text>
                                        </TouchableOpacity>
                                    </XStack>
                                </YStack>
                            </Card>
                        </TouchableOpacity>

                        {/* Quiz 3 */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navegarParaQuiz(3)}
                            style={{ width: 200 }}
                        >
                            <Card style={{
                                backgroundColor: colors.card,
                                borderRadius: 16,
                                overflow: 'hidden',
                                height: 200,
                            }}>
                                <YStack p="$3" gap="$2" style={{ flex: 1, justifyContent: 'space-between' }}>
                                    <View style={{
                                        alignSelf: 'flex-start',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        backgroundColor: '#ffedd5'
                                    }}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '600',
                                            color: '#ea580c'
                                        }}>
                                            Biologia
                                        </Text>
                                    </View>

                                    <YStack>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text.primary }}>
                                            Sistema Nervoso
                                        </Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
                                            12 questões • 15 min
                                        </Text>
                                    </YStack>

                                    <XStack justifyContent="flex-end">
                                        <TouchableOpacity
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                backgroundColor: colors.primary[600],
                                                borderRadius: 8
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                                                Jogar
                                            </Text>
                                        </TouchableOpacity>
                                    </XStack>
                                </YStack>
                            </Card>
                        </TouchableOpacity>
                    </ScrollView>
                </YStack>
            </ScrollView>

            {/* Tab Bar de navegação */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingTop: 12,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
                backgroundColor: colors.card,
                borderTopWidth: 1,
                borderTopColor: colors.border,
            }}>
                <TouchableOpacity style={{ alignItems: 'center' }}>
                    <Ionicons name="home" size={24} color={colors.primary[600]} />
                    <Text style={{ fontSize: 12, color: colors.primary[600], marginTop: 2 }}>
                        Início
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    onPress={navegarParaAvaliacoes}
                >
                    <Ionicons name="document-text-outline" size={24} color={colors.text.muted} />
                    <Text style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
                        Avaliações
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    onPress={navegarParaQuizzes}
                >
                    <Ionicons name="game-controller-outline" size={24} color={colors.text.muted} />
                    <Text style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
                        Quizzes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    onPress={navegarParaEstatisticas}
                >
                    <Ionicons name="bar-chart-outline" size={24} color={colors.text.muted} />
                    <Text style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
                        Estatísticas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    onPress={navegarParaPerfil}
                >
                    <Ionicons name="person-outline" size={24} color={colors.text.muted} />
                    <Text style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
                        Perfil
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
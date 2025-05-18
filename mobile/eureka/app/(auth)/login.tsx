import React from 'react';
import { View, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import { XStack, YStack } from '~/components/ui/stack';
import { CustomInput } from '~/components/ui/custom-input';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Importando o novo hook de tema
import { useTheme } from '~/lib/theme/useTheme';

export default function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Usando o novo hook de tema
  const { colors, tw, isDark } = useTheme();

  // Corrigindo o atributo style duplicado usando um objeto combinado
  const viewStyle = {
    ...tw.style('flex-1'),
    backgroundColor: colors.background
  };

  // Funções de navegação
  const navegarParaRecuperarSenha = () => {
    // Navegando para a página de recuperar senha (quando existir)
    // Você pode implementar temporariamente um alert
    alert("Funcionalidade de recuperar senha ainda não implementada");
  };

  const navegarParaCadastro = () => {
    router.push('/(auth)/cadastro');
  };

  const fazerLogin = () => {
    // Simulando login bem-sucedido
    router.push('/(app)');

    // Quando a estrutura de rotas estiver pronta, substitua pelo router.push
    //alert(`Login com ${email} realizado com sucesso!`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={viewStyle}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={tw.style('flex-grow justify-center px-5 pb-10')}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap="$4" pt={insets.top}>
          {/* Logo e Título */}
          <YStack alignItems="center" gap="$2" mb="$6">
            <Image
              source={require('../../assets/images/logo.png')}
              style={tw.style('w-20 h-20 mb-2')}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.accent }}>
              Eureka
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
              Preparação para exames
            </Text>
          </YStack>

          <Card style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <YStack p="$4" gap="$4">
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.accent, marginBottom: 8 }}>
                Entrar
              </Text>

              {/* Campo de Email - usando CustomInput */}
              <YStack gap="$2">
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.secondary }}>
                  Email
                </Text>
                <CustomInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Seu endereço de email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.text.muted}
                      style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
                    />
                  }
                />
              </YStack>

              {/* Campo de Senha - usando CustomInput */}
              <YStack gap="$2">
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.secondary }}>
                  Senha
                </Text>
                <CustomInput
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Sua senha"
                  secureTextEntry={!mostrarSenha}
                  leftIcon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.text.muted}
                      style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setMostrarSenha(!mostrarSenha)}
                      style={{ position: 'absolute', right: 12, top: 12, zIndex: 1 }}
                    >
                      <Ionicons
                        name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.text.muted}
                      />
                    </TouchableOpacity>
                  }
                />
              </YStack>

              {/* Esqueci minha senha */}
              <XStack justifyContent="flex-end">
                <TouchableOpacity
                  onPress={navegarParaRecuperarSenha}
                  style={{ padding: 8 }}
                >
                  <Text style={{ fontSize: 14, color: colors.text.accent, fontWeight: '500' }}>
                    Esqueci minha senha
                  </Text>
                </TouchableOpacity>
              </XStack>

              {/* Botão de Login - personalizado para aceitar pressStyle */}
              <TouchableOpacity
                onPress={fazerLogin}
                style={{
                  backgroundColor: colors.primary[600],
                  paddingVertical: 14,
                  borderRadius: 12,
                  marginTop: 8,
                }}
                activeOpacity={0.7} // Simula o efeito pressStyle
              >
                <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                  Entrar
                </Text>
              </TouchableOpacity>
            </YStack>
          </Card>

          {/* Separador */}
          <XStack alignItems="center" my="$2">
            <Separator style={{ flex: 1, backgroundColor: colors.separator }} />
            <Text style={{ marginHorizontal: 16, color: colors.text.muted, fontWeight: '500' }}>ou</Text>
            <Separator style={{ flex: 1, backgroundColor: colors.separator }} />
          </XStack>

          {/* Botões de redes sociais - substituindo Button por TouchableOpacity */}
          <YStack gap="$3">
            <TouchableOpacity
              onPress={() => alert("Login com Google ainda não implementado")}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.card
              }}
              activeOpacity={0.7} // Simula o efeito pressStyle
            >
              <XStack gap="$2" justifyContent="center" alignItems="center">
                <Ionicons name="logo-google" size={18} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>
                  Continuar com Google
                </Text>
              </XStack>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => alert("Login com Apple ainda não implementado")}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.card
              }}
              activeOpacity={0.7} // Simula o efeito pressStyle
            >
              <XStack gap="$2" justifyContent="center" alignItems="center">
                <Ionicons name="logo-apple" size={18} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>
                  Continuar com Apple
                </Text>
              </XStack>
            </TouchableOpacity>
          </YStack>

          {/* Link para cadastro */}
          <XStack justifyContent="center" mt="$4">
            <Text style={{ color: colors.text.secondary }}>
              Não tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={navegarParaCadastro}>
              <Text style={{ color: colors.text.accent, fontWeight: '600' }}>
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
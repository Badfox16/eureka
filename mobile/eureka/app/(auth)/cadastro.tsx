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

// Importando o hook de tema
import { useTheme } from '~/lib/theme/useTheme';

export default function CadastroScreen() {
  const [nome, setNome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [confirmarSenha, setConfirmarSenha] = React.useState('');
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = React.useState(false);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Usando o hook de tema completo como na página de login
  const { colors, tw, isDark } = useTheme();

  // Estilo do container principal (igual ao login)
  const viewStyle = { 
    ...tw.style('flex-1'),
    backgroundColor: colors.background 
  };

  // Função para criar a conta
  const criarConta = () => {
    // Validação básica
    if (!nome || !email || !senha || !confirmarSenha) {
      alert("Por favor, preencha todos os campos");
      return;
    }
    
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }
    
    // Simulando o cadastro bem-sucedido
    alert(`Conta criada com sucesso para ${nome}!`);
  };

  // Navegação para a tela de login
  const voltarParaLogin = () => {
    router.back(); // Volta para a tela anterior (que geralmente é o login)
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
              style={tw.style('w-16 h-16 mb-2')}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.primary }}>
              Crie sua conta
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
              Entre para a comunidade Eureka
            </Text>
          </YStack>

          <Card style={{ backgroundColor: colors.card, borderRadius: 16 }}>
            <YStack p="$4" gap="$4">
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary, marginBottom: 8 }}>
                Cadastro
              </Text>

              {/* Campo de Nome */}
              <YStack gap="$2">
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.secondary }}>
                  Nome completo
                </Text>
                <CustomInput
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Seu nome completo"
                  autoCapitalize="words"
                  leftIcon={
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color={colors.text.muted}
                      style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
                    />
                  }
                />
              </YStack>

              {/* Campo de Email */}
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

              {/* Campo de Senha */}
              <YStack gap="$2">
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.secondary }}>
                  Senha
                </Text>
                <CustomInput
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Crie uma senha forte"
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

              {/* Campo de Confirmar Senha */}
              <YStack gap="$2">
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.secondary }}>
                  Confirmar senha
                </Text>
                <CustomInput
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  placeholder="Confirme sua senha"
                  secureTextEntry={!mostrarConfirmarSenha}
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
                      onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)} 
                      style={{ position: 'absolute', right: 12, top: 12, zIndex: 1 }}
                    >
                      <Ionicons 
                        name={mostrarConfirmarSenha ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={colors.text.muted}
                      />
                    </TouchableOpacity>
                  }
                />
              </YStack>

              {/* Termos e condições */}
              <XStack alignItems="center" justifyContent="center" my="$1">
                <Text style={{ fontSize: 13, color: colors.text.muted, textAlign: 'center' }}>
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Text style={{ color: colors.text.accent, fontWeight: '500' }}>
                    Termos de Serviço
                  </Text>
                  {' '}e{' '}
                  <Text style={{ color: colors.text.accent, fontWeight: '500' }}>
                    Política de Privacidade
                  </Text>
                </Text>
              </XStack>

              {/* Botão de Cadastro */}
              <TouchableOpacity
                onPress={criarConta}
                style={{
                  backgroundColor: colors.primary[600],
                  paddingVertical: 14,
                  borderRadius: 12,
                  marginTop: 8,
                }}
                activeOpacity={0.7} // Simula o efeito pressStyle
              >
                <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                  Criar conta
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

          {/* Botões de redes sociais */}
          <YStack gap="$3">
            <TouchableOpacity
              onPress={() => alert("Cadastro com Google ainda não implementado")}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 14, 
                borderRadius: 12,
                backgroundColor: colors.card
              }}
              activeOpacity={0.7}
            >
              <XStack gap="$2" justifyContent="center" alignItems="center">
                <Ionicons name="logo-google" size={18} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>
                  Continuar com Google
                </Text>
              </XStack>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => alert("Cadastro com Apple ainda não implementado")}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 14, 
                borderRadius: 12,
                backgroundColor: colors.card
              }}
              activeOpacity={0.7}
            >
              <XStack gap="$2" justifyContent="center" alignItems="center">
                <Ionicons name="logo-apple" size={18} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>
                  Continuar com Apple
                </Text>
              </XStack>
            </TouchableOpacity>
          </YStack>

          {/* Link para login */}
          <XStack justifyContent="center" mt="$4">
            <Text style={{ color: colors.text.secondary }}>
              Já tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={voltarParaLogin}>
              <Text style={{ color: colors.text.accent, fontWeight: '600' }}>
                Faça login
              </Text>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
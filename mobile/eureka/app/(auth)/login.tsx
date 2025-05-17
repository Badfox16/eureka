import React from 'react';
import { View, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Input as TextInput } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { XStack, YStack } from '~/components/ui/stack';

import { useTailwind } from '../../lib/tailwind';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tw = useTailwind();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={tw.style('flex-1 bg-white dark:bg-slate-950')}
    >
      <StatusBar style="auto" />
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
            <Text style={tw.style('text-2xl font-bold text-slate-800 dark:text-white')}>
              Eureka
            </Text>
            <Text style={tw.style('text-sm text-slate-500 dark:text-slate-400')}>
              Preparação para exames
            </Text>
          </YStack>

          <Card style={tw.style('bg-white dark:bg-slate-900 rounded-2xl shadow-md')}>
            <YStack p="$4" gap="$4">
              <Text style={tw.style('text-xl font-bold text-slate-800 dark:text-white mb-2')}>
                Entrar
              </Text>

              {/* Campo de Email */}
              <YStack gap="$2">
                <Text style={tw.style('text-sm font-medium text-slate-700 dark:text-slate-300')}>
                  Email
                </Text>
                <View style={tw.style('relative')}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Seu endereço de email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={tw.style('px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white')}
                    placeholderTextColor={tw.color('slate-400')}
                    leftIconComponent={
                      <Ionicons name="mail-outline" size={20} color={tw.color('slate-400')} />
                    }
                  />
                </View>
              </YStack>

              {/* Campo de Senha */}
              <YStack gap="$2">
                <Text style={tw`text-sm font-medium text-slate-700 dark:text-slate-300`}>
                  Senha
                </Text>
                <View style={tw`relative`}>
                  <TextInput
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="Sua senha"
                    secureTextEntry={!mostrarSenha}
                    style={tw`px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white`}
                    placeholderTextColor={tw.color('slate-400')}
                    leftIconComponent={
                      <Ionicons name="lock-closed-outline" size={20} color={tw.color('slate-400')} />
                    }
                    rightIconComponent={
                      <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={tw`p-2`}>
                        <Ionicons 
                          name={mostrarSenha ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color={tw.color('slate-400')}
                        />
                      </TouchableOpacity>
                    }
                  />
                </View>
              </YStack>

              {/* Esqueci minha senha */}
              <XStack justifyContent="flex-end">
                <TouchableOpacity
                  onPress={() => router.push('/recuperar-senha')}
                  style={tw`py-2`}
                >
                  <Text style={tw`text-sm text-violet-600 dark:text-violet-400 font-medium`}>
                    Esqueci minha senha
                  </Text>
                </TouchableOpacity>
              </XStack>

              {/* Botão de Login */}
              <Button
                onPress={() => router.push('/(app)')}
                style={tw`bg-violet-600 dark:bg-violet-500 py-3.5 rounded-xl mt-2`}
                pressStyle={tw`bg-violet-700 dark:bg-violet-600`}
              >
                <Text style={tw`text-white font-semibold text-center`}>
                  Entrar
                </Text>
              </Button>
            </YStack>
          </Card>

          {/* Separador */}
          <XStack alignItems="center" my="$2">
            <Separator style={tw`flex-1 bg-slate-200 dark:bg-slate-700`} />
            <Text style={tw`mx-4 text-slate-400 dark:text-slate-500 font-medium`}>ou</Text>
            <Separator style={tw`flex-1 bg-slate-200 dark:bg-slate-700`} />
          </XStack>

          {/* Botões de redes sociais */}
          <YStack gap="$3">
            <Button
              onPress={() => {}}
              style={tw`border border-slate-200 dark:border-slate-700 py-3.5 rounded-xl bg-white dark:bg-slate-900`}
              pressStyle={tw`bg-slate-50 dark:bg-slate-800`}
            >
              <XStack gap="$2" justifyContent="center" alignItems="center">
                <Ionicons name="logo-google" size={18} color={tw.color('slate-700 dark:slate-300')} />
                <Text style={tw`text-slate-700 dark:text-slate-300 font-semibold`}>
                  Continuar com Google
                </Text>
              </XStack>
            </Button>

            <Button
              onPress={() => {}}
              style={tw`border border-slate-200 dark:border-slate-700 py-3.5 rounded-xl bg-white dark:bg-slate-900`}
              pressStyle={tw`bg-slate-50 dark:bg-slate-800`}
            >
              <XStack gap="$2" justifyContent="center" alignItems="center">
                <Ionicons name="logo-apple" size={18} color={tw.color('slate-700 dark:slate-300')} />
                <Text style={tw`text-slate-700 dark:text-slate-300 font-semibold`}>
                  Continuar com Apple
                </Text>
              </XStack>
            </Button>
          </YStack>

          {/* Link para cadastro */}
          <XStack justifyContent="center" mt="$4">
            <Text style={tw`text-slate-600 dark:text-slate-400`}>
              Não tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/cadastro')}>
              <Text style={tw`text-violet-600 dark:text-violet-400 font-semibold`}>
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
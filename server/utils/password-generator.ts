/**
 * Gera uma senha aleatória para novos usuários
 * @param length Comprimento da senha (padrão: 8)
 * @returns Uma senha aleatória
 */
export function generatePassword(length: number = 8): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  // Garante pelo menos um número
  const randomNumber = Math.floor(Math.random() * 10).toString();
  password += randomNumber;
  
  // Garante pelo menos uma letra maiúscula
  const randomUppercase = charset.charAt(Math.floor(Math.random() * 26));
  password += randomUppercase;
  
  // Preenche o resto da senha
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  
  // Embaralha a senha para não ter padrão previsível
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}
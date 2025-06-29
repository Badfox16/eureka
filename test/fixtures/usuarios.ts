import { Usuario, TipoUsuario } from '../../server/src/models/usuario';
import bcrypt from 'bcrypt';

// Senhas pré-hasheadas para testes
export const senhaHash = async (senha: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(senha, saltRounds);
};

export const usuarioFixtures = async () => [
  {
    nome: 'Admin Teste',
    email: 'admin@exemplo.com',
    password: await senhaHash('senha123'),
    tipo: TipoUsuario.ADMIN
  },
  {
    nome: 'Professor Teste',
    email: 'professor@exemplo.com',
    password: await senhaHash('senha123'),
    tipo: TipoUsuario.PROFESSOR
  },
  {
    nome: 'Usuário Normal',
    email: 'normal@exemplo.com',
    password: await senhaHash('senha123'),
    tipo: TipoUsuario.NORMAL
  }
];

export const createUsuarioFixtures = async () => {
  const fixtures = await usuarioFixtures();
  return await Usuario.insertMany(fixtures);
};
import request from 'supertest';
import { app } from '../../src/index';  // Precisa exportar o app do index.ts
import { Usuario } from '../../src/models/usuario';
import bcrypt from 'bcrypt';

describe('Autenticação', () => {
  beforeEach(async () => {
    // Criar um usuário para testes
    const password = await bcrypt.hash('senha123', 10);
    await Usuario.create({
      nome: 'Teste',
      email: 'teste@example.com',
      password,
      tipo: 'NORMAL'
    });
  });

  it('deve permitir login com credenciais corretas', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'teste@example.com', password: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.token).toBeDefined();
  });

  it('deve rejeitar login com senha incorreta', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'teste@example.com', password: 'errada' });

    expect(res.status).toBe(401);
  });
});
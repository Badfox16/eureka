# 📚 Documentação da API Eureka

## Visão Geral

A API Eureka é uma API RESTful para o sistema de preparação para exames educacionais angolanos. Esta documentação fornece informações detalhadas sobre todos os endpoints disponíveis.

## 🔗 Acesso à Documentação

### Swagger UI
- **URL**: `http://localhost:6199/api-docs`
- **Descrição**: Interface interativa para testar a API

### OpenAPI JSON
- **URL**: `http://localhost:6199/api-docs.json`
- **Descrição**: Especificação OpenAPI em formato JSON

## 🚀 Início Rápido

### 1. Autenticação

A API usa autenticação JWT. Para acessar endpoints protegidos:

1. **Registrar/Login**: Use os endpoints `/auth/register` ou `/auth/login`
2. **Token**: Inclua o token no header: `Authorization: Bearer <seu_token>`

### 2. Exemplo de Uso

```bash
# Login
curl -X POST http://localhost:6199/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Usar token para acessar recursos protegidos
curl -X GET http://localhost:6199/api/v1/disciplinas \
  -H "Authorization: Bearer <seu_token>"
```

## 📋 Endpoints Principais

### Autenticação (`/auth`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/auth/login` | Login de usuário | ❌ |
| POST | `/auth/register` | Registro de usuário | ❌ |
| POST | `/auth/refresh` | Renovar token | ❌ |
| POST | `/auth/logout` | Logout | ✅ |
| GET | `/auth/me` | Perfil do usuário | ✅ |

### Disciplinas (`/disciplinas`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/disciplinas` | Listar disciplinas | ❌ |
| POST | `/disciplinas` | Criar disciplina | ✅ |
| GET | `/disciplinas/{id}` | Obter disciplina | ❌ |
| PUT | `/disciplinas/{id}` | Atualizar disciplina | ✅ |
| DELETE | `/disciplinas/{id}` | Remover disciplina | ✅ |
| GET | `/disciplinas/search` | Buscar disciplinas | ❌ |

### Avaliações (`/avaliacoes`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/avaliacoes` | Listar avaliações | ❌ |
| POST | `/avaliacoes` | Criar avaliação | ✅ |
| GET | `/avaliacoes/{id}` | Obter avaliação | ❌ |
| PUT | `/avaliacoes/{id}` | Atualizar avaliação | ✅ |
| DELETE | `/avaliacoes/{id}` | Remover avaliação | ✅ |
| GET | `/avaliacoes/search` | Buscar avaliações | ❌ |
| GET | `/avaliacoes/estatisticas` | Estatísticas | ❌ |

### Questões (`/questoes`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/questoes` | Listar questões | ❌ |
| POST | `/questoes` | Criar questão | ✅ |
| GET | `/questoes/{id}` | Obter questão | ❌ |
| PUT | `/questoes/{id}` | Atualizar questão | ✅ |
| DELETE | `/questoes/{id}` | Remover questão | ✅ |
| GET | `/questoes/search` | Buscar questões | ❌ |
| POST | `/questoes/importar/{avaliacaoId}` | Importar questões | ✅ |

### Quizzes (`/quizzes`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/quizzes` | Listar quizzes | ❌ |
| POST | `/quizzes` | Criar quiz | ✅ |
| GET | `/quizzes/{id}` | Obter quiz | ❌ |
| PUT | `/quizzes/{id}` | Atualizar quiz | ✅ |
| DELETE | `/quizzes/{id}` | Remover quiz | ✅ |
| PATCH | `/quizzes/{id}/toggle-status` | Ativar/desativar | ✅ |

### Estudantes (`/estudantes`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/estudantes` | Listar estudantes | ❌ |
| POST | `/estudantes` | Criar estudante | ✅ |
| GET | `/estudantes/{id}` | Obter estudante | ❌ |
| PUT | `/estudantes/{id}` | Atualizar estudante | ✅ |
| DELETE | `/estudantes/{id}` | Remover estudante | ✅ |
| GET | `/estudantes/{id}/respostas` | Respostas do estudante | ❌ |
| GET | `/estudantes/{id}/estatisticas` | Estatísticas | ❌ |

## 🔐 Autenticação e Autorização

### Tipos de Usuário

- **ADMIN**: Acesso completo a todas as funcionalidades
- **PROFESSOR**: Pode criar e gerenciar conteúdo educacional
- **NORMAL**: Acesso limitado (estudante)

### Tokens JWT

- **Access Token**: Expira em 24h
- **Refresh Token**: Expira em 7 dias
- **Formato**: `Bearer <token>`

### Exemplo de Headers

```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

## 📊 Paginação

A maioria dos endpoints de listagem suporta paginação:

### Parâmetros de Query

- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)
- `sort`: Campo para ordenação
- `order`: Ordem (asc/desc, padrão: desc)

### Exemplo

```bash
GET /api/v1/disciplinas?page=2&limit=20&sort=nome&order=asc
```

### Resposta

```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## 🔍 Busca

Endpoints de busca aceitam o parâmetro `q`:

```bash
GET /api/v1/disciplinas/search?q=matemática
```

## 📁 Upload de Arquivos

### Endpoints de Upload

- `POST /api/v1/temp/upload` - Upload de imagens para questões

### Formato

```bash
curl -X POST http://localhost:6199/api/v1/temp/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@imagem.jpg"
```

### Tipos Suportados

- **Imagens**: JPG, PNG, GIF, WebP
- **Tamanho máximo**: 5MB

## 📈 Estatísticas

### Endpoints de Estatísticas

- `GET /api/v1/estatisticas/geral` - Estatísticas gerais
- `GET /api/v1/estatisticas/avaliacoes` - Estatísticas de avaliações
- `GET /api/v1/estatisticas/estudantes` - Estatísticas de estudantes
- `GET /api/v1/estatisticas/disciplinas` - Estatísticas por disciplina

## 🚨 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 403 | Proibido |
| 404 | Não encontrado |
| 409 | Conflito |
| 422 | Entidade não processável |
| 500 | Erro interno do servidor |

## 📝 Exemplos de Uso

### Criar uma Avaliação

```bash
curl -X POST http://localhost:6199/api/v1/avaliacoes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "AP",
    "ano": 2024,
    "disciplina": "64f1a2b3c4d5e6f7g8h9i0j1",
    "trimestre": "1º",
    "provincia": "64f1a2b3c4d5e6f7g8h9i0j2",
    "classe": 11,
    "areaEstudo": "CIÊNCIAS"
  }'
```

### Criar uma Questão

```bash
curl -X POST http://localhost:6199/api/v1/questoes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 1,
    "enunciado": "Qual é a capital de Angola?",
    "alternativas": [
      {
        "letra": "A",
        "texto": "Luanda",
        "correta": true
      },
      {
        "letra": "B",
        "texto": "Benguela",
        "correta": false
      },
      {
        "letra": "C",
        "texto": "Lobito",
        "correta": false
      },
      {
        "letra": "D",
        "texto": "Huambo",
        "correta": false
      }
    ],
    "avaliacao": "64f1a2b3c4d5e6f7g8h9i0j3",
    "explicacao": "Luanda é a capital e maior cidade de Angola."
  }'
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
PORT=6199
MONGODB_URI=mongodb://localhost:27017/eureka
JWT_SECRET=seu_segredo_jwt
JWT_REFRESH_SECRET=seu_refresh_secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Desenvolvimento

```bash
# Instalar dependências
bun install

# Executar em modo desenvolvimento
bun run dev

# Acessar documentação
open http://localhost:6199/api-docs
```

## 🤝 Contribuição

Para contribuir com a documentação:

1. Atualize os comentários Swagger nos controllers
2. Teste os endpoints na interface Swagger
3. Atualize este arquivo README se necessário
4. Verifique se a documentação está sincronizada com o código

## 📞 Suporte

Para dúvidas ou problemas:

- **Email**: suporte@eureka.ao
- **Issues**: [GitHub Issues](https://github.com/Badfox16/eureka/issues)
- **Documentação**: [Swagger UI](http://localhost:6199/api-docs) 
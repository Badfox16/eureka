# Refatoração dos Componentes e APIs para Usar Tipos em Português

## Estrutura da API

O backend está estruturado com os seguintes endpoints principais:

1. `/api/v1/auth` - Autenticação e gerenciamento de sessão
2. `/api/v1/usuarios` - Gerenciamento de usuários
3. `/api/v1/estudantes` - Gerenciamento de estudantes
4. `/api/v1/disciplinas` - Gerenciamento de disciplinas
5. `/api/v1/provincias` - Gerenciamento de províncias
6. `/api/v1/avaliacoes` - Gerenciamento de avaliações
7. `/api/v1/questoes` - Gerenciamento de questões
8. `/api/v1/quizzes` - Gerenciamento de quizzes
9. `/api/v1/quiz-respostas` - Gerenciamento de respostas aos quizzes
10. `/api/v1/estatisticas` - Estatísticas e métricas

## Estrutura dos Serviços e Hooks

1. **Serviço Base (`apiService.ts`)**
   - Função `fetchApi` centralizada
   - Gerenciamento de tokens de autenticação
   - Manipulação de erros padronizada

2. **Serviços Específicos**
   - `auth.ts`: Login, registro, logout e verificação de usuário atual
   - `usuario.ts`: Operações de usuários
   - `estudante.ts`: Operações de estudantes, incluindo busca e estatísticas
   - `quiz.ts`: Gerenciamento de quizzes
   - `quizResposta.ts`: Gerenciamento de tentativas e respostas
   - `avaliacao.ts`: Gerenciamento de avaliações
   - `disciplina.ts`: Gerenciamento de disciplinas
   - `provincia.ts`: Gerenciamento de províncias
   - `estatistica.ts`: Consulta de estatísticas e relatórios

3. **Hooks Personalizados**
   - `useAuth.ts`: Gerencia estado de autenticação
   - `useQuizResposta.ts`: Gerencia tentativas e respostas de quiz
   - `useEstudante.ts`: Gerencia perfil e dados do estudante
   - `useQuizzes.ts`: Gerencia operações de quizzes
   - `useEstatisticas.ts`: Gerencia estatísticas e métricas

## Padronização de Tipos e Nomenclatura

Todos os tipos estão em português, seguindo o modelo do backend:

1. `Usuario` (antes: User)
2. `Estudante` (antes: Student)
3. `Quiz` (mantido)
4. `EstudanteQuiz` (antes: QuizAttempt)
5. `QuizResposta` (antes: QuizAnswer)
6. `Avaliacao`
7. `Disciplina`
8. `Provincia`
9. `Questao`
10. `EstatisticasUsuario` (antes: UserStats)
11. `AtividadeRecente` (antes: RecentActivity)
12. `Insignia` (antes: Badge)
13. `TipoAtividade` (antes: ActivityType)

## Parâmetros de Busca (SearchParams)

Todos os tipos de parâmetros de busca estão padronizados:

1. `UsuarioSearchParams` 
2. `EstudanteSearchParams`
3. `QuizSearchParams`
4. `EstudanteQuizSearchParams`
5. `AvaliacaoSearchParams`
6. `DisciplinaSearchParams`
7. `ProvinciaSearchParams`

## Comunicação com a API

Todas as funções de API seguem um padrão uniforme:

1. Utilizam a função `fetchApi` base
2. Retornam objetos com estrutura `{ data, error, pagination, message }`
3. Adicionam automaticamente cabeçalhos de autenticação quando necessário
4. Suportam paginação e filtragem com `buildQueryString`

## Gerenciamento de Estado

Utilizamos React Query para gerenciamento de estado:

1. Consultas (`useQuery`) para buscar dados
2. Mutações (`useMutation`) para modificar dados
3. Cache inteligente para minimizar requisições
4. Invalidação de consultas para manter dados atualizados

## Refatoração Completa

✅ Tipos: Todos os tipos foram refatorados para português
✅ APIs: Todas as funções de API foram atualizadas para usar os novos tipos
✅ Hooks: Todos os hooks foram atualizados para usar os tipos em português
✅ Formulários: Componentes de login e registro atualizados
✅ Validação: Esquemas Zod atualizados para português
✅ Parâmetros de busca: Padronizados e corrigidos em todos os arquivos

## Compatibilidade

Para facilitar a transição, mantivemos aliases temporários:
- `User = Usuario`
- `QuizAttempt = EstudanteQuiz`
- `QuizAnswer = QuizResposta`
- `UserStats = EstatisticasUsuario`

Esses aliases devem ser removidos após a refatoração completa de todos os componentes.

## Próximos Passos

1. Remover arquivos antigos não mais necessários:
   - `user.ts` (substituído por `usuario.ts`)
   - `attempt.ts` (substituído pelos tipos específicos)
   - Outros arquivos de tipo antigos

2. Remover aliases de compatibilidade depois que todos os componentes estiverem usando os novos tipos

3. Revisar e atualizar testes para garantir compatibilidade com os novos tipos

4. Verificar e corrigir quaisquer referências remanescentes aos tipos antigos em componentes de UI

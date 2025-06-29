/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - tipo
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do usuário
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário (hash)
 *         tipo:
 *           type: string
 *           enum: [ADMIN, PROFESSOR, NORMAL]
 *           description: Tipo de usuário
 *         ativo:
 *           type: boolean
 *           default: true
 *           description: Status do usuário
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Disciplina:
 *       type: object
 *       required:
 *         - codigo
 *         - nome
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da disciplina
 *         codigo:
 *           type: string
 *           description: Código da disciplina
 *         nome:
 *           type: string
 *           description: Nome da disciplina
 *         descricao:
 *           type: string
 *           description: Descrição da disciplina
 *         ativo:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CreateDisciplinaRequest:
 *       type: object
 *       required:
 *         - codigo
 *         - nome
 *       properties:
 *         codigo:
 *           type: string
 *           description: Código da disciplina
 *         nome:
 *           type: string
 *           description: Nome da disciplina
 *         descricao:
 *           type: string
 *           description: Descrição da disciplina
 * 
 *     UpdateDisciplinaRequest:
 *       type: object
 *       properties:
 *         codigo:
 *           type: string
 *           description: Código da disciplina
 *         nome:
 *           type: string
 *           description: Nome da disciplina
 *         descricao:
 *           type: string
 *           description: Descrição da disciplina
 *         ativo:
 *           type: boolean
 *           description: Status da disciplina
 * 
 *     Provincia:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da província
 *         nome:
 *           type: string
 *           description: Nome da província
 *         ativo:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Avaliacao:
 *       type: object
 *       required:
 *         - tipo
 *         - ano
 *         - disciplina
 *         - classe
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da avaliação
 *         tipo:
 *           type: string
 *           enum: [AP, EXAME]
 *           description: Tipo de avaliação (AP = Avaliação Provincial, EXAME = Exame Nacional)
 *         ano:
 *           type: number
 *           minimum: 2000
 *           description: Ano da avaliação
 *         disciplina:
 *           type: string
 *           description: ID da disciplina
 *         trimestre:
 *           type: string
 *           enum: [1º, 2º, 3º]
 *           description: Trimestre (apenas para AP)
 *         provincia:
 *           type: string
 *           description: ID da província (apenas para AP)
 *         variante:
 *           type: string
 *           enum: [A, B, C, D, ÚNICA]
 *           default: ÚNICA
 *           description: Variante da prova
 *         epoca:
 *           type: string
 *           enum: [1ª, 2ª]
 *           description: Época (apenas para EXAME)
 *         areaEstudo:
 *           type: string
 *           enum: [CIÊNCIAS, LETRAS, GERAL]
 *           default: GERAL
 *           description: Área de estudo
 *         classe:
 *           type: number
 *           enum: [10, 11, 12]
 *           description: Classe
 *         titulo:
 *           type: string
 *           description: Título da avaliação
 *         questoes:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs das questões
 *         ativo:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Questao:
 *       type: object
 *       required:
 *         - numero
 *         - enunciado
 *         - alternativas
 *         - avaliacao
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da questão
 *         numero:
 *           type: number
 *           description: Número da questão
 *         enunciado:
 *           type: string
 *           description: Texto do enunciado
 *         imagemEnunciadoUrl:
 *           type: string
 *           description: URL da imagem do enunciado
 *         alternativas:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - letra
 *               - texto
 *               - correta
 *             properties:
 *               letra:
 *                 type: string
 *                 description: Letra da alternativa (A, B, C, D)
 *               texto:
 *                 type: string
 *                 description: Texto da alternativa
 *               correta:
 *                 type: boolean
 *                 description: Se é a alternativa correta
 *               imagemUrl:
 *                 type: string
 *                 description: URL da imagem da alternativa
 *         explicacao:
 *           type: string
 *           description: Explicação da resposta correta
 *         avaliacao:
 *           type: string
 *           description: ID da avaliação
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Quiz:
 *       type: object
 *       required:
 *         - titulo
 *         - avaliacao
 *         - tempoLimite
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do quiz
 *         titulo:
 *           type: string
 *           description: Título do quiz
 *         descricao:
 *           type: string
 *           description: Descrição do quiz
 *         avaliacao:
 *           type: string
 *           description: ID da avaliação
 *         tempoLimite:
 *           type: number
 *           minimum: 1
 *           description: Tempo limite em minutos
 *         ativo:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Estudante:
 *       type: object
 *       required:
 *         - usuario
 *         - classe
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do estudante
 *         usuario:
 *           type: string
 *           description: ID do usuário
 *         classe:
 *           type: number
 *           enum: [11, 12]
 *           description: Classe do estudante
 *         provincia:
 *           type: string
 *           description: ID da província
 *         areaEstudo:
 *           type: string
 *           enum: [CIÊNCIAS, LETRAS, GERAL]
 *           description: Área de estudo
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     EstudanteQuiz:
 *       type: object
 *       required:
 *         - estudante
 *         - quiz
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do resultado
 *         estudante:
 *           type: string
 *           description: ID do estudante
 *         quiz:
 *           type: string
 *           description: ID do quiz
 *         dataInicio:
 *           type: string
 *           format: date-time
 *           description: Data de início do quiz
 *         dataFim:
 *           type: string
 *           format: date-time
 *           description: Data de fim do quiz
 *         pontuacaoObtida:
 *           type: number
 *           minimum: 0
 *           description: Pontuação obtida
 *         totalPontos:
 *           type: number
 *           minimum: 0
 *           description: Total de pontos possíveis
 *         respostasCorretas:
 *           type: number
 *           default: 0
 *           description: Número de respostas corretas
 *         totalQuestoes:
 *           type: number
 *           default: 0
 *           description: Total de questões
 *         percentualAcerto:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *           description: Percentual de acerto
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     QuizResposta:
 *       type: object
 *       required:
 *         - estudanteQuiz
 *         - questao
 *         - alternativaEscolhida
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da resposta
 *         estudanteQuiz:
 *           type: string
 *           description: ID do resultado do quiz
 *         questao:
 *           type: string
 *           description: ID da questão
 *         alternativaEscolhida:
 *           type: string
 *           description: Letra da alternativa escolhida
 *         correta:
 *           type: boolean
 *           description: Se a resposta está correta
 *         tempoResposta:
 *           type: number
 *           description: Tempo de resposta em segundos
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário
 * 
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - tipo
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           minLength: 6
 *           description: Senha do usuário (mínimo 6 caracteres)
 *         tipo:
 *           type: string
 *           enum: [ADMIN, PROFESSOR, NORMAL]
 *           description: Tipo de usuário
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Login realizado com sucesso
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: Token JWT
 *             usuario:
 *               $ref: '#/components/schemas/Usuario'
 * 
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 * 
 *     SearchQuery:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *           description: Termo de busca
 *         page:
 *           type: number
 *           minimum: 1
 *           default: 1
 *           description: Número da página
 *         limit:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           description: Limite de itens por página
 *         sort:
 *           type: string
 *           description: Campo para ordenação
 *         order:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           description: Ordem da ordenação
 */ 
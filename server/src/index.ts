import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { connectToDatabase } from './config/db'
import { specs } from './config/swagger'
import morgan from 'morgan'
import errorHandler from './middlewares/errorHandler'
import disciplinaRoutes from './routes/disciplina.routes'
import estudanteRoutes from './routes/estudante.routes'
import quizRoutes from './routes/quiz.routes'
import questaoRoutes from './routes/questao.routes'
import avaliacaoRoutes from './routes/avaliacao.routes'
import usuarioRoutes from './routes/usuario.routes'
import provinciaRoutes from './routes/provincia.routes'
import estatisticaRoutes from './routes/estatistica.routes'
import quizRespostaRoutes from './routes/quizResposta.routes'
import authRoutes from './routes/auth.routes'
import uploadRoutes from './routes/upload.routes'

dotenv.config()

export const app = express()

// Configuração do CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://eureka-dashboard.vercel.app']

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem 'origin' (como apps mobile ou Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Bloqueado pelo CORS'))
    }
  },
  credentials: true, // Permitir cookies em requisições cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(morgan('dev'))
const PORT = process.env.PORT || 6199

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// --- Servir arquivos estáticos da pasta de uploads ---
// Isso fará com que os arquivos em 'tmp/uploads' sejam acessíveis via '/uploads' na URL
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')));

// Configuração do Swagger/OpenAPI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Eureka API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}))

// Rota para o arquivo JSON do Swagger
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(specs)
})

// Middleware para tratamento de erros (deve vir após as rotas)
// app.use(errorHandler)

// Prefixo da API
const API_PREFIX = '/v1'

// Rotas da API
app.use(`${API_PREFIX}/auth`, authRoutes)
app.use(`${API_PREFIX}/usuarios`, usuarioRoutes)
app.use(`${API_PREFIX}/estudantes`, estudanteRoutes)
app.use(`${API_PREFIX}/disciplinas`, disciplinaRoutes)
app.use(`${API_PREFIX}/provincias`, provinciaRoutes)
app.use(`${API_PREFIX}/avaliacoes`, avaliacaoRoutes)
app.use(`${API_PREFIX}/questoes`, questaoRoutes)
app.use(`${API_PREFIX}/quizzes`, quizRoutes)
app.use(`${API_PREFIX}/quiz-respostas`, quizRespostaRoutes)
app.use(`${API_PREFIX}/estatisticas`, estatisticaRoutes)
app.use(`${API_PREFIX}/temp`, uploadRoutes) // Nova rota para uploads

// Rota básica para verificar se o servidor está rodando
app.get('/', (req, res) => {
  res.json({
    message: 'API Eureka - Sistema de Preparação para Exames',
    status: 'online',
    version: '1.0.0',
    documentation: '/api-docs',
    apiBase: `${API_PREFIX}`
  })
})

// Middleware para tratamento de erros (deve vir após as rotas)
app.use(errorHandler)

// Middleware para tratar erros
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Erro interno do servidor'
  })
})

// Middleware para tratar rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada'
  })
})

app.listen(PORT, async () => {
  await connectToDatabase()
  console.log(`🚀 Servidor a correr na porta ${PORT}`)
})
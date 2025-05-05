import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import { connectToDatabase } from './config/db'
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

dotenv.config()

export const app = express()
app.use(morgan('dev'))
const PORT = process.env.PORT || 6199

// Middleware para parsear JSON
app.use(express.json())
// --- Servir arquivos estáticos da pasta de uploads ---
// Isso fará com que os arquivos em 'tmp/uploads' sejam acessíveis via '/uploads' na URL
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))); 
// Middleware para tratamento de erros
app.use(errorHandler);

// Rotas da API
app.use('/api/disciplinas', disciplinaRoutes)
app.use('/api/estudantes', estudanteRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/questoes', questaoRoutes)
app.use('/api/avaliacoes', avaliacaoRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/provincias', provinciaRoutes)

// Novas rotas
app.use('/api/estatisticas', estatisticaRoutes)
app.use('/api/quiz-respostas', quizRespostaRoutes)

// Remover rota de respostas obsoleta (substituída por quiz-respostas)
// app.use('/api/respostas', respostaRoutes)

// Rota básica para verificar se o servidor está rodando
app.get('/', (req, res) => {
  res.json({
    message: 'API Eureka - Sistema de Preparação para Exames',
    status: 'online',
    version: '2.0.0' // Versão atualizada para refletir as melhorias
  })
})

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
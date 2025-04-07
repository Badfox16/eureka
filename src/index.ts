import express from 'express'
import dotenv from 'dotenv'
import { connectToDatabase } from './config/db'
import morgan from 'morgan'

dotenv.config()

const app = express()
app.use(morgan('dev'))
const PORT = process.env.PORT || 3000

app.use(express.json())

app.listen(PORT, async () => {
    await connectToDatabase()
    console.log(`🚀 Servidor a correr na porta ${PORT}`)
})
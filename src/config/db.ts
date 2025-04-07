import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!

export async function connectToDatabase() {
    try {
      await mongoose.connect(uri)
      console.log('✅ Conectado ao MongoDB com Mongoose')
    } catch (err) {
      console.error('❌ Erro ao conectar no MongoDB:', err)
      process.exit(1)
    }
  }
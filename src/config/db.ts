import mongoose from "mongoose";

// Obter as variáveis de ambiente para a conexão com o MongoDB
const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "sapientia"; 

export async function connectToDatabase() {
  try {
    // Conectar especificando o banco de dados nas opções
    await mongoose.connect(uri, {
      dbName: dbName
    });

    console.log(`✅ Conectado ao MongoDB com Mongoose`);
    console.log(`📊 Banco de dados: ${dbName}`);
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB:', err);
    process.exit(1);
  }
}
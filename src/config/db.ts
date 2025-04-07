import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!

export let db: any

export async function connectToDatabase(){
    const client = new MongoClient(uri)
    await client.connect()
    db = client.db(process.env.MONGODB_DB)
    console.log("Conectado a base de dados")
}
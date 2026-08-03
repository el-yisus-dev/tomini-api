import mongoose from 'mongoose'
import config from './config.js'

const mongoURI = config.databaseUri ?? ''
const dbName = config.nameDd ?? ''

export const connectToMongoDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) return

  try {
    const connection = await mongoose.connect(mongoURI, {
      dbName,
      autoIndex: true
    })
    console.log(`Successfully connected to MongoDB: ${connection.connection.host}`)
  } catch (error) {
    const err = error as Error
    console.log('Error connecting to MongoDB', { message: err.message, stack: err.stack })
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost. Attempting to reconnect...')
  void connectToMongoDB()
})
import { MongoServerError } from 'mongodb'
import { type MongooseError } from 'mongoose'

export interface AllErrorsType {
  message: string
  name: string
  stack?: string
  code?: number
  keyPattern?: Record<string, any>
  errors?: Record<string, MongooseError>
  reason?: string
}

export const getErrorMessages = (error: AllErrorsType): string[] => {
  if (error instanceof MongoServerError && error.code === 11000) {
    const keys: string[] = Object.keys(error.keyPattern ?? {})
    return keys.map(key => `La propiedad '${key}' ya existe.`)
  }

  if (error instanceof MongoServerError && error.name === 'CastError') {
    return ['Valores no compatibles.']
  }

  if (error instanceof MongoServerError && error.name === 'ValidationError') {
    const errors: Record<string, Error> = error.errors as Record<string, Error>
    const keys = Object.keys(errors ?? {})
    const messages: string[] = []

    for (const key of keys) {
      messages.push(errors[key].message)
    }

    return messages
  }

  if (error instanceof Error) {
    return [error.message]
  }

  return ['Ocurrió un error inesperado.']
}

export const getErrorType = (error: AllErrorsType): string => {
  if (error instanceof MongoServerError && error?.name === 'ValidationError') return 'Los datos proporcionados no son válidos.'

  if (error instanceof MongoServerError && error.code === 11000) return 'Los datos ya existen.'

  if (error instanceof MongoServerError) { return 'Ocurrió un error.' }

  return error.message
}
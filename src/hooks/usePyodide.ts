// src/hooks/usePyodide.ts

import { useState, useEffect, useCallback } from 'react'

import { pyodideParser } from '@/lib/pyodideParser'
import type { ParsedMessage } from '@/lib/types'

interface UsePyodideReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  parseCode: (code: string) => Promise<ParsedMessage[] | { error: string }>;
  initializePyodide: () => Promise<void>;
}

export const usePyodide = (): UsePyodideReturn => {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePyodide = useCallback(async () => {
    if (isReady || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      await pyodideParser.initialize()
      setIsReady(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Pyodide'
      setError(errorMessage)
      console.error('Pyodide initialization failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isReady, isLoading])

  const parseCode = useCallback(
    async (code: string) => {
      if (!isReady) {
        throw new Error('Pyodide is not ready. Call initializePyodide() first.')
      }

      return await pyodideParser.parseGeminiCode(code)
    },
    [isReady],
  )

  // Auto-initialize on mount (optional - you might want lazy loading)
  useEffect(() => {
    // Uncomment if you want auto-initialization
    // initializePyodide();
  }, [])

  return {
    isReady,
    isLoading,
    error,
    parseCode,
    initializePyodide,
  }
}

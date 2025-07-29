// src/hooks/usePyodide.ts

import { useState, useCallback, useEffect } from 'react';

import { pyodideParser } from '@/lib/pyodideParser'
import type { ParseResult } from '@/lib/types';

interface UsePyodideReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  parseCode: (code: string) => Promise<ParseResult | { error: string }>;
  initializePyodide: () => Promise<void>;
}

export const usePyodide = (): UsePyodideReturn => {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePyodide = useCallback(async () => {
    if (pyodideParser.isInitialized || pyodideParser.isInitializing) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await pyodideParser.initialize();
      setIsReady(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Pyodide';
      setError(errorMessage);
      console.error('Pyodide initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const parseCode = useCallback(async (code: string): Promise<ParseResult | { error: string }> => {
    if (!pyodideParser.isInitialized) {
      return { error: 'Pyodide is not initialized' };
    }

    try {
      return await pyodideParser.parseGeminiCode(code);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse code';
      return { error: errorMessage };
    }
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    initializePyodide();
  }, [initializePyodide]);

  return {
    isReady,
    isLoading,
    error,
    parseCode,
    initializePyodide,
  }
}

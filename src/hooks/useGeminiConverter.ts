// src/hooks/useGeminiConverter.ts

import { useState, useCallback } from 'react';
import { usePyodide } from './usePyodide';
import { MarkdownConverter } from '@/lib/markdownConverter';
import type { ConversionOptions, ConversionResult } from '@/lib/types';

interface UseGeminiConverterReturn {
  // State
  isProcessing: boolean;
  isPyodideReady: boolean;
  isPyodideLoading: boolean;
  pyodideError: string | null;

  // Actions
  convertCode: (code: string, options: ConversionOptions) => Promise<ConversionResult>;
  initializePyodide: () => Promise<void>;
  copyToClipboard: (content: string) => Promise<boolean>;
  downloadAsFile: (content: string, filename?: string) => Promise<void>;
}

export const useGeminiConverter = (): UseGeminiConverterReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    isReady: isPyodideReady,
    isLoading: isPyodideLoading,
    error: pyodideError,
    parseCode,
    initializePyodide,
  } = usePyodide();

  const convertCode = useCallback(
    async (code: string, options: ConversionOptions): Promise<ConversionResult> => {
      if (!code.trim()) {
        return {
          success: false,
          error: 'Please provide some Gemini SDK code to convert',
        };
      }

      if (!isPyodideReady) {
        return {
          success: false,
          error: 'Pyodide is not ready. Please wait for initialization to complete.',
        };
      }

      setIsProcessing(true);

      try {
        // Parse the Python code
        const parseResult = await parseCode(code);

        if ('error' in parseResult) {
          return {
            success: false,
            error: parseResult.error,
          };
        }

        // Convert to markdown
        const conversionResult = MarkdownConverter.convertToMarkdown(parseResult, options);

        return conversionResult;
      } catch (error) {
        console.error('Conversion error:', error);
        return {
          success: false,
          error: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [isPyodideReady, parseCode],
  );

  const copyToClipboard = useCallback(async (content: string): Promise<boolean> => {
    return await MarkdownConverter.copyToClipboard(content);
  }, []);

  const downloadAsFile = useCallback(async (content: string, filename?: string): Promise<void> => {
    await MarkdownConverter.downloadAsFile(content, filename);
  }, []);

  return {
    // State
    isProcessing,
    isPyodideReady,
    isPyodideLoading,
    pyodideError,

    // Actions
    convertCode,
    initializePyodide,
    copyToClipboard,
    downloadAsFile,
  };
};

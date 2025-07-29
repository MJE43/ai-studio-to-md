// src/lib/types.ts

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiPart {
  text?: string;
  // Could extend this for other part types like images, etc.
}

export interface ParsedMessage {
  role: 'user' | 'model';
  parts: string[];
}

export interface ConversionOptions {
  includeThinking: boolean;
  claudeMode: boolean;
}

export interface ConversionResult {
  success: boolean;
  markdown?: string;
  error?: string;
  messageCount?: number;
}

export interface PyodideInstance {
  runPython: (code: string) => unknown;
  globals: Map<string, unknown>;
}

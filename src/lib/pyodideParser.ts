// src/lib/pyodideParser.ts

import { loadPyodide, type PyodideInterface } from 'pyodide';
import type { ParsedMessage } from './types';

class PyodideParser {
  private pyodide: PyodideInterface | null = null;
  private isLoading = false;
  private loadPromise: Promise<PyodideInterface> | null = null;

  async initialize(): Promise<PyodideInterface> {
    if (this.pyodide) {
      return this.pyodide;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadPyodide();

    try {
      this.pyodide = await this.loadPromise;
      return this.pyodide;
    } finally {
      this.isLoading = false;
    }
  }

  private async loadPyodide(): Promise<PyodideInterface> {
    const pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
    });

    // Install our Python parsing code
    pyodide.runPython(`
import ast
import json
import re

def extract_gemini_contents(code_str):
    """
    Extract the contents array from Gemini SDK Python code using AST parsing.
    Returns a list of content objects or an error dict.
    """
    try:
        # Clean up the code string - remove any leading/trailing whitespace
        code_str = code_str.strip()

        # Parse the Python AST
        tree = ast.parse(code_str)

        # Find the contents assignment
        for node in ast.walk(tree):
            if (isinstance(node, ast.Assign) and
                len(node.targets) == 1 and
                isinstance(node.targets[0], ast.Name) and
                node.targets[0].id == 'contents'):

                # Extract the list contents
                if isinstance(node.value, ast.List):
                    contents = []
                    for item in node.value.elts:
                        content_obj = parse_content_object(item)
                        if content_obj:
                            contents.append(content_obj)
                    return contents
                else:
                    return {"error": "contents is not a list"}

        return {"error": "No contents assignment found in code"}

    except SyntaxError as e:
        return {"error": f"Python syntax error: {str(e)}"}
    except Exception as e:
        return {"error": f"Parsing error: {str(e)}"}

def parse_content_object(node):
    """Parse a types.Content(...) call into a dict"""
    if not isinstance(node, ast.Call):
        return None

    # Check if it's a types.Content call
    if (isinstance(node.func, ast.Attribute) and
        isinstance(node.func.value, ast.Name) and
        node.func.value.id == 'types' and
        node.func.attr == 'Content'):

        content = {}

        # Parse keyword arguments
        for keyword in node.keywords:
            if keyword.arg == 'role':
                if isinstance(keyword.value, ast.Constant):
                    content['role'] = keyword.value.value
            elif keyword.arg == 'parts':
                if isinstance(keyword.value, ast.List):
                    parts = []
                    for part_node in keyword.value.elts:
                        part = parse_part_object(part_node)
                        if part:
                            parts.append(part)
                    content['parts'] = parts

        return content if 'role' in content and 'parts' in content else None

    return None

def parse_part_object(node):
    """Parse a types.Part.from_text(...) call into a dict"""
    if not isinstance(node, ast.Call):
        return None

    # Check if it's a types.Part.from_text call
    if (isinstance(node.func, ast.Attribute) and
        isinstance(node.func.value, ast.Attribute) and
        isinstance(node.func.value.value, ast.Name) and
        node.func.value.value.id == 'types' and
        node.func.value.attr == 'Part' and
        node.func.attr == 'from_text'):

        # Find the text keyword argument
        for keyword in node.keywords:
            if keyword.arg == 'text' and isinstance(keyword.value, ast.Constant):
                return {'text': keyword.value.value}

    return None

def parse_gemini_to_messages(code_str):
    """
    Main function to parse Gemini SDK code and return structured messages.
    """
    contents = extract_gemini_contents(code_str)

    if isinstance(contents, dict) and 'error' in contents:
        return contents

    messages = []
    for content in contents:
        if 'role' in content and 'parts' in content:
            parts_text = []
            for part in content['parts']:
                if isinstance(part, dict) and 'text' in part:
                    parts_text.append(part['text'])

            if parts_text:  # Only add if we have actual text parts
                messages.append({
                    'role': content['role'],
                    'parts': parts_text
                })

    return messages
    `);

    return pyodide;
  }

  async parseGeminiCode(code: string): Promise<ParsedMessage[] | { error: string }> {
    const pyodide = await this.initialize();

    try {
      // Call our Python parsing function
      const result = pyodide.runPython(`
import json
result = parse_gemini_to_messages(${JSON.stringify(code)})
json.dumps(result)
      `);

      const parsed = JSON.parse(result);

      // Check if it's an error
      if (parsed && typeof parsed === 'object' && 'error' in parsed) {
        return { error: parsed.error };
      }

      // Validate the structure
      if (!Array.isArray(parsed)) {
        return { error: 'Invalid response format from parser' };
      }

      // Type-safe conversion
      const messages: ParsedMessage[] = parsed.map((msg: any) => ({
        role: msg.role as 'user' | 'model',
        parts: msg.parts as string[],
      }));

      return messages;
    } catch (error) {
      console.error('Pyodide parsing error:', error);
      return {
        error: `Failed to parse code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  get isInitialized(): boolean {
    return this.pyodide !== null;
  }

  get isInitializing(): boolean {
    return this.isLoading;
  }
}

// Singleton instance
export const pyodideParser = new PyodideParser();

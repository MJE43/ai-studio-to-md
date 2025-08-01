// src/lib/pyodideParser.ts

import { loadPyodide, type PyodideInterface } from 'pyodide'

import type { ParsedMessage, ParseResult } from './types'

class PyodideParser {
  private pyodide: PyodideInterface | null = null
  private isLoading = false
  private loadPromise: Promise<PyodideInterface> | null = null

  async initialize(): Promise<PyodideInterface> {
    if (this.pyodide) {
      return this.pyodide
    }

    if (this.loadPromise) {
      return this.loadPromise
    }

    this.isLoading = true
    this.loadPromise = this.loadPyodide()

    try {
      this.pyodide = await this.loadPromise
      return this.pyodide
    } finally {
      this.isLoading = false
    }
  }

  private async loadPyodide(): Promise<PyodideInterface> {
    const pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/',
    })

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

def extract_system_instruction(code_str):
    """
    Extract the system_instruction from generate_content_config.
    Returns the system instruction text or None if not found.
    """
    try:
        # Parse the Python AST
        tree = ast.parse(code_str)

        # Find the generate_content_config assignment
        for node in ast.walk(tree):
            if (isinstance(node, ast.Assign) and
                len(node.targets) == 1 and
                isinstance(node.targets[0], ast.Name) and
                node.targets[0].id == 'generate_content_config'):

                # Look for system_instruction in the config
                if isinstance(node.value, ast.Call):
                    for keyword in node.keywords:
                        if keyword.arg == 'system_instruction':
                            result = parse_system_instruction_value(keyword.value)
                            return result

        return None

    except Exception as e:
        return None

def parse_system_instruction_value(node):
    """Parse the system_instruction value from AST node"""

    if isinstance(node, ast.List) and len(node.elts) > 0:
        # system_instruction is a list, get the first element
        first_element = node.elts[0]

        if isinstance(first_element, ast.Call):
            # Check if it's types.Part.from_text call
            if (isinstance(first_element.func, ast.Attribute) and
                isinstance(first_element.func.value, ast.Attribute) and
                isinstance(first_element.func.value.value, ast.Name) and
                first_element.func.value.value.id == 'types' and
                first_element.func.value.attr == 'Part' and
                first_element.func.attr == 'from_text'):

                # Find the text keyword argument
                for keyword in first_element.keywords:
                    if keyword.arg == 'text' and isinstance(keyword.value, ast.Constant):
                        return keyword.value.value
    elif isinstance(node, ast.Constant):
        # Direct string value
        return node.value

    return None

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

def is_placeholder_text(text):
    """Check if text is a placeholder that should be filtered out"""
    if not text or not text.strip():
        return True

    # Check for INSERT_*_HERE patterns
    import re
    placeholder_pattern = r'INSERT_[A-Z_]*_HERE'
    if re.search(placeholder_pattern, text.upper()):
        return True

    # Check for specific known placeholders
    placeholders = {
        'INSERT_INPUT_HERE',
        'INSERT_YOUR_PROMPT_HERE',
        'INSERT_USER_INPUT_HERE'
    }

    return text.strip().upper() in placeholders

def parse_gemini_to_messages(code_str):
    """
    Main function to parse Gemini SDK code and return structured messages with system instruction.
    """
    contents = extract_gemini_contents(code_str)

    if isinstance(contents, dict) and 'error' in contents:
        return contents

    # Extract system instruction
    system_instruction = extract_system_instruction(code_str)

    messages = []
    for content in contents:
        if 'role' in content and 'parts' in content:
            parts_text = []
            for part in content['parts']:
                if isinstance(part, dict) and 'text' in part:
                    text = part['text']
                    # Filter out placeholder text
                    if not is_placeholder_text(text):
                        parts_text.append(text)

            if parts_text:  # Only add if we have actual text parts
                messages.append({
                    'role': content['role'],
                    'parts': parts_text
                })

    # Return both messages and system instruction
    result = {'messages': messages}
    if system_instruction:
        result['systemInstruction'] = system_instruction

    return result
    `)

    return pyodide
  }

  async parseGeminiCode(code: string): Promise<ParseResult | { error: string }> {
    const pyodide = await this.initialize()

    try {
      // Call our Python parsing function
      const result = pyodide.runPython(`
import json
result = parse_gemini_to_messages(${JSON.stringify(code)})
json.dumps(result)
      `)

      const parsed = JSON.parse(result)

      // Check if it's an error
      if (parsed && typeof parsed === 'object' && 'error' in parsed) {
        return { error: parsed.error }
      }

      // Validate the structure
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.messages)) {
        return { error: 'Invalid response format from parser' }
      }

      // Type-safe conversion
      const messages: ParsedMessage[] = parsed.messages.map((msg: unknown) => {
        const message = msg as { role: string; parts: string[] }
        return {
          role: message.role as 'user' | 'model',
          parts: message.parts as string[],
        }
      })

      const parseResult: ParseResult = {
        messages,
        systemInstruction: parsed.systemInstruction || undefined,
      }

      return parseResult
    } catch (error) {
      console.error('Pyodide parsing error:', error)
      return {
        error: `Failed to parse code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  get isInitialized(): boolean {
    return this.pyodide !== null
  }

  get isInitializing(): boolean {
    return this.isLoading
  }
}

// Singleton instance
export const pyodideParser = new PyodideParser()

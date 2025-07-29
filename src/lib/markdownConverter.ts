// src/lib/markdownConverter.ts

import type { ParsedMessage, ConversionOptions, ConversionResult } from './types';

export class MarkdownConverter {
  static convertToMarkdown(messages: ParsedMessage[], options: ConversionOptions): ConversionResult {
    try {
      // Filter out placeholder messages as backup
      const filteredMessages = messages.filter(message =>
        !this.isPlaceholderMessage(message)
      );

      if (filteredMessages.length === 0) {
        return {
          success: false,
          error: 'No valid messages found to convert',
        };
      }

      let markdown = '';

      // Add system message for Claude mode
      if (options.claudeMode) {
        markdown += '**SYSTEM MESSAGE**\n';
        markdown += 'Your knowledge cutoff is January 2025.\n\n';
        markdown += '---\n\n';
        markdown += '**Human:**\n\n';
      }

      // Process each message
      filteredMessages.forEach((message, index) => {
        if (message.role === 'user') {
          markdown += this.formatUserMessage(message, options, index);
        } else if (message.role === 'model') {
          markdown += this.formatModelMessage(message, options);
        }
      });

      // Add end of conversation marker if last message is from model
      const lastMessage = filteredMessages[filteredMessages.length - 1];
      if (lastMessage && lastMessage.role === 'model') {
        markdown += '---\n\n*End of conversation*\n\n';
      }

      return {
        success: true,
        markdown: markdown.trim(),
        messageCount: filteredMessages.length,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to convert to markdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static isPlaceholderMessage(message: ParsedMessage): boolean {
    // Check if message has no valid parts
    if (!message.parts || message.parts.length === 0) {
      return true;
    }

    // Check if all parts are placeholders or empty
    return message.parts.every(part => this.isPlaceholderText(part));
  }

  private static isPlaceholderText(text: string): boolean {
    if (!text || !text.trim()) {
      return true;
    }

    // Check for INSERT_*_HERE patterns
    const placeholderPattern = /INSERT_[A-Z_]*_HERE/i;
    if (placeholderPattern.test(text)) {
      return true;
    }

    // Check for specific known placeholders
    const placeholders = new Set([
      'INSERT_INPUT_HERE',
      'INSERT_YOUR_PROMPT_HERE',
      'INSERT_USER_INPUT_HERE'
    ]);

    return placeholders.has(text.trim().toUpperCase());
  }

  private static formatUserMessage(message: ParsedMessage, options: ConversionOptions, index: number): string {
    let output = '';

    // Add user header (skip for first message in Claude mode since we already added it)
    if (options.claudeMode && index > 0) {
      output += '\n**Human:**\n\n';
    } else if (!options.claudeMode) {
      output += '## User\n\n';
    }

    // Add user content (usually just one part)
    if (message.parts.length > 0) {
      const content = message.parts[0].trim();
      if (content) {
        output += content + '\n\n';
      }
    }

    return output;
  }

  private static formatModelMessage(message: ParsedMessage, options: ConversionOptions): string {
    let output = '';

    // Add assistant header
    if (options.claudeMode) {
      output += '**Assistant:**\n\n';
    } else {
      output += '## Assistant\n\n';
    }

    if (message.parts.length === 1) {
      // Single part response - just the content
      const content = message.parts[0].trim();
      if (content) {
        output += content + '\n\n';
      }
    } else if (message.parts.length >= 2) {
      // Multiple parts - typically thinking + response
      const thinkingPart = message.parts[0].trim();
      const responsePart = message.parts[message.parts.length - 1].trim();

      // Add thinking block if requested and exists
      if (options.includeThinking && thinkingPart) {
        if (options.claudeMode) {
          output += '<thinking>\n';
          output += thinkingPart + '\n';
          output += '</thinking>\n\n';
        } else {
          output += '### Thinking\n\n';
          output += thinkingPart + '\n\n';
          output += '### Response\n\n';
        }
      }

      // Add the actual response
      if (responsePart) {
        output += responsePart + '\n\n';
      }
    }

    return output;
  }

  static async downloadAsFile(content: string, filename?: string): Promise<void> {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `gemini-conversation-${Date.now()}.md`;

    // Append to body, click, and cleanup
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async copyToClipboard(content: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);

      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      } catch (fallbackError) {
        console.error('Clipboard fallback failed:', fallbackError);
        return false;
      }
    }
  }
}

// src/components/GeminiMarkdownConverter.tsx
import React, { useState, useCallback } from 'react';
import {
  Copy,
  Download,
  Upload,
  Settings,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGeminiConverter } from '@/hooks/useGeminiConverter';

const GeminiMarkdownConverter: React.FC = () => {
  // Form state
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [includeThinking, setIncludeThinking] = useState<boolean>(false);
  const [claudeMode, setClaudeMode] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Conversion hook
  const {
    isProcessing,
    isPyodideReady,
    isPyodideLoading,
    pyodideError,
    convertCode,
    initializePyodide,
    copyToClipboard,
    downloadAsFile,
  } = useGeminiConverter();

  // Initialize Pyodide on first interaction
  const handleInitializePyodide = useCallback(async () => {
    if (!isPyodideReady && !isPyodideLoading) {
      await initializePyodide();
    }
  }, [isPyodideReady, isPyodideLoading, initializePyodide]);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) {
      setError('Please paste some Gemini SDK code to convert');
      return;
    }

    // Initialize Pyodide if not ready
    if (!isPyodideReady) {
      await handleInitializePyodide();
    }

    setError('');

    const result = await convertCode(input, { includeThinking, claudeMode });

    if (result.success && result.markdown) {
      setOutput(result.markdown);
      setMessageCount(result.messageCount || 0);
      setError('');
    } else {
      setError(result.error || 'Unknown error occurred');
      setOutput('');
      setMessageCount(0);
    }
  }, [input, includeThinking, claudeMode, isPyodideReady, convertCode, handleInitializePyodide]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!output) return;

    const success = await copyToClipboard(output);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [output, copyToClipboard]);

  const handleDownload = useCallback(async () => {
    if (!output) return;
    await downloadAsFile(output);
  }, [output, downloadAsFile]);

  // Show pyodide error if there is one
  const displayError = error || pyodideError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Studio Export to Markdown Converter</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Convert Google AI Studio SDK exports into clean, readable markdown format. Perfect for importing
            conversations into Claude or other LLMs.
          </p>

          {/* Pyodide Status */}
          <div className="mt-4 flex justify-center">
            {isPyodideLoading && (
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading Python Parser...
              </Badge>
            )}
            {isPyodideReady && (
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                <Zap className="w-3 h-3 mr-1" />
                Parser Ready
              </Badge>
            )}
            {pyodideError && (
              <Badge variant="outline" className="border-red-500/30 text-red-400">
                <AlertCircle className="w-3 h-3 mr-1" />
                Parser Error
              </Badge>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <Card className="mb-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="w-5 h-5 text-purple-400" />
              Conversion Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 transition-all duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="text-white font-medium">Claude Mode</label>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Default
                    </Badge>
                    {claudeMode && (
                      <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                        ON
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">Use Human:/Assistant: format for Claude</p>
                </div>
                <Switch checked={claudeMode} onCheckedChange={setClaudeMode} />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 transition-all duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="text-white font-medium">Include Thinking</label>
                    {includeThinking && (
                      <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                        ON
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">Include AI reasoning blocks in output</p>
                </div>
                <Switch checked={includeThinking} onCheckedChange={setIncludeThinking} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Conversion Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Upload className="w-5 h-5 text-purple-400" />
                  Paste Gemini SDK Code
                </CardTitle>
                <Button
                  onClick={handleConvert}
                  disabled={isProcessing || isPyodideLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : isPyodideLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Parser...
                    </>
                  ) : (
                    'Convert to Markdown'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={handleInitializePyodide} // Initialize on first focus
                placeholder="Paste your Gemini SDK code here (the full Python code from AI Studio's 'Get Code' feature)..."
                className="min-h-96 bg-slate-900/50 border-slate-600 text-slate-100 font-mono text-sm resize-none focus:ring-purple-500 focus:border-purple-500"
              />

              {displayError && (
                <Alert className="mt-4 border-red-700 bg-red-900/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">{displayError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  Markdown Output
                  {messageCount > 0 && (
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      {messageCount} messages
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyToClipboard}
                    disabled={!output}
                    variant="outline"
                    size="sm"
                    className={cn(
                      'border-slate-600 text-slate-300 hover:bg-slate-600',
                      copySuccess && 'border-green-500 text-green-400',
                    )}
                  >
                    {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={!output}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    <Download className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-96 bg-slate-900/50 border border-slate-600 rounded-lg p-4 overflow-auto">
                {output ? (
                  <pre className="text-slate-100 text-sm whitespace-pre-wrap font-mono">{output}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 mb-2">Converted markdown will appear here...</p>
                      <p className="text-slate-600 text-sm">Paste your Gemini SDK code and click convert</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-slate-800/30 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mb-4 text-lg">
                  1
                </div>
                <h4 className="font-semibold text-white mb-2">Export from AI Studio</h4>
                <p className="text-slate-300 text-sm">
                  In Google AI Studio, click "Get Code" to export your conversation as SDK code
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mb-4 text-lg">
                  2
                </div>
                <h4 className="font-semibold text-white mb-2">Paste & Convert</h4>
                <p className="text-slate-300 text-sm">
                  Copy the entire Python code and paste it into the input field, then click convert
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mb-4 text-lg">
                  3
                </div>
                <h4 className="font-semibold text-white mb-2">Export Markdown</h4>
                <p className="text-slate-300 text-sm">
                  Copy the formatted markdown or download as .md file for use in other LLMs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        {isPyodideReady && (
          <Card className="mt-6 bg-slate-800/20 backdrop-blur-sm border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Zap className="w-4 h-4 text-purple-400" />
                Powered by Pyodide - Python AST parsing in your browser
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GeminiMarkdownConverter;

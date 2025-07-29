import { useState, useCallback } from 'react'
import {
  Copy,
  Download,
  Settings,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Sparkles,
  Code,
  ArrowRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGeminiConverter } from '@/hooks/useGeminiConverter'

export default function GeminiMarkdownConverter() {
  // Form state
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [includeThinking, setIncludeThinking] = useState<boolean>(false)
  const [claudeMode, setClaudeMode] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [messageCount, setMessageCount] = useState<number>(0)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  // Use the real converter hook
  const {
    convertCode,
    isProcessing,
    isPyodideReady,
    isPyodideLoading,
    pyodideError,
    initializePyodide,
    copyToClipboard,
    downloadAsFile,
  } = useGeminiConverter()

  const handleInitializePyodide = useCallback(async () => {
    if (!isPyodideReady && !isPyodideLoading) {
      await initializePyodide()
    }
  }, [isPyodideReady, isPyodideLoading, initializePyodide])

  const handleConvert = useCallback(async () => {
    if (!input.trim()) {
      setError('Please paste some Gemini SDK code to convert')
      return
    }

    // Initialize Pyodide if not ready
    if (!isPyodideReady) {
      await handleInitializePyodide()
    }

    setError('')

    const result = await convertCode(input, { includeThinking, claudeMode })

    if (result.success && result.markdown) {
      setOutput(result.markdown)
      setMessageCount(result.messageCount || 0)
      setError('')
    } else {
      setError(result.error || 'Unknown error occurred')
      setOutput('')
      setMessageCount(0)
    }
  }, [input, includeThinking, claudeMode, isPyodideReady, convertCode, handleInitializePyodide])

  const handleCopyToClipboard = useCallback(async () => {
    if (!output) return

    const success = await copyToClipboard(output)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }, [output, copyToClipboard])

  const handleDownload = useCallback(async () => {
    if (!output) return

    await downloadAsFile(output, 'gemini-conversation.md')
  }, [output, downloadAsFile])

  // Show pyodide error if there is one
  const displayError = error || pyodideError

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-slate-950"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>

      <div className="relative w-full px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mb-6 shadow-2xl shadow-cyan-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-4">
            AI Studio Export to Markdown Converter
          </h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Convert Google AI Studio SDK exports into clean, readable markdown format. Perfect for importing
            conversations into Claude or other LLMs with advanced formatting options.
          </p>

          {/* Pyodide Status */}
          <div className="mt-6 flex justify-center">
            {isPyodideLoading && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 px-4 py-2">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading Python Parser...
              </Badge>
            )}
            {isPyodideReady && (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Parser Ready
              </Badge>
            )}
            {pyodideError && (
              <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 px-4 py-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                Parser Error
              </Badge>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <Card className="mb-8 bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <Settings className="w-6 h-6 text-cyan-400" />
              Conversion Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group flex items-center justify-between p-6 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/50 transition-all duration-300 hover:bg-slate-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-white font-semibold text-lg">Claude Mode</label>
                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      Default
                    </Badge>
                    {claudeMode && (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                        ON
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-400">Use Human:/Assistant: format optimized for Claude</p>
                </div>
                <Switch
                  checked={claudeMode}
                  onCheckedChange={setClaudeMode}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-cyan-500 data-[state=unchecked]:bg-slate-600 border-0 shadow-lg transition-all duration-300"
                />
              </div>

              <div className="group flex items-center justify-between p-6 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/50 transition-all duration-300 hover:bg-slate-700/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-white font-semibold text-lg">Include Thinking</label>
                    {includeThinking && (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                        ON
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-400">Include AI reasoning blocks in markdown output</p>
                </div>
                <Switch
                  checked={includeThinking}
                  onCheckedChange={setIncludeThinking}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-500 data-[state=unchecked]:bg-slate-600 border-0 shadow-lg transition-all duration-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Conversion Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-blue-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <Code className="w-6 h-6 text-cyan-400" />
                  Paste Gemini SDK Code
                </CardTitle>
                <Button
                  onClick={handleConvert}
                  disabled={isProcessing || isPyodideLoading}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : isPyodideLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading Parser...
                    </>
                  ) : (
                    <>
                      Convert to Markdown
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={handleInitializePyodide}
                placeholder="Paste your Gemini SDK code here (the full Python code from AI Studio's 'Get Code' feature)...

Example:
import google.generativeai as genai
genai.configure(api_key='your-api-key')
model = genai.GenerativeModel('gemini-pro')
..."
                className="min-h-[500px] bg-slate-900/60 border-slate-600/50 text-slate-100 font-mono text-sm resize-none focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 focus:shadow-lg focus:shadow-cyan-500/10"
              />

              {displayError && (
                <Alert className="mt-4 border-red-700/50 bg-red-900/30 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">{displayError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-blue-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <MessageSquare className="w-6 h-6 text-emerald-400" />
                  Markdown Output
                  {messageCount > 0 && (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      {messageCount} messages
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCopyToClipboard}
                    disabled={!output}
                    variant="outline"
                    size="lg"
                    className={cn(
                      'border-slate-600/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-300 bg-transparent hover:border-cyan-500/50 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/10',
                      copySuccess && 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
                    )}
                  >
                    {copySuccess ? <CheckCircle className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={!output}
                    variant="outline"
                    size="lg"
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-300 bg-transparent hover:border-blue-500/50 hover:text-blue-300 hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[500px] bg-slate-900/60 border border-slate-600/50 rounded-xl p-6 overflow-auto backdrop-blur-sm">
                {output ? (
                  <pre className="text-slate-100 text-sm whitespace-pre-wrap font-mono leading-relaxed">{output}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-12 h-12 text-slate-500" />
                      </div>
                      <p className="text-slate-400 mb-2 text-lg">Converted markdown will appear here...</p>
                      <p className="text-slate-600">Paste your Gemini SDK code and click convert</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-12 bg-slate-800/30 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-blue-500/5">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">How to Use This Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 group">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold mb-6 text-2xl shadow-lg shadow-cyan-500/25 group-hover:shadow-xl group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-105">
                  1
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Export from AI Studio</h4>
                <p className="text-slate-300 leading-relaxed">
                  In Google AI Studio, click "Get Code" to export your conversation as SDK code. Copy the entire Python
                  script.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 group">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold mb-6 text-2xl shadow-lg shadow-cyan-500/25 group-hover:shadow-xl group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-105">
                  2
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Paste & Convert</h4>
                <p className="text-slate-300 leading-relaxed">
                  Paste the Python code into the input field, adjust your settings, then click convert to process.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 group">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold mb-6 text-2xl shadow-lg shadow-cyan-500/25 group-hover:shadow-xl group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-105">
                  3
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Export Markdown</h4>
                <p className="text-slate-300 leading-relaxed">
                  Copy the formatted markdown or download as .md file for seamless import into Claude or other LLMs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        {isPyodideReady && (
          <Card className="mt-8 bg-slate-800/20 backdrop-blur-xl border-slate-700/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 text-slate-400">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-lg">Powered by Pyodide - Python AST parsing in your browser</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

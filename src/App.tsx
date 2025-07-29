import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  const techStack = [
    { name: 'React 19', icon: '⚛️' },
    { name: 'TypeScript', icon: '🟦' },
    { name: 'Vite', icon: '⚡' },
    { name: 'Tailwind CSS', icon: '🎨' },
    { name: 'shadcn/ui', icon: '🧩' },
    { name: 'Lucide Icons', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {{project_title}}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            {{project_description}}
          </p>
          <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
            Ready for Production 🚀
          </span>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">

          {/* Interactive Counter Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-500">⚡</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Interactive Example</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              A simple counter to test React state management
            </p>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">{count}</div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setCount(count + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Increment
                </button>
                <button
                  onClick={() => setCount(0)}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Tech Stack Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-500">💻</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tech Stack</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Modern tools for beautiful, fast applications
            </p>
            <div className="grid grid-cols-2 gap-3">
              {techStack.map((tech) => (
                <div key={tech.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                  <span className="text-lg">{tech.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-500">🎨</span>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ready to Build?</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
            This template includes everything you need to start building amazing applications
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-400">1</span>
              <span className="text-slate-700 dark:text-slate-300">
                Edit <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">src/App.tsx</code> to customize this page
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-400">2</span>
              <span className="text-slate-700 dark:text-slate-300">
                Add components with <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">npx shadcn@latest add [component]</code>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-400">3</span>
              <span className="text-slate-700 dark:text-slate-300">Start building your amazing project!</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1">
            Made with <span className="text-red-500">❤️</span> by {{author_name}}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            © {{current_year}} {{project_title}}. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

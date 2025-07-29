> **ℹ️ This is a project template. The title, description, and other fields below will be replaced when you create a new project from this template.**

# {{project_title}}

{{project_description}}

## 🚀 Quick Start

1. **Setup the project:**
   ```bash
   node setup-project.js
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

## 🛠️ Built With

- **React 19** - Latest React with improved performance
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning fast build tool
- **Tailwind CSS 4** - Latest utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Beautiful icons
- **pnpm** - Fast, disk space efficient package manager

## 📁 Project Structure

```
{{project_name}}/
├── src/
│   ├── components/        # Reusable components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utilities and helpers
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── components.json       # shadcn/ui configuration
└── package.json
```

## 📦 Path Aliases

Clean imports with pre-configured path aliases:

- `@` → `src/`
- `@components` → `src/components/`
- `@ui` → `src/components/ui/`
- `@lib` → `src/lib/`
- `@hooks` → `src/hooks/`
- `@assets` → `src/assets/`
- `@styles` → `src/index.css`

Example usage:
```tsx
import { Button } from '@ui/button';
import { cn } from '@lib/utils';
import { useLocalStorage } from '@hooks/use-local-storage';
```

## 🧩 Available Components

This template comes with shadcn/ui pre-configured. Add components with:

```bash
npx shadcn@latest add [component-name]
```

## 📝 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## 🎨 Styling

- **Tailwind CSS 4** with CSS variables for theming
- **Dark mode** support out of the box
- **shadcn/ui** design system
- **Custom CSS variables** in `src/index.css`

## 🔧 Configuration

- **Vite config** - `vite.config.ts`
- **TypeScript** - `tsconfig.json`
- **Tailwind** - `components.json`
- **ESLint** - `eslint.config.js`

## 📄 License

{{project_name}} is [MIT licensed](./LICENSE).

---

**Author:** {{author_name}}{{#author_email}} ({{author_email}}){{/author_email}}
**Year:** {{current_year}}

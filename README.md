# Svelte 5 + TypeScript + Vite + Tailwind CSS Bootstrap

A modern starter template for building web applications with Svelte 5, TypeScript, Vite, and Tailwind CSS.

## Table of Contents
- [Features](#features)
- [Why Use This Template?](#why-use-this-template)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development Features](#development-features)
  - [Hot Module Replacement (HMR)](#hot-module-replacement-hmr)
  - [TypeScript Configuration](#typescript-configuration)
  - [Tailwind CSS Integration](#tailwind-css-integration)
- [Continuous Integration & Deployment](#continuous-integration--deployment)
  - [Testing & Linting Workflow](#testing--linting-workflow)
  - [Deployment Workflow](#deployment-workflow)
  - [Release Workflow](#release-workflow)
  - [Workflow Files](#workflow-files)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- 🚀 [Svelte 5](https://svelte.dev) with TypeScript
- ⚡️ [Vite](https://vitejs.dev) for lightning-fast development
- 🎨 [Tailwind CSS 4](https://tailwindcss.com) for utility-first styling
- 🧪 [Vitest](https://vitest.dev) for unit testing
- 📝 TypeScript for type safety
- 🔍 ESLint for code linting
- ✨ Prettier for code formatting
- 🎯 Pre-configured with best practices

## Why Use This Template?

This template is ideal if you want to use Svelte without the full SvelteKit framework. It's perfect for:

- **Simple SPAs**: When you don't need server-side rendering or complex routing
- **Custom Stack**: When you want to choose your own routing, state management, and other tools
- **Learning Svelte**: Great for understanding Svelte basics without framework overhead
- **Prototypes**: Quick to start and easy to build upon
- **Static Sites**: Perfect for sites that don't need a backend
- **Component Libraries**: Ideal for developing standalone component libraries

While SvelteKit is an excellent full-featured framework, this template provides a lighter alternative when you:
- Want more control over your project structure
- Don't need server-side rendering
- Prefer to add features as needed
- Want to minimize bundle size for simple applications

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/svelte5-vite-ts-tailwind-eslint.git
cd svelte5-vite-ts-tailwind-eslint
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see your application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run coverage` - Generate test coverage report
- `npm run lint` - Lint code
- `npm run format` - Format code

## Project Structure

```
/
├── src/
│   ├── lib/
│   │   └── Counter.svelte
│   ├── app.css
│   ├── main.ts
│   └── App.svelte
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Technology Stack

- **Framework**: Svelte 5
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest
- **Language**: TypeScript
- **Code Quality**:
  - ESLint for linting
  - Prettier for formatting
  - TypeScript for type checking

## Development Features

### Hot Module Replacement (HMR)

The template includes HMR support for Svelte components.

### TypeScript Configuration

The project uses TypeScript for type safety. Key configurations include:

- Strict mode enabled
- Svelte type definitions included
- Path aliases configured
- Global type definitions in `src/vite-env.d.ts`

### Tailwind CSS Integration

Tailwind CSS is pre-configured with:

- JIT (Just-In-Time) mode enabled
- Dark mode support (`class` strategy)
- Custom color schemes
- Prettier plugin for automatic class sorting

## Continuous Integration & Deployment

This template comes with pre-configured GitHub Actions workflows for automated testing, linting, and deployment:

### Testing & Linting Workflow
- Runs on every push to non-main branches
- Uses Node.js 22
- Steps:
  1. Install dependencies
  2. Run ESLint checks
  3. Run test suite

### Deployment Workflow
- Automatically deploys to GitHub Pages
- Triggers on:
  - Push to main branch
  - Manual workflow dispatch
- Builds and deploys the static site
- Provides deployment URL in workflow summary

### Release Workflow
- Triggers when tags are pushed
- Creates GitHub releases automatically
- Features:
  - Builds the project
  - Creates .zip and .tar.gz archives
  - Generates release notes from CHANGELOG.md
  - Supports beta/rc releases with proper prerelease marking
  - Attaches build artifacts to releases

### Workflow Files
```
.github/workflows/
├── test.yml     # Testing and linting
├── static.yml   # GitHub Pages deployment
└── release.yml  # Release automation
```

To use these workflows:
1. Enable GitHub Pages in your repository settings
2. For releases, push a tag (e.g., `git tag 1.0.0 && git push origin 1.0.0`)
3. Ensure your CHANGELOG.md is updated before creating releases

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License—see the LICENSE file for details.

## Acknowledgments

- Svelte team for the amazing framework
- Vite team for the build tool
- Tailwind CSS team for the styling framework
- All contributors to the included tools and libraries

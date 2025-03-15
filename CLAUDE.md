# Google Todo Client - Development Guidelines

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compile and Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Code Style Guidelines

### TypeScript
- Use strict TypeScript with proper type definitions
- Create interfaces for component props and state
- Define types in separate files under `/src/types/`
- Avoid `any` type; use proper typing or `unknown` when necessary

### React Components
- Use functional components with hooks
- Props interfaces should be named `ComponentNameProps`
- Export components as default when they're the main export of a file

### State Management
- Use Redux Toolkit for global state
- Use Redux slices for feature-specific state
- Utilize React hooks for local component state

### Naming Conventions
- PascalCase for components and types
- camelCase for variables, functions, and instances
- Descriptive names that reflect purpose

### Error Handling
- Use try/catch blocks for async operations
- Log errors to console with descriptive messages
- Gracefully degrade UI when errors occur

### File Structure
- Organize by feature in the `/src/features/` directory
- Keep components in `/src/components/`
- Utility functions in `/src/utils/`
- API services in `/src/services/`
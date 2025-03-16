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

## File Documentation

### Auth Related Files
- `src/services/auth.ts`: Google OAuth authentication service with functions like `initGoogleAuth()`, `signInWithGoogle()`, and `signOut()`
- `src/features/auth/authSlice.ts`: Redux slice for authentication state management with actions for login/logout
- `src/components/LoginPage.tsx`: Main login page component that initializes Google Auth and renders LoginButton
- `src/components/LoginButton.tsx`: Button component that triggers Google sign-in

### Todo Related Files
- `src/components/TodoList.tsx`: Main component displaying the list of todos, includes logout button
- `src/components/TodoItem.tsx`: Individual todo item component
- `src/components/TodoModal.tsx`: Modal for viewing, editing, or adding todo items
- `src/features/todos/todosSlice.ts`: Redux slice for todo state management
- `src/services/todoApi.ts`: API service for todo CRUD operations
- `src/types/todo.ts`: TypeScript interfaces for todo data

### App Structure
- `src/App.tsx`: Main application component with authentication routing logic
- `src/App.css`: Global styles including logout button and header styles
- `src/main.tsx`: Entry point that sets up Redux store and renders App component
- `src/store/index.ts`: Redux store configuration

## Important Notes

If any files have been updated, please check whether there are any changes to the content of "File Documentation" and update it as needed.

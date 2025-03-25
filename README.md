# Pomodoro Task Manager

A modern task management application with Pomodoro timer functionality, built with React, TypeScript, and Vite. The application helps users manage tasks and work in focused time blocks using the Pomodoro Technique.

## Features
### Completed
- ✅ Task management with drag-and-drop reordering
- 🔔 Desktop notifications for timer events
- 💾 Persistent storage using IndexedDB

### ToDo
- 🕒 Configurable Pomodoro timer with work, break, and long break sessions
- 📊 Progress tracking and completion statistics
- 📱 Responsive design for all devices

## Tech Stack

- React 19
- TypeScript
- Vite
- IndexedDB for storage
- @dnd-kit for drag-and-drop functionality
- Vitest for testing

## Project Structure

```
public/ # Public assets
src/
├── components/ # React components
├── hooks/ # Custom React hooks
├── styles/ # Styling
├── types/ # TypeScript definitions
├── utils/ # Utility functions
└── test/ # Tests
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository

2. Install dependencies

## Development

Run the development server:

```bash
yarn dev
```

## Testing

Run the test suite:

```bash
yarn test
```

Run tests with UI:

```bash
yarn test:ui
```

Run tests without watch mode:

```bash
yarn test:run
```

### Building for Production

Build the application:

```bash
yarn build
```

Preview the production build:

```bash
yarn preview
```

### Linting

Run ESLint:

```bash
yarn lint
```

## Development Guidelines

### Code Style

- Write all new components in TypeScript
- Use CSS Modules for component styling
- Follow existing patterns for IndexedDB operations
- Use TDD; Add tests for new functionality before implementing

### Component Structure

- Components should be placed in the appropriate subdirectory under `src/components`
- Each component should have its own directory with:
  - Main component file (`.tsx`)
  - Sub components (`.tsx`)
  - Styles module (`.module.css`)
  - Index file for exports

### State Management

- Use IndexedDB for persistent storage
- Implement React hooks for complex state logic
- Follow existing patterns for task management and timer state

### Testing

- Write tests for new components and utilities
- Use Vitest and React Testing Library
- Test IndexedDB operations in DatabaseIntegrationTest.ts

## Key Features Implementation

### Timer

- Configurable work, break, and long break durations
- Desktop notifications for session completion
- Visual and audio feedback for timer events

### Task Management

- Drag-and-drop task reordering
- Task categories and descriptions
- Multiple pomodoro sessions per task
- Progress tracking

### Data Persistence

- IndexedDB storage for tasks
- Completed task history
- Session statistics

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the development guidelines
3. Add tests for new functionality
4. Update documentation as needed
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **IndexedDB not working**
   - Check browser compatibility
   - Verify permissions
   - Clear browser data if needed

2. **Notifications not showing**
   - Ensure notifications are enabled in browser
   - Check notification permissions
   - Verify browser compatibility

### Development Issues

1. **Build failures**
   - Verify Node.js version
   - Clear `node_modules` and reinstall
   - Check for TypeScript errors

2. **Test failures**
   - Check for async operation handling
   - Verify mocks and stubs

## License

MIT

## Acknowledgments

- [React Documentation](https://react.dev)
- [Vite](https://vitejs.dev)
- [@dnd-kit](https://dndkit.com)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
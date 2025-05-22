# Pomodoro Task Manager

A modern task management application with Pomodoro timer functionality, built with React, TypeScript, and Vite. The application helps users manage tasks and work in focused time blocks using the Pomodoro Technique.

## Features
### Completed
- ✅ Task management with drag-and-drop reordering
- 🔔 Desktop notifications for timer events
- 💾 Persistent storage using IndexedDB
- 🕒 Pomodoro timer with:
  - 90-minute work sessions
  - 30-minute break sessions
  - 60-minute long break sessions
  - Long break after 4 work sessions
- 📊 Progress tracking features:
  - Task completion history
  - Total duration calculations
  - Finish time predictions
- 🔄 Task operations:
  - Add, edit, and delete tasks
  - Mark tasks as complete
  - Repeat completed tasks
  - Update number of pomodoros per task
- ⏲️ Timer controls:
  - Start/pause/resume timer
  - Switch between work and break sessions
  - Skip current session
  - Reset timer

### Planned Enhancements
- ⚙️ User-configurable timer durations
- 📋 Session statistics and analytics
- 📈 Visual progress tracking
- 🔊 Custom notification sounds
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
│   ├── Banner/ # Banner components
│   ├── NavBar/ # Navigation components
│   ├── Timer/ # Timer related components
│   ├── Tasks/ # Task management components
│   ├── Notification/ # Notification components
│   ├── debug/ # Debug components
│   └── ErrorBoundary.tsx # Error handling component
├── contexts/ # React contexts
├── constants/ # Application constants
├── hooks/ # Custom React hooks
├── pages/ # Page components
├── styles/ # Global styling
├── test/ # Test files
├── types/ # TypeScript definitions
├── utils/ # Utility functions
├── App.tsx # Main App component
├── App.css # App-level styles
├── main.tsx # Application entry point
├── index.css # Global styles
└── vite-env.d.ts # Vite environment types
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository

```bash
git clone git@github.com:adrianmurage/pomodoro-panda.git
```

2. Install dependencies

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests without watch mode:

```bash
npm run test:run
```

### Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Linting

Run ESLint:

```bash
npm run lint
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

- Fixed duration settings:
  - 90-minute work sessions
  - 30-minute break sessions
  - 60-minute long break sessions
  - Long break after 4 work sessions
- Desktop notifications for session completion
- Visual feedback for timer events

### Task Management

- Drag-and-drop task reordering
- Task descriptions
- Configurable pomodoro sessions per task
- Task completion tracking
- Task history management

### Data Persistence

- IndexedDB storage for tasks
- Completed task history
- Time tracking and estimates
- Task order persistence

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
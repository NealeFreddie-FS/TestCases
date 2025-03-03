# Component Structure and Testing Plan

## Component Organization

We will organize components into the following categories:

### 1. Core Components

- Basic building blocks used across the application
- Located in `app/components/core/`
- Examples: Button, Card, Input, Modal

### 2. Layout Components

- Components used for page structure and layout
- Located in `app/components/layout/`
- Examples: Header, Footer, Sidebar, PageContainer

### 3. Feature Components

- Specific feature implementations
- Located in `app/components/features/`
- Examples: GameStore, CharacterCreation, GameEngine

### 4. Page Components

- Top-level page components
- Located directly in `app/`
- Example: `app/game/page.tsx`

## Testing Strategy

### 1. Unit Tests

- Test individual components in isolation
- Mock dependencies and external interactions
- Focus on component behavior and rendering

### 2. Integration Tests

- Test interactions between related components
- Verify communication between components

### 3. End-to-End Tests

- Test complete user flows and scenarios
- Simulate user interactions and verify outcomes

### 4. Test Organization

- Tests located alongside components with `.test.tsx` suffix
- Shared test utilities in `app/tests/utils/`
- Testing helpers and mocks in `app/tests/mocks/`

## State Management

### 1. Local Component State

- Use React's `useState` for component-specific state

### 2. Custom Hooks

- Extract reusable state logic into custom hooks
- Located in `app/hooks/`

### 3. Context API

- For sharing state between related components
- Located in `app/contexts/`

## Project Folder Structure

```
app/
├── components/
│   ├── core/           # Basic UI components
│   ├── layout/         # Layout components
│   ├── features/       # Feature-specific components
│   │   ├── game-engine/
│   │   ├── character-creation/
│   │   └── game-store/
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── tests/              # Test utilities and mocks
│   ├── utils/          # Test utility functions
│   └── mocks/          # Mocks for testing
└── [page-directories]  # Page components
```

## Component Documentation

Each component should include:

1. Component purpose
2. Props documentation
3. Usage examples
4. Edge cases and limitations

## Testing Best Practices

1. Test behavior, not implementation
2. Focus on user-centric tests
3. Use snapshot testing sparingly
4. Ensure test independence
5. Aim for high coverage of critical paths

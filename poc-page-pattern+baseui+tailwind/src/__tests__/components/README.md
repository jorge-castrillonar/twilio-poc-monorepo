# Component Tests

This folder contains unit tests for all React UI components.

## Structure

All component tests follow the pattern:
```
ComponentName.test.tsx
```

## Current Tests

- ✅ **Button.test.tsx** (15 tests) - Base UI Button wrapper with variants
- ✅ **Input.test.tsx** (36 tests) - Base UI Field-based input with validation
- ✅ **Modal.test.tsx** (35 tests) - Base UI Dialog-based modal
- ✅ **SearchBar.test.tsx** (32 tests) - Search input with icon
- ✅ **Alert.test.tsx** (46 tests) - Alert/notification component

**Total: 144 tests passing**

## Test Philosophy

Component tests focus on:
1. **Rendering** - Component displays correctly with props
2. **User Interaction** - Clicks, typing, keyboard navigation
3. **Base UI Integration** - Base UI components work correctly
4. **Accessibility** - ARIA attributes, keyboard support, screen reader support
5. **Styling** - Tailwind classes applied correctly
6. **Edge Cases** - Disabled states, error states, empty states

## Running Tests

```bash
# Run all component tests
npm test -- __tests__/components

# Run specific component test
npm test -- Button.test.tsx

# Run in watch mode
npm test -- --watch
```

## Test Coverage

Component tests provide ~90% coverage of UI components. These tests validate:
- All component variants and sizes
- User interactions (click, type, focus, blur)
- Error states and validation
- Accessibility features
- Base UI integration

## Adding New Component Tests

When creating a new component, create its test file here:

1. Create `ComponentName.test.tsx`
2. Import the component from `../../components/ComponentName`
3. Write tests following the existing patterns
4. Run tests to verify
5. Aim for >80% code coverage

## Dependencies

- `@testing-library/react` - Component rendering and queries
- `@testing-library/user-event` - Simulate user interactions
- `@testing-library/jest-dom` - Custom matchers
- `jest` - Test runner

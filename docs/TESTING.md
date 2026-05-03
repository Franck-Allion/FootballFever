# Testing Standards & Guidelines

This document defines the testing protocols and quality guardrails for the **FootballFever** project.

## 🎯 Mandatory Thresholds

To ensure project stability, the following coverage thresholds are enforced on all `core` and `domain` logic:

- **Lines:** 95%
- **Functions:** 95%
- **Branches:** 95%
- **Statements:** 95%

Any pull request or change that drops coverage below these levels will be rejected by the CI/CD pipeline.

## 🛠 Tools & Frameworks

- **Test Runner:** [Vitest](https://vitest.dev/)
- **Mocking:** Vitest built-in `vi` utilities.
- **Database Mocking:** `fake-indexeddb` (for `DatabaseService` unit tests).
- **DOM Environment:** `happy-dom`.

## 🧪 Testing Patterns

### AAA Pattern (Arrange-Act-Assert)

All tests must follow the AAA pattern for clarity and consistency:

```typescript
it('should perform a specific action', () => {
    // 1. Arrange: Setup the test data and mocks
    const value = 10;
    
    // 2. Act: Execute the method being tested
    const result = myFunction(value);
    
    // 3. Assert: Verify the outcome
    expect(result).toBe(expectedValue);
});
```

### Critical Zones

The following directories are considered "Critical Zones" and should aim for 100% coverage where possible:
- `src/domains/` (Match Engine, Loot, Economy)
- `src/core/services/database/`
- `src/core/fsm/`

## 🚀 Running Tests

### Local Development
Run tests in watch mode during development:
```bash
npm test
```

### CI / Coverage Report
Run the full test suite with coverage thresholds:
```bash
npm run test:ci
```

### Individual File
Test a specific service:
```bash
npm test -- path/to/MyService.test.ts
```

## 📝 Best Practices

1. **Deterministic Tests:** Avoid `Math.random()` or `Date.now()` without proper mocking or seeds.
2. **Isolation:** Tests should not depend on each other. Use `beforeEach` to reset singletons or shared state.
3. **No UI Skew:** Tests for logic should be decoupled from React components whenever possible.
4. **Mock External IO:** Always mock database calls, network requests, and heavy browser APIs.

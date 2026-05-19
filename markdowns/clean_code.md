# Clean Code Rules

Write code that is easy to read, modify, and maintain by developers other than its original author.

## Philosophy
- Prioritize readability over cleverness.
- Keep code simple (KISS).
- Fix root causes, not symptoms.
- Leave code cleaner than you found it.
- Prefer maintainability over premature optimization.

---

## Naming
- Use descriptive, searchable names.
- Avoid abbreviations unless widely accepted (`API`, `URL`, `JWT`).
- Replace magic numbers with named constants.
- Avoid ambiguous names (`data`, `temp`, `obj`, `value`).
- Use pronounceable names.

Bad:
```ts
const d = new Date();
const x = 18;
```

Good:
```ts
const currentDate = new Date();
const LEGAL_AGE = 18;
```

---

## Functions
- Keep functions small and focused.
- One function = one responsibility.
- Prefer ≤3 parameters.
- Avoid boolean flags.
- Prefer pure functions when possible.
- Avoid deep nesting; use early returns.
- Use descriptive function names.

Bad:
```ts
function generateReport(isPdf: boolean) {}
```

Good:
```ts
generatePDFReport();
generateCSVReport();
```

Bad:
```ts
if (user) {
  if (user.isActive) {
    accessDashboard();
  }
}
```

Good:
```ts
if (!user) return;
if (!user.isActive) return;

accessDashboard();
```

---

## Architecture
- Follow Single Responsibility Principle.
- Separate concerns:
  - Controllers → request/response handling
  - Services → business logic
  - Database → persistence
- Keep business logic out of routes and UI components.
- Prefer composition over inheritance.
- Use dependency injection when useful.
- Avoid tight coupling.

Example structure:
```txt
modules/
└── auth/
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── auth.routes.ts
    └── auth.validation.ts
```

---

## TypeScript
- Avoid `any`.
- Prefer explicit types for public APIs.
- Use interfaces/types for shared contracts.
- Replace magic strings with enums/constants.
- Validate external inputs.

Bad:
```ts
const user: any;
```

Good:
```ts
interface User {
  id: string;
  email: string;
}
```

---

## Error Handling
- Fail fast.
- Never silently ignore errors.
- Use meaningful error messages.
- Handle edge cases explicitly.
- Log useful debugging information.

Bad:
```ts
try {
  processPayment();
} catch {}
```

Good:
```ts
try {
  processPayment();
} catch (error) {
  logger.error(error);
  throw error;
}
```

---

## Comments
- Prefer self-explanatory code.
- Comment **why**, not **what**.
- Remove dead/commented code.
- Add warnings only for important side effects.

Bad:
```ts
// Increment counter
counter++;
```

Good:
```ts
// Retry to avoid temporary API failure
retryRequest();
```

---

## Testing
- Test behavior, not implementation.
- Tests should be fast, readable, and independent.
- Use descriptive test names.
- One test = one behavior.

Good:
```ts
test("should throw error for invalid password")
```

---

## Avoid
- Overengineering
- Duplicate code
- Deep nesting
- Massive files/classes
- Hidden side effects
- Large condition chains
- Premature optimization
- Commented-out code

---

## Rule of Thumb

Before committing code, ask:

- Is this easy to understand?
- Can another developer maintain it?
- Is there unnecessary complexity?
- Are names clear?
- Are edge cases handled?

> Clean code is not clever code.  
> Clean code is obvious code.
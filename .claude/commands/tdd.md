# TDD Command (Personal Recommended)

description: Enforce test-driven development workflow. Always write tests first, then minimal implementation, then refactor. Beginner-friendly and strict.

---

## Purpose

This command enforces Test-Driven Development (TDD) as a thinking and verification process.

The goal is not speed, but correctness, clarity, and trust.

---

## Core Rule (CRITICAL)

Implementation must NEVER be written before tests.

Correct order:

1. Clarify behavior
2. Define inputs and outputs
3. Write tests
4. Confirm tests fail
5. Write minimal code to pass
6. Refactor after green

If this order is broken, stop and restart.

---

## When to Use

Use this command when:
- Creating a new function
- Adding business logic
- Fixing a bug
- Refactoring behavior-related code

Do NOT use for:
- Formatting only
- Renaming only
- Documentation only

---

## Agent Responsibilities

When this command is invoked, the agent must:

1. Restate requirements in plain language
2. Define inputs and outputs
3. Propose test cases before implementation
4. Write tests that fail if code does not exist
5. Confirm failures are expected
6. Implement the minimum code to pass tests
7. Run tests and confirm they pass
8. Refactor only for readability or safety
9. Re-run tests after refactor
10. Mention coverage expectations (target 80%+)

---

## TDD Cycle

RED:
- Tests describe expected behavior
- Failure is expected

GREEN:
- Write the smallest possible code
- No optimization

REFACTOR:
- Improve structure and naming
- Do not change behavior

Repeat for each behavior.

---

## Beginner Rules

- Prefer simple tests
- One test = one behavior
- Test results, not implementation
- Add tests when unsure, not code

---

## Example (Conceptual)

User request:
"I need a function to calculate total price with tax"

Expected flow:
- Clarify how tax is applied
- Decide rounding rules
- Identify edge cases
- Write tests for those cases
- Implement logic to satisfy tests

---

## Coverage Guidelines

- Target minimum coverage: 80%
- Critical calculations should aim for 100%
- Coverage is a signal, not the goal

---

## Common Mistakes

- Writing code before tests
- Skipping failing test step
- Fixing tests instead of code
- Testing internal implementation details

---

## Recommended Workflow

1. /plan
2. /tdd
3. /code-review
4. /test-coverage

---

## Related Agent

This command invokes:
~/.claude/agents/tdd-guide.md

The agent must strictly follow this document.

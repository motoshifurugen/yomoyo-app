# Code Review Command (Personal Recommended)

description: Perform a careful, beginner-friendly code review focused on security, correctness, and maintainability. Be strict on security, constructive on quality.

---

## Purpose

This command turns Claude into a dedicated code reviewer.

The goal is not to praise code, but to:
- Detect serious risks early
- Prevent insecure or fragile code from being committed
- Help the user learn through clear, actionable feedback

---

## Review Scope

Only review **uncommitted changes**.

Steps:
1. Identify changed files using:
   git diff --name-only HEAD
2. Review ONLY those files
3. Ignore unrelated or untouched files

---

## Review Categories

### Security Issues (CRITICAL)

If any item below is found, the review MUST block approval.

- Hardcoded secrets (API keys, passwords, tokens)
- Insecure environment variable handling
- SQL injection risks
- XSS vulnerabilities
- Missing input validation on external input
- Insecure authentication or authorization logic
- Path traversal or file system risks
- Unsafe use of eval or similar APIs

Never approve code with unresolved security risks.

---

### Code Quality Issues (HIGH)

These issues usually block approval unless explicitly accepted by the user.

- Functions longer than 50 lines
- Files larger than 800 lines
- Deep nesting (more than 4 levels)
- Missing error handling
- console.log or debug statements left in code
- TODO or FIXME comments without explanation
- Public functions without clear naming or comments

---

### Best Practices (MEDIUM)

These should be reported, but do not block approval by default.

- Mutable state where immutable patterns are safer
- New logic without corresponding tests
- Overly complex logic that could be simplified
- Accessibility concerns (a11y) in UI code
- Inconsistent naming or formatting

---

## Review Output Format

For each issue, report:

- Severity: CRITICAL / HIGH / MEDIUM
- File name
- Line number (if possible)
- Clear description of the problem
- Concrete suggestion for improvement

Avoid vague advice.

---

## Approval Rules

- If CRITICAL issues exist: ❌ DO NOT APPROVE
- If HIGH issues exist: ❌ DO NOT APPROVE (unless user explicitly accepts)
- If only MEDIUM issues exist: ⚠️ Approve with comments

Never say "Looks good overall" if serious issues remain.

---

## Tone Guidelines

- Be calm and respectful
- Be specific and practical
- Do not shame or lecture
- Assume the user is learning

The reviewer is a safety net, not a judge.

---

## Recommended Workflow

1. Write or modify code
2. Run tests
3. Run /code-review
4. Fix CRITICAL and HIGH issues
5. Commit only after approval

---

## Related Agent

This command invokes:
~/.claude/agents/code-reviewer.md

The agent must strictly follow this document.

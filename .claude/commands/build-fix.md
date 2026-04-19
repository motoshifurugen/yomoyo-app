# Build and Fix

## Description
Incrementally fix TypeScript and build errors in a safe, explain-first manner.
Never apply multiple fixes at once. Never guess.

---

## Core Policy

- Fix ONE error at a time
- Explain before changing code
- Re-run build after EVERY fix
- Stop if uncertainty increases

This command prioritizes stability over speed.

---

## Step 1: Run Build

Run the project build using the same command as CI.

Examples:
- npm run build
- pnpm build

Do not run tests or linters yet.

---

## Step 2: Parse Build Errors

From the build output:

- Group errors by file
- Sort by severity (blocking first)

Priority order:
1. TypeScript compile errors
2. Missing modules / imports
3. Configuration errors
4. Warnings (handled last)

---

## Step 3: Fix Errors (One by One)

For EACH error, follow this exact loop.

### 3.1 Show Context
- File path
- Line number
- 5 lines before and after the error

Do not modify code yet.

---

### 3.2 Explain the Error
Explain in plain language:
- What the tool is complaining about
- Why this error occurs
- Whether it is a root cause or a secondary error

If unclear, say so.

---

### 3.3 Propose a Fix
Describe:
- What will be changed
- Why this fix is minimal and safe
- Possible side effects (if any)

If multiple options exist, choose the least invasive one.

---

### 3.4 Apply the Fix
Rules:
- Change only what is necessary
- Do not refactor unrelated code
- Do not silence errors using any, ts-ignore, or dummy values

---

### 3.5 Re-run Build
Run the build again immediately.

---

### 3.6 Verify
Confirm:
- The original error is gone
- No new blocking errors appeared

Only then move to the next error.

---

## Stop Conditions

STOP immediately if:

- A fix introduces new build errors
- The same error persists after 3 attempts
- The root cause becomes unclear
- The user asks to pause

When stopped, summarize and ask for direction.

---

## Final Summary

At the end, report:
- Fixed errors (file names)
- Remaining errors
- Newly introduced errors (if any)
- Suspected root causes

---

## Absolute Rules

- Never fix multiple errors at once
- Never guess silently
- Never trade correctness for speed

Slow is smooth. Smooth is fast.

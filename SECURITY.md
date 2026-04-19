# Security Checklist

This document defines the minimum security checks before release or PR merge.
The goal is to keep local data safe and avoid input-driven failures.

## Database & Queries
- [ ] All SQL uses parameter binding (`?`) for values.
- [ ] No SQL strings are built from user input.
- [ ] LIKE queries use bound parameters (no string interpolation in SQL).

## Input Normalization & Limits
- [ ] Text inputs are normalized (trim, newline, multi-space collapse) before saving.
- [ ] Length limits are enforced both in UI and before persistence.
- [ ] URL inputs are normalized and validated before saving.

## Logging & Error Handling
- [ ] Errors are handled without exposing user input in logs.
- [ ] User-facing error copy is calm and non-alarming.

## Manual Test Cases (Quick)
- [ ] Menu name: `' OR 1=1 --` (should not crash; should save safely).
- [ ] Reading: `; DROP TABLE recipes;` (should not crash; should save safely).
- [ ] Memo: multiline text with extra spaces (should normalize on save).
- [ ] Overlong inputs (menu name, reading, memo, URL) are clamped.
- [ ] URL with spaces/newlines is sanitized and validated.

## Notes
- Security issues block approval.
- If a new input is added, extend this checklist.

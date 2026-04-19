---
description: Think before coding. Clarify requirements, identify risks, and create a simple step-by-step plan. DO NOT write any code until the user explicitly approves.
---

# Plan Command (Personal)

## Purpose

This command is used to prevent rushing into implementation.

The goal is to:
- Make sure requirements are clearly understood
- Surface potential risks early
- Decide a reasonable implementation order
- Keep control in the user's hands

---

## What This Command Must Do

When `/plan` is used, the agent MUST:

1. Restate the requirements in simple words
2. Ask clarifying questions if anything is unclear
3. Identify obvious risks or unknowns
4. Propose a small, step-by-step implementation plan
5. STOP and wait for user confirmation

Writing code before approval is strictly forbidden.

---

## Output Format

The plan should be presented using the following sections only:

Requirements Restatement
Questions / Uncertainties
Proposed Steps
Risks
Estimated Complexity

Keep explanations concise and beginner-friendly.

---

## When I Use This Command

I use `/plan` when:
- Starting a new feature
- I feel unsure about the correct approach
- More than one file will be modified
- The change feels "a bit scary"
- I want to think before touching code

---

## Rules for the Agent

- Do NOT write code
- Do NOT suggest tools unless necessary
- Do NOT over-optimize or over-engineer
- Prefer clarity over completeness
- Assume the user is still learning

---

## Confirmation Rule (CRITICAL)

After presenting the plan, the agent must stop and ask for confirmation.

Allowed user responses:
- "yes"
- "proceed"
- "looks good"
- "modify: ..."

Any other response means NO implementation yet.

---

## Next Steps After Approval

After approval, the user may choose to:
- Use `/tdd` to start implementation
- Use `/code-review` after coding
- Revise the plan if new information appears

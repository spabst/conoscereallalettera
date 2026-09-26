# Claude instructions — conoscereallalettera

## Project intent

Educational iPad-first React Native / Expo app for children learning letters.

## Working rules

- Preserve the existing simple architecture unless a feature requires change.
- Do not perform broad refactors unrelated to the task.
- Keep child-facing UX positive and non-punitive.
- Prefer offline/on-device behavior.
- Never add cloud OCR for handwriting without an explicit requirement.
- Do not migrate the whole repository to TypeScript as part of the sand-tracing feature.
- For high-frequency drawing events, avoid React state updates per touch point.
- Rendering and recognition/scoring must be separate concerns.
- Thresholds/configuration belong in a config module, not scattered through components.
- All randomness used for visual particles should be stable/deterministic per stroke.
- Keep the existing navigation and non-tracing exercises working.

## Sand tracing feature

Before working on it, read all files under `docs/`.

The required v1 recognizer is target-aware geometric/raster trace evaluation, not generic OCR.

The current legacy rule "enough points means success" must not survive.

## Before finishing a task

- run relevant tests;
- check imports and syntax;
- inspect the final diff;
- update README when setup/dependencies changed;
- explicitly state what still requires physical iPad QA.

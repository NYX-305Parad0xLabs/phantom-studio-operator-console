# Approval Flow

Operators submit decisions explicitly from the review console to keep the control plane’s audit log intact. Each decision records the type, affected artifact scope, and human notes so downstream services can act deterministically.

## Decision types

- **Approve:** marks a payload as verified and ready for publish scheduling.
- **Reject:** records a counter-review when an artifact or workflow step fails policy checks.
- **Request regenerate:** sends a note back to the provider gateway to refresh captions, voice, lipsync, or render layers before backfill.

All three actions reuse the same modal, so switching between them preserves the selected artifact scope and notes.

## Control-plane mutations

- `/workflow-runs/{id}/approve`
- `/workflow-runs/{id}/reject`
- `/workflow-runs/{id}/request-regenerate`

Each mutation carries a payload of `{ decisionType, notes, artifactScope }`. The console uses stubbed API helpers when the real control plane base URL is absent.

## Run history

- The history panel lists QA events, caption/voice review notes, and approval trace entries with timestamps and actor IDs.
- Status badges (`QA`, `Review`, `Approval`) highlight progress without hiding blocked states.
- This chronology ensures operators can rehearse what decisions have already been applied before issuing another.

## Safety notes

Every action is auditable—no “silent approve” paths are permitted. Reject/regenerate always encourage a short note so the control plane can feed it to the operator queue or provider gateway jobs for reprocessing.

# Adding to ryo

Small, focused changes are welcome. Open an issue first for anything large, so nobody builds what will not be merged.

## Before you push

```bash
npm ci --no-audit --no-fund
npm run lint
npm run typecheck
npm run build
```

Push only when all of it passes.

## What every change comes with

- Plain English in anything a person reads: say what it does and why, and put the plain meaning next to every number.
- No invented figures. A number on the page comes from a source you can name.

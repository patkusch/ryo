# Changelog

What changed and when, newest first. This project does not have numbered releases, so the entries are grouped by month.

## 2026-11

- Next.js updated to 16.4.6. Lint-tool advisories cleared with a pinned `minimatch`.

## 2026-10

- Fixed a critical Next.js image-generation vulnerability (16.3.5 to 16.3.8), with two Linux-only lockfile entries added by hand so the CI install works.
- `sharp`, `source-map-js`, `zod` and `puppeteer-core` updated to patched versions.
- Declared the Node version the tests run on. Added `.env.example`; the Anthropic API key is optional.

## 2026-09

- Lint errors fixed and lint added to the build gate. Type-checking runs on its own without a build first.
- The lockfile now works on every platform, and CI installs from it exactly.

## 2026-08

- First version: an AI cafe operator built for a hackathon, with a real multi-agent pipeline, a dashboard, agent screenshots and tab links that can be shared by URL.

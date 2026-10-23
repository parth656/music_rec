# Music Discovery Platform

A music recommendation project currently being rebuilt from an earlier Flask-based implementation into a Next.js and TypeScript application.

## Current status

**In development.** The README and current project description identify the Next.js/TypeScript/Firebase direction, with Spotify API integration planned. Do not assume that the planned integration is already available.

## Planned technology

- Next.js
- TypeScript
- Firebase
- Spotify API integration (planned)

## Getting started

The exact scripts and environment variables depend on the current Next.js app configuration. From the repository root:

```bash
git clone https://github.com/parth656/music_rec.git
cd music_rec
```

Then inspect `package.json` and follow the available scripts. If it defines the standard Next.js scripts, install dependencies with your package manager and run the development script.

## Configuration

- Keep API secrets out of source control.
- Use server-side environment variables for private Spotify credentials.
- Document required variable names in a local `.env.example` with placeholder values only.
- Never commit Firebase service-account files or private tokens.

## Recommended milestones

1. Complete the core search and discovery experience.
2. Add a recommendation flow with a documented input/output contract.
3. Integrate Spotify only after credentials, scopes, and error handling are configured.
4. Add tests for recommendation logic and loading/error states.
5. Include screenshots and a demo link after the app is deployable.

## License and attribution

Add a license and attribution for any third-party APIs, datasets, icons, or media used by the application.

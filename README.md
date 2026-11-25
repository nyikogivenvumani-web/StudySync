# StudySync

StudySync is a responsive study-accountability app for students studying the
same university modules. The MVP scope and requirements are defined in
[the PRD](docs/PRD.md) and [the implementation plan](docs/Implementation_plan.md).

## Design prototype

[Open the StudySync project in Google Stitch](https://stitch.google.com/projects/17823946123067257044).
Access may require a Google account that has been granted permission.

## Technology

- React and TypeScript frontend (`apps/web`)
- Node.js, Express, and TypeScript API (`apps/api`)
- Supabase PostgreSQL, Auth, Row-Level Security, and Realtime
- Daily.co or LiveKit for video-only rooms (provider decision pending)
- GitHub Actions for linting, typechecking, tests, and builds

## Prerequisites

- Node.js 22.13 or later
- npm 10 or later

## Local development

```sh
npm ci
```

Copy `.env.example` to `.env`, then start the API and frontend from the
repository root:

```sh
npm run dev
```

The frontend is available at `http://localhost:5173`; the API health endpoint
is `http://localhost:3001/health`. Supabase is not yet integrated; its
environment-variable names are documented in `.env.example`.

##Live Demo

https://study-sync-orcin-iota.vercel.app/

##Test Login

Use these accounts to try the app without signing up.

##Role	Email	Password
Student	student@studysync.test	Student@12345
Admin	admin@studysync.test	Admin@12345
Student lands on /discover (or /profile if no modules are selected yet).
Admin lands on /admin/catalogue and can create/close rooms, manage the module catalogue, and moderate the forum.

These are test accounts only. Do not use real personal details or passwords.

## Quality checks

Run the same checks as CI from the repository root:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The GitHub Actions workflow runs these checks on pull requests and pushes to
`main`. Never commit credentials or production secrets.

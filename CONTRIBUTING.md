# Contributing to StoryChat Studio

Thank you for considering a contribution. Bug reports, thoughtful feature proposals, documentation improvements, and focused pull requests are welcome.

## Before you start

- Search existing issues and pull requests before starting substantial work.
- For larger changes, open an issue first to agree on scope and approach.
- Keep pull requests focused; avoid bundling unrelated formatting or refactoring.

## Development setup

1. Install Node.js 20+ and npm.
2. Clone the repository and run `npm install` from its root.
3. Optionally configure MySQL by copying `backend/.env.example` to `backend/.env`. Without database settings, the API uses its local persistent JSON store.
4. Run `npm run dev` to start the API and frontend.
5. Run `npm run build` before submitting changes.

Do not commit `.env` files, API keys, passwords, local database files, uploaded media, generated exports, caches, or logs.

## Pull request checklist

- Describe the problem and the solution.
- Include reproduction or verification steps.
- Update relevant documentation.
- Run the production build and any checks relevant to the changed code.
- For visual changes, provide before/after screenshots when practical.
- Confirm generated files and local configuration are not included.

## Reporting issues

Include the operating system, Node.js version, steps to reproduce, expected behavior, actual behavior, and relevant sanitized error output. Remove secrets and personal data before posting logs.

## Code of conduct

Be respectful, constructive, and considerate in project discussions and reviews. Harassment and discriminatory behavior are not acceptable.

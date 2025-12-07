# GitHub Copilot Instructions for SIGAA Socket API

These instructions guide AI coding agents working on this repo to be productive quickly. Focus on existing architecture, workflows, conventions, and integration points specific to this project.

## Big Picture
- Purpose: Exposes academic data from SIGAA over WebSocket. Users connect via Socket.IO and interact through channel-like events aligned with the `asyncapi.yaml` spec.
- Layers:
  - `src/index.ts`: App bootstrap. Initializes Socket.IO server, middleware, router.
  - `src/Router.ts`: Maps incoming socket events to controllers using operation/channel names.
  - `src/middlewares/`: Cross-cutting concerns (e.g., `Auth.ts` JWT validation).
  - `src/controllers/`: Feature endpoints grouped by domain (e.g., `Courses.ts`, `Grades.ts`). Each controller orchestrates services and DTO assembly.
  - `src/services/sigaa-api/`: Adapters to the external `sigaa-api` library. Subfolders mirror SIGAA domains (`Bond`, `Course`, etc.). Rehydrate/Service classes translate raw data into local DTOs.
  - `src/services/cache/`: In-memory caches (`NodeCache`) for sessions, bonds, responses, request stack, and socket references.
  - `src/DTOs/`: Data contracts used internally and to shape responses; subfolders for attachments and grade groups.
- Documentation: `asyncapi/asyncapi.yaml` (and modularized under `asyncapi/`) describes channels, operations, messages, and schemas used by the socket API.

## Runtime & Developer Workflows
- Node/TypeScript toolchain (TypeScript 4.9). Commands:
  - `npm run dev`: Hot-reload dev server (`tsx watch src/index.ts`).
  - `npm run devDebug`: Debug with inspector on `0.0.0.0:7001` using `ts-node-dev`.
  - `npm run build`: Compile to `dist/` with `tsc`.
  - `npm start`: Run compiled JS (`dist/index.js`).
- Environment:
  - `.env` loaded via `dotenv`. Common vars: server port/path, JWT secret, cache toggles (inspect code to add/consume). Keep consistent with AsyncAPI servers.
  - Socket.IO server is typically `ws` on port `5000` (see AsyncAPI `servers` variables and any config files).
- AsyncAPI workflows:
  - Modular spec: `asyncapi/asyncapi.yaml` references `asyncapi/channels/*.yaml` and `asyncapi/components/*.yaml`.
  - Validate: `npx @asyncapi/cli validate asyncapi/asyncapi.yaml`.
  - Generate HTML docs: `npx @asyncapi/cli generate fromTemplate asyncapi/asyncapi.yaml @asyncapi/html-template -o docs/html --use-new-generator -p sidebarOrganization=byTags`.
  - Generate Markdown docs: `npx @asyncapi/cli generate fromTemplate asyncapi/asyncapi.yaml @asyncapi/markdown-template -o docs/markdown --use-new-generator`.
  - CI: `.github/workflows/asyncapi.yml` validates and generates docs on PR/push.

## Conventions & Patterns
- Channels/Operations:
  - Event names follow `domain::action` (e.g., `user::login`, `courses::list`). Keep parity with `asyncapi.yaml` channels and `operations`.
  - For AsyncAPI v3, `operations.*.messages` must reference messages defined under the referred channel (not directly from `components.messages`).
- Controllers:
  - One controller per domain. Inputs are request payloads, outputs are DTOs.
  - Leverage services in `src/services/sigaa-api/*` for data retrieval; do not call external APIs directly from controllers.
- DTOs:
  - Keep schemas aligned with `components/schemas.yaml`. If adding DTOs, update both TypeScript DTOs and AsyncAPI schemas/messages.
- Caching:
  - Use caches from `src/services/cache/*` to reduce SIGAA calls and improve responsiveness. Respect cache flags from payloads (e.g., `cache: true`).
- Auth:
  - `src/middlewares/Auth.ts` handles JWT validation. Security schemes are documented under `components/security.yaml`.

## Integration Points
- External dependency: `sigaa-api` (GitHub URL in `package.json`). It provides domain-specific services. Ensure compatibility when updating.
- Transport: Socket.IO (`socket.io` server and `socket.io-client` as devDependency). Event names and payloads must match AsyncAPI.
- AsyncAPI Generators: HermesJS output may be generated in `docs/output` when using nodejs templates; ensure `config/common.yml` has correct YAML nesting under `ws`.

## Gotchas & Examples
- AsyncAPI v3 generators are strict:
  - Operation messages must belong to the referred channel (example fix: `operations.loginUser.messages[0] -> #/channels/userLogin/messages/UserLoginRequest`).
  - Avoid appending CI/workflow YAML into AsyncAPI files; it breaks parsing.
- WebSocket config must be nested:
  - Example `docs/output/config/common.yml`:
    ```yaml
    default:
      ws:
        port: 5000
        path: /ws
        topicSeparator: '__'
    ```
- Dev example: starting and hitting channels
  - Start dev: `npm run dev`
  - Client emits:
    - `user::login` with `{ username, password, institution }`
    - `courses::list` with `{ registration, cache }`
  - Server sends status via `user::status` messages per `UserStatusUpdatePayload`.

## How to Extend
- Add a new domain:
  1. Create controller in `src/controllers/<Domain>.ts`.
  2. Implement service/adapters under `src/services/sigaa-api/<Domain>/`.
  3. Define DTOs under `src/DTOs/` and update `asyncapi/components/schemas.yaml`.
  4. Add channel + messages in `asyncapi/channels/<domain>.yaml` and reference in `asyncapi/asyncapi.yaml`.
  5. Update `src/Router.ts` to route the new events to the controller.

If anything above is unclear or missing (e.g., environment variables list or router patterns), ask for clarification and I will refine these instructions.

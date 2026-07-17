# Daily Expense & Income Diary

This workspace contains a full-stack assessment solution for a daily expense and income diary.
## What is implemented

- A Node.js API for transaction CRUD operations.
- A React + Ant Design frontend to list, create, update, filter, and delete diary entries.
## Project Structure

- `Api/`: backend API built with Node.js, Express, MongoDB, and Mongoose.
- `FrontEnd/`: frontend app built with React, Vite, and Ant Design.
## Features

- Add expense and income entries with amount, category, date, and description.
- View transactions in a sortable table.
## Run Locally

Install dependencies in both folders first.
```sh
cd Api && npm install
cd ../FrontEnd && npm install
```
## API Notes

- `GET /transactions`
- `POST /transactions`
## Testing

Run backend tests from `Api/`:
```sh
npm test
```
## Assessment Notes

- The solution keeps the implementation focused on the required CRUD flow.
# Web assessment (React, Node.js)

This repository is designed to test the technical skills of candidates for a full stack developer position. It consists of the following structure:

- **Api**: The backend folder built with Node.js.
- **Frontend**: The frontend folder built with React and Ant Design.

### Objective

Expense and Income Diary: Create an application to track daily expenses and incomes. Users should be able to add, read, update, and delete expense and income entries.

### Task Description

1. **Clone this repository** to your local machine.
2. Create a new repository on your own GitHub account.
3. Push the cloned repository to your new GitHub repository.
4. Implement a small API that performs CRUD operations as specified.
5. Create a frontend application to interact with the CRUD API.


**Note**:
The template provides several features, helpers, and middleware for the backend, and components for the frontend. It is up to the candidate to choose whether to use them or not. You are not required to overdo or spend excessive time on this task. The exercise will be a discussion point, where you can justify your choices and explain any features you omitted due to time constraints or other reasons.

### Commit Guidelines

Please make your commits in a structured and meaningful way. Ideally, follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

### Evaluation Criteria

1. **Code Quality**: Clean, well-structured, and commented code.
2. **Functionality**: The CRUD operations work as expected and are tested in the `api/specs` folder.
3. **UI/UX**: The frontend is user-friendly and visually appealing.

### Requirements

- [Node.js](https://nodejs.org/) (use version 20.x)
- [npm](https://www.npmjs.com/)
- [VSCode](https://code.visualstudio.com/) (recommended extensions: [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode))

### Getting Started

1. Clone the repository.
2. Install the packages with `npm install` in both the `api` and `frontend` folders.
3. Visit `http://localhost` to access the application. Use the following credentials, created by the seed process, to log in:
   - **Email**: `test@meblabs.com`
   - **Password**: `testtest`
4. Start coding!

### Submission

- Record a 3-5mins of [Loom video](https://www.loom.com) showing how it works, including the expected and actual behavior if you're testing.
- Once you’ve completed the tasks, send the result to https://forms.gle/1E2z5713vGV9vhr4A.
- Please make sure that your repository is **public** or share access if it's private.

### Deadline

Please complete and submit the result within 2 hour since you accepted the invitation, unless otherwise discussed.

## Implementation Log And Trade-offs (Added During This Work Session)

### Work completed

1. Backend transaction domain implemented.
   - Added model: `Api/models/transaction.js`.
   - Added controller: `Api/controllers/transactions.js`.
   - Added routes: `Api/routes/transactions.js`.
   - Added validation schema: `Api/schema/transaction.js`.
   - Exposed CRUD endpoints used by the diary UI (`GET/POST/PUT/DELETE /transactions`), including filter/sort support.

2. Frontend diary experience implemented in the main route.
   - Updated `FrontEnd/src/routes/Home.jsx` with a complete diary dashboard flow: list, add, edit, delete, filter, stats, and loading/error states.
   - Updated menu/context to point to the diary flow in `FrontEnd/src/helpers/AppContext.jsx`.
   - Updated i18n dictionaries in:
     - `FrontEnd/public/locales/en/common.json`
     - `FrontEnd/public/locales/it/common.json`

3. Backend auth and middleware behavior aligned with test/runtime expectations.
   - Reworked auth controller behavior in `Api/controllers/auth.js`.
   - Updated token helpers in `Api/helpers/auth.js`.
   - Updated auth middleware in `Api/middlewares/isAuth.js`.
   - Updated user model response behavior in `Api/models/user.js`.
   - Updated user RBAC ownership checks in `Api/rbac/users.js`.
   - Ensured app bootstrap stability in `Api/app.js` and API entrypoint behavior in `Api/index.js`.

4. Tests and quality gates.
   - Added dedicated transactions tests: `Api/specs/transactions.test.js`.
   - Installed and used `mongodb-memory-server` in API test tooling (`Api/package.json`, `Api/package-lock.json`).
   - Validated backend test execution end-to-end (all suites passing during this session).

5. Documentation and build/run stabilization.
   - Updated backend-specific docs in `Api/README.md`.
   - Updated this root README with implementation details and run/test notes.
   - Updated frontend dependency metadata (`FrontEnd/package-lock.json`) and resolved Browserslist outdated data warning.

6. Runtime debugging and final verification.
   - Diagnosed frontend "infinite pending spinner" as an auth refresh-loop condition while unauthenticated.
   - Confirmed frontend recovery after backend auth middleware/process alignment.
   - Performed browser-based login verification and dashboard load verification on `http://localhost:3000`.

### Trade-offs and decisions made

1. Reuse of existing project architecture over introducing a new pattern.
   - Decision: implement transactions using existing controller/route/schema/middleware conventions.
   - Trade-off: faster delivery and consistency with repository style, but less opportunity to refactor legacy abstractions.

2. Minimal invasive changes in auth path.
   - Decision: adjust middleware/controller interaction so refresh-token errors return the expected payload/code shape used by frontend logic.
   - Trade-off: kept behavior compatible with current app/tests quickly, but preserved some legacy coupling between client error handling and backend error codes.

3. Test-first compatibility over broad refactors.
   - Decision: restore and align behavior to existing spec expectations rather than rewriting tests.
   - Trade-off: improves reliability immediately, but leaves deeper cleanup/refactor opportunities for a separate pass.

4. Local runtime reproducibility prioritized.
   - Decision: validate against running local services (frontend dev server + backend + Mongo) and fix real startup/runtime blockers.
   - Trade-off: environment assumptions remain (for example Mongo credentials and process lifecycle), so first-run setup still requires correct local configuration.

5. Scope control on documentation.
   - Decision: document implementation and operational decisions directly in README files instead of creating a separate architecture decision log.
   - Trade-off: easier discoverability for reviewers, but long-term decision history may become harder to maintain without dedicated ADR files.
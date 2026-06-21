# TinaCMS Terraform Configurator

## Purpose

The **TinaCMS Terraform Configurator** abstracts the complex and error-prone process of manually editing JSON configuration files for Terraform infrastructure. By providing a guided, form-driven interface, this project ensures that users never need to manually write or edit JSON. It enforces schema compliance and prevents invalid configurations before they ever reach the deployment pipeline.

## Architecture Approach

The architecture is designed to decouple the user experience of configuring infrastructure from the strict requirements of Terraform JSON structure.

1. **Presentation Layer (Next.js & TinaCMS):** Next.js acts as the application shell hosting TinaCMS. TinaCMS dynamically generates forms based on our defined content schemas (representing `subscriptions`, `resourceGroups`, etc.). This layer focuses entirely on user experience, abstracting JSON semantics behind a rich UI.
2. **Validation Engine (AJV):** Forms are strictly validated against complex JSON schemas before any submission. This engine handles nested structures, UUID validation, regex matching, and conditional requirements. By validating in the browser and API layer, we guarantee that only structurally sound data is ever persisted.
3. **Git-Backed Data Persistence:** Instead of a traditional database, GitHub is the single source of truth. The application acts as a secure intermediary using an API-driven workflow. Every valid configuration submission follows a strict GitOps pattern:
   - A deterministic JSON string is generated from the form state.
   - A new feature branch is programmatically created.
   - The JSON file is committed to the repository's `content/` directory.
   - A Pull Request is opened for the Terraform team to review and merge.

## Technical Details

- **Core Framework:** Next.js (App Router)
- **CMS / UI Layer:** TinaCMS, serving as the interface for structured data entry. It dynamically maps visual fields to underlying data models.
- **Validation:** AJV is used for robust, schema-compliant JSON validation against strict infrastructure requirements. The schema acts as the single source of truth for allowed infrastructure configurations.
- **Git Integration:** `@octokit/rest` handles programmatic interactions with the GitHub API. It orchestrates the creation of branches, commits, and Pull Requests seamlessly on behalf of the user.
- **Language & Typings:** TypeScript is used throughout to ensure end-to-end type safety.
- **File Structure:** The generated data is stored as individual JSON files in the `content/` directory (e.g., `content/subscriptions/my-sub.json`), where each submission maps exactly to one JSON file.

## Overall Impact

- **Eliminates Manual Errors:** Abstracting JSON syntax prevents formatting errors, typos, and invalid references.
- **Guided Experience:** Users think in terms of infrastructure concepts rather than JSON schema mechanics.
- **Schema Compliance:** Immediate, in-browser validation prevents bad data from ever being committed.
- **Streamlined Code Review:** Replaces manual git commands. The app automatically opens a clean, isolated Pull Request containing only the necessary JSON modifications, ready for the Terraform team to merge.
- **Enhanced Security & Process:** Enforces a strict Pull Request workflow without allowing direct commits to the main branch.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

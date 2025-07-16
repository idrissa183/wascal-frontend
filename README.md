# EcoWatch Frontend

EcoWatch is a web interface for monitoring environmental and climatic data. It is built with [Astro](https://astro.build) and React and communicates with the EcoWatch backend API.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and adjust the values for your installation:

   ```bash
   cp .env.example .env
   ```

   The `.env` file provides Vite variables such as `VITE_API_BASE_URL`, OAuth credentials and other runtime configuration.

3. Start the development server:

## Common Commands

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start the local development server    |
| `npm run build`      | Build the production site into `dist` |
| `npm run preview`    | Preview the built site locally        |
| `npm run lint`       | Run ESLint checks                     |
| `npm run lint:fix`   | Fix lint issues automatically         |
| `npm run type-check` | Run TypeScript type checking          |

## Environment

Vite automatically loads variables from `.env` during development and build. See `.env.example` for all available options.

## Docker

The repository includes a `Dockerfile` and `docker-compose.yml` for running the application in containers alongside the backend and database.

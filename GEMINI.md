# Project Overview
This project is a React single-page application (SPA) built with Vite and TypeScript. It serves as a local directory and discovery platform for trades businesses and contractors (e.g., Electricians, Plumbers, General Contractors) across various cities in British Columbia, Canada (such as Kelowna, Vernon, Penticton, etc.).

The application utilizes Google GenAI (`@google/genai`) and features smooth page transitions using Framer Motion (`motion/react`). The user interface is styled with TailwindCSS v4 and uses `lucide-react` for icons.

Additionally, the project includes Node.js data processing scripts (located in the `scripts/` directory) that fetch, normalize, and enrich business data using the Serper API (Google Places/Search wrapper) and potentially Gemini. The scraped and processed data is cached and stored in the `generated/` directory as JSON files, which act as the primary data source for the frontend application.

## Core Technologies
*   **Frontend Framework:** React 19
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** TailwindCSS v4
*   **Routing:** React Router v7 (`react-router-dom`)
*   **Animations:** Framer Motion (`motion/react`)
*   **Icons:** Lucide React (`lucide-react`)
*   **AI Integration:** Google GenAI (`@google/genai`)
*   **Data Processing:** `better-sqlite3`, `tsx` (for running TypeScript scripts)

## Building and Running

### Prerequisites
*   Node.js (v22+ recommended based on `@types/node`)
*   A `.env.local` or `.env` file containing necessary API keys:
    *   `GEMINI_API_KEY`: Required for the Google GenAI integration.
    *   `SERPER_API_KEY`: Required if running the data import scripts.

### Available Commands
*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Start Development Server:**
    ```bash
    npm run dev
    ```
    Starts the Vite development server on `0.0.0.0:3000`. Note: Hot Module Replacement (HMR) might be disabled based on the `DISABLE_HMR` environment variable in `vite.config.ts`.
*   **Build for Production:**
    ```bash
    npm run build
    ```
*   **Preview Production Build:**
    ```bash
    npm run preview
    ```
*   **Type Checking / Linting:**
    ```bash
    npm run lint
    ```
    Runs TypeScript compiler (`tsc --noEmit`) to check for type errors.
*   **Clean Build Output:**
    ```bash
    npm run clean
    ```

### Data Pipeline Commands
These commands are used to fetch and process the business directory data:
*   `npm run import:serper`: Fetches business places data using the Serper API and caches it in `generated/cache/`.
*   `npm run merge:generated`: Merges the generated JSON data.
*   `npm run enrich:serper`: Enriches the fetched data.

## Development Conventions
*   **TypeScript:** The project strictly uses TypeScript for both the React frontend and the Node.js backend scripts. Ensure proper typings for new components and data structures.
*   **Component Structure:** The application separates view layouts into the `src/components/` and `src/pages/` directories.
*   **Styling:** Uses utility-first CSS with TailwindCSS. Avoid creating custom CSS files unless absolutely necessary (like the existing `src/index.css` for base directives).
*   **Data Source:** The primary source of truth for categories, cities, and hardcoded businesses is `src/data.ts`. The dynamically fetched and cached data resides in the `generated/` directory.
*   **Routing:** Utilizes `<BrowserRouter>` with animated routes wrapped in `<AnimatePresence>` for smooth transitions between pages.

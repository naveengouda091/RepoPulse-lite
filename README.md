# RepoPulse Lite

RepoPulse Lite is a lightweight repository intelligence dashboard for GitHub projects. It combines deterministic repository analysis with optional OpenAI-compatible LLM summaries to help teams review development momentum, operational risk, commit hygiene, and overall repository health.

The project is built with Next.js 15 App Router, TypeScript, Tailwind CSS, Recharts, GitHub REST API service utilities, and modular OpenAI-compatible LLM provider support. It is intentionally database-free.

## Overview

RepoPulse Lite analyzes recent GitHub commit activity and presents a concise executive dashboard. The current implementation includes:

- GitHub repository URL validation.
- GitHub commit fetching service.
- Deterministic commit complexity tiers.
- Deterministic repository health scoring.
- OpenAI-compatible LLM summary integration.
- Responsive analytics dashboard with charts.
- Friendly error states for invalid repositories, GitHub rate limits, LLM timeouts, and network failures.

## Features

- Next.js 15 App Router application.
- TypeScript-first codebase.
- Tailwind CSS UI.
- shadcn-compatible project structure.
- Recharts visualizations:
  - Tier Distribution Pie Chart.
  - Commit Complexity Bar Chart.
  - Health Score Gauge.
- GitHub REST API service for recent commit details.
- Zod-based repository URL validation.
- OpenAI-compatible LLM integration.
- Provider support for:
  - Groq.
  - OpenRouter.
  - NVIDIA NIM.
  - Custom OpenAI-compatible base URL.
- Deterministic complexity and health scoring.
- Loading skeletons, route error boundaries, retry buttons, and friendly error messages.

## Architecture

RepoPulse Lite uses a clean, layered architecture:

- `src/app`: Next.js App Router routes, loading states, and error boundaries.
- `src/components`: Presentation components and reusable dashboard UI.
- `src/lib/github`: GitHub REST API client, service, types, and errors.
- `src/lib/analysis`: Pure deterministic analysis functions.
- `src/lib/llm`: OpenAI-compatible provider config, client, prompts, parsing, and errors.
- `src/lib/validation`: Zod validation utilities.
- `src/lib/errors`: UI-facing error presentation mapping.
- `src/types`: Shared application and dashboard types.

The intended runtime flow is:

1. Validate a GitHub repository URL.
2. Resolve `owner/repository`.
3. Fetch latest commits from the GitHub REST API.
4. Fetch detailed commit information for each commit.
5. Compute complexity tiers.
6. Compute repository health score.
7. Optionally generate a JSON executive summary through an LLM provider.
8. Render the responsive executive dashboard.

## Folder Structure

```text
RepoPulse-lite/
  src/
    app/
      dashboard/
        error.tsx
        loading.tsx
        page.tsx
      error.tsx
      globals.css
      layout.tsx
      loading.tsx
      not-found.tsx
      page.tsx
    components/
      dashboard/
        AnalyticsDashboard.tsx
        ChartCard.tsx
        CommitComplexityBarChart.tsx
        DashboardError.tsx
        DashboardSkeleton.tsx
        EmptyChartState.tsx
        ErrorState.tsx
        ExecutiveSummaryCard.tsx
        HealthScoreCard.tsx
        HealthScoreGauge.tsx
        MetricCard.tsx
        RepositoryHeader.tsx
        SpecializedErrorStates.tsx
        TierCountsCard.tsx
        TierDistributionPieChart.tsx
        format.ts
    lib/
      analysis/
        complexity.ts
        health-score.ts
        index.ts
      errors/
        presentation.ts
      github/
        client.ts
        errors.ts
        index.ts
        service.ts
        types.ts
      llm/
        client.ts
        errors.ts
        index.ts
        prompts.ts
        providers.ts
        summary.ts
        types.ts
      validation/
        github-repository-url.ts
        index.ts
      utils.ts
    types/
      app-error.ts
      dashboard.ts
  spec.md
```

## Installation

Prerequisites:

- Node.js 20 or newer.
- npm.

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Variables

Create `.env.local` for local secrets when API route wiring is added.

```env
GITHUB_TOKEN=

LLM_PROVIDER=
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=

OPENROUTER_SITE_URL=
OPENROUTER_APP_NAME=
```

Variable usage:

- `GITHUB_TOKEN`: Optional GitHub token for higher API limits or private repository access when supported.
- `LLM_PROVIDER`: `groq`, `openrouter`, `nvidia-nim`, or `custom`.
- `LLM_API_KEY`: Provider API key.
- `LLM_BASE_URL`: Required for custom providers; optional override for built-in providers.
- `LLM_MODEL`: Model name passed to the OpenAI-compatible chat completions endpoint.
- `OPENROUTER_SITE_URL`: Optional OpenRouter attribution header value.
- `OPENROUTER_APP_NAME`: Optional OpenRouter attribution header value.

Never expose GitHub or LLM API keys to client components.

## Deployment

RepoPulse Lite is designed for serverless Next.js deployment.

Recommended deployment target:

- Vercel.

Deployment steps:

1. Push the repository to GitHub.
2. Import the project into the deployment platform.
3. Configure environment variables.
4. Build with:

```bash
npm run build
```

5. Start with:

```bash
npm run start
```

The app has no database, no queue, and no required persistent storage.

## AI Workflow

The LLM workflow is optional and isolated from deterministic scoring.

1. Repository metrics are computed first.
2. A compact analysis payload is sent to the selected LLM provider.
3. The prompt requires strict JSON output.
4. The response is parsed and validated with Zod.
5. Malformed JSON, timeouts, invalid API keys, and bad model names are converted into typed errors.

Required summary shape:

```json
{
  "developmentMomentum": "- One bullet point.",
  "operationalRisks": "- One bullet point.",
  "commitHygiene": "- One bullet point."
}
```

LLM output is advisory. Complexity tiers and health scores remain deterministic.

## OpenCode Usage

This project is structured to work well with OpenCode-style AI development workflows:

- Keep architecture decisions documented in `spec.md`.
- Make small, reviewable changes.
- Keep business logic in pure functions under `src/lib`.
- Keep UI components reusable and data-driven.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` after meaningful changes.
- Avoid putting secrets in prompts, logs, test fixtures, or client-side code.

Suggested workflow:

1. Ask the coding agent to inspect the relevant files first.
2. Implement one capability at a time.
3. Verify with typecheck, lint, and build.
4. Review generated UI and error states manually.
5. Commit only source files and lockfiles that are intentionally changed.

## LLM Providers

Provider configuration is handled in `src/lib/llm/providers.ts`.

Built-in providers:

| Provider | Default Base URL |
| --- | --- |
| Groq | `https://api.groq.com/openai/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |
| NVIDIA NIM | `https://integrate.api.nvidia.com/v1` |
| Custom | User-provided HTTPS base URL |

All providers use the OpenAI-compatible `/chat/completions` API shape.

Supported LLM failure handling:

- Timeout.
- Invalid API key.
- Bad model name.
- Network failure.
- Empty response.
- Malformed JSON.
- Upstream provider error.

## Complexity Algorithm

The deterministic complexity engine lives in `src/lib/analysis/complexity.ts`.

Rules:

- Tier 1:
  - Less than `50` total changes, or
  - Documentation-only changes.
- Tier 2:
  - `50-250` total changes, and
  - Fewer than `5` modified files.
- Tier 3:
  - More than `250` total changes, or
  - More than `5` modified files.

Each result includes:

- `tier`
- `reason`
- `summary`

The engine is pure TypeScript and unit-test friendly.

## Health Score

The deterministic health score engine lives in `src/lib/analysis/health-score.ts`.

Output:

- `score`: `0-100`
- `grade`: `A`, `B`, `C`, `D`, or `F`
- `breakdown`: factor-level scores and reasons

Formula:

```text
score =
  tierDistribution.score * 0.30 +
  commitFrequency.score * 0.20 +
  documentationCommits.score * 0.15 +
  largeRiskyCommits.score * 0.20 +
  recentActivity.score * 0.15
```

Factors:

- Tier counts and tier distribution.
- Commit frequency.
- Documentation commits.
- Large risky commits.
- Recent activity.

The algorithm does not use randomness or LLM output.

## Known Limitations

- Full API route orchestration is not wired yet.
- The dashboard currently renders sample data.
- Repository metadata fetching for stars and forks is not fully connected to GitHub service output yet.
- No database or historical trend storage exists.
- No GitHub webhook support.
- No repository cloning or static code analysis.
- No authentication UI.
- No automated test suite has been added yet.
- LLM summaries depend on provider availability and model JSON compliance.

## Future Improvements

- Implement `POST /api/analyze` end-to-end.
- Add repository input form.
- Fetch repository metadata, stars, forks, issues, pull requests, releases, and contributors.
- Add unit tests for validation, GitHub service, complexity, health score, and LLM parsing.
- Add integration tests with mocked GitHub and LLM providers.
- Add configurable scoring weights.
- Add export to PDF.
- Add multi-repository comparison.
- Add optional caching.
- Add GitHub App authentication.
- Add deeper static analysis through repository cloning.
- Add historical trend charts.

## Contributing

Contributions should preserve the project's core constraints:

- No database unless explicitly introduced as a planned feature.
- Keep deterministic logic independent from LLM output.
- Keep provider integrations modular.
- Keep business logic reusable and testable.
- Keep UI components responsive and accessible.
- Avoid unnecessary dependencies.

Before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run build
```

## License

No license has been selected yet. Add a `LICENSE` file before distributing or accepting external contributions.

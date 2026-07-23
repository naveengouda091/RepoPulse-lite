# RepoPulse Lite Architecture Specification

## 1. Project Overview

RepoPulse Lite is a lightweight repository intelligence dashboard that analyzes public or token-accessible GitHub repositories without storing data in a database. It uses the GitHub REST API to collect repository, commit, pull request, issue, and contributor signals, then applies deterministic scoring plus optional OpenAI-compatible LLM summarization to produce an executive dashboard.

The application is built with Next.js 15 App Router, TypeScript, Tailwind CSS, and API Routes. All repository analysis is computed on demand and returned to the browser without persistent server-side storage.

## 2. Project Goals

- Provide a fast, readable executive view of repository health.
- Estimate engineering activity, delivery risk, and maintenance quality from GitHub metadata.
- Score commit complexity using deterministic heuristics that do not require cloning the repository.
- Support multiple OpenAI-compatible LLM providers for summaries and recommendations.
- Avoid database operations, migrations, background workers, and persistent application state.
- Keep deployment simple enough for serverless hosting.

## 3. Scope

### In Scope

- Next.js 15 App Router application.
- TypeScript throughout the application.
- Tailwind CSS for styling.
- API Routes for all server-side integrations.
- GitHub REST API integration.
- OpenAI-compatible chat completion integration.
- Provider support for Groq, NVIDIA NIM, OpenRouter, and custom base URLs.
- Repository health score.
- Commit complexity engine.
- Executive dashboard.
- Stateless request-response architecture.

### Out of Scope

- Database persistence.
- Git repository cloning.
- GitHub webhook ingestion.
- Long-running background jobs.
- Organization-wide historical warehousing.
- User accounts managed by the application.
- Payment, billing, or tenant administration.

## 4. Functional Requirements

### 4.1 Repository Input

- Allow users to enter a GitHub repository URL or `owner/repo` identifier.
- Validate and normalize repository input before API requests.
- Support public repositories without a GitHub token.
- Support private or higher-rate-limit access when a GitHub token is configured server-side.

### 4.2 Repository Analysis

The system must retrieve and analyze:

- Repository metadata.
- Default branch.
- Recent commits.
- Pull requests.
- Issues.
- Contributors.
- Languages.
- Release metadata when available.
- README presence.
- License presence.

### 4.3 Health Score

- Produce a health score from `0` to `100`.
- Display the score with a rating label:
  - `85-100`: Excellent
  - `70-84`: Healthy
  - `50-69`: Watch
  - `30-49`: At Risk
  - `0-29`: Critical
- Include component-level score breakdowns.
- Explain the most important positive and negative drivers.

### 4.4 Commit Complexity Engine

- Analyze recent commits using GitHub REST API commit metadata.
- Estimate complexity without repository cloning.
- Score each commit from `0` to `100`.
- Classify commits as:
  - `0-24`: Trivial
  - `25-49`: Low
  - `50-74`: Moderate
  - `75-100`: High
- Aggregate commit complexity into repository-level complexity metrics.

### 4.5 Executive Dashboard

The dashboard must include:

- Repository identity and basic metadata.
- Health score summary.
- Activity trend summary.
- Commit complexity summary.
- Pull request and issue signals.
- Contributor activity.
- Risk indicators.
- LLM-generated executive summary when an LLM provider is configured.
- Clear loading, empty, and error states.

### 4.6 LLM Provider Support

The system must support OpenAI-compatible chat completion APIs through:

- Groq.
- NVIDIA NIM.
- OpenRouter.
- Custom base URL.

Provider configuration must include:

- Provider type.
- API key.
- Base URL.
- Model name.
- Optional default headers.

LLM usage must be optional. The dashboard must still work when no LLM provider is configured.

## 5. Non-Functional Requirements

### Performance

- First dashboard result should return within reasonable serverless limits for typical repositories.
- API requests should be parallelized where safe.
- GitHub pagination should be bounded.
- LLM summaries should use compact prompts and capped token output.

### Reliability

- GitHub and LLM provider failures must be isolated.
- Deterministic scores must still render when LLM calls fail.
- Partial data should produce a partial dashboard with warnings rather than a total failure whenever possible.

### Maintainability

- Domain logic must be separated from UI components and API route handlers.
- Scoring algorithms must be implemented as pure functions.
- Provider-specific LLM differences must be isolated behind a common interface.
- Types must be shared between API handlers, domain services, and UI consumers.

### Usability

- Dashboard information must be dense, scannable, and executive-friendly.
- Technical details should be available without overwhelming the primary view.
- Errors should be actionable and written in plain language.

### Portability

- The app must run locally with standard Node.js tooling.
- The app must be deployable to serverless Next.js platforms such as Vercel.
- No external database, queue, cache, or storage service is required.

## 6. Technology Stack

- Framework: Next.js 15 App Router.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Server integration: Next.js API Routes / Route Handlers.
- External source data: GitHub REST API.
- AI providers: OpenAI-compatible chat completion APIs.
- Runtime: Node.js runtime for API routes.
- Package manager: npm, pnpm, yarn, or bun, selected by project preference.

## 7. Folder Structure

```text
repo-pulse-lite/
  app/
    layout.tsx
    page.tsx
    globals.css
    dashboard/
      page.tsx
    api/
      analyze/
        route.ts
      llm/
        summarize/
          route.ts
      health/
        route.ts
  components/
    dashboard/
      ExecutiveDashboard.tsx
      HealthScoreCard.tsx
      ComplexityPanel.tsx
      ActivityOverview.tsx
      ContributorSummary.tsx
      RiskIndicators.tsx
      ExecutiveSummary.tsx
    forms/
      RepositoryInput.tsx
      ProviderSettings.tsx
    ui/
      Badge.tsx
      Button.tsx
      Card.tsx
      ErrorState.tsx
      LoadingState.tsx
      MetricTile.tsx
  lib/
    github/
      client.ts
      endpoints.ts
      normalize-repo.ts
      types.ts
    llm/
      client.ts
      providers.ts
      prompts.ts
      types.ts
    analysis/
      collect-repository-data.ts
      complexity.ts
      health-score.ts
      risk.ts
      trends.ts
      types.ts
    validation/
      env.ts
      request.ts
    errors/
      app-error.ts
      map-error.ts
  hooks/
    useRepositoryAnalysis.ts
  types/
    api.ts
    dashboard.ts
  tests/
    unit/
      complexity.test.ts
      health-score.test.ts
      normalize-repo.test.ts
    integration/
      analyze-route.test.ts
  public/
  spec.md
```

## 8. Data Flow

1. User enters a GitHub repository URL or `owner/repo`.
2. Client validates basic input format.
3. Client sends an analysis request to `POST /api/analyze`.
4. API route validates and normalizes the repository identifier.
5. Server fetches bounded repository data from the GitHub REST API.
6. Analysis services compute:
   - Commit complexity.
   - Activity metrics.
   - Risk indicators.
   - Health score.
7. If LLM configuration is available, the server requests an executive summary from the selected provider.
8. API returns a normalized dashboard payload.
9. Client renders the dashboard with score cards, charts, summaries, and warnings.

## 9. Component Hierarchy

```text
AppLayout
  HomePage
    RepositoryInput
    ProviderSettings
    ExecutiveDashboard
      HealthScoreCard
      ActivityOverview
      ComplexityPanel
      ContributorSummary
      RiskIndicators
      ExecutiveSummary
      ErrorState
      LoadingState
```

### Component Responsibilities

- `RepositoryInput`: Accepts and validates repository input.
- `ProviderSettings`: Allows runtime selection of provider settings when supported by the product mode.
- `ExecutiveDashboard`: Owns the dashboard layout and receives normalized analysis data.
- `HealthScoreCard`: Displays total score, rating label, and component scores.
- `ComplexityPanel`: Displays average complexity, high-complexity commits, and trends.
- `ActivityOverview`: Displays commits, pull requests, issues, releases, and freshness indicators.
- `ContributorSummary`: Displays contributor count and concentration risk.
- `RiskIndicators`: Displays actionable repository risks.
- `ExecutiveSummary`: Displays LLM-generated summary or deterministic fallback summary.

## 10. API Design

### 10.1 `POST /api/analyze`

Primary endpoint for dashboard generation.

Request body:

```json
{
  "repository": "owner/repo",
  "includeLlmSummary": true,
  "provider": "groq",
  "model": "llama-3.1-70b-versatile"
}
```

Response body:

```json
{
  "repository": {
    "owner": "owner",
    "name": "repo",
    "url": "https://github.com/owner/repo",
    "defaultBranch": "main"
  },
  "health": {
    "score": 82,
    "label": "Healthy",
    "breakdown": {}
  },
  "complexity": {
    "average": 41,
    "classification": "Low",
    "highComplexityCommitCount": 3
  },
  "activity": {},
  "risks": [],
  "summary": {
    "text": "Repository is healthy with moderate delivery risk.",
    "source": "llm"
  },
  "warnings": []
}
```

### 10.2 `POST /api/llm/summarize`

Optional endpoint for summary generation when separated from repository analysis.

Request body:

```json
{
  "provider": "openrouter",
  "model": "openai/gpt-4o-mini",
  "analysis": {}
}
```

Response body:

```json
{
  "summary": "Executive summary text.",
  "provider": "openrouter",
  "model": "openai/gpt-4o-mini"
}
```

### 10.3 `GET /api/health`

Operational health endpoint.

Response body:

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

## 11. Validation Rules

### Repository Input

- Must be a GitHub URL or `owner/repo`.
- Owner and repository names must contain only valid GitHub name characters.
- Owner and repository names must not be empty.
- Repository URL must use `https://github.com`.
- Query strings and fragments must be stripped from URLs.

### API Request

- Request body must be valid JSON.
- `repository` is required.
- `includeLlmSummary` defaults to `false`.
- `provider` is required only when `includeLlmSummary` is `true` and no default provider is configured.
- `model` is required only when `includeLlmSummary` is `true` and no default model is configured.

### Provider Configuration

- Provider must be one of `groq`, `nvidia-nim`, `openrouter`, or `custom`.
- API key must never be sent back to the client.
- Base URL must use HTTPS unless local development explicitly allows HTTP.
- Custom base URL must be a valid absolute URL.
- Model name must be a non-empty string.

### Analysis Bounds

- Maximum commits analyzed: 100.
- Maximum pull requests analyzed: 100.
- Maximum issues analyzed: 100.
- Maximum contributors analyzed: 100.
- LLM prompt payload must be summarized before sending and must not include raw secrets.

## 12. Error Handling

### Error Categories

- `VALIDATION_ERROR`: Invalid user input or request body.
- `GITHUB_NOT_FOUND`: Repository does not exist or is inaccessible.
- `GITHUB_RATE_LIMITED`: GitHub API rate limit exceeded.
- `GITHUB_AUTH_FAILED`: Invalid or missing GitHub token for requested repository.
- `GITHUB_UPSTREAM_ERROR`: GitHub returned an unexpected failure.
- `LLM_CONFIG_ERROR`: Missing or invalid provider configuration.
- `LLM_UPSTREAM_ERROR`: LLM provider failed or timed out.
- `ANALYSIS_ERROR`: Internal analysis failure.

### Handling Rules

- Return `400` for validation errors.
- Return `401` for authentication failures.
- Return `403` for rate limits or forbidden GitHub access.
- Return `404` for inaccessible repositories.
- Return `502` for upstream provider failures.
- Return `500` for unexpected server errors.
- Include a stable error code in every error response.
- Do not expose raw provider responses, stack traces, tokens, or secrets.
- Use partial responses with warnings when non-critical data cannot be fetched.

Example error response:

```json
{
  "error": {
    "code": "GITHUB_RATE_LIMITED",
    "message": "GitHub rate limit was exceeded. Configure a GitHub token or try again later."
  }
}
```

## 13. Security Considerations

- Store provider API keys only in environment variables or secure server-side configuration.
- Never expose GitHub tokens or LLM provider keys to the browser.
- Execute all GitHub and LLM requests from server-side API routes.
- Validate custom base URLs to reduce server-side request forgery risk.
- Restrict custom base URLs to HTTPS in production.
- Apply request size limits.
- Apply timeouts to GitHub and LLM requests.
- Avoid logging secrets, authorization headers, raw prompts containing sensitive metadata, or raw provider responses.
- Sanitize LLM output before rendering.
- Treat all repository content and metadata as untrusted input.
- Use least-privilege GitHub tokens.
- Do not persist repository analysis unless a future storage feature is explicitly introduced.

## 14. Commit Complexity Algorithm

The Commit Complexity Engine estimates implementation complexity from GitHub REST API commit data.

### Inputs

For each commit:

- Files changed.
- Lines added.
- Lines deleted.
- Total changes.
- File statuses.
- File extensions.
- Commit message.
- Parent count.

### Per-Commit Score

Each commit receives a score from `0` to `100`:

```text
score =
  fileImpactScore * 0.25 +
  changeVolumeScore * 0.25 +
  structuralRiskScore * 0.20 +
  semanticSignalScore * 0.15 +
  breadthScore * 0.15
```

### Factors

#### File Impact Score

- More changed files increase complexity.
- Changes to configuration, build, dependency, authentication, routing, API, or infrastructure files receive higher weight.
- Test-only or documentation-only changes receive lower weight.

#### Change Volume Score

- Based on additions plus deletions.
- Small changes score low.
- Very large diffs saturate at high complexity.
- Deletions are treated as meaningful complexity, not ignored.

#### Structural Risk Score

Increases when a commit includes:

- Renamed files.
- Removed files.
- Dependency manifest changes.
- Lockfile changes.
- Framework configuration changes.
- API route changes.
- Authentication or authorization changes.
- Multiple parent commits.

#### Semantic Signal Score

Uses commit message signals:

- Higher risk terms: `refactor`, `migration`, `breaking`, `rewrite`, `security`, `auth`, `schema`, `architecture`.
- Medium risk terms: `optimize`, `upgrade`, `integrate`, `replace`, `deprecate`.
- Lower risk terms: `docs`, `typo`, `style`, `format`, `chore`.

#### Breadth Score

Measures how many logical areas are touched:

- UI components.
- API routes.
- Domain logic.
- Configuration.
- Tests.
- Documentation.
- Styling.
- Build and deployment files.

### Repository-Level Complexity

Repository complexity is computed from recent commits:

```text
averageComplexity = mean(commitScores)
weightedComplexity = recentCommitWeightedMean(commitScores)
highComplexityRatio = highComplexityCommits / analyzedCommits
```

Recent commits receive greater weight than older commits.

## 15. Health Score Algorithm

The health score is a deterministic weighted score from `0` to `100`.

```text
healthScore =
  activityScore * 0.20 +
  maintenanceScore * 0.20 +
  collaborationScore * 0.15 +
  complexityScore * 0.15 +
  reliabilityScore * 0.15 +
  governanceScore * 0.15
```

### Activity Score

Signals:

- Recent commits.
- Recent pull requests.
- Recent issue activity.
- Release freshness.
- Default branch activity.

Repositories with no recent activity receive lower scores unless they are clearly stable and low-maintenance.

### Maintenance Score

Signals:

- Open issue count relative to repository size.
- Stale issue ratio.
- Stale pull request ratio.
- Time since last release.
- README presence.
- Dependency file update activity.

### Collaboration Score

Signals:

- Active contributor count.
- Contributor concentration.
- Pull request review activity when available.
- Ratio of merged to abandoned pull requests.

High dependence on one contributor lowers the score.

### Complexity Score

Signals:

- Average commit complexity.
- High-complexity commit ratio.
- Recent complexity trend.
- Frequency of risky structural changes.

Higher complexity lowers this component score.

### Reliability Score

Signals:

- Test file presence.
- CI configuration presence.
- Release consistency.
- Failed-risk indicators from commit messages.
- Bugfix-heavy activity patterns.

### Governance Score

Signals:

- License presence.
- README presence.
- Code of conduct presence when available.
- Security policy presence when available.
- Issue and pull request templates when available.

### Score Normalization

- All component scores are clamped between `0` and `100`.
- Missing optional data should reduce confidence before it severely reduces score.
- The response must include warnings for missing or inaccessible data.
- The final score is rounded to the nearest integer.

## 16. LLM Architecture

### Provider Abstraction

All providers must implement a common chat completion interface:

- `baseUrl`.
- `apiKey`.
- `model`.
- `headers`.
- `messages`.
- `temperature`.
- `maxTokens`.

### Provider Defaults

- Groq: OpenAI-compatible endpoint using Groq base URL.
- NVIDIA NIM: OpenAI-compatible endpoint using NVIDIA-hosted NIM base URL.
- OpenRouter: OpenAI-compatible endpoint using OpenRouter base URL and optional routing headers.
- Custom: User-supplied HTTPS base URL.

### Prompting Rules

- Send summarized metrics, not raw large GitHub payloads.
- Ask for concise executive language.
- Require the model to avoid unsupported claims.
- Include deterministic score values and risk signals.
- Treat LLM output as advisory, not authoritative.

## 17. Deployment Architecture

### Runtime Topology

```text
Browser
  -> Next.js App Router UI
  -> Next.js API Routes
  -> GitHub REST API
  -> Optional OpenAI-compatible LLM Provider
```

### Environment Variables

Recommended variables:

```text
GITHUB_TOKEN=
LLM_PROVIDER=
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=
OPENROUTER_SITE_URL=
OPENROUTER_APP_NAME=
```

### Serverless Deployment

- Deploy the Next.js application to a serverless-compatible platform.
- Configure all secrets as deployment environment variables.
- Use Node.js runtime for API routes that call external APIs.
- Set conservative request timeouts.
- Keep analysis bounded to avoid serverless execution timeouts.

### Local Development

- Run the Next.js development server locally.
- Use `.env.local` for local secrets.
- Public repository analysis should work without secrets, subject to GitHub rate limits.

## 18. Testing Strategy

### Unit Tests

Cover:

- Repository input normalization.
- Request validation.
- Commit complexity scoring.
- Health score scoring.
- Risk indicator generation.
- Provider URL validation.
- Error mapping.

### Integration Tests

Cover:

- `POST /api/analyze` with mocked GitHub responses.
- LLM summary generation with mocked provider responses.
- Partial GitHub failures.
- Rate limit handling.
- Invalid repository handling.

### UI Tests

Cover:

- Repository input states.
- Dashboard rendering.
- Loading states.
- Empty states.
- Error states.
- Partial-data warning states.

### Contract Tests

Cover:

- API response shape.
- Error response shape.
- Provider client request format.

### Manual QA

Use representative repositories:

- Small inactive repository.
- Active library repository.
- Repository with many open issues.
- Repository with high commit churn.
- Repository with no releases.
- Repository with sparse metadata.

## 19. Future Improvements

- Add optional persistence for historical trend analysis.
- Add GitHub App authentication.
- Add organization-level portfolio dashboards.
- Add webhook-based refreshes.
- Add background analysis jobs for large repositories.
- Add repository cloning for deeper static analysis.
- Add dependency vulnerability analysis.
- Add test coverage detection from CI artifacts.
- Add pull request review quality scoring.
- Add configurable scoring weights.
- Add export to PDF or presentation format.
- Add caching layer for GitHub API responses.
- Add multi-repository comparison.
- Add role-specific dashboard views for executives, engineering managers, and maintainers.

## 20. Architectural Principles

- Keep deterministic analysis usable without AI.
- Keep provider integrations replaceable.
- Keep request scope bounded.
- Prefer explicit warnings over hidden assumptions.
- Avoid persistence until the product has a clear history or collaboration requirement.
- Make scores explainable enough that users can challenge and tune them.

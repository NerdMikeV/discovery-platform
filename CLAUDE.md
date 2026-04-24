# Claris Discovery Platform

## Instructions for AI Agents
<!-- DO NOT DELETE THIS SECTION — it tells AI agents how to maintain this document -->
When you finish a coding session, update this document before your final commit:
- Move any tasks you completed from "In-Progress Work" to "Recent Changes" with today's date, your branch name, and a brief summary of what you did
- If you discovered a bug or issue during your session, add it to "Active Issues" with the appropriate severity
- If you made an architectural decision (chose a library, established a pattern, changed a convention), add it to "Recent Decisions"
- If you encountered something that would trip up the next person working on this project, add it to "Known Gotchas"
- Always include the branch name in your Recent Changes entries, e.g. "Apr 20 (staging): Fixed SFTP retry logic"
- Do NOT modify Quick Reference or Architecture sections unless you made structural changes to the project
- Do NOT remove entries from Recent Changes — it is append-only (newest at top)
- Keep this document under 500 lines. If Recent Changes grows beyond 30 entries, remove the oldest ones.

## Quick Reference
<!-- Maintained by: Claris OS (auto-generated) and humans (manual edits) -->
- **What**: AI-powered assessment platform for evaluating organizational AI readiness across 5 dimensions
- **Stack**: Vite + React frontend, Express proxy backend, Anthropic Claude API, Supabase (PostgreSQL)
- **Repo**: NerdMikeV/discovery-platform
- **Deploy**: Railway (auto-deploy from main branch)
- **URLs**: https://discovery-platform.claris-ai.com
- **Key People**: Michael Vestal (Technical Founder)
- **Last context sync**: 2026-04-07 04:30 UTC

## Current State
<!-- Maintained by: Claris OS auto-updater ONLY — do not edit manually -->
<!-- This section is regenerated from the Claris OS database whenever tasks, issues, or builds change -->

### Active Issues
- No open issues

### In-Progress Work
- Nothing currently in progress

### Pending To-Dos
- Save/resume functionality (enter email to save progress, resume later)
- Company Profile auto-research module
- Assessment Dashboard UI (view all assessments, completion status, trigger reports)

### Pending Tests
- No tasks awaiting testing

## Recent Changes
<!-- Maintained by: Claude Code sessions (append new entries at top) -->
<!-- Format: "- {date} ({branch}): {who} — {what was done}" -->
<!-- Newest entries at top. Keep max 30 entries. -->

- 2026-04-07 (main): Claude Code — Added Supabase integration to save assessment results. Created AssessmentContext for shared state across tools with sessionStorage persistence. Added 6 API endpoints for creating assessments and saving results from all 4 tools.
- 2026-04-07 (main): Claude Code — Added Stakeholder Discovery as 5th card on home page (external link to discovery.claris-ai.com)
- 2026-04-06 (main): Claude Code — Fixed 429 rate limit issues by adding 60-second delays between API calls. Fixed Express catch-all route compatibility. Deployed to Railway with custom domain.
- 2026-04-06 (main): Claude Code — Built Employee Pulse v2 with new fulfillment questions
- 2026-04-06 (main): Claude Code — Built Vendor AI Scan v2 with Planning & Allocation, LMS, TMS categories, thinking chain log
- 2026-04-06 (main): Claude Code — Built Competitive Intelligence v2 with 3-step flow, auto-discovery, terminal-style thinking chain

## Recent Decisions
<!-- Maintained by: Both Claris OS (from decisions table) and Claude Code (from session discoveries) -->

- **2026-04-07**: Use sessionStorage via AssessmentContext to link all tools to the same assessment within a browser session. Fire-and-forget saves to Supabase (don't block UI on save failures).
- **2026-04-06**: Use claude-opus-4-5-20251101 for production quality research (not claude-opus-4-5-20250514 which returns 404)
- **2026-04-06**: Add 60-second delays between Claude API calls to avoid 30k token/minute org rate limit

## Architecture & Patterns
<!-- Maintained by: Humans and Claude Code (only on structural changes) -->

### Project Structure
- **NerdMikeV/discovery-platform** — https://github.com/NerdMikeV/discovery-platform (default branch: `main`)
├── src/
│   ├── pages/
│   │   ├── Home.jsx                    # Landing page with 5 tool cards
│   │   ├── ExecutiveIntake.jsx         # Form for org constraints, goals, AI philosophy
│   │   ├── CompetitiveIntelligence.jsx # AI-powered competitor research
│   │   ├── VendorAIScan.jsx            # AI-powered vendor capability analysis
│   │   └── EmployeePulse.jsx           # Anonymous employee AI sentiment survey
│   ├── context/
│   │   └── AssessmentContext.jsx       # Manages assessmentId across tools via sessionStorage
│   └── App.jsx                         # Routes wrapped with AssessmentProvider
├── server/
│   └── proxy.js                        # Express server - proxies /api/anthropic to Claude API, serves static dist/, handles Supabase endpoints
├── vite.config.js                      # Dev proxy for /api routes
└── package.json

### Coding Conventions
- React functional components with hooks
- Tailwind CSS for styling
- JSONB for storing complex responses in Supabase
- Fire-and-forget pattern for Supabase saves (log errors, don't block UI)

### Known Gotchas
<!-- Maintained by: Claude Code (adds gotchas discovered during sessions) -->
- **Model string**: Use `claude-opus-4-5-20251101` not `claude-opus-4-5-20250514` (404 error)
- **Rate limits**: Anthropic org limit is 30k input tokens/minute. Add 60-second delays between research calls. 5-competitor analysis takes ~5-6 minutes.
- **Express catch-all**: Use `app.use()` not `app.get('*')` for serving static files in newer Express versions
- **Node version**: Must use Node 18+ (use nvm if needed)
- **Dropbox + Git**: Git operations in Dropbox folders can hit lock file conflicts. Run git commands directly in Terminal if Claude Code has issues.

### Environment Variables
- `ANTHROPIC_API_KEY` — Claude API key
- `ANTHROPIC_MODEL` — Model to use (claude-opus-4-5-20251101)
- `PORT` — Server port (3003)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon/public key

### Supabase Tables
```sql
assessments (parent table)
├── id (uuid), company_name, industry, company_size, status, created_at, completed_at

executive_intake
├── id, assessment_id (fk), respondent_name, respondent_role, responses (jsonb), created_at

competitive_intel
├── id, assessment_id (fk), company_name, industry, competitors (jsonb), synthesis (jsonb), created_at

vendor_scan
├── id, assessment_id (fk), vendors (jsonb), synthesis (jsonb), created_at

employee_pulse
├── id, assessment_id (fk), responses (jsonb), created_at

company_profiles (future - auto-researched context)
├── id, assessment_id (fk), company_name, research (jsonb), sources (jsonb), created_at

interviews (existing - from Voice Discovery, optional link)
├── assessment_id (uuid, nullable fk)
```

## History
<!-- Maintained by: Claris OS (major milestones from builds/deploys) -->
<!-- Append-only, newest at top -->

- 2026-04-07: Supabase integration deployed — all 4 tools now save results
- 2026-04-06: Initial deployment to Railway with custom domain discovery-platform.claris-ai.com
- 2026-04-06: Built all 5 assessment tools (Executive Intake, Competitive Intelligence v2, Vendor AI Scan v2, Employee Pulse v2, Stakeholder Discovery link)


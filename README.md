# LogLens AI

LogLens AI is a full-stack bug triage dashboard that helps developers turn logs, stack traces, and bug reports into organized engineering reports.

The app is built around a common workflow: something breaks, a developer pastes the error details, and the system helps summarize what happened, how serious it is, what likely caused it, and what steps should be taken next.

## Features

- Analyze logs, stack traces, and bug reports
- Generate structured triage reports with:
  - Summary
  - Severity
  - Category
  - Likely root cause
  - Affected component
  - Suggested fix
  - Debugging steps
  - Tests to add
  - Confidence score
- Save analyzed issues to Supabase
- View saved issues in a dashboard
- Search and filter issue history
- Update issue status
- Copy a saved report as Markdown
- Delete saved issues
- User authentication with Supabase
- User-scoped database access with Row Level Security
- Dashboard metrics and severity chart

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React
- Supabase JavaScript client

### Backend

- Python
- Flask
- Flask-CORS
- python-dotenv
- Requests
- Google Gemini API

### Database and Auth

- Supabase Auth
- Supabase PostgreSQL
- Row Level Security

## How It Works

1. A user signs in with Supabase Auth.
2. The user enters an issue title, environment, tech stack, and raw error details.
3. The React frontend sends the issue details to the Flask backend.
4. The backend sends the issue context to Gemini and receives a structured triage report.
5. The frontend displays the report.
6. The user can save the issue and analysis to Supabase.
7. Saved issues appear in the dashboard, issue history, and issue detail pages.
8. Users can update status, copy the report as Markdown, or delete the issue.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/loglens-ai.git
cd loglens-ai
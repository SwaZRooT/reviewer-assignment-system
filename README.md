# Reviewer Assignment System (DBMS Level 3 Project)

This project automates the assignment of research papers to peer reviewers using vector-based semantic search, while enforcing workload caps and blocking conflicts of interest. 

## Technology Stack
* **Frontend/Backend:** Next.js (TypeScript, Tailwind CSS)
* **Database:** PostgreSQL with `pgvector`
* **AI Embeddings:** HuggingFace `all-MiniLM-L6-v2` via `@xenova/transformers`

## Setup Instructions

1. **Install Dependencies:**
   Run `npm install` in the project root.
2. **Database Setup:**
   Ensure PostgreSQL is installed with the `pgvector` extension (the `pgcrypto` extension that ships with PostgreSQL is also used).
   Create a database named `reviewer_db`.
3. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in real values:
   ```
   DATABASE_URL="postgres://username:password@localhost:5432/reviewer_db"
   SESSION_SECRET="<output of: openssl rand -base64 32>"
   ```
   `.env` is git-ignored and must never be committed.
4. **Initialize Database:**
   Run `psql "$DATABASE_URL" -f schema.sql` to create tables, triggers, views and seed users.
   The script drops and recreates everything, so re-running it wipes existing data.
5. **Run the Application:**
   Run `npm run dev` and open `http://localhost:3000`. You are sent to the login page.
6. **First run (admin):** log in as an admin and click **1. Initialize AI Embeddings** once (downloads the model, needs internet).

## Authentication and Authorization

* **Login** with email and password. Passwords are stored only as **bcrypt hashes**, and the database `CHECK` constraint on `users.password_hash` rejects anything that is not a bcrypt hash.
* **Sessions** are signed JWTs (`jose`, HS256) in an `httpOnly`, `SameSite=Lax` cookie, valid for 8 hours. The signing key comes from `SESSION_SECRET`, with no hard-coded fallback.
* **Registration** is open for `author` and `reviewer` only. Admin accounts cannot be created from the website.
* **Rate limiting:** 5 failed logins per email and IP in 15 minutes, then HTTP 429.
* **Authorization is enforced twice:** in `proxy.ts` (pages and API calls without a valid session are redirected or get 401) and inside each API route with `requireRole(...)` (wrong role gets 403).

| Role | What they can do |
|------|------------------|
| Admin | See all papers, generate embeddings, find candidate reviewers, assign reviewers |
| Author | Submit papers, see only their own papers and how many reviewers are assigned |
| Reviewer | See only their own assignments, mark them completed or declined (frees a workload slot via a trigger) |

### Demo accounts (created by `schema.sql`, password for all: `Password@123`)

| Email | Role |
|-------|------|
| admin1@pes.edu, admin2@pes.edu | admin |
| alan@pes.edu, ada@pes.edu | reviewer |
| alice@pes.edu | author |

Change these passwords before using the system for anything real.

## Documentation
- [ER Diagram and Relational Schema](docs/ER_Diagram_and_Relational_Schema.pdf)

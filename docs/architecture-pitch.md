# Vantage SA — Architecture for Pitch Deck

## 5-step user journey (exactly 5 steps)
1. **Graduate signs in** and uploads a CV to import declared skills.
2. **Aptitude game** produces a cognitive score (accuracy-based, 0–100).
3. **Micro-tasks verify skills** and generate an HMAC proof hash per verified skill.
4. **Vantage Digital Passport** is generated as an A4 PDF with VPS + verified proofs.
5. **Employer portal** shows ROI estimates and a filterable talent pool for hiring.

## Architect’s summary (3 sentences)
Vantage SA is a modular monolith built in Next.js, where pages and API routes live in one codebase and share a single Postgres database via Prisma. Graduates earn a composite VPS (Trust Score) from an aptitude score plus verified skill ratio, and each verified skill is stamped with an HMAC hash to make the proof tamper-evident. Employers see the business case immediately through an ROI calculator (Section 12H + B-BBEE estimate) and can export a passport PDF per candidate.

## 5 architecture highlights (max 15 words each)
- Single Next.js app: UI + API route handlers, fewer moving parts.
- VPS is a composite score: aptitude + verified skill ratio (0–100).
- HMAC proof hashes simulate immutability without a blockchain dependency.
- Employer ROI uses canonical formulas with clear “estimates only” disclaimers.
- Deploys to Vercel with Postgres (Neon/Railway) and Sentry monitoring.

## Data flow (CV → Passport)
- CV upload → parse skills (Affinda if configured; safe fallback otherwise).
- Skills saved as `Skill(isVerified=false)` for the graduate.
- Micro-task submission → server verification → `MicroTask.isVerified=true`.
- Verified skill updated: `Skill.isVerified=true` + `Skill.proofHash=HMAC(...)`.
- Passport PDF generated on-demand with VPS + verified skills and proof hashes.

## Deployment architecture
- **Frontend + API**: Vercel (Next.js App Router + Route Handlers)
- **Database**: Postgres (Neon/Railway/local)
- **Observability**: Sentry (client/server/edge)

## Why it scales (100,000 users without rebuild)
- Stateless Next.js app scales horizontally behind Vercel’s edge network.
- Prisma + Postgres handle relational workloads; add indexes/connection pooling as needed.
- Compute-heavy operations are bounded (small CV parse, simple verification, PDF generation).

## ASCII diagram
```
 Graduate Browser                 Employer Browser
        |                                |
        |  Next.js App Router UI         |  Next.js App Router UI
        +--------------+-----------------+
                       |
                       v
             Next.js Route Handlers (/app/api/*)
                |      |        |        |
                |      |        |        +--> Sentry (errors/traces)
                |      |        |
                |      |        +--> PDF Generator (@react-pdf/renderer)
                |      |
                |      +--> CV Parse (Affinda API if key set; fallback otherwise)
                |
                v
           PostgreSQL (Neon/Railway/local)
              | User, Skill, MicroTask, BbeeLog
              +--> HMAC proofs stored in Skill.proofHash
```


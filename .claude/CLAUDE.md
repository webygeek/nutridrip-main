# NutriDrip — Claude Code Rules

## CRITICAL: Don't Break Working Features

### Before editing ANY file:
1. Read the FULL file first — understand all imports, exports, and references
2. Note every import at the top of the file — these MUST NOT be removed
3. Note every export — these MUST NOT change signatures

### After editing ANY file:
1. Verify all imports still exist — grep for every imported name to confirm it's still used
2. If you removed code, check nothing else references it
3. Rebuild Docker: `docker build -t nutridrip . && docker rm -f nutridrip-app && docker run -d --name nutridrip-app -p 3001:3000 nutridrip`
4. Verify at http://localhost:3001

### NEVER do these:
- Never have 2 agents edit the SAME file simultaneously — one will overwrite the other
- Never rewrite an entire file when you only need to add/change a few lines — use surgical Edit tool
- Never delete import lines unless you're 100% sure the imported name is unused
- Never rename exports without updating all consumers

## Stack

- **Framework**: Next.js 16 (App Router) — `src/app/` is the route root
- **Language**: TypeScript + React 19
- **Styling**: Tailwind CSS v4 + CSS custom properties in `src/app/globals.css`
- **ORM**: Prisma 5 + better-sqlite3 (SQLite in dev)
- **Auth**: `src/lib/auth.ts` — role-based (`admin`, `doctor`, `nurse`, `patient`, `clinic`)
- **Deploy**: Docker → port 3001 externally, 3000 internally

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + Nav + Footer
│   ├── globals.css             # Design tokens (CSS vars)
│   ├── dashboard/
│   │   ├── admin/              # Admin dashboard + studio
│   │   ├── doctor/             # Doctor dashboard + QuizPanel
│   │   ├── nurse/              # Nurse dashboard + order view
│   │   ├── clinic/             # Clinic dashboard
│   │   └── patient/            # Patient dashboard
│   ├── health-quiz/            # Patient-facing quiz (9 sections)
│   ├── treatments/             # Treatment listing + [slug] detail
│   └── login/                  # Auth page
├── components/
│   ├── dashboard/DashLayout.tsx # Shared dashboard shell + StatCard
│   └── layout/                  # Nav, Footer, MobileTabBar, CustomCursor
└── lib/
    ├── auth.ts                  # Role resolution
    ├── db.ts                    # Prisma client
    ├── content-store.ts
    └── data/                    # All mock/static data
        ├── dashboard-mock.ts    # DEMO_PATIENTS, DEMO_BOOKINGS, DEMO_APPROVALS
        ├── patient-quiz-mock.ts # PATIENT_QUIZ, NUTRIENT_LABELS, CATEGORY_COLORS
        ├── drips.ts / drip-details.ts
        ├── doctors.ts / labs.ts / nursing-mock.ts
        └── testimonials.ts
```

## Design System

### Brand Palette (use hardcoded hex in print components — CSS vars don't survive print)
```
#1A7EA8  teal (primary)
#0F5C7D  tealDark
#5BB8F5  sky (accent)
#D6EEFA  skyPale (subtle borders)
#EEF7FD  skyBg (panel backgrounds)
#0E2233  text (primary)
#3A5568  text2 (secondary)
#7A9BB0  text3 (muted)
```

### CSS Custom Properties (globals.css)
Use `var(--teal)`, `var(--text)`, `var(--border)`, `var(--radius-sm)` etc. in screen components.

### Shared Panel CSS Classes
`.panel`, `.panel-head`, `.panel-title`, `.panel-sub`, `.stat-grid`, `.split-grid`,
`.dash-table`, `.row-action-btn`, `.pill`, `.sev-badge`, `.empty-state`

### Print CSS Pattern
```css
@media screen { .rx-print-root { display: none; } }
@media print {
  body * { visibility: hidden; }
  .rx-print-root, .rx-print-root * {
    visibility: visible;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .rx-print-root { position: absolute; top: 0; left: 0; width: 100%; }
  @page { margin: 10mm; size: A4 portrait; }
}
```

## Key Data

### Treatment Charts (localStorage key: `nutridrip_tx_charts`)
```ts
type TxChart = {
  id: string; patientName: string; patientAge: string; diagnosis: string;
  startDate: string; totalWeeks: number; weeks: TxWeek[];
  createdAt: string; sharedWithNurse: boolean; doctorName: string;
};
```

### Patient Quiz Results (`src/lib/data/patient-quiz-mock.ts`)
```ts
type PatientQuizResult = {
  patientId: string;       // matches DEMO_PATIENTS id e.g. "p-001"
  completedAt: string;     // ISO 8601 e.g. "2026-04-01T10:00:00Z"
  vitalityScore: number;   // 0–100
  categoryScores: CategoryScores;  // Energy, Immunity, Skin, Performance, Cognitive, Metabolic, Hormonal
  nutrientRisks: NutrientRisks;   // 16 nutrients, each 0–100
  sections: QASection[];   // { section: string; qa: {q,a}[] }[]
};
```

### Dashboard Patients (`src/lib/data/dashboard-mock.ts`)
8 patients: p-001 through p-008. Quiz results exist for: p-001, p-002, p-004, p-006, p-007.

## Dashboard Role Map
| Role    | Route                    |
|---------|--------------------------|
| admin   | `/dashboard/admin`       |
| doctor  | `/dashboard/doctor`      |
| nurse   | `/dashboard/nurse`       |
| clinic  | `/dashboard/clinic`      |
| patient | `/dashboard/patient`     |

`DashLayout` enforces `allowedRoles` — always pass the correct array.

## Logo Persistence
```ts
const LOGO_KEY = "nutridrip_rx_logo";  // base64 data URL stored in localStorage
```

## Health Quiz Scoring (src/app/health-quiz/page.tsx)
- `calcNutrientRisks(answers)` → 16 nutrient risk scores (0–100)
- `calcVitalityScore(risks)` → single composite score (0–100)
- `calcCategoryScores(risks)` → 7 category scores

## Docker Workflow
```bash
# Full rebuild and restart
docker build -t nutridrip . && docker rm -f nutridrip-app && docker run -d --name nutridrip-app -p 3001:3000 nutridrip

# Check logs
docker logs nutridrip-app

# App runs at
http://localhost:3001
```

## Testing After Changes
1. Rebuild Docker (above)
2. Open http://localhost:3001 and click through the changed feature
3. Check `docker logs nutridrip-app` for server errors

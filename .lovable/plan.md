# DriveSchool Pro — Build Plan

The full spec covers 25+ screens across 4 portals. Building it all in one shot would produce a shallow result. I'll deliver in **4 phases**, each fully working and reviewable. This plan covers Phase 1 in detail; later phases are outlined.

---

## Phase 1 (this turn) — Foundation + Public Site + Student Auth

**1. Design System** (`src/styles.css` + token primitives)
- Full color token set (brand navy/red/blue, semantic, neutral 50-900, role colors)
- Typography: Inter + JetBrains Mono via Google Fonts; type scale tokens
- Radius, shadow, spacing tokens
- Light + dark mode variants

**2. Component variants** (extending shadcn)
- Button: primary (brand-red), secondary, ghost, destructive, outline-brand, hero
- Badge: status (paid/pending/overdue/active), method (M-Pesa/card/cash), role pills
- Card variants: surface, raised, feature, lesson
- Stat/KPI card component
- Progress ring component

**3. Lovable Cloud + Auth**
- Enable Cloud
- `profiles` table + `user_roles` table (enum: super_admin, branch_admin, instructor, finance, examiner, student)
- `has_role()` security definer function
- Trigger to create profile + default 'student' role on signup
- Email/password + Google sign-in
- `_authenticated` route guard

**4. Public Website routes**
- `/` Homepage (PW-1) — hero, stats bar, courses, how-it-works, instructors, testimonials, branches, footer
- `/courses/$courseId` Course detail (PW-2) — sticky pricing card
- `/register` (PW-3) — 3-step stepper
- `/login`
- Shared public navbar + footer components

**5. Student Portal shell**
- `/_authenticated/dashboard` (SP-1) — KPI row, progress ring, upcoming lessons, quick actions
- Student sidebar layout
- Mock data for lessons/progress (real DB tables come in phase 2)

---

## Phase 2 — Booking, Payments, Theory (student portal)
SP-2 Book a lesson (4-step wizard), SP-3 Payments + M-Pesa flow (mocked), SP-4 Theory tests, SP-5 Documents. Adds DB tables: courses, enrollments, lessons, payments, quizzes.

## Phase 3 — Staff Portal (all roles)
ST-1 Admin dashboard, ST-2 Students mgmt, ST-3 Calendar, ST-4 Fleet, ST-5 Instructor schedule, ST-6 Finance, ST-7 Examiner.

## Phase 4 — Super Admin + Mobile polish
SA-1 through SA-6 + dedicated responsive passes for the 6 mobile screens.

---

## Tech notes
- TanStack Start + file-based routing under `src/routes/`
- All colors in `src/styles.css` as oklch tokens — no hex in components
- Roles stored in separate `user_roles` table (never on profiles) per Lovable security guidelines
- Mock data lives in `src/lib/mock-data.ts` until each module's real tables land

After Phase 1 you'll be able to: browse the marketing site, register, log in, and see the student dashboard. Confirm and I'll start.
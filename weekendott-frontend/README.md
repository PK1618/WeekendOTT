# WeekendOTT – Frontend

React + TypeScript + TailwindCSS frontend for WeekendOTT.

## Stack
- React 18
- TypeScript (strict)
- TailwindCSS 3
- Axios
- React Router v6
- Vite

## Get Started

```bash
npm install
npm run dev
```

Runs at http://localhost:5173 — proxies `/api` to your Spring Boot server at `http://localhost:8080`.

## File Structure

```
src/
  api/          → All API calls (aligned to backend DTOs)
  components/   → Reusable UI components
  pages/        → Home + MovieDetails
  types/        → TypeScript types matching backend DTOs exactly
  utils/        → Platform color/label mapping
```

---

## Design

- **Font**: Bebas Neue (display) + DM Sans (body)
- **Theme**: Cinema dark — zinc-950 base, amber-400 accent
- **Cards**: Staggered fade-in animation, platform badges, hover glow
- **Comments**: Spoiler blur/reveal, "watched" trust badge
- **Rating**: Glowing 5-star interactive selector

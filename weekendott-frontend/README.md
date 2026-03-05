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

## ⚠️ Backend Fixes Required

Before running together, fix these in your Spring Boot project:

### 1. SecurityConfig — allow all requests in dev
Make sure your `SecurityConfig` permits all requests (no auth gate) while you finish the auth layer.

### 2. CORS — allow localhost:5173
In your `SecurityConfig` or a `@Bean CorsConfigurationSource`, add:
```java
config.setAllowedOrigins(List.of("http://localhost:5173"));
config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
config.setAllowedHeaders(List.of("*"));
```

### 3. Rating scale is 1–5 (confirmed ✅)
`RatingRequestDto` has `@Min(1) @Max(5)` — frontend now sends 1–5 stars. ✅

### 4. Hardcoded userId (TODO for later)
`CommentController` and `RatingController` use a hardcoded UUID for `userId`. This is fine for MVP — replace with real JWT/session extraction when you add auth.

---

## Design

- **Font**: Bebas Neue (display) + DM Sans (body)
- **Theme**: Cinema dark — zinc-950 base, amber-400 accent
- **Cards**: Staggered fade-in animation, platform badges, hover glow
- **Comments**: Spoiler blur/reveal, "watched" trust badge
- **Rating**: Glowing 5-star interactive selector

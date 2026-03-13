# 🌦️ Weather App

A weather application

**Stack:** Vue 3 · Quasar · TypeScript · Pinia · Vite · Docker · GitHub Actions

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [Running Tests](#running-tests)
- [Building for Production](#building-for-production)
- [CI / CD Pipeline](#ci--cd-pipeline)
- [API Reference](#api-reference)
- [Architecture Overview](#architecture-overview)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | v20 or later |
| npm | v9 or later |
| Quasar CLI | `npm install -g @quasar/cli` |
| Docker | v24 or later _(container runs only)_ |
| Docker Compose | v2 — included with Docker Desktop |
| OpenWeatherMap API key | Free tier at [openweathermap.org](https://openweathermap.org) |

---

## Project Structure

```
weather-app/
├── .env                        # only for local use
├── .env.example                # template — copy to .env
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions pipeline
├── Dockerfile                  # multi-stage build
├── docker-compose.yml
├── nginx.conf
├── vitest.config.ts
├── src/
│   ├── components/             # StatChip, SearchBar, UnitToggle and other components
│   ├── composables/            # useWeatherIcon.ts
│   ├── pages/                  # IndexPage.vue
│   ├── services/               # WeatherService.ts (Axios)
│   ├── stores/                 # WeatherStore.ts (Pinia)
│   └── types/                  # Weather.ts interfaces
└── test/
    ├── setup.ts                # Vitest global setup
    └── unit/
        ├── components/         # component spec files
        ├── composables/
        └── stores/
```

---

## Environment Setup

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_OWM_API_KEY=your_openweathermap_api_key_here
VITE_OWM_BASE_URL=https://api.openweathermap.org
```

> **Getting a free API key**
> 1. Create a free account at [openweathermap.org](https://openweathermap.org)
> 2. Go to **API keys** under your account profile
> 3. Copy the default key or generate a new one
> 4. New keys take up to **2 hours** to activate

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/sjmuimra/weather-app
cd weather-app

# 2. Install dependencies
npm install

# 3. Start the dev server
quasar dev
```

Open [http://localhost:9000](http://localhost:9000) in your browser.

Hot reload is enabled — changes to `.vue` and `.ts` files are reflected instantly.

---

## Running with Docker

### Quick start

```bash
docker compose up --build
```

The app will be available at [http://localhost:3002](http://localhost:3002).

### How the build works

The Dockerfile uses a two-stage build:

| Stage | What it does |
|---|---|
| `builder` (node:20-alpine) | Copies all source, installs deps, runs `quasar build` |
| `server` (nginx:1.25-alpine) | Serves only `dist/spa` — no Node.js or source in the final image |

> **Note:** The entire source is copied _before_ `npm ci` because the `postinstall` hook (`quasar prepare`) requires `quasar.config.js` to be present.


### Health check

```bash
docker ps  # check the STATUS column for (healthy)
```

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode — re-runs on file save
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Building for Production

```bash
quasar build
# Output: dist/spa/
```

The `dist/spa` directory can be served from any static host (Nginx, Netlify, Vercel, etc.).

> Make sure your host is configured to fall back to `index.html` for all routes (SPA routing). The included `nginx.conf` already handles this with `try_files $uri /index.html`.

---

## CI / CD Pipeline

The GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push and pull request to `master`.

### Jobs

| Job | Triggers on | Steps |
|---|---|---|
| `quality` | push + PR | checkout → Node 20 → `npm ci` → ESLint → `vue-tsc --noEmit` → `vitest run` |
| `docker` | push to `master` only | checkout → Buildx → Docker Hub login → build & push |

### Required GitHub Secrets

Set these under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `VITE_OWM_API_KEY` | OpenWeatherMap API key (injected as build arg) |
| `VITE_OWM_BASE_URL` | `https://api.openweathermap.org` |

### Docker image tags

Each successful push to `master` produces two tags:
- `latest` — always points to the most recent build
- `sha-<commit-hash>` — pinned to a specific commit for rollback

---

## API Reference

All HTTP calls go through `WeatherService.ts` using Axios with a 10s timeout.

### `GET /geo/1.0/direct` — Geocoding

Converts a city name typed in the search bar into lat/lon coordinates.

| Param | Value |
|---|---|
| `q` | City name |
| `limit` | `5` |
| `appid` | `VITE_OWM_API_KEY` |

### `GET /data/2.5/weather` — Current weather

Returns temperature, conditions, wind speed, humidity, pressure, and sunrise/sunset.

| Param | Value |
|---|---|
| `lat` / `lon` | From selected location |
| `units` | `metric` or `imperial` |
| `appid` | `VITE_OWM_API_KEY` |

### `GET /data/2.5/forecast` — 5-day forecast

Returns 40 three-hour entries. The store aggregates these into 5 daily summaries by grouping on date and using the 12:00 UTC entry as the representative for icon and description.

> Both weather and forecast endpoints are fetched in **parallel** via `Promise.all`, cutting load time roughly in half compared to sequential requests.

---

## Architecture Overview

### Data flow

```
User types city name
  ↓
SearchBar → store.searchLocations() → WeatherService → OWM Geocoding API
                                                      ↓
                                           Dropdown suggestions shown
  ↓ user selects
store.selectLocation() → fetchWeatherData()
                           ↓ Promise.all
                           ├── getCurrentWeather()
                           └── getForecast() → aggregateDailyForecasts()
                           ↓
              CurrentWeatherCard + ForecastCard update reactively
```

### Component tree

```
IndexPage.vue
  ├── SearchBar.vue         — location autocomplete (QSelect)
  ├── UnitToggle.vue        — metric / imperial switch
  ├── EmptyState.vue        — shown before first search
  ├── ErrorBanner.vue       — API error messages
  ├── CurrentWeatherCard.vue
  │   └── StatChip.vue      — wind, humidity, pressure chips
  └── ForecastCard.vue      — 5-day forecast strip
```

### State (WeatherStore.ts)

| State | Type | Purpose |
|---|---|---|
| `units` | `'metric' \| 'imperial'` | Persists across location changes |
| `locationSuggestions` | `GeocodingResult[]` | Dropdown options |
| `selectedLocation` | `GeocodingResult \| null` | Confirmed pick |
| `currentWeather` | `CurrentWeather \| null` | Raw API response |
| `dailyForecasts` | `DailyForecast[]` | Aggregated daily summaries |
| `loading` | `boolean` | Drives spinners and disabled states |
| `error` | `string \| null` | Drives ErrorBanner |
| `lastUpdated` | `Date \| null` | Shown in CurrentWeatherCard |

### Unit toggle design decision

Switching units triggers a fresh API fetch rather than client-side conversion. This avoids floating-point rounding drift and ensures wind speed, pressure, and all derived values are always server-accurate.

---

## Troubleshooting

| Problem                                   | Solution                                                                                              |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **401 Invalid API key**                   | Check `VITE_OWM_API_KEY` in `.env`. New keys take up to 2 hours to activate.                          |
| **`quasar: command not found`**           | Run `npm install -g @quasar/cli`                                                                      |
| **Docker build fails on `npm ci`**        | The Dockerfile must `COPY . .` _before_ `RUN npm ci` — `quasar prepare` needs the config file present |
| **Snapshot tests fail after a UI change** | Delete `test/unit/__snapshots/*.snap` and run `npm test` to regenerate                                |
| **Port 3002 already in use**              | Change the host port in `docker-compose.yml` to e.g. `"3003:80"`                                      |
| **Docker job never runs in CI**           | Check that `github.ref` in `ci.yml` matches your actual branch (`refs/heads/master`)                  |
# RideSync

A corporate carpooling and employee commute platform built in a minimalist, map-first style inspired by ride-hailing apps. Built with React and TypeScript, it automatically matches employees along shared routes, features real-time trip simulation, women-only safety safeguards, and ESG sustainability analytics.

## Features

- **Multi-stop corridor matching** — calculates route overlap, detour minutes, and walk distance for colleagues along shared office lanes.
- **Map-first mobile UI** — full-screen Leaflet & Carto Voyager maps with draggable 3-snap bottom sheets (peek, half, full).
- **Light blue minimalist design** — uncluttered typography (Inter), 8px grid, soft shadows (`0 4px 20px rgba(43,140,235,0.10)`), and WCAG AA contrast compliance.
- **Women-only verified pools** — dedicated purple badge safeguard restricting discoverability and ride joining strictly to verified female employees.
- **Live trip simulation** — animated GPS vehicle marker, horizontal 5-step status stepper, large 32px ETA, and 4-digit boarding OTP verification.
- **Docked emergency SOS** — persistent 56px round red button triggering a 5-second animated countdown ring, corporate security dispatch, and live trip link sharing.
- **Automated cost split & savings** — per-passenger fuel & wear cost computation highlighting savings vs solo cab fares.
- **Corporate ESG analytics** — desktop admin console with KPI cards, trend area charts, corridor load bars, peak heatmap, and CSV export.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS (Light Blue custom theme) |
| 2D Map | React-Leaflet + OpenStreetMap (Carto Voyager) |
| Optional Map Engine | Google Maps JavaScript & Routes API (@vis.gl/react-google-maps) |
| State Management | React Context + LocalStorage persistence |
| Telemetry & Charts | Recharts (Area, Bar) |
| Icons & Motion | Lucide React, Canvas Confetti |

## Project Structure

```
src/
  App.tsx                      # Root routes & app layout shell
  main.tsx                     # React DOM entry point
  index.css                    # Tailwind design tokens & CSS variables
  components/
    ui/                        # Reusable atomic design components
      BottomSheet.tsx          # 3-snap draggable bottom sheet
      RideCard.tsx             # Ranked carpool match card
      SOSButton.tsx            # 56px docked red emergency button & modal
      RouteTimeline.tsx        # Vertical dotted stop timeline
      StatusStepper.tsx        # Horizontal 5-state trip progress
      TimePicker.tsx           # 28-36px semibold departure selector
      Stepper.tsx              # -/+ seat counter (min 44px touch targets)
      KPICard.tsx              # Metric stat card with trend indicator
      Badge.tsx                # Status, match & women-only badges
      Button.tsx               # Primary, secondary, ghost, danger CTAs
    Navbar.tsx                 # Top navigation with role & persona toggle
    BottomNav.tsx              # 4-item mobile tab bar
    MapControls.tsx            # Floating back/menu & recenter buttons
    NotificationCenter.tsx     # Slide-out alerts drawer
  pages/
    Dashboard.tsx              # Home screen (map + Where to? + Find/Host cards)
    HostRide.tsx               # Stepper-free scrolling route host sheet
    FindRide.tsx               # Pin drop, route preview & ranked cards
    LiveTrip.tsx               # Animated driver marker, ETA & SOS
    RideDetails.tsx            # Route stops timeline, cost split & avatars
    Alerts.tsx                 # Today / Earlier grouped notifications
    Profile.tsx                # Chevron rows, emergency contacts & privacy
    AdminDashboard.tsx         # Desktop admin console, KPI cards & heatmap
    Requests.tsx               # Join approval requests & scheduled rides
  maps/
    MapView.tsx                # Dual-engine map wrapper (OSM / Google)
    GoogleMapRenderer.tsx      # Google Maps JavaScript API integration
    googleMapsKeyManager.ts    # Client-side key storage
  matching/
    score.ts                   # Multi-factor carpool matching algorithm
    eligibility.ts             # Gender verification & team privacy rules
  data/
    fallbackRoutes.ts          # Precomputed Hyderabad tech corridors
    seedData.ts                # Verified employees, vehicles & historical ESG
```

## Built with Google Antigravity

This project was built entirely using [Google Antigravity](https://deepmind.google/), Google's advanced AI software engineering assistant.

Antigravity was used throughout the full development lifecycle:

- **Architecture & planning** — designing the map-first bottom sheet layout, state management, and 5-factor corridor scoring engine
- **Feature implementation** — developing all 9 responsive screens, Leaflet map views, real-time trip simulation, and admin analytics
- **Iterative refinement** — applying the minimalist Light Blue design system, WCAG AA contrast compliance, and touch-friendly mobile controls
- **Code cleanup** — identifying and removing dead code (unused imports, redundant exports, orphaned components), gitignore hygiene, and TypeScript correctness
- **Debugging** — resolving map overlay z-index layering, modal conflicts, and ensuring clean production build execution

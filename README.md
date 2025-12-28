# RescueLink 🚨

A real-time community-driven emergency incident tracking and response coordination platform. RescueLink enables users to report, verify, and respond to local emergencies through crowdsourced incident reporting and live map visualization.

## 🌟 Features

- **Real-time Incident Reporting** - Report emergencies (fire, medical, accidents, infrastructure, disturbances) with location data
- **Live Map Visualization** - Interactive map showing nearby incidents with severity indicators
- **Community Verification** - Crowdsourced confirmation system to validate incident reports
- **Trust Score System** - Backend-calculated trust scores to filter false reports
- **Real-time Updates** - WebSocket-powered live updates for new incidents and status changes
- **PWA Support** - Installable as a Progressive Web App for offline capabilities
- **Responsive Design** - Optimized for both desktop and mobile devices

## 🔄 Application Flow

```
1. User opens app → Geolocation requested
2. Nearby incidents fetched based on user location
3. User can:
   ├── View incidents on map or list
   ├── Report new incident with type, description & location
   ├── Confirm/verify existing incidents
   └── Navigate to incident location
4. Real-time WebSocket updates push new incidents to all nearby users
5. Backend calculates trust scores & priority based on confirmations
```

## 🛠️ Tech Stack

### Frontend

| Library                                               | Purpose                 | Link         |
| ----------------------------------------------------- | ----------------------- | ------------ |
| [React](https://react.dev/)                           | UI Framework            | MIT License  |
| [TypeScript](https://www.typescriptlang.org/)         | Type Safety             | Apache-2.0   |
| [Vite](https://vite.dev/)                             | Build Tool & Dev Server | MIT License  |
| [Tailwind CSS](https://tailwindcss.com/)              | Utility-first Styling   | MIT License  |
| [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) | Interactive Maps        | BSD-3-Clause |
| [Framer Motion](https://www.framer.com/motion/)       | Animations              | MIT License  |
| [Lucide React](https://lucide.dev/)                   | Icon Library            | ISC License  |
| [React Router](https://reactrouter.com/)              | Client-side Routing     | MIT License  |
| [Socket.IO Client](https://socket.io/)                | Real-time Communication | MIT License  |
| [Vite PWA](https://vite-pwa-org.netlify.app/)         | PWA Support             | MIT License  |

### Backend

- REST API hosted on [Render](https://render.com/)
- WebSocket server for real-time updates

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── HomePage.tsx       # Incident list view
│   ├── MapPage.tsx        # Map visualization
│   ├── NewIncidentForm.tsx # Report new incidents
│   ├── IncidentDetailModal.tsx # Incident details
│   └── ...
├── context/           # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── IncidentContext.tsx # Incidents state
├── hooks/             # Custom React hooks
│   └── useGeolocation.ts  # Location tracking
├── services/          # API & WebSocket services
│   └── api.ts             # Backend communication
├── types/             # TypeScript type definitions
│   └── incident.ts        # Incident types
└── utils/             # Utility functions
    ├── cache.ts           # Caching utilities
    └── distance.ts        # Distance calculations
```

## 📄 License

This project is open source. See individual library licenses above for attribution requirements.

---

Built with ❤️ for community safety.
By - Amulya Yadav and Sambodhi Bhowal

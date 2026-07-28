# AdventureLog

AdventureLog is a full-stack mobile journal for preserving meaningful experiences through places, photos, notes, maps, collections, and personal milestones.

The app is designed around remembering experiences rather than tracking public reviews or competing with other users. An adventure can be a hike, sporting event, trip, meal, outdoor activity, or planned destination.

> Every adventure leaves a mark.

## Project status

AdventureLog is a complete portfolio MVP with a deployed FastAPI backend, hosted PostgreSQL database, cloud media storage, and a standalone Expo preview build.

The primary workflows have passed automated checks, migration validation, and manual end-to-end testing against the deployed environment.

## App preview

<p align="center">
    <img src="docs/screenshots/home.png" alt="AdventureLog Home screen in dark mode" width="30%" />
    <img src="docs/screenshots/journal.png" alt="Searchable and filterable Adventure Journal" width="30%" />
    <img src="docs/screenshots/map.png" alt="Adventure map with category markers and selected memory preview" width="30%" />
</p>

<p align="center">
    <img src="docs/screenshots/detail.png" alt="Photo-led adventure detail screen" width="30%" />
    <img src="docs/screenshots/collections.png" alt="Adventure collections with progress goals" width="30%" />
    <img src="docs/screenshots/collection-detail.png" alt="Adventure collection detail page with currently added adventures" width="30%" />
</p>

## Features

### Adventure journal 

- Create completed or planned adventures
- Add a title, category, date, location, rating, and journal entry
- Attach up to five photos
- Search adventures by title, location, or description
- Filter by completion status and category
- Sort the journal newest-first or oldest-first
- Edit, favorite, and delete saved adventures

### Maps and location

- Capture the device's current location
- Search for a typed location
- Convert location names into map coordinates
- Reverse-geocode current coordinates into a readable place name
- Preview a selected location before saving
- Display saved adventures as category-specific map markers
- Filter visible markers by category
- Open adventure details from map previews

### Photos

- Select photos from device library
- Capture new photos with the camera
- Upload images securely through the FastAPI backend
- Store durable image URLs through Cloudinary
- Display photo carousels with page indicators
- Remove obsolete uploaded assets when photos or adventures are deleted
- Clean up partial uploads when adventure creation fails

### Collections

- Create themed collections
- Choose a title, description, icon, and progress target
- Add or remove owned adventures
- View collection progress on Home and Profile
- Edit and delete collections
- Prevent users from accessing another account's collections

### Planned adventures and reminders

- Save future experiences as planned adventures
- Display the next upcoming adventure on Home
- Schedule local device reminders
- Open the correct adventure from a reminder
- Mark a planned adventure as completed
- Cancel obsolete reminders after completion or deletion

### Achievements and profile

- Calculate profile statistics from real adventure data
- Track completed adventures, unique places, and favorites
- Earn six progress-based achievements
- View earned dates and locked-achievement progress
- Display real collections and account information
- Choose Light, Dark, or System appearance

### Offline behavior

- Persist authenticated query data locally
- Reopen previously loaded adventures and collections offline
- Display intentional offline and uncached-data states
- Prevent server mutations while disconnected
- Save unfinished adventure forms as account-specific local drafts
- Restore draft fields and the current creation step after restarting

Temporary photo paths are deliberately excluded from restored drafts because device-picker files may no longer exist after an app restart. Final adventure submission and photo uploading require a network connection.

## Technology

### Mobile application 

- React Native
- Expo SDK 54
- TypeScript
- Expo Router
- TanStack Query
- React Hook Form
- Zod
- AsyncStorage
- Expo SecureStore
- Expo Location
- Expo Image Picker
- Expo Notifications
- Expo Haptics
- React Native Maps
- React Native Gesture Handler
- React Native Reanimated

### Backend API

- Python
- FastAPI
- SQLAlchemy 2
- Alembic
- PostgreSQL
- Pydantic
- JWT access and refresh tokens
- Argon2 password hashing
- Pytest

### Media

- Cloudinary authenticated server-side uploads
- User-scoped Cloudinary folders
- Stored public IDs for asset cleanup

## Deployment

- **Mobile builds:** Expo Application Services
- **Backend API:** FastAPI Cloud
- **PostgreSQL:** Neon
- **Photo storage:** Cloudinary

The mobile preview build communicates with the hosted API over HTTPS. FastAPI owns authentication, authorization, database access, and media credentials.

The free hosted services may scale to zero during inactivity, so the first request after an idle period can take longer than subsequent requests.

API documentation: [AdventureLog API](https://adventurelog-api.fastapicloud.dev/docs)

## Architecture

```text
AdventureLog/
├── mobile/
│   ├── app/                 # Expo Router screens
│   ├── components/          # Reusable mobile interface
│   ├── features/            # Feature hooks and calculations
│   ├── lib/                 # API, auth, storage, and notifications
│   ├── theme/               # Light and dark theme tokens
│   └── types/               # Shared TypeScript types
│
├── backend/
│   ├── alembic/             # Database migrations
│   ├── app/
│   │   ├── api/             # FastAPI routes and dependencies
│   │   ├── core/            # Configuration, security, and media setup
│   │   ├── db/              # SQLAlchemy session and base
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic request and response models
│   │   └── services/        # Application and persistence logic
│   └── tests/               # Isolated API tests
│
└── docker-compose.yml       # Local PostgreSQL
```

The mobile app communicates with an authenticated REST API. FastAPI owns database access, authentication, authorization, and Cloudinary credentials. The mobile application never receives the Cloudinary API secret.

## Local setup

### Prerequisites

Install:

- Node.js and npm
- Python
- Docker Desktop
- Expo Go or a mobile simulator
- A free Cloudinary account for photo uploads

### 1. Clone the repository

```bash
git clone https://github.com/trevcruz182/AdventureLog.git
cd AdventureLog
```

### 2. Start PostgreSQL

```bash
docker compose up -d adventurelog-db
```

The local database is exposed on port `5434`.

### 3. Configure the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Create:

```text
backend/.env
```

Use `backend/.env.example` as the starting point:

```env
APP_NAME=AdventureLog API
APP_ENV=development
API_V1_PREFIX=/api/v1

SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

DATABASE_URL=postgresql+psycopg://adventurelog:adventurelog_dev@localhost:5434/adventurelog

CLOUDINARY_CLOUD_NAME=replace_me
CLOUDINARY_API_KEY=replace_me
CLOUDINARY_API_SECRET=replace_me
MAX_IMAGE_UPLOAD_BYTES=10485760
```

Never commit `.env` or Cloudinary credentials.

Apply the database migrations:

```bash
alembic upgrade head
```

Start FastAPI:

```bash
uvicorn app.main:app \
--reload \
--host 0.0.0.0 \
--port 8000
```

API documentation is available locally at:

```text
http://127.0.0.1:8000/docs
```

### 4. Configure the mobile app

In another terminal:

```bash
cd mobile
npm install
```

Create:

```text
mobile/.env.local
```

Use the computer's local network address when testing on a physical phone:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000/api/v1
```

For an iOS simulator, `127.0.0.1` may be appropriate. Android emulator networking may require its emulator-specific host address.

Start Expo:

```bash
npx expo start
```

Scan the QR code with Expo Go or open the app in a simulator.

## Automated checks

### Backend tests

The backend suite uses an isolated in-memory database and does not modify the development PostgreSQL database.

```bash
cd backend
source .venv/bin/activate
python -m pytest -v
```

The current suite contains 17 tests covering:

- Health endpoints
- Registration and login
- Access and refresh tokens
- Protected routes
- Adventure creation, reading, editing, and deletion
- Adventure ownership isolation
- Collection creation
- Collection membership
- Collection ownership isolation

### Mobile checks

```bash
cd mobile
npx tsc --noEmit
npx expo lint
```

### Migration checks

With PostgreSQL running:

```bash
cd backend
source .venv/bin/activate
alembic current
alembic heads
alembic check
```

The migration chain has also been tested against a disposable PostgreSQL database by upgrading from zero, downgrading to the base revision, and upgrading to the head again.

## API overview

The API is grouped around:

```text
/api/v1/auth
/api/v1/users
/api/v1/adventures
/api/v1/collections
/api/v1/media
/api/v1/health
```

Adventure and collection routes require a valid access token. Database queries are scoped to the authenticated user, and requests for another user's resources return `404`.

## Design decisions

### Personal rather than social

AdventureLog intentionally does not include a public feed, followers, messaging, public reviews, or leaderboards. The MVP focuses on preserving a user's own experiences.

### Mobile-first interaction

The interface uses bottom-tab navigation, maps, camera, and photo access, haptic feedback, local reminders, horizontal photo paging, safe-area handling, and offline states.

### Focused offline support

Previously loaded server data is cached for offline reading, and unfinished adventure forms are saved as local drafts. The app does not attempt a background mutation queue or conflict-resolution system.

### Server-side media credentials

Images pass through FastAPI before reaching Cloudinary. This keeps upload credentials out of the mobile bundle and allows the backend to enforce file ownership and cleanup rules.

### Deliberate scope

The project demonstrates full-stack and mobile-specific development without adding systems that would not improve the core portfolio story. Features such as social networking, live location sharing, AI recommendations, booking, and competitive leaderboards remain outside the MVP.

## Current limitations

- Final adventure submission and photo uploads requires a network connection
- Selected photos are not restored with offline drafts
- Reminders are local to the current device
- Location search uses platform geocoding and may vary by device
- Free hosted services may have cold-start delays after inactivity
- The iOS standalone build currently targets the Simulator
- The app has not been submitted to the Apple App Store or Google Play Store

## Future improvements

Possible post-MVP improvements include:

- Installable Android preview build
- App Store and Play Store distribution
- Additional API tests for media failure handling
- Responsive image thumbnails for list and map previews
- Optional user data export
- Accessibility audit and screen-reader refinements
- Expanded achievement and collection options

## Portfolio purpose

AdventureLog was built as a mobile-focused full-stack portfolio project. It complements web projects by demonstrating:

- React Native and Expo development
- Native device capabilities
- Authenticated API design
- Relational database modeling
- Media uploads and cleanup
- Location and map integration
- Offline-aware mobile behavior
- Automated backend testing
- Intentional product scope and visual design

## License

This project is currently provided for portfolio and demonstration purposes.
# AURA Coworking & Meeting Room Management — Mobile Application

Cross-platform mobile application for enterprise coworking clients and team members built with React Native and Expo.

## Features

- **Authentication**: Secure JWT email/password login with `@react-native-async-storage/async-storage` session persistence and auto-login on app launch.
- **Quota Allowance Tracker**: Visual gauge displaying granted free hours, reserved hours, consumed hours, and available balance for the current monthly billing period.
- **Interactive Room Catalog**: Browse executive boardrooms and collaborative suites with capacity, equipment amenities, and hourly rates.
- **Real-Time Slot Availability**: Live query of physical room schedules and conflict detection via the `/api/v1/availability/:roomId` endpoint.
- **Allowance Impact Estimation**: Instant preview of free allowance hours applied vs billable overage before booking confirmation.
- **Atomic Booking Engine**: Race-condition safe reservation with immediate slot lock and quota ledger deduction.
- **Reservation Management**: Upcoming and past meeting lists with one-tap cancellation and automatic quota refunding.
- **Double-Entry Quota Ledger**: Complete history of quota credits, reservations, releases, and consumptions.
- **Corporate Statements**: Monthly itemized invoices with balance due tracking and offline remittance instructions (ACH, wire, desk POS) strictly conforming to Phase 1 constraints.
- **In-App Notifications**: Notification center with unread badges, mark as read, and real-time alerts.

## Technology Stack

- **Framework**: React Native 0.76.7, Expo SDK 52, TypeScript (Strict Mode)
- **Icons**: Expo Vector Icons (Ionicons)
- **Safe Area**: React Native Safe Area Context
- **Storage**: AsyncStorage
- **Theme**: Obsidian slate (`#090D16`, `#121826`) with warm champagne brass accents (`#B6925A`, `#C5A880`)

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Company Owner | `marcus.chen@nexusai.com` | `Password@123` |
| Booking Manager | `sarah.lin@nexusai.com` | `Password@123` |

The login screen features one-tap demo account buttons to pre-populate these credentials.

## Environment & Network Configuration

The application communicates with the AURA Backend API. Configuration is set in `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:6018/api/v1
```

### Running on Different Platforms:
1. **iOS Simulator**: Uses `http://localhost:6018/api/v1` automatically.
2. **Android Emulator**: In Android emulators, `localhost` maps to `10.0.2.2`. The API client automatically handles this mapping.
3. **Physical Device (Expo Go)**:
   - When scanning the Expo QR code on a physical iPhone or Android device, set `EXPO_PUBLIC_API_BASE_URL` in `.env` to your computer's local network IP address:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.X:5000/api/v1
   ```
   - Ensure your phone and development machine are connected to the same Wi-Fi network.

## Getting Started

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm start
```

Press `i` in the terminal to open iOS Simulator, `a` for Android Emulator, or scan the QR code with Expo Go on your mobile device.

### Typecheck & Lint
```bash
npm run lint
```

# PhytoSense – React Native (Expo) frontend

## Run
```bash
npm install
npx expo start        # press a / i / w for Android / iOS / web
```

## Structure (MVC)
```
src/
  models/        Data shapes + normalisers (User, Diagnosis, Post, Alert)
  views/         Screens only render UI (auth, home, scan, result, community, alerts, profile)
  controllers/   Hooks holding screen logic and state (Auth, Scan, Alerts, Community)
  services/      API calls (api.js, authService, plantService, alertService, communityService)
  components/    Small reusable UI pieces
  navigation/    RootNavigator (auth vs app) + MainTabs
  context/       AuthContext (session)
  config/        env.js (API URL, USE_MOCK), crops.js
  theme/         Colors, spacing
  utils/         responsive hook, storage, location, useAction
```

## Connecting to your backend
- `src/config/env.js`: set `API_BASE_URL`, and set `USE_MOCK = false`.
- `src/services/endpoints.js`: edit the paths to match your API.
- `src/models/*.js`: adjust field names if your responses differ.

## Responsive
`useResponsive()` gives 1/2/3 columns (phone/tablet/desktop). `ScreenContainer`
centres content at max 960px; `ResponsiveGrid` lays cards out per breakpoint.

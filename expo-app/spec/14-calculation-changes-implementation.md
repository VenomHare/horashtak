# Calculation Changes Implementation

## Overview
Implemented optional Rahu and Ketu grahas with special timing calculations, fixed widget click-to-open functionality, and wrapped alert lists in collapsible dropdowns for better UX.

## Changes Made

### 1. Core Graha Infrastructure
**File:** `lib/hora-detector.ts`
- Added 'Rahu' and 'Ketu' to GRAHA_SEQUENCE
- Updated `getHoraDay` method to accept `showRahuKetu` parameter
- Implemented `insertRahuKetu` private method that:
  - Identifies Mangal→Ravi transition for Rahu insertion (last 12 min of Mangal + first 12 min of Ravi)
  - Identifies Shani→Guru transition for Ketu insertion (last 12 min of Shani + first 12 min of Guru)
  - Creates 24-minute periods for Rahu and Ketu
  - Adjusts adjacent graha timings accordingly
  - Reindexes all periods after insertion

### 2. Graha Visual Assets
**File:** `lib/graha.ts`
- Added symbols: Rahu (☊), Ketu (☋)
- Added color schemes: Rahu (purple theme), Ketu (indigo theme)
- Added translation keys for both grahas

### 3. Translations
**File:** `locales/translations.ts`
- Added `grahaRahu` and `grahaKetu` for all languages (mr, en, hi)
- Added `rahuKetuSettings` section title
- Added `showRahuKetu` toggle label

### 4. State Management
**File:** `store/app-store.ts`
- Added `showRahuKetu: boolean` to AppState (default: false)
- Added `setShowRahuKetu` action
- Persisted in zustand storage
- Included in partialize for persistence

### 5. Cache Management
**File:** `services/cache.ts`
- Updated CACHE_VERSION from 1 to 2
- Added `showRahuKetu` to CachedHoraDay type
- Cache invalidation when Rahu/Ketu setting changes
- Properly integrated with zustand using `getState()`

### 6. UI Updates
**File:** `app/(tabs)/explore.tsx`
- Added Rahu/Ketu settings section with toggle
- Filtered GRAHA_SEQUENCE to conditionally show Rahu/Ketu based on setting
- Added recalculation trigger when setting changes (clears cache and navigates home)
- Wrapped start alerts and end alerts in Collapsible dropdowns
- Used existing Collapsible component (enhanced for better styling)

### 7. Home Screen Updates
**File:** `app/(tabs)/index.tsx`
- Updated to pass `showRahuKetu` parameter to `getHoraDay`
- Properly handles Rahu/Ketu display in hora table
- Integrated with cache invalidation

### 8. Background Tasks
**File:** `services/background-tasks.ts`
- Updated hora recalculation to use `showRahuKetu` setting
- Fixed BackgroundTask API usage (removed non-existent `isTaskRegisteredAsync`)
- Cleaned up unused imports

### 9. Widget Click Handler
**File:** `plugins/with-android-hora-widget.js`
- Added click functionality to widget layout
- Made root FrameLayout clickable and focusable
- Added PendingIntent to launch app when widget is clicked
- Implemented Android 12+ compatibility with FLAG_IMMUTABLE
- Child views set to non-clickable to prevent event conflicts

### 10. Collapsible Component Enhancement
**File:** `components/ui/collapsible.tsx`
- Enhanced with better styling using theme system
- Added MaterialIcons for chevron
- Added `defaultOpen` prop for initial state
- Improved styling to match app design system

### 11. Service Integration
**Files:** `services/cache.ts`, `services/background-tasks.ts`, `services/widget-sync.ts`
- All services properly integrated with zustand using `getState()`
- Notifications service already supports new grahas through existing implementation
- Widget sync service handles Rahu/Ketu symbols and colors

## Technical Details

### Rahu/Ketu Calculation Logic
- Rahu: Replaces last 12 minutes of Mangal + first 12 minutes of Ravi (24 min total)
- Ketu: Replaces last 12 minutes of Shani + first 12 minutes of Guru (24 min total)
- Original grahas lose those time segments when Rahu/Ketu are enabled
- When disabled, uses original 7-graha sequence
- Cache invalidation ensures recalculation when setting changes

### Zustand Usage
- React components: Use `useAppStore((state) => state.value)` hook
- Service functions: Use `useAppStore.getState().value` for synchronous access
- Proper persistence with AsyncStorage via zustand middleware
- Cache version bump handles migration

### Widget Click Implementation
- Uses PendingIntent with proper Android version compatibility
- FLAG_IMMUTABLE for Android 12+, regular FLAG_UPDATE_CURRENT for older versions
- Launches app's main activity via package manager
- Child views explicitly set to non-clickable to ensure root click works

## Files Modified
1. `lib/hora-detector.ts` - Core calculation logic
2. `lib/graha.ts` - Visual assets
3. `locales/translations.ts` - Translations
4. `store/app-store.ts` - State management
5. `services/cache.ts` - Cache management
6. `services/background-tasks.ts` - Background tasks
7. `app/(tabs)/explore.tsx` - Settings UI
8. `app/(tabs)/index.tsx` - Home screen
9. `plugins/with-android-hora-widget.js` - Widget implementation
10. `components/ui/collapsible.tsx` - Collapsible component

## Testing
- ESLint passed with no errors
- Fixed all linting warnings (unused variables, dependency arrays)
- Removed non-existent BackgroundTask API calls
- Verified zustand usage patterns are correct

## Backward Compatibility
- Rahu/Ketu default to false for existing users
- Cache version bump ensures old cache is invalidated
- All existing functionality preserved when Rahu/Ketu disabled
- Gradual migration path through cache invalidation

## Known Limitations
- Widget changes require native Android rebuild to test
- Rahu/Ketu timing logic is complex and requires manual verification
- Dropdowns default to collapsed to reduce initial scroll

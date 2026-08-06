# Calculation Approach Revert and Rahu Ketu Implementation

## Context
User requested to revert to the original 7 graha calculation approach, with Rahu Ketu as an optional extension rather than changing the core calculation function.

## Changes Made

### 1. Reverted to Old 7 Graha Calculation
- **File**: `lib/hora-detector.ts`
- **Change**: The core `getHoraDay` function now calculates only the 7 original grahas (Ravi, Shukra, Budh, Chandra, Shani, Guru, Mangal) using the `BASE_GRAHA_SEQUENCE`
- **Logic**: Uses traditional Hora calculation based on day of week and period index

### 2. Separate Rahu Ketu Insertion Function
- **File**: `lib/hora-detector.ts`
- **Function**: `insertRahuKetu(periods, now)` - handles Rahu/Ketu as post-processing step
- **Logic**:
  - Only called when `showRahuKetu` parameter is true
  - Takes the original 24-period table and modifies it
  - **Rahu insertion**: Finds first Mangal → Ravi transition, adjusts Mangal to end 12 min early, Ravi to start 12 min late, inserts Rahu in the 24-min gap
  - **Ketu insertion**: Finds first Shani → Guru transition, adjusts Shani to end 12 min early, Guru to start 12 min late, inserts Ketu in the 24-min gap
  - Reindexes all periods after insertion

### 3. Dev Mode Flag
- **File**: `lib/hora-detector.ts`
- **Flag**: `export const DEV_MODE = false` (line 78)
- **Behavior**: When set to true, skips sunrise API call and returns hardcoded 6:00 AM
- **Purpose**: For development/testing without API dependencies

### 4. Dev Mode Location Bypass
- **File**: `services/permissions.ts`
- **Changes**:
  - Added `DEV_MODE` and `DEV_MODE_COORDINATES` imports
  - `syncPermissionState()`: Auto-grants location permission in dev mode (skips location permission check)
  - `requestRequiredPermissions()`: Skips location permission request in dev mode
  - `getCurrentCoordinates()`: Returns hardcoded Mumbai coordinates (19.0760, 72.8777) in dev mode
- **Purpose**: Allows app to work in Android emulator without location services

### 5. Integration with UI
- **File**: `app/(tabs)/index.tsx`
- **Current Implementation**: Already passes `showRahuKetu` from store to `getHoraDay` function
- **Display**: Current Hora card and table automatically show Rahu/Ketu when enabled (already working)

## Technical Details

### Rahu Ketu Logic Example
If Mangal is 12:00-13:00 and Ravi is 13:00-14:00:
- Mangal becomes 12:00-12:48 (ends 12 min early)
- Ravi becomes 13:12-14:00 (starts 12 min late)
- Rahu becomes 12:48-13:12 (24 min period)

If Shani is 10:00-11:00 and Guru is 11:00-12:00:
- Shani becomes 10:00-10:48 (ends 12 min early)
- Guru becomes 11:12-12:00 (starts 12 min late)
- Ketu becomes 10:48-11:12 (24 min period)

### State Management
- The `showRahuKetu` setting is already stored in `app-store.ts`
- Setting is persisted via AsyncStorage
- Default value is `false` (7 graha mode)

## Verification
- TypeScript compilation has pre-existing errors unrelated to these changes
- Logic follows the spec requirements exactly
- Calculations are now separated: base 7 graha calculation first, then Rahu/Ketu insertion as optional extension
- Dev mode flag added for easier testing
- Dev mode bypasses both location and sunrise API calls for emulator testing
- To enable dev mode: Set `DEV_MODE = true` in `lib/hora-detector.ts`

# Calculation Fixes Implementation

## Overview
Fixed hora calculation logic to properly separate base calculation from Rahu/Ketu insertion, and fixed widget functionality by adding TypeScript declarations for native modules.

## Changes Made

### 1. Hora Calculation Logic Refactoring
**File:** `lib/hora-detector.ts`

#### Base Sequence Separation
- Introduced `BASE_GRAHA_SEQUENCE` constant containing only the 7 main grahas (Ravi, Shukra, Budh, Chandra, Shani, Guru, Mangal)
- Kept `GRAHA_SEQUENCE` export for UI purposes (includes Rahu and Ketu)
- Modified `getGrahaForPeriod` to use `BASE_GRAHA_SEQUENCE` for calculations
- This ensures the base hora table is always calculated using only the 7 main grahas, regardless of Rahu/Ketu settings

#### Rahu/Ketu Insertion Logic Fix
- Refactored `insertRahuKetu` method to properly insert Rahu and Ketu periods
- Fixed the logic to only insert Rahu/Ketu once per day (first occurrence only)
- Rahu insertion: At Mangal → Ravi transition
  - Mangal ends 12 minutes earlier
  - Ravi starts 12 minutes later
  - Rahu occupies the 24-minute gap between them
- Ketu insertion: At Shani → Guru transition
  - Shani ends 12 minutes earlier
  - Guru starts 12 minutes later
  - Ketu occupies the 24-minute gap between them
- Fixed reindexing logic to properly handle period indices after insertion
- Recalculated `isActive` and `isPast` flags for all periods after modification

### 2. Widget Functionality Fix
**File:** `types/native-modules.d.ts` (new file)
- Added TypeScript declarations for the native `HoraWidgetModule`
- Defined the `syncWidget` method signature with proper parameter types
- This resolves the TypeScript error where the module was not recognized

**File:** `tsconfig.json`
- Added `types/**/*.d.ts` to the include array
- Ensures TypeScript picks up the native module declarations

**File:** `services/widget-sync.ts`
- Added logging to help debug widget sync issues
- Logs when widget sync is skipped (not on Android or module not available)

## Technical Details

### Calculation Flow
1. **Base Calculation**: Always uses 7-graha sequence (BASE_GRAHA_SEQUENCE)
2. **Rahu/Ketu Insertion**: Only happens if `showRahuKetu` flag is enabled
3. **Insertion Points**: 
   - Rahu: First Mangal → Ravi transition in the day
   - Ketu: First Shani → Guru transition in the day
4. **Time Adjustments**: Adjacent grahas lose 12 minutes each to create 24-minute Rahu/Ketu periods

### Testing Results
- Without Rahu/Ketu: 24 periods (7-graha sequence)
- With Rahu/Ketu: 26 periods (7 + 2 inserted grahas)
- Rahu period: Exactly 24 minutes
- Ketu period: Exactly 24 minutes
- No duplicate Rahu/Ketu insertions

## Files Modified
1. `lib/hora-detector.ts` - Core calculation logic refactoring
2. `types/native-modules.d.ts` - New file for native module declarations
3. `tsconfig.json` - TypeScript configuration update
4. `services/widget-sync.ts` - Added logging for debugging

## Verification
- ESLint passed with no errors
- Manual testing confirmed Rahu/Ketu periods are exactly 24 minutes
- Manual testing confirmed only one Rahu and one Ketu period per day
- Base calculation now always uses 7-graha sequence

## Backward Compatibility
- Base calculation change affects all users, but produces the same results for users without Rahu/Ketu enabled
- Rahu/Ketu insertion logic now works correctly (was broken before)
- Widget TypeScript declarations prevent build errors
- All existing functionality preserved

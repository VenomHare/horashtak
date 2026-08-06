# Bug Fix: Rahu and Ketu Insertion in All Cycles

## Issue
Rahu and Ketu were only being inserted in the first cycle of grahas, not in all 3-4 cycles that occur throughout a day.

## Root Cause
The `insertRahuKetu` method in `lib/hora-detector.ts` had:
- Single-insertion flags (`rahuInserted`, `ketuInserted`) that prevented multiple insertions
- `break` statements that stopped processing after the first occurrence of each transition

## Solution
Modified the `insertRahuKetu` method to:
- Remove the single-insertion flags
- Remove the `break` statements to allow processing all cycles
- Add `i++` after each insertion to skip the newly inserted period and avoid re-processing
- Updated comments to reflect "all occurrences" instead of "only first occurrence"

## Changes Made
- File: `lib/hora-detector.ts`
- Lines 148-219: Updated `insertRahuKetu` method
- Rahu now inserted at every Mangal→Ravi transition
- Ketu now inserted at every Shani→Guru transition
- All cycles throughout the day now include Rahu and Ketu periods

## Testing
The fix ensures that when `showRahuKetu=true` is passed to `getHoraDay`, all graha cycles will have Rahu and Ketu periods inserted appropriately, not just the first cycle.

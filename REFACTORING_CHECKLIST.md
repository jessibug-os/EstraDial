# Refactoring Checklist

This checklist breaks down the code review recommendations into small, focused PRs that can be implemented and reviewed one at a time.

## Quick Wins (Low Risk, High Value)

### ✅ PR 1: Extract formatNumber utility
- [x] Create `src/utils/formatters.ts`
- [x] Add `formatNumber` function
- [x] Update `VisualTimeline.tsx` to import and use it
- [ ] Update `ConcentrationGraph.tsx` to import and use it (Note: ConcentrationGraph has a different formatNumber - handles separately)
- [x] Test that formatting still works correctly (build passes)

### ✅ PR 2: Extract color constants
- [ ] Create `src/constants/colors.ts`
- [ ] Move ester color mapping to constants
- [ ] Add `getEsterColor` helper function
- [ ] Update `VisualTimeline.tsx` to use `getEsterColor` from constants
- [ ] Verify ester colors still display correctly

### ✅ PR 3: Extract debounce hook
- [ ] Create `src/hooks/useDebounce.ts`
- [ ] Create `useDebouncedInput` hook
- [ ] Update `VisualTimeline.tsx` to use hook for schedule input
- [ ] Update `VisualTimeline.tsx` to use hook for max injections input
- [ ] Update `ConcentrationGraph.tsx` to use hook for graph days input
- [ ] Test that debouncing still works as expected

### ✅ PR 4: Extract validation utilities
- [ ] Create `src/utils/validation.ts`
- [ ] Add `parsePositiveInteger` function
- [ ] Add `parsePositiveFloat` function
- [ ] Update input `onBlur` handlers to use validation utilities
- [ ] Test validation edge cases

### ✅ PR 5: Extract pharmacokinetic constants
- [ ] Create `src/constants/pharmacokinetics.ts`
- [ ] Extract magic numbers (100 days, 0.5 step, -3 cycles, etc.)
- [ ] Update `App.tsx` to use constants
- [ ] Update `scheduleOptimizer.ts` to use constants if applicable
- [ ] Verify calculations still work correctly

### ✅ PR 6: Extract default values
- [ ] Add default values to `src/constants/pharmacokinetics.ts`
- [ ] Update `App.tsx` to use `DEFAULTS` constant
- [ ] Update any hardcoded default doses/schedules

## Component Refactoring (Medium Risk, High Value)

### ✅ PR 7: Extract TimelineDayCell component
- [ ] Create `src/components/VisualTimeline/TimelineDayCell.tsx`
- [ ] Move day cell rendering logic to new component
- [ ] Extract props interface
- [ ] Update `VisualTimeline.tsx` to use new component
- [ ] Test clicking, editing, and adding doses

### ✅ PR 8: Extract DoseEditorPanel component
- [ ] Create `src/components/VisualTimeline/DoseEditorPanel.tsx`
- [ ] Move right sidebar editor panel logic
- [ ] Extract props interface
- [ ] Update `VisualTimeline.tsx` to use new component
- [ ] Test dose editing functionality

### ✅ PR 9: Extract PresetMenu component
- [ ] Create `src/components/VisualTimeline/PresetMenu.tsx`
- [ ] Move preset dropdown menu logic
- [ ] Extract props interface
- [ ] Update `VisualTimeline.tsx` to use new component
- [ ] Test preset selection

### ✅ PR 10: Extract ResetConfirmModal component
- [ ] Create `src/components/VisualTimeline/ResetConfirmModal.tsx`
- [ ] Move reset confirmation modal logic
- [ ] Extract props interface
- [ ] Update `VisualTimeline.tsx` to use new component
- [ ] Test reset functionality

### ✅ PR 11: Extract OptimizerModal component
- [ ] Create `src/components/VisualTimeline/OptimizerModal.tsx`
- [ ] Move optimizer modal logic
- [ ] Extract props interface
- [ ] Update `VisualTimeline.tsx` to use new component
- [ ] Test optimizer flow

### ✅ PR 12: Extract TimelineControls component
- [ ] Create `src/components/VisualTimeline/TimelineControls.tsx`
- [ ] Move schedule length, repeat, steady state controls
- [ ] Extract props interface
- [ ] Update `VisualTimeline.tsx` to use new component
- [ ] Test control interactions

### ✅ PR 13: Extract TimelineGrid component
- [ ] Create `src/components/VisualTimeline/TimelineGrid.tsx`
- [ ] Move week/day grid rendering logic
- [ ] Extract props interface
- [ ] Update `VisualTimeline.tsx` to use new component
- [ ] Test grid rendering and interactions

## Styling Improvements (Medium Risk, Medium Value)

### ✅ PR 14: Create shared button styles
- [ ] Create `src/styles/buttons.ts` or CSS module
- [ ] Extract common button style patterns
- [ ] Update buttons to use shared styles
- [ ] Test button hover states

### ✅ PR 15: Create shared modal styles
- [ ] Create `src/styles/modals.ts` or CSS module
- [ ] Extract modal overlay and container styles
- [ ] Update modals to use shared styles
- [ ] Test modal display

## Advanced Refactoring (Higher Risk, High Value)

### ✅ PR 16: Extract useDoseEditing hook
- [ ] Create `src/hooks/useDoseEditing.ts`
- [ ] Move dose editing state and logic
- [ ] Update `VisualTimeline.tsx` to use hook
- [ ] Test editing functionality

### ✅ PR 17: Extract useUrlSchedule hook
- [ ] Create `src/hooks/useUrlSchedule.ts`
- [ ] Move URL encoding/decoding logic from `App.tsx`
- [ ] Update `App.tsx` to use hook
- [ ] Test URL persistence

### ✅ PR 18: Extract useConcentrationData hook
- [ ] Create `src/hooks/useConcentrationData.ts`
- [ ] Move concentration calculation logic from `App.tsx`
- [ ] Update `App.tsx` to use hook
- [ ] Test concentration calculations

### ✅ PR 19: Add error boundaries
- [ ] Create `src/components/ErrorBoundary.tsx`
- [ ] Wrap main app sections in error boundaries
- [ ] Add error logging
- [ ] Test error handling

## Testing & Quality (Low Risk, High Value)

### ✅ PR 20: Add unit tests for formatters
- [ ] Create `src/utils/__tests__/formatters.test.ts`
- [ ] Test `formatNumber` with various inputs
- [ ] Test `formatConcentration` edge cases
- [ ] Add tests to CI if not already present

### ✅ PR 21: Add unit tests for validation
- [ ] Create `src/utils/__tests__/validation.test.ts`
- [ ] Test `parsePositiveInteger` edge cases
- [ ] Test `parsePositiveFloat` edge cases
- [ ] Test boundary conditions

### ✅ PR 22: Add unit tests for pharmacokinetics
- [ ] Create `src/utils/__tests__/pharmacokinetics.test.ts`
- [ ] Test `calculateConcentration` with known inputs
- [ ] Test `calculateTotalConcentration` with multiple doses
- [ ] Verify mathematical correctness

### ✅ PR 23: Add component tests for TimelineDayCell
- [ ] Create `src/components/VisualTimeline/__tests__/TimelineDayCell.test.tsx`
- [ ] Test rendering with/without dose
- [ ] Test click interactions
- [ ] Test editing flow

## Documentation (Low Risk, Medium Value)

### ✅ PR 24: Add JSDoc comments
- [ ] Add JSDoc to utility functions
- [ ] Add JSDoc to hooks
- [ ] Add JSDoc to complex component props
- [ ] Document pharmacokinetic constants

### ✅ PR 25: Update README with architecture
- [ ] Document component structure
- [ ] Document data flow
- [ ] Add contribution guidelines
- [ ] Document testing approach

---

## Progress Tracker

- Total PRs: 25
- Completed: 0
- In Progress: 1
- Not Started: 24

## PR 1 Summary

**Status:** ✅ Complete (ready for PR)

**Changes:**
- Created `src/utils/formatters.ts` with `formatNumber` function
- Updated `VisualTimeline.tsx` to import and use the utility
- Removed duplicate `formatNumber` function from `VisualTimeline.tsx`
- Build passes successfully

**Note:** `ConcentrationGraph.tsx` has a different `formatNumber` function that serves a different purpose (rounds concentration values). It can be extracted as a separate function (`formatConcentration`) in a future PR if needed.

## Notes

- Each PR should be small and focused
- Each PR should maintain existing functionality
- Test thoroughly before marking complete
- Consider adding integration tests as we go


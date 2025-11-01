# Quick Wins: Immediate Improvements

These are small, high-impact changes that can be implemented quickly without major refactoring.

## 1. Extract Constants (30 minutes)

### Create `src/constants/pharmacokinetics.ts`

```typescript
/**
 * Pharmacokinetic model constants
 */
export const PHARMACOKINETICS = {
  /** Maximum days an ester continues to affect concentration after injection */
  ESTER_EFFECT_DURATION_DAYS: 100,
  
  /** Time step for generating concentration data points */
  TIME_POINT_STEP: 0.5,
  
  /** Number of cycles to prepend for steady-state calculations */
  STEADY_STATE_CYCLES: 3,
  
  /** Starting cycle offset for steady state (negative to prepend cycles) */
  STEADY_STATE_START_CYCLE: -3,
} as const;

/**
 * Default values for dose and schedule configuration
 */
export const DEFAULTS = {
  DEFAULT_DOSE_MG: 6,
  DEFAULT_SCHEDULE_LENGTH: 29,
  DEFAULT_GRAPH_DAYS: 90,
  DEFAULT_REPEAT: true,
  DEFAULT_CYCLE_TYPE: 'typical' as const,
} as const;

/**
 * Dose constraints
 */
export const DOSE_CONSTRAINTS = {
  MIN_DOSE_MG: 0.1,
  MAX_DOSE_MG: 20,
  MIN_SCHEDULE_LENGTH: 1,
  MAX_SCHEDULE_LENGTH: 365,
} as const;
```

### Update existing files to use constants

**In `App.tsx`:**
```typescript
import { DEFAULTS } from './constants/pharmacokinetics';

// Replace:
return {
  doses: [],
  scheduleLength: 29,
  graphDays: 90,
  repeat: true,
  cycleType: 'typical'
};

// With:
return {
  doses: [],
  scheduleLength: DEFAULTS.DEFAULT_SCHEDULE_LENGTH,
  graphDays: DEFAULTS.DEFAULT_GRAPH_DAYS,
  repeat: DEFAULTS.DEFAULT_REPEAT,
  cycleType: DEFAULTS.DEFAULT_CYCLE_TYPE,
};
```

**In `App.tsx` useEffect:**
```typescript
import { PHARMACOKINETICS } from './constants/pharmacokinetics';

// Replace:
const timePoints = generateTimePoints(graphDisplayDays + 100, 0.5);

// With:
const timePoints = generateTimePoints(
  graphDisplayDays + PHARMACOKINETICS.ESTER_EFFECT_DURATION_DAYS,
  PHARMACOKINETICS.TIME_POINT_STEP
);
```

---

## 2. Extract Format Utilities (15 minutes)

### Create `src/utils/formatters.ts`

```typescript
/**
 * Format a number to a specific decimal precision without trailing zeros
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return parseFloat(num.toFixed(decimals)).toString();
}

/**
 * Format concentration value with appropriate rounding
 */
export function formatConcentration(value: number): number {
  if (value >= 1000) {
    return Math.round(value / 50) * 50;
  } else if (value >= 100) {
    return Math.round(value / 10) * 10;
  } else if (value >= 10) {
    return Math.round(value);
  } else {
    return parseFloat((Math.round(value * 10) / 10).toFixed(1));
  }
}

/**
 * Format dosage value with units
 */
export function formatDosage(value: number): string {
  return `${formatNumber(value, 2)}mg`;
}

/**
 * Format average weekly dosage
 */
export function formatWeeklyDosage(totalMg: number, scheduleDays: number): string {
  const avgWeeklyDose = (totalMg / scheduleDays) * 7;
  return `${formatNumber(avgWeeklyDose, 2)}mg avg/week`;
}

/**
 * Format total dosage
 */
export function formatTotalDosage(totalMg: number): string {
  return `${formatNumber(totalMg, 2)}mg total`;
}
```

### Update files to use formatters

**In `VisualTimeline.tsx`:**
```typescript
import { formatNumber, formatWeeklyDosage, formatTotalDosage } from '../utils/formatters';

// Replace inline formatNumber function with import

// Replace getDosageDisplayText:
const getDosageDisplayText = (): string => {
  if (doses.length === 0) return '';
  const totalMg = doses.reduce((sum, dose) => sum + dose.dose, 0);
  
  if (repeatSchedule) {
    return ` (${formatWeeklyDosage(totalMg, viewDays)})`;
  } else {
    return ` (${formatTotalDosage(totalMg)})`;
  }
};
```

**In `ConcentrationGraph.tsx`:**
```typescript
import { formatConcentration } from '../utils/formatters';

// Replace formatNumber function with:
const formatNumber = formatConcentration;
```

---

## 3. Extract Color Constants (20 minutes)

### Create `src/constants/colors.ts`

```typescript
/**
 * Ester-specific colors (lavender/purple theme)
 */
export const ESTER_COLORS: Record<string, string> = {
  'Estradiol benzoate': '#e6d5f5',          // Light lavender
  'Estradiol valerate': '#b794f6',          // Medium lavender
  'Estradiol cypionate': '#9b72cf',         // Purple lavender
  'Estradiol cypionate suspension': '#8b5fbf', // Deep lavender
  'Estradiol enanthate': '#a78bce',         // Soft purple
  'Estradiol undecylate': '#c9b1e4',        // Pale purple
  'Polyestradiol phosphate': '#7952b3',    // Rich purple
} as const;

/**
 * Default ester color (fallback)
 */
export const DEFAULT_ESTER_COLOR = '#b794f6';

/**
 * UI colors
 */
export const UI_COLORS = {
  background: '#f8f9fa',
  border: '#dee2e6',
  text: '#6c757d',
  textDark: '#495057',
  primary: '#b794f6',
  primaryDark: '#7952b3',
  primaryHover: '#9b72cf',
  secondary: '#6c757d',
  secondaryHover: '#5a6268',
  danger: '#c77a9b',
  dangerHover: '#b8698a',
  selected: '#f3eeff',
  selectedBorder: '#d8c7f0',
} as const;

/**
 * Get color for an ester by name
 */
export function getEsterColor(esterName: string): string {
  return ESTER_COLORS[esterName] || DEFAULT_ESTER_COLOR;
}
```

### Update VisualTimeline.tsx

```typescript
import { getEsterColor } from '../constants/colors';

// Remove getEsterColor function from component
// Use imported function instead:

const backgroundColor = getEsterColor(doseData.ester.name);
```

---

## 4. Create Debounce Hook (30 minutes)

### Create `src/hooks/useDebounce.ts`

```typescript
import { useEffect, useState } from 'react';

/**
 * Debounce a value with a specified delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debouncedCallback, setDebouncedCallback] = useState(callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => clearTimeout(handler);
  }, [callback, delay]);

  return debouncedCallback as T;
}
```

### Alternative: useDebouncedValue hook for inputs

```typescript
import { useState, useEffect } from 'react';

/**
 * Hook for debouncing input values with a controlled input pattern
 */
export function useDebouncedInput<T>(
  initialValue: T,
  onChange: (value: T) => void,
  delay: number = 1000
) {
  const [inputValue, setInputValue] = useState<T>(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue !== initialValue) {
        onChange(inputValue);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [inputValue, delay, initialValue, onChange]);

  return [inputValue, setInputValue] as const;
}
```

### Update VisualTimeline.tsx

```typescript
import { useDebouncedInput } from '../hooks/useDebounce';

// Replace:
const [scheduleInputValue, setScheduleInputValue] = useState(viewDays.toString());
useEffect(() => {
  const timeoutId = setTimeout(() => {
    const numValue = parseInt(scheduleInputValue);
    if (!isNaN(numValue) && numValue >= 1 && numValue !== viewDays) {
      onViewDaysChange(numValue);
    }
  }, 1000);
  return () => clearTimeout(timeoutId);
}, [scheduleInputValue, viewDays, onViewDaysChange]);

// With:
const [scheduleInputValue, setScheduleInputValue] = useDebouncedInput(
  viewDays.toString(),
  (value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue !== viewDays) {
      onViewDaysChange(numValue);
    }
  },
  1000
);
```

---

## 5. Extract Validation Utilities (15 minutes)

### Create `src/utils/validation.ts`

```typescript
/**
 * Validate and parse a positive integer string
 */
export function parsePositiveInteger(
  value: string,
  min: number = 1,
  max?: number
): number | null {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || (max !== undefined && num > max)) {
    return null;
  }
  return num;
}

/**
 * Validate and parse a positive float string
 */
export function parsePositiveFloat(
  value: string,
  min: number = 0,
  max?: number
): number | null {
  const num = parseFloat(value);
  if (isNaN(num) || num <= min || (max !== undefined && num > max)) {
    return null;
  }
  return num;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

### Update input handlers

```typescript
import { parsePositiveInteger } from '../utils/validation';

// In onBlur handlers:
onBlur={(e) => {
  const val = e.target.value;
  const parsed = parsePositiveInteger(val, 1);
  if (parsed === null) {
    setScheduleInputValue('1');
    onViewDaysChange(1);
  }
}}
```

---

## Implementation Order

1. **Format utilities** (15 min) - Most reused code
2. **Constants** (30 min) - Removes magic numbers
3. **Colors** (20 min) - Centralizes styling
4. **Validation** (15 min) - Improves robustness
5. **Debounce hook** (30 min) - Reduces duplication

**Total time: ~2 hours** for all quick wins.

## Benefits

- **Immediate**: Reduces code duplication
- **Foundation**: Sets up infrastructure for larger refactorings
- **Low risk**: No behavior changes, just organization
- **High value**: Makes future changes easier


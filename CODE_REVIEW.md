# Code Review: Estradiol Calculator

## Executive Summary

This is a well-functioning React/TypeScript application with solid core logic. However, there are several opportunities to improve maintainability, extensibility, and code organization. The primary concerns are:

1. **Massive component file** (`VisualTimeline.tsx` - 1048 lines)
2. **Inconsistent styling approach** (inline styles everywhere)
3. **Code duplication** (formatNumber, debounce patterns, validation)
4. **Hardcoded constants** scattered throughout
5. **Mixed concerns** (UI, business logic, state management)

---

## Priority 1: Critical Refactoring Opportunities

### 1.1 Break Down VisualTimeline Component

**Current State:** `VisualTimeline.tsx` is 1048 lines and handles:
- Timeline rendering
- Modal management (3 different modals)
- Dose editing UI
- Schedule optimizer integration
- Form validation
- State synchronization

**Recommendation:** Extract into smaller, focused components:

```
src/components/VisualTimeline/
  ├── VisualTimeline.tsx          # Main orchestrator (100-150 lines)
  ├── TimelineGrid.tsx            # Calendar grid rendering
  ├── TimelineDayCell.tsx          # Individual day cell component
  ├── DoseEditorPanel.tsx         # Right sidebar editor
  ├── PresetMenu.tsx              # Preset dropdown menu
  ├── OptimizerModal.tsx          # Schedule optimizer modal
  ├── ResetConfirmModal.tsx       # Reset confirmation modal
  └── TimelineControls.tsx        # Schedule length, repeat controls
```

**Benefits:**
- Each component has a single responsibility
- Easier to test individual pieces
- Better code reuse opportunities
- Simpler mental model for developers

---

### 1.2 Extract Custom Hooks

**Current Issues:**
- Debounce logic duplicated in multiple components
- URL encoding/decoding mixed with component logic
- Schedule calculation logic embedded in App.tsx

**Recommendation:** Create reusable hooks:

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T

// hooks/useUrlSchedule.ts
export function useUrlSchedule(): {
  schedule: ScheduleData | null;
  updateSchedule: (data: ScheduleData) => void;
}

// hooks/useConcentrationData.ts
export function useConcentrationData(
  doses: Dose[],
  scheduleLength: number,
  graphDays: number,
  repeat: boolean,
  steadyState: boolean
): ConcentrationPoint[]

// hooks/useDoseEditing.ts
export function useDoseEditing(
  doses: Dose[],
  onDosesChange: (doses: Dose[]) => void
): {
  selectedDose: number | null;
  editingDose: number | null;
  // ... editing methods
}
```

---

### 1.3 Create Constants/Theme File

**Current State:** Colors, spacing, magic numbers scattered throughout:
- `#b794f6`, `#9b72cf`, etc. hardcoded
- `100` days (ester effect duration)
- `0.5` step (time point granularity)
- Various spacing values

**Recommendation:** Create `src/constants/theme.ts`:

```typescript
export const PHARMACOKINETICS = {
  ESTER_EFFECT_DURATION_DAYS: 100,
  TIME_POINT_STEP: 0.5,
  STEADY_STATE_CYCLES: 3,
} as const;

export const COLORS = {
  primary: {
    light: '#e6d5f5',
    main: '#b794f6',
    dark: '#7952b3',
  },
  esters: {
    benzoate: '#e6d5f5',
    valerate: '#b794f6',
    cypionate: '#9b72cf',
    // ...
  },
  ui: {
    background: '#f8f9fa',
    border: '#dee2e6',
    text: '#6c757d',
    // ...
  },
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
} as const;
```

---

## Priority 2: Code Organization & Maintainability

### 2.1 Styling Strategy

**Current State:** Inline styles everywhere make it hard to:
- Maintain consistent design
- Make theme changes
- See styling at a glance
- Reuse styles

**Recommendation:** Choose one approach:
- **Option A:** CSS Modules (recommended for React apps)
  ```typescript
  import styles from './TimelineCell.module.css';
  <div className={styles.cell} />
  ```
- **Option B:** Styled Components (if you want JS-in-CSS)
  ```typescript
  const Cell = styled.div`...`;
  ```
- **Option C:** Extract inline styles to a `styles.ts` file with typed style objects

**Migration Strategy:**
- Start with new components
- Gradually refactor existing components
- Create shared style utilities (e.g., `styles/button.ts`, `styles/modal.ts`)

---

### 2.2 Utility Function Consolidation

**Current Issues:**
- `formatNumber` defined in multiple places with slight variations
- Input validation logic duplicated
- Number parsing patterns repeated

**Recommendation:** Create `src/utils/formatters.ts`:

```typescript
export const formatters = {
  number: (num: number, decimals: number = 2): string => {
    return parseFloat(num.toFixed(decimals)).toString();
  },
  
  concentration: (value: number): number => {
    // Consolidated concentration formatting logic
    if (value >= 1000) return Math.round(value / 50) * 50;
    if (value >= 100) return Math.round(value / 10) * 10;
    if (value >= 10) return Math.round(value);
    return parseFloat((Math.round(value * 10) / 10).toFixed(1));
  },
  
  dosage: (value: number): string => {
    return formatters.number(value, 2) + 'mg';
  },
} as const;
```

And `src/utils/validation.ts`:

```typescript
export const validators = {
  positiveInteger: (value: string): number | null => {
    const num = parseInt(value);
    return (!isNaN(num) && num >= 1) ? num : null;
  },
  
  positiveFloat: (value: string, min: number = 0): number | null => {
    const num = parseFloat(value);
    return (!isNaN(num) && num > min) ? num : null;
  },
} as const;
```

---

### 2.3 Type Safety Improvements

**Current State:** Some areas could benefit from stricter typing:

**Recommendations:**

1. **String literal unions instead of magic strings:**
   ```typescript
   // Instead of: 't' | 'h' | 'c' | 'p'
   // Use branded types or const enums
   export const CYCLE_TYPE = {
     TYPICAL: 'typical',
     HRT_TARGET: 'hrt-target',
     // ...
   } as const;
   ```

2. **Extract complex prop types to interfaces:**
   ```typescript
   // VisualTimelineProps is good, but break down further
   export interface DoseEditorProps {
     dose: Dose;
     onUpdate: (dose: Dose) => void;
     onRemove: () => void;
   }
   ```

3. **Use `satisfies` for better inference (TypeScript 4.9+):**
   ```typescript
   const COLORS = {
     // ...
   } satisfies Record<string, string>;
   ```

---

## Priority 3: Architecture & Extensibility

### 3.1 State Management

**Current State:** Prop drilling through multiple components, state synchronized via useEffect

**Considerations:**
- If adding more features (e.g., undo/redo, multiple schedule comparison), consider:
  - **Context API** for shared state (simple, React-native)
  - **Zustand** or **Jotai** for lightweight state management
  - **Redux Toolkit** only if you need time-travel debugging or complex middleware

**Recommendation:** Start with Context API for URL state and schedule state. Only add a state library if you find prop drilling becoming unwieldy.

---

### 3.2 Modal Management

**Current State:** Each modal manages its own `showModal` state

**Recommendation:** Create a modal system:

```typescript
// contexts/ModalContext.tsx
export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState<ModalType | null>(null);
  
  return (
    <ModalContext.Provider value={{ modal, openModal: setModal, closeModal: () => setModal(null) }}>
      {children}
      <ModalRenderer modal={modal} />
    </ModalContext.Provider>
  );
};

// Usage:
const { openModal } = useModal();
openModal('optimizer');
```

This makes it easier to:
- Add new modals
- Manage modal z-index/layering
- Track modal open state globally
- Add animations/transitions consistently

---

### 3.3 Error Handling

**Current State:** Errors mostly handled with `try/catch` and console.error

**Recommendations:**

1. **Add error boundaries:**
   ```typescript
   // ErrorBoundary.tsx
   class ErrorBoundary extends React.Component {
     // Catch rendering errors
   }
   ```

2. **User-facing error messages:**
   - Replace `alert()` calls with toast notifications
   - Show inline validation errors
   - Display helpful error messages for optimization failures

3. **Error logging:**
   - Consider adding error tracking (Sentry, LogRocket, etc.)
   - Log optimization failures with context

---

## Priority 4: Testing & Quality

### 4.1 Testing Infrastructure

**Current State:** Tests appear minimal (only `App.test.tsx`)

**Recommendations:**

1. **Unit tests for pure functions:**
   - `calculateConcentration` (pharmacokinetics.ts)
   - `encodeSchedule` / `decodeSchedule` (urlEncoding.ts)
   - `formatNumber` (formatters.ts)
   - `calculateMSE` (scheduleOptimizer.ts)

2. **Component tests:**
   - After breaking down VisualTimeline, test each sub-component
   - Test user interactions (clicking days, editing doses)
   - Test modal opening/closing

3. **Integration tests:**
   - Test schedule persistence via URL
   - Test optimization flow end-to-end

**Testing Library:** You already have React Testing Library set up - use it!

---

### 4.2 Code Quality Tools

**Recommendations:**

1. **Add ESLint rules:**
   ```json
   // .eslintrc.json additions
   {
     "rules": {
       "max-lines": ["warn", { "max": 300 }],
       "complexity": ["warn", 10],
       "max-params": ["warn", 4]
     }
   }
   ```

2. **Prettier for formatting:**
   - Ensures consistent code style
   - Prevents style debates in PRs

3. **Pre-commit hooks (Husky):**
   - Run linter
   - Run tests
   - Format code

---

## Priority 5: Performance Optimizations

### 5.1 React Performance

**Issues:**
- Large components re-render entire subtrees
- Optimization calculations run synchronously (could block UI)

**Recommendations:**

1. **Memoization:**
   ```typescript
   const TimelineDayCell = React.memo(({ day, dose, ... }) => {
     // ...
   });
   
   const memoizedData = useMemo(() => 
     calculateTotalConcentration(doses, timePoints),
     [doses, timePoints]
   );
   ```

2. **Virtual scrolling** for long timelines:
   - Consider `react-window` if timeline grows beyond 120 days

3. **Web Workers for optimization:**
   - Move `optimizeSchedule` to a Web Worker
   - Prevents UI blocking during long optimizations

---

### 5.2 Calculation Optimization

**Current State:** `generateTimePoints` creates many data points (0.5 step = 180 points for 90 days)

**Considerations:**
- Current approach is fine for most use cases
- If performance becomes an issue, consider:
  - Adaptive step size (smaller near doses, larger elsewhere)
  - WebGL rendering for very large datasets
  - Lazy calculation (only calculate visible range)

---

## Specific Code Improvements

### A. VisualTimeline.tsx Refactoring

**Extract timeline day rendering:**
```typescript
// TimelineDayCell.tsx
interface TimelineDayCellProps {
  day: number;
  dose: Dose | null;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onAdd: () => void;
  onUpdateDose: (dose: number) => void;
}

export const TimelineDayCell: React.FC<TimelineDayCellProps> = ({
  day, dose, isSelected, isEditing, onSelect, onAdd, onUpdateDose
}) => {
  // 150-200 lines extracted here
};
```

**Extract modal components:**
```typescript
// OptimizerModal.tsx
export const OptimizerModal: React.FC<OptimizerModalProps> = ({
  isOpen,
  onClose,
  onOptimize,
  // ...
}) => {
  // 200+ lines extracted here
};
```

### B. App.tsx Improvements

**Extract URL loading logic:**
```typescript
// hooks/useInitialSchedule.ts
export function useInitialSchedule() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const scheduleData = params.get('s');
    
    if (scheduleData) {
      let decoded = decodeSchedule(scheduleData);
      if (!decoded) {
        decoded = decodeLegacySchedule(scheduleData);
      }
      if (decoded) return decoded;
    }
    
    return getDefaultSchedule();
  }, []);
}
```

**Extract dose calculation logic:**
```typescript
// utils/scheduleCalculation.ts
export function prepareDosesForCalculation(
  doses: Dose[],
  scheduleLength: number,
  graphDays: number,
  repeat: boolean,
  steadyState: boolean
): Dose[] {
  // Logic extracted from App.tsx useEffect
}
```

---

## Migration Strategy

**Phase 1 (Week 1-2):** Foundation
1. Create constants/theme file
2. Extract utility functions (formatters, validators)
3. Set up custom hooks for debounce

**Phase 2 (Week 3-4):** Component Breakdown
1. Extract TimelineDayCell component
2. Extract DoseEditorPanel component
3. Extract one modal at a time

**Phase 3 (Week 5-6):** Polish
1. Migrate to CSS Modules or styled components
2. Add error boundaries
3. Improve error handling

**Phase 4 (Ongoing):** Testing & Quality
1. Add unit tests incrementally
2. Set up ESLint/Prettier
3. Add integration tests for critical paths

---

## Quick Wins (Can be done immediately)

1. **Extract formatNumber to utils** - 15 minutes
2. **Create constants file** - 30 minutes
3. **Extract debounce to custom hook** - 30 minutes
4. **Add JSDoc comments** to complex functions - 1 hour
5. **Extract TimelineDayCell component** - 2-3 hours

---

## Summary

The codebase is functional and well-structured at the macro level, but would benefit significantly from:

1. **Breaking down the VisualTimeline component** (highest impact)
2. **Consolidating styling approach** (high impact, moderate effort)
3. **Extracting reusable utilities and hooks** (high value, low effort)
4. **Adding testing infrastructure** (critical for long-term maintenance)
5. **Improving error handling** (better user experience)

These improvements will make the codebase more maintainable, easier to extend, and more welcoming to new developers.


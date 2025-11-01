# Refactoring Example: TimelineDayCell Extraction

This document shows a concrete example of how to refactor the `VisualTimeline` component by extracting the day cell rendering logic.

## Before: Inline in VisualTimeline.tsx (lines 152-276)

The day cell rendering is embedded directly in the `renderTimelineDay` function, mixing concerns.

## After: Extracted Component

### Step 1: Create the TimelineDayCell Component

```typescript
// src/components/VisualTimeline/TimelineDayCell.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Dose } from '../../data/estradiolEsters';

interface TimelineDayCellProps {
  day: number;
  dose: Dose | null;
  isSelected: boolean;
  isEditing: boolean;
  editingValue: string;
  onSelect: () => void;
  onAdd: () => void;
  onEditStart: (day: number) => void;
  onEditEnd: (value: string) => void;
  onUpdateDose: (day: number, dose: number) => void;
  onFocusInput?: (day: number, element: HTMLInputElement | null) => void;
}

export const TimelineDayCell: React.FC<TimelineDayCellProps> = ({
  day,
  dose,
  isSelected,
  isEditing,
  editingValue,
  onSelect,
  onAdd,
  onEditStart,
  onEditEnd,
  onUpdateDose,
  onFocusInput,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onFocusInput && inputRef.current) {
      onFocusInput(day, inputRef.current);
    }
  }, [day, onFocusInput]);

  const formatNumber = (num: number): string => {
    return parseFloat(num.toFixed(2)).toString();
  };

  const getEsterColor = (esterName: string): string => {
    const colors: { [key: string]: string } = {
      'Estradiol benzoate': '#e6d5f5',
      'Estradiol valerate': '#b794f6',
      'Estradiol cypionate': '#9b72cf',
      'Estradiol cypionate suspension': '#8b5fbf',
      'Estradiol enanthate': '#a78bce',
      'Estradiol undecylate': '#c9b1e4',
      'Polyestradiol phosphate': '#7952b3',
    };
    return colors[esterName] || '#b794f6';
  };

  if (dose) {
    const backgroundColor = getEsterColor(dose.ester.name);

    return (
      <div
        onClick={onSelect}
        className="testcell"
        style={{
          width: '100%',
          aspectRatio: '1',
          backgroundColor,
          border: isSelected ? '2px solid #7952b3' : '1px solid #dee2e6',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          color: 'white',
          fontWeight: '600',
          position: 'relative',
          transition: 'all 0.15s ease',
          boxShadow: `0 1px 2px ${backgroundColor}66`,
          overflow: 'hidden',
        }}
        title={`Day ${day}: ${formatNumber(dose.dose)}mg (${dose.ester.name})`}
      >
        <input
          ref={inputRef}
          type="text"
          value={isEditing ? editingValue : formatNumber(dose.dose)}
          onChange={(e) => {
            // Local state handled by parent
          }}
          onFocus={() => onEditStart(day)}
          onBlur={() => {
            const newDose = parseFloat(editingValue);
            if (!isNaN(newDose) && newDose > 0) {
              onUpdateDose(day, newDose);
            }
            onEditEnd('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newDose = parseFloat(editingValue);
              if (!isNaN(newDose) && newDose > 0) {
                onUpdateDose(day, newDose);
              }
              onEditEnd('');
              e.currentTarget.blur();
            } else if (e.key === 'Escape') {
              onEditEnd('');
              e.currentTarget.blur();
            }
          }}
          readOnly={!isEditing}
          style={{
            width: '4ch',
            minWidth: '4ch',
            maxWidth: '4ch',
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: '600',
            color: 'white',
            padding: '0',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        onAdd();
        onEditStart(day);
      }}
      style={{
        width: '100%',
        aspectRatio: '1',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        color: '#6c757d',
        fontWeight: '400',
        position: 'relative',
        transition: 'all 0.15s ease',
      }}
      title={`Day ${day}: Click to add injection`}
    >
      {day % 7 === 0 ? day : ''}
    </div>
  );
};
```

### Step 2: Update VisualTimeline to use the component

```typescript
// In VisualTimeline.tsx, replace renderTimelineDay with:

const renderTimelineDay = (day: number) => {
  const doseData = doses.find(d => d.day === day);
  const dose = doseData || null;
  const isSelected = selectedDose === day;
  const isEditing = editingDose === day;

  return (
    <TimelineDayCell
      key={day}
      day={day}
      dose={dose}
      isSelected={isSelected}
      isEditing={isEditing}
      editingValue={editingValue}
      onSelect={() => {
        setSelectedDose(isSelected ? null : day);
      }}
      onAdd={() => {
        addOrUpdateDose(day);
        setSelectedDose(day);
        setEditingDose(day);
        setEditingValue('6');
      }}
      onEditStart={(day) => {
        setEditingDose(day);
        const dose = doses.find(d => d.day === day);
        setEditingValue(dose?.dose.toString() || '');
      }}
      onEditEnd={() => {
        setEditingDose(null);
      }}
      onUpdateDose={updateDoseAmount}
      onFocusInput={(day, element) => {
        if (element) {
          setTimeout(() => {
            element.focus();
            element.select();
          }, 10);
        }
      }}
    />
  );
};
```

## Benefits

1. **Separation of Concerns**: Cell rendering logic is isolated
2. **Testability**: Can test TimelineDayCell independently
3. **Reusability**: Can use in other contexts (e.g., schedule comparison view)
4. **Maintainability**: Easier to understand and modify cell behavior
5. **Performance**: Can memoize the cell component

## Next Steps

1. Extract color mapping to a constants file
2. Extract formatNumber to utils
3. Create a theme/styling system
4. Extract the input editing logic to a custom hook


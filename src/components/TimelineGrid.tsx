import { useState, useRef } from 'react';
import { Dose } from '../data/estradiolEsters';
import { EstradiolMedication } from '../types/medication';
import { formatNumber } from '../utils/formatters';
import { getEsterColor } from '../constants/colors';
import { parsePositiveFloat } from '../utils/validation';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/styles';

interface TimelineGridProps {
  doses: Dose[];
  viewDays: number;
  selectedDose: number | null;
  esterConcentrations: Record<string, number>;
  defaultEster: EstradiolMedication;
  onDoseClick: (day: number) => void;
  onDoseAdd: (day: number, dose: number, ester: EstradiolMedication) => void;
  onDoseUpdate: (day: number, newDose: number) => void;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
  doses,
  viewDays,
  selectedDose,
  esterConcentrations,
  defaultEster,
  onDoseClick,
  onDoseAdd,
  onDoseUpdate
}) => {
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [editingDose, setEditingDose] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const renderTimelineDay = (day: number) => {
    const doseData = doses.find(d => d.day === day);
    const dose = doseData?.dose || null;
    const hasInjection = dose !== null;
    const isSelected = selectedDose === day;
    const isEditing = editingDose === day;

    if (hasInjection && doseData) {
      const medication = doseData.medication || doseData.ester; // Backward compatibility
      const medicationName = medication?.name || 'Unknown';
      const backgroundColor = getEsterColor(medicationName);
      const concentration = esterConcentrations[medicationName] || 40;
      const volumeMl = dose / concentration;

      return (
        <div
          key={day}
          onClick={() => onDoseClick(day)}
          className="testcell"
          style={{
            width: '100%',
            aspectRatio: '1',
            backgroundColor,
            border: isSelected ? `2px solid ${COLORS.primaryHover}` : `1px solid ${COLORS.gray300}`,
            borderRadius: BORDER_RADIUS.sm,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: TYPOGRAPHY.fontSize.base,
            color: COLORS.white,
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            position: 'relative' as const,
            transition: 'all 0.15s ease',
            boxShadow: `0 1px 2px ${backgroundColor}66`,
            overflow: 'hidden'
          }}
          title={`Day ${day}: ${formatNumber(dose)}mg = ${formatNumber(volumeMl, 3)}mL (${medicationName})`}
        >
          <input
            ref={(el) => { inputRefs.current[day] = el; }}
            type="text"
            value={isEditing ? editingValue : formatNumber(dose)}
            onChange={(e) => {
              setEditingValue(e.target.value);
            }}
            onFocus={(e) => {
              setEditingDose(day);
              setEditingValue(dose?.toString() || '');
              e.target.select();
            }}
            onBlur={() => {
              const newDose = parsePositiveFloat(editingValue, 0);
              if (newDose !== null) {
                onDoseUpdate(day, newDose);
              }
              setEditingDose(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const newDose = parsePositiveFloat(editingValue, 0);
                if (newDose !== null) {
                  onDoseUpdate(day, newDose);
                }
                setEditingDose(null);
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setEditingDose(null);
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
              textAlign: 'center' as const,
              fontSize: TYPOGRAPHY.fontSize.base,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.white,
              padding: '0',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          {/* Volume display in corner */}
          <div
            style={{
              position: 'absolute' as const,
              bottom: '2px',
              right: '3px',
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              color: 'rgba(255, 255, 255, 0.85)',
              pointerEvents: 'none' as const,
              textShadow: '0 0 2px rgba(0,0,0,0.3)'
            }}
          >
            {formatNumber(volumeMl, 3)}mL
          </div>
        </div>
      );
    }

    return (
      <div
        key={day}
        onClick={() => {
          onDoseAdd(day, 6, defaultEster);
          // Select this dose and enter editing mode
          onDoseClick(day);
          setEditingDose(day);
          setEditingValue('6');
          setTimeout(() => {
            inputRefs.current[day]?.focus();
            inputRefs.current[day]?.select();
          }, 10);
        }}
        style={{
          width: '100%',
          aspectRatio: '1',
          backgroundColor: COLORS.gray50,
          border: `1px solid ${COLORS.gray300}`,
          borderRadius: BORDER_RADIUS.sm,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: TYPOGRAPHY.fontSize.base,
          color: COLORS.gray600,
          fontWeight: TYPOGRAPHY.fontWeight.normal,
          position: 'relative' as const,
          transition: 'all 0.15s ease'
        }}
        title={`Day ${day}: Click to add injection`}
      >
        {day % 7 === 0 ? day : ''}
      </div>
    );
  };

  const renderWeeks = () => {
    const weeks = [];
    for (let week = 0; week < Math.ceil(viewDays / 7); week++) {
      const weekDays = [];
      for (let day = week * 7; day < Math.min((week + 1) * 7, viewDays); day++) {
        weekDays.push(renderTimelineDay(day));
      }
      weeks.push(
        <div key={week} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: SPACING.sm, marginBottom: SPACING.sm }}>
          {weekDays}
        </div>
      );
    }
    return weeks;
  };

  return (
    <div className="hide-scrollbar" style={{
      border: `2px solid ${COLORS.gray300}`,
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: COLORS.white,
      height: '400px',
      overflowY: 'auto' as const,
      padding: SPACING.xl,
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none' // IE/Edge
    }}>
      {renderWeeks()}
    </div>
  );
};

export default TimelineGrid;

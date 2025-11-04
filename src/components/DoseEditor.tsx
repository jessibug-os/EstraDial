import { Dose, ESTRADIOL_ESTERS } from '../data/estradiolEsters';
import { formatNumber } from '../utils/formatters';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, BUTTON_STYLES, INPUT_STYLES, mergeStyles } from '../constants/styles';

interface DoseEditorProps {
  selectedDoseData: Dose | null;
  onUpdateDoseEster: (day: number, esterName: string) => void;
  onUpdateDoseAmount: (day: number, newDose: number) => void;
  onRemoveDose: (day: number) => void;
  onClose: () => void;
}

const DoseEditor: React.FC<DoseEditorProps> = ({
  selectedDoseData,
  onUpdateDoseEster,
  onUpdateDoseAmount,
  onRemoveDose,
  onClose
}) => {
  return (
    <div style={{
      padding: SPACING['3xl'],
      backgroundColor: selectedDoseData ? COLORS.selectedHighlight : COLORS.white,
      border: `1px solid ${selectedDoseData ? COLORS.selectedBorder : COLORS.gray300}`,
      borderRadius: BORDER_RADIUS.lg,
      boxShadow: SHADOWS.md,
      height: '454px',
      overflowY: 'auto' as const,
      display: 'flex',
      flexDirection: 'column' as const
    }}>
      {selectedDoseData ? (
        <>
          <h4 style={{ margin: `0 0 ${SPACING['2xl']} 0`, fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>Edit Injection - Day {selectedDoseData.day}</h4>

          <div style={{ marginBottom: SPACING['2xl'] }}>
            <label style={{ display: 'block', marginBottom: SPACING.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.md }}>Estradiol Ester:</label>
            <select
              value={(selectedDoseData.medication || selectedDoseData.ester)?.name}
              onChange={(e) => onUpdateDoseEster(selectedDoseData.day, e.target.value)}
              style={{
                width: '100%',
                padding: SPACING.md,
                border: `1px solid ${COLORS.gray400}`,
                borderRadius: BORDER_RADIUS.sm,
                fontSize: TYPOGRAPHY.fontSize.md,
                backgroundColor: COLORS.white
              }}
            >
              {ESTRADIOL_ESTERS.map((ester) => (
                <option key={ester.name} value={ester.name}>
                  {ester.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: SPACING['2xl'] }}>
            <label style={{ display: 'block', marginBottom: SPACING.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.md }}>Dose (mg):</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
              <input
                type="number"
                value={formatNumber(selectedDoseData.dose)}
                onChange={(e) => onUpdateDoseAmount(selectedDoseData.day, parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                max="20"
                style={mergeStyles(INPUT_STYLES.base, INPUT_STYLES.numberLarge)}
              />
              <span style={{ color: COLORS.gray600, fontSize: TYPOGRAPHY.fontSize.md }}>mg</span>
            </div>
          </div>

          <div style={{ marginBottom: SPACING['3xl'], padding: SPACING.xl, backgroundColor: COLORS.parameterBackground, borderRadius: BORDER_RADIUS.sm }}>
            <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, marginBottom: SPACING.md, color: COLORS.parameterText }}>Pharmacokinetic Parameters:</div>
            <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray600 }}>
              {(() => {
                const med = selectedDoseData.medication || selectedDoseData.ester;
                // Check if it's an estradiol medication (has D, k1, k2, k3)
                if (med && 'D' in med) {
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>D:</span>
                        <span style={{ fontFamily: 'monospace' }}>{med.D.toExponential(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>k1:</span>
                        <span style={{ fontFamily: 'monospace' }}>{med.k1.toFixed(4)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>k2:</span>
                        <span style={{ fontFamily: 'monospace' }}>{med.k2.toFixed(4)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>k3:</span>
                        <span style={{ fontFamily: 'monospace' }}>{med.k3.toFixed(4)}</span>
                      </div>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: SPACING.lg }}>
            <button
              onClick={onClose}
              style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.primary, {
                borderRadius: BORDER_RADIUS.md
              })}
            >
              Done
            </button>
            <button
              onClick={() => onRemoveDose(selectedDoseData.day)}
              style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.danger, {
                borderRadius: BORDER_RADIUS.md
              })}
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <>
          <h4 style={{ margin: `0 0 ${SPACING['2xl']} 0`, fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>Instructions</h4>
          <p style={{ fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.gray600, lineHeight: TYPOGRAPHY.lineHeight.relaxed }}>
            Click on any day in the calendar to add an injection. Click on an existing injection to edit its dose and ester type.
          </p>
          <p style={{ fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.gray600, lineHeight: TYPOGRAPHY.lineHeight.relaxed, marginTop: SPACING.xl }}>
            Each injection can use a different estradiol ester with unique pharmacokinetic properties.
          </p>
        </>
      )}
    </div>
  );
};

export default DoseEditor;

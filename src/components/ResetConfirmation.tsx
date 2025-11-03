import { Z_INDEX } from '../constants/defaults';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, BUTTON_STYLES, mergeStyles } from '../constants/styles';

interface ResetConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  doseCount: number;
}

const ResetConfirmation: React.FC<ResetConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  doseCount
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: Z_INDEX.MODAL_BACKDROP
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'absolute' as const,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: SPACING.md,
          backgroundColor: COLORS.white,
          padding: SPACING['2xl'],
          borderRadius: BORDER_RADIUS.lg,
          boxShadow: SHADOWS.lg,
          width: '280px',
          zIndex: Z_INDEX.MODAL_CONTENT,
          border: `1px solid ${COLORS.gray300}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        <div
          style={{
            position: 'absolute' as const,
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `6px solid ${COLORS.gray300}`
          }}
        />
        <div
          style={{
            position: 'absolute' as const,
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `6px solid ${COLORS.white}`
          }}
        />

        <div style={{ fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, marginBottom: SPACING.md }}>
          Clear all injections?
        </div>
        <div style={{ fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.gray600, marginBottom: SPACING['2xl'] }}>
          This will remove all {doseCount} injection{doseCount !== 1 ? 's' : ''}.
        </div>
        <div style={{ display: 'flex', gap: SPACING.md }}>
          <button
            onClick={onClose}
            style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.secondary, {
              flex: 1,
              padding: SPACING.md,
              fontSize: TYPOGRAPHY.fontSize.base
            })}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.danger, {
              flex: 1,
              padding: SPACING.md,
              fontSize: TYPOGRAPHY.fontSize.base
            })}
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
};

export default ResetConfirmation;

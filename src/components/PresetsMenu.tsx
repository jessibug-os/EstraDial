import { Dose } from '../data/estradiolEsters';
import { PRESETS } from '../data/presets';
import { Z_INDEX } from '../constants/defaults';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/styles';

interface PresetsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (doses: Dose[], scheduleLength: number, repeat: boolean) => void;
}

const PresetsMenu: React.FC<PresetsMenuProps> = ({ isOpen, onClose, onSelectPreset }) => {
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
          left: 0,
          marginTop: SPACING.xs,
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.gray300}`,
          borderRadius: BORDER_RADIUS.md,
          boxShadow: SHADOWS.lg,
          zIndex: Z_INDEX.MODAL_CONTENT,
          minWidth: '280px',
          maxHeight: '400px',
          overflowY: 'auto' as const
        }}
      >
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => {
              onSelectPreset(preset.doses, preset.scheduleLength, preset.repeat ?? true);
              onClose();
            }}
            style={{
              width: '100%',
              padding: `${SPACING.lg} ${SPACING.md}`,
              textAlign: 'left' as const,
              border: 'none',
              borderBottom: `1px solid ${COLORS.gray100}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              fontSize: TYPOGRAPHY.fontSize.base,
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.gray50}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.white}
          >
            <div style={{ fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.gray900, marginBottom: '2px' }}>
              {preset.name}
            </div>
            <div style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.gray600 }}>
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default PresetsMenu;

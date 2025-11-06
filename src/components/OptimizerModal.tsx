import { useState, useEffect } from 'react';
import { ESTRADIOL_ESTERS } from '../data/estradiolEsters';
import { PROGESTERONE_ROUTES } from '../data/progesteroneRoutes';
import { AnyMedication } from '../types/medication';
import { ReferenceCycleType } from '../data/referenceData';
import { formatNumber } from '../utils/formatters';
import ErrorBoundary from './ErrorBoundary';
import { Z_INDEX } from '../constants/defaults';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, BUTTON_STYLES, INPUT_STYLES, MODAL_STYLES, mergeStyles } from '../constants/styles';

interface OptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewDays: number;
  referenceCycleType: ReferenceCycleType;
  esterConcentrations: Record<string, number>;
  selectedEsters: AnyMedication[];
  maxInjections: number;
  granularity: number;
  progesteroneDoses: number[];
  onSettingsChange: (selectedEsters: AnyMedication[], granularity: number, progesteroneDoses: number[]) => void;
}

const OptimizerModal: React.FC<OptimizerModalProps> = ({
  isOpen,
  onClose,
  selectedEsters: initialSelectedEsters,
  granularity: initialGranularity,
  progesteroneDoses: initialProgesteroneDoses,
  onSettingsChange
}) => {
  const [selectedEsters, setSelectedEsters] = useState<AnyMedication[]>(initialSelectedEsters);
  const [granularity, setGranularity] = useState<number>(initialGranularity);
  const [progesteroneDoses, setProgesteroneDoses] = useState<number[]>(initialProgesteroneDoses);

  // Update local state when props change
  useEffect(() => {
    setSelectedEsters(initialSelectedEsters);
    setGranularity(initialGranularity);
    setProgesteroneDoses(initialProgesteroneDoses);
  }, [initialSelectedEsters, initialGranularity, initialProgesteroneDoses, isOpen]);

  if (!isOpen) return null;

  return (
    <ErrorBoundary
      fallback={
        <div
          style={mergeStyles(MODAL_STYLES.content, MODAL_STYLES.smallContent, {
            zIndex: Z_INDEX.MODAL_ELEVATED,
            textAlign: 'center' as const
          })}
        >
          <div style={{ fontSize: TYPOGRAPHY.fontSize['2xl'], marginBottom: SPACING.xl }}>⚠️</div>
          <h3 style={{ margin: `0 0 ${SPACING.md} 0`, fontSize: TYPOGRAPHY.fontSize.xl }}>Optimizer Error</h3>
          <p style={{ fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.gray600, marginBottom: SPACING['2xl'] }}>
            The schedule optimizer encountered an error. Please try different settings or close and try again.
          </p>
          <button
            onClick={onClose}
            style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.primary, {
              padding: `${SPACING.lg} ${SPACING['3xl']}`
            })}
          >
            Close
          </button>
        </div>
      }
    >
      <>
      <div
        style={mergeStyles(MODAL_STYLES.backdrop, {
          zIndex: Z_INDEX.MODAL_CONTENT
        })}
        onClick={onClose}
      />
      <div
        style={mergeStyles(MODAL_STYLES.content, {
          zIndex: Z_INDEX.MODAL_ELEVATED,
          maxWidth: '500px',
          width: '90%'
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={MODAL_STYLES.title}>Optimizer Settings</h3>
        <p style={{ fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.gray600, marginBottom: SPACING['3xl'] }}>
          Configure which esters you have access to and the volume granularity for optimization.
        </p>

        <div style={{ marginBottom: SPACING['3xl'] }}>
          <label style={{ fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, display: 'block', marginBottom: SPACING.lg }}>
            Available Medications:
          </label>

          {/* Estradiol section */}
          <div style={{ marginBottom: SPACING.lg }}>
            <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.gray600, marginBottom: SPACING.sm }}>
              Estradiol Esters
            </div>
            {ESTRADIOL_ESTERS.map((ester, index) => (
              <label
                key={`estradiol-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: SPACING.md,
                  marginBottom: SPACING.sm,
                  borderRadius: BORDER_RADIUS.sm,
                  backgroundColor: selectedEsters.some(e => e.name === ester.name) ? '#f0e6ff' : COLORS.gray50,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedEsters.some(e => e.name === ester.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEsters([...selectedEsters, ester]);
                    } else {
                      setSelectedEsters(selectedEsters.filter(e => e.name !== ester.name));
                    }
                  }}
                  style={{ marginRight: SPACING.lg, cursor: 'pointer' }}
                />
                <span style={{ fontSize: TYPOGRAPHY.fontSize.base }}>{ester.name}</span>
              </label>
            ))}
          </div>

          {/* Progesterone section */}
          <div>
            <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.gray600, marginBottom: SPACING.sm }}>
              Progesterone
            </div>
            {PROGESTERONE_ROUTES.map((prog, index) => (
              <label
                key={`progesterone-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: SPACING.md,
                  marginBottom: SPACING.sm,
                  borderRadius: BORDER_RADIUS.sm,
                  backgroundColor: selectedEsters.some(e => e.name === prog.name) ? '#f0e6ff' : COLORS.gray50,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedEsters.some(e => e.name === prog.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEsters([...selectedEsters, prog]);
                    } else {
                      setSelectedEsters(selectedEsters.filter(e => e.name !== prog.name));
                    }
                  }}
                  style={{ marginRight: SPACING.lg, cursor: 'pointer' }}
                />
                <span style={{ fontSize: TYPOGRAPHY.fontSize.base }}>{prog.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Progesterone dose selection */}
        <div style={{ marginBottom: SPACING['3xl'] }}>
          <label style={{ fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, display: 'block', marginBottom: SPACING.lg }}>
            Available Progesterone Doses:
          </label>
          <div style={{ display: 'flex', gap: SPACING.lg }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: SPACING.md,
                borderRadius: BORDER_RADIUS.sm,
                backgroundColor: progesteroneDoses.includes(100) ? '#f0e6ff' : COLORS.gray50,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                flex: 1
              }}
            >
              <input
                type="checkbox"
                checked={progesteroneDoses.includes(100)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProgesteroneDoses([...progesteroneDoses, 100].sort());
                  } else {
                    setProgesteroneDoses(progesteroneDoses.filter(d => d !== 100));
                  }
                }}
                style={{ marginRight: SPACING.lg, cursor: 'pointer' }}
              />
              <span style={{ fontSize: TYPOGRAPHY.fontSize.base }}>100mg</span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: SPACING.md,
                borderRadius: BORDER_RADIUS.sm,
                backgroundColor: progesteroneDoses.includes(200) ? '#f0e6ff' : COLORS.gray50,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                flex: 1
              }}
            >
              <input
                type="checkbox"
                checked={progesteroneDoses.includes(200)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProgesteroneDoses([...progesteroneDoses, 200].sort());
                  } else {
                    setProgesteroneDoses(progesteroneDoses.filter(d => d !== 200));
                  }
                }}
                style={{ marginRight: SPACING.lg, cursor: 'pointer' }}
              />
              <span style={{ fontSize: TYPOGRAPHY.fontSize.base }}>200mg</span>
            </label>
          </div>
          <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray600, marginTop: SPACING.sm }}>
            Select which progesterone pill/suppository doses you have available
          </div>
        </div>

        {selectedEsters.length === 0 && (
          <div style={{ padding: SPACING.lg, backgroundColor: COLORS.warning, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING['2xl'] }}>
            <span style={{ fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.warningText }}>
              Please select at least one medication
            </span>
          </div>
        )}

        <div style={{ marginBottom: SPACING['3xl'] }}>
          <label style={{ fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, display: 'block', marginBottom: SPACING.lg }}>
            Volume Granularity (minimum volume increment):
          </label>
          <div style={{ display: 'flex', gap: SPACING.md, alignItems: 'center' }}>
            <input
              type="range"
              min="0.01"
              max="0.1"
              step="0.01"
              value={granularity}
              onChange={(e) => setGranularity(Math.round(parseFloat(e.target.value) * 100) / 100)}
              style={{ flex: 1 }}
            />
            <input
              type="number"
              min="0.01"
              max="0.1"
              step="0.01"
              value={formatNumber(granularity, 3)}
              onChange={(e) => setGranularity(Math.round(parseFloat(e.target.value) * 100) / 100 || 0.05)}
              style={mergeStyles(INPUT_STYLES.base, {
                width: '70px',
                padding: `${SPACING.sm} ${SPACING.md}`,
                fontSize: TYPOGRAPHY.fontSize.base
              })}
            />
            <span style={{ fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.gray600, minWidth: '30px' }}>mL</span>
          </div>
          <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray600, marginTop: SPACING.sm }}>
            {granularity <= 0.025 ? 'Very fine adjustments (slower, for precision)' :
             granularity <= 0.05 ? 'Fine adjustments (balanced)' :
             'Coarse adjustments (faster)'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: SPACING.lg }}>
          <button
            onClick={onClose}
            style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.secondary, {
              flex: 1
            })}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedEsters.length === 0) return;
              onSettingsChange(selectedEsters, granularity, progesteroneDoses.length > 0 ? progesteroneDoses : [100, 200]);
              onClose();
            }}
            disabled={selectedEsters.length === 0}
            style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.primary, {
              flex: 1,
              backgroundColor: selectedEsters.length === 0 ? COLORS.gray300 : COLORS.primary,
              cursor: selectedEsters.length === 0 ? 'not-allowed' : 'pointer'
            })}
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
    </ErrorBoundary>
  );
};

export default OptimizerModal;

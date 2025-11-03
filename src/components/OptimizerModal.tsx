import { useState } from 'react';
import { Dose, ESTRADIOL_ESTERS, EstradiolEster } from '../data/estradiolEsters';
import { optimizeSchedule } from '../utils/scheduleOptimizer';
import { ReferenceCycleType } from '../data/referenceData';
import { formatNumber } from '../utils/formatters';
import { useDebouncedInput } from '../hooks/useDebounce';
import { parsePositiveInteger } from '../utils/validation';
import ErrorBoundary from './ErrorBoundary';
import { OPTIMIZER_DEFAULTS, Z_INDEX } from '../constants/defaults';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, BUTTON_STYLES, INPUT_STYLES, MODAL_STYLES, mergeStyles } from '../constants/styles';

interface OptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewDays: number;
  referenceCycleType: ReferenceCycleType;
  esterConcentrations: Record<string, number>;
  onOptimizedSchedule: (doses: Dose[]) => void;
  onEnableRepeat: () => void;
  onEnableSteadyState: () => void;
}

const OptimizerModal: React.FC<OptimizerModalProps> = ({
  isOpen,
  onClose,
  viewDays,
  referenceCycleType,
  esterConcentrations,
  onOptimizedSchedule,
  onEnableRepeat,
  onEnableSteadyState
}) => {
  // Default to Estradiol valerate for optimizer
  const DEFAULT_OPTIMIZER_ESTER = ESTRADIOL_ESTERS[1] || ESTRADIOL_ESTERS[0]!;
  const [selectedEsters, setSelectedEsters] = useState<EstradiolEster[]>([DEFAULT_OPTIMIZER_ESTER]);
  const [maxInjections, setMaxInjections] = useState<number>(OPTIMIZER_DEFAULTS.DEFAULT_MAX_INJECTIONS);
  const [maxInjectionsInput, setMaxInjectionsInput] = useDebouncedInput(
    OPTIMIZER_DEFAULTS.DEFAULT_MAX_INJECTIONS.toString(),
    (value) => {
      const numValue = parsePositiveInteger(value, 1);
      if (numValue !== null && numValue !== maxInjections) {
        setMaxInjections(numValue);
      }
    },
    500
  );
  const [granularity, setGranularity] = useState<number>(OPTIMIZER_DEFAULTS.DEFAULT_GRANULARITY_ML);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationScore, setOptimizationScore] = useState(0);

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
        <h3 style={MODAL_STYLES.title}>Schedule Optimizer</h3>
        <p style={{ fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.gray600, marginBottom: SPACING['3xl'] }}>
          Select which esters you have access to, and the optimizer will find the best injection schedule to match your selected reference cycle.
        </p>

        <div style={{ marginBottom: SPACING['3xl'] }}>
          <label style={{ fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, display: 'block', marginBottom: SPACING.lg }}>
            Injections Per Cycle:
          </label>
          <div style={{ display: 'flex', gap: SPACING.xl, alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              max={viewDays}
              value={maxInjectionsInput}
              onChange={(e) => setMaxInjectionsInput(e.target.value)}
              onBlur={(e) => {
                const val = e.target.value;
                const parsed = parsePositiveInteger(val, 1);
                if (parsed === null) {
                  setMaxInjectionsInput('1');
                  setMaxInjections(1);
                }
              }}
              style={mergeStyles(INPUT_STYLES.base, INPUT_STYLES.numberLarge, {
                fontSize: TYPOGRAPHY.fontSize.md
              })}
            />
            <span style={{ fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.gray600 }}>
              injections (in {viewDays} days = {formatNumber(maxInjections / viewDays * 7)} per week)
            </span>
          </div>
          <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray600, marginTop: SPACING.sm }}>
            The optimizer will find the best schedule using {maxInjections} injection{maxInjections !== 1 ? 's' : ''}.
          </div>
        </div>

        <div style={{ marginBottom: SPACING['3xl'] }}>
          <label style={{ fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, display: 'block', marginBottom: SPACING.lg }}>
            Available Esters:
          </label>
          {ESTRADIOL_ESTERS.map((ester, index) => (
            <label
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: SPACING.md,
                marginBottom: SPACING.sm,
                borderRadius: BORDER_RADIUS.sm,
                backgroundColor: selectedEsters.includes(ester) ? '#f0e6ff' : COLORS.gray50,
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
            >
              <input
                type="checkbox"
                checked={selectedEsters.includes(ester)}
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

        {selectedEsters.length === 0 && (
          <div style={{ padding: SPACING.lg, backgroundColor: COLORS.warning, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING['2xl'] }}>
            <span style={{ fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.warningText }}>
              Please select at least one ester
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

        {isOptimizing && (
          <div style={{ marginBottom: SPACING['2xl'] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <span style={{ fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.gray600 }}>
                Optimizing... {optimizationProgress}%
              </span>
              <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: '#999' }}>
                Score: {formatNumber(optimizationScore)}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: SPACING.md,
              backgroundColor: COLORS.gray200,
              borderRadius: BORDER_RADIUS.sm,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${optimizationProgress}%`,
                height: '100%',
                backgroundColor: COLORS.primary,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

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
            onClick={async () => {
              if (selectedEsters.length === 0) return;

              setIsOptimizing(true);
              setOptimizationProgress(0);
              setOptimizationScore(0);

              // Small delay to allow UI to update
              await new Promise(resolve => setTimeout(resolve, 50));

              try {
                const result = await optimizeSchedule(
                  {
                    availableEsters: selectedEsters,
                    scheduleLength: viewDays,
                    referenceCycleType,
                    steadyState: true, // Always use steady state for optimization
                    granularity,
                    maxDosePerInjection: OPTIMIZER_DEFAULTS.MAX_DOSE_PER_INJECTION,
                    minDosePerInjection: OPTIMIZER_DEFAULTS.MIN_DOSE_PER_INJECTION,
                    maxInjectionsPerCycle: maxInjections,
                    esterConcentrations
                  },
                  (progress, score) => {
                    setOptimizationProgress(Math.round(progress));
                    setOptimizationScore(score);
                  }
                );

                onOptimizedSchedule(result.doses);
                onEnableRepeat(); // Enable repeat mode for optimized schedules
                onEnableSteadyState(); // Enable steady state for optimized schedules
                onClose();
              } catch (error) {
                console.error('Optimization failed:', error);
                alert('Optimization failed. Please try again.');
              } finally {
                setIsOptimizing(false);
                setOptimizationProgress(0);
              }
            }}
            disabled={selectedEsters.length === 0 || isOptimizing}
            style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.primary, {
              flex: 1,
              backgroundColor: selectedEsters.length === 0 || isOptimizing ? COLORS.gray300 : COLORS.primary,
              cursor: selectedEsters.length === 0 || isOptimizing ? 'not-allowed' : 'pointer'
            })}
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
          </button>
        </div>
      </div>
    </>
    </ErrorBoundary>
  );
};

export default OptimizerModal;

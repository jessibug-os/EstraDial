import { Dose } from '../data/estradiolEsters';
import { AnyMedication, isProgesteroneMedication, isEstradiolMedication } from '../types/medication';
import { calculateTotalConcentration, generateTimePoints, ConcentrationPoint } from './pharmacokinetics';
import { generateReferenceCycle, ReferenceCycleType } from '../data/referenceData';
import { PHARMACOKINETICS } from '../constants/pharmacokinetics';

// Optimization algorithm constants
const OPTIMIZATION_CONSTANTS = {
  // Starting dose for estradiol (mL)
  DEFAULT_ESTRADIOL_STARTING_VOLUME_ML: 0.15,

  // Dose adjustment search parameters
  MAX_DOSE_ADJUSTMENT_STEPS: 10,

  // Progesterone constraints
  MAX_ORAL_VAGINAL_PROGESTERONE_PER_DAY: 4,

  // Progress estimation parameters
  PROGRESS_CONVERGENCE_RATE: 10, // Higher = faster initial progress
  MAX_DISPLAYED_PROGRESS_UNTIL_COMPLETE: 95,

  // MSE calculation sampling
  SAMPLES_PER_DAY: 4,
  TIME_POINT_TOLERANCE: 0.1,

  // Convergence detection
  MIN_IMPROVEMENT_THRESHOLD: 0.0001, // Stop if improvement less than this
  NO_IMPROVEMENT_ITERATIONS_LIMIT: 3, // Stop after N iterations without improvement

  // Adaptive granularity
  ADAPTIVE_GRANULARITY_ENABLED: true,
  INITIAL_GRANULARITY_MULTIPLIER: 4, // Start 4x coarser
  GRANULARITY_REFINEMENT_TRIGGER: 2, // Refine after N iterations without improvement
  MIN_GRANULARITY_MULTIPLIER: 1, // Don't go finer than requested granularity

  // Simulated annealing (currently disabled - would require refactoring greedy search)
  SIMULATED_ANNEALING_ENABLED: false,
  INITIAL_TEMPERATURE: 1.0, // Initial temperature for simulated annealing
  COOLING_RATE: 0.95, // Temperature multiplier per iteration
  MIN_TEMPERATURE: 0.01, // Stop annealing below this temperature

  // Multi-objective optimization (quality vs simplicity)
  SIMPLICITY_WEIGHT: 0.02, // How much to penalize complexity (injections)
  DOSE_COMPLEXITY_WEIGHT: 0.001, // Small penalty for having many different dose amounts
  PREFER_FEWER_MEDICATIONS: true, // Prefer using fewer different medications
  MEDICATION_VARIETY_PENALTY: 0.01, // Penalty for each unique medication used
} as const;

export interface OptimizationParams {
  availableEsters: AnyMedication[];
  scheduleLength: number;
  referenceCycleType: ReferenceCycleType;
  steadyState?: boolean;
  granularity?: number; // In mL
  maxDosePerInjection?: number; // In mg
  minDosePerInjection?: number; // In mg
  maxInjectionsPerCycle?: number;
  esterConcentrations: Record<string, number>; // mg/mL for each ester
  progesteroneDoses?: number[]; // Available progesterone doses (100mg and/or 200mg)
}

export interface OptimizationResult {
  doses: Dose[];
  score: number; // Lower is better (mean squared error)
  iterations: number;
}

export type ProgressCallback = (progress: number, currentScore: number, iteration: number) => void;

/**
 * Internal state for optimization algorithm
 */
interface OptimizationState {
  currentDoses: Dose[];
  currentScore: number;
  iterations: number;
  noImprovementCount: number;
  bestScoreThisRun: number;
  bestDosesThisRun: Dose[]; // Track best solution found
  currentGranularityMultiplier: number; // Adaptive granularity multiplier
  iterationsSinceRefinement: number; // Track iterations for adaptive granularity
}

/**
 * Create a lookup map for faster time point access
 * Uses floor and ceiling indices for interpolation
 */
function createConcentrationLookup(
  points: ConcentrationPoint[]
): Map<number, ConcentrationPoint> {
  const lookup = new Map<number, ConcentrationPoint>();
  for (const point of points) {
    // Round to nearest 0.01 for lookup key
    const key = Math.round(point.time * 100) / 100;
    lookup.set(key, point);
  }
  return lookup;
}

/**
 * Get concentration at a specific time using interpolation if needed
 */
function getConcentrationAtTime(
  time: number,
  lookup: Map<number, ConcentrationPoint>,
  allPoints: ConcentrationPoint[]
): ConcentrationPoint | null {
  // Try exact match first (rounded to 0.01)
  const roundedTime = Math.round(time * 100) / 100;
  const exact = lookup.get(roundedTime);
  if (exact) return exact;

  // Find closest point within tolerance
  for (const point of allPoints) {
    if (Math.abs(point.time - time) < OPTIMIZATION_CONSTANTS.TIME_POINT_TOLERANCE) {
      return point;
    }
  }

  return null;
}

/**
 * Calculate mean squared error between generated schedule and reference cycle
 * Normalizes estradiol and progesterone errors separately before combining
 * Optimized with lookup tables and pre-computed samples
 */
function calculateMSE(
  doses: Dose[],
  referenceData: { day: number; estradiol: number; progesterone?: number }[],
  scheduleLength: number,
  steadyState: boolean = false
): number {
  // If steady state, prepend cycles before day 0
  let dosesForCalc = doses;
  if (steadyState) {
    const preCycles: Dose[] = [];
    for (let cycle = PHARMACOKINETICS.STEADY_STATE_START_CYCLE; cycle < 0; cycle++) {
      doses.forEach(dose => {
        preCycles.push({
          ...dose,
          day: dose.day + (cycle * scheduleLength)
        });
      });
    }
    dosesForCalc = [...preCycles, ...doses];
  }

  const timePoints = generateTimePoints(scheduleLength, PHARMACOKINETICS.TIME_POINT_STEP);
  const allGenerated = calculateTotalConcentration(dosesForCalc, timePoints);
  const generated = allGenerated.filter(p => p.time >= 0);

  // Create lookup for faster access
  const lookup = createConcentrationLookup(generated);

  // Pre-compute sample offsets
  const sampleOffsets = Array.from(
    { length: OPTIMIZATION_CONSTANTS.SAMPLES_PER_DAY },
    (_, i) => i / OPTIMIZATION_CONSTANTS.SAMPLES_PER_DAY
  );

  // Calculate separate MSE for estradiol and progesterone
  let estradiolSumSquaredError = 0;
  let estradiolCount = 0;
  let progesteroneSumSquaredError = 0;
  let progesteroneCount = 0;

  // Pre-filter reference data for this schedule length
  const relevantRefData = referenceData.filter(r => r.day >= 0 && r.day < scheduleLength);

  for (const refPoint of relevantRefData) {
    for (const offset of sampleOffsets) {
      const time = refPoint.day + offset;
      const genPoint = getConcentrationAtTime(time, lookup, generated);
      if (!genPoint) continue;

      // Calculate error for estradiol (normalized by reference value to make scale-independent)
      const estradiolError = (genPoint.estradiolConcentration - refPoint.estradiol) / (refPoint.estradiol || 1);
      estradiolSumSquaredError += estradiolError * estradiolError;
      estradiolCount++;

      // Calculate error for progesterone if reference data includes it
      if (refPoint.progesterone !== undefined && refPoint.progesterone > 0) {
        const progesteroneError = (genPoint.progesteroneConcentration - refPoint.progesterone) / refPoint.progesterone;
        progesteroneSumSquaredError += progesteroneError * progesteroneError;
        progesteroneCount++;
      }
    }
  }

  // Calculate normalized MSE for each hormone separately
  const estradiolMSE = estradiolCount > 0 ? estradiolSumSquaredError / estradiolCount : 0;
  const progesteroneMSE = progesteroneCount > 0 ? progesteroneSumSquaredError / progesteroneCount : 0;

  // Combine with equal weighting (or return estradiol-only if no progesterone data)
  if (progesteroneCount > 0) {
    return (estradiolMSE + progesteroneMSE) / 2;
  } else {
    return estradiolMSE;
  }
}


/**
 * Calculate multi-objective score that balances accuracy with simplicity
 * Lower score is better
 */
function calculateMultiObjectiveScore(
  doses: Dose[],
  mseScore: number
): number {
  // Start with base MSE (accuracy)
  let totalScore = mseScore;

  // Penalize number of estradiol injections (simplicity)
  const estradiolCount = doses.filter(d => isEstradiolMedication(d.medication)).length;
  const simplicitPenalty = estradiolCount * OPTIMIZATION_CONSTANTS.SIMPLICITY_WEIGHT;
  totalScore += simplicitPenalty;

  // Penalize dose variety (prefer consistent dosing)
  const uniqueDoses = new Set(doses.map(d => Math.round(d.dose * 100) / 100)).size;
  const doseComplexityPenalty = uniqueDoses * OPTIMIZATION_CONSTANTS.DOSE_COMPLEXITY_WEIGHT;
  totalScore += doseComplexityPenalty;

  // Penalize medication variety (prefer fewer different medications)
  if (OPTIMIZATION_CONSTANTS.PREFER_FEWER_MEDICATIONS) {
    const uniqueMedications = new Set(doses.map(d => d.medication.name)).size;
    const medicationPenalty = uniqueMedications * OPTIMIZATION_CONSTANTS.MEDICATION_VARIETY_PENALTY;
    totalScore += medicationPenalty;
  }

  return totalScore;
}

/**
 * Check if a day already has rectal progesterone
 */
function hasRectalProgesteroneOnDay(doses: Dose[], day: number, excludeIndex?: number): boolean {
  return doses.some((d, idx) =>
    d.day === day &&
    idx !== excludeIndex &&
    isProgesteroneMedication(d.medication) &&
    'route' in d.medication &&
    d.medication.route === 'rectal'
  );
}

/**
 * Count oral/vaginal progesterone doses on a specific day
 */
function countOralVaginalProgesteroneOnDay(doses: Dose[], day: number): number {
  return doses.filter(d =>
    d.day === day &&
    isProgesteroneMedication(d.medication) &&
    'route' in d.medication &&
    (d.medication.route === 'oral' || d.medication.route === 'vaginal')
  ).length;
}

/**
 * Check if adding a medication to a day would violate constraints
 */
function canAddMedicationToDay(
  medication: AnyMedication,
  day: number,
  currentDoses: Dose[],
  maxInjectionsPerCycle: number
): boolean {
  const dosesOnDay = currentDoses.filter(d => d.day === day);
  const medicationsOnDay = dosesOnDay.map(d => d.medication.name);

  // For estradiol: only one injection of each type per day
  if (isEstradiolMedication(medication) && medicationsOnDay.includes(medication.name)) {
    return false;
  }

  // Check estradiol injection limit (only for estradiol)
  if (isEstradiolMedication(medication)) {
    const totalEstradiolCount = currentDoses.filter(d => isEstradiolMedication(d.medication)).length;
    if (totalEstradiolCount >= maxInjectionsPerCycle) {
      return false;
    }
  }

  // For progesterone: check route-specific constraints
  if (isProgesteroneMedication(medication) && 'route' in medication) {
    if (medication.route === 'rectal') {
      // Rectal: only one per day (can't use multiple suppositories)
      if (hasRectalProgesteroneOnDay(currentDoses, day)) {
        return false;
      }
    } else if (medication.route === 'oral' || medication.route === 'vaginal') {
      // Oral and vaginal: limit to max per day
      const count = countOralVaginalProgesteroneOnDay(currentDoses, day);
      if (count >= OPTIMIZATION_CONSTANTS.MAX_ORAL_VAGINAL_PROGESTERONE_PER_DAY) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generate candidate injection days evenly distributed across schedule length
 * Ensures exactly maxInjections days are generated
 */
function generateCandidateDays(scheduleLength: number, maxInjections: number): number[] {
  const days: number[] = [];

  // If only one injection, place it at day 0
  if (maxInjections === 1) {
    return [0];
  }

  // Distribute injections evenly across the schedule
  const step = scheduleLength / maxInjections;

  for (let i = 0; i < maxInjections; i++) {
    // Round to nearest day, ensuring we don't exceed scheduleLength
    const day = Math.min(Math.round(i * step), scheduleLength - 1);
    if (!days.includes(day)) {
      days.push(day);
    }
  }

  return days;
}

/**
 * Try to remove a single estradiol dose to meet injection limit
 * Returns updated state if improvement found
 * Uses multi-objective scoring to balance accuracy and simplicity
 */
function tryRemoveEstradiolDose(
  state: OptimizationState,
  referenceData: { day: number; estradiol: number; progesterone?: number }[],
  scheduleLength: number,
  steadyState: boolean,
  maxInjectionsPerCycle: number
): { doses: Dose[]; score: number; improved: boolean } {
  const estradiolDoseCount = state.currentDoses.filter(d => isEstradiolMedication(d.medication)).length;

  if (estradiolDoseCount <= maxInjectionsPerCycle) {
    return { doses: state.currentDoses, score: state.currentScore, improved: false };
  }

  let bestRemovalScore = Infinity;
  let bestRemovalIndex = -1;

  // Find the BEST single ESTRADIOL dose to remove (using multi-objective score)
  for (let i = state.currentDoses.length - 1; i >= 0; i--) {
    if (!isEstradiolMedication(state.currentDoses[i]!.medication)) continue;

    const withoutDose = state.currentDoses.filter((_, idx) => idx !== i);
    if (withoutDose.length === 0) continue;

    const mse = calculateMSE(withoutDose, referenceData, scheduleLength, steadyState);
    const multiObjScore = calculateMultiObjectiveScore(withoutDose, mse);

    if (multiObjScore < bestRemovalScore) {
      bestRemovalScore = multiObjScore;
      bestRemovalIndex = i;
    }
  }

  if (bestRemovalIndex >= 0) {
    return {
      doses: state.currentDoses.filter((_, idx) => idx !== bestRemovalIndex),
      score: bestRemovalScore,
      improved: true
    };
  }

  return { doses: state.currentDoses, score: state.currentScore, improved: false };
}

/**
 * Try adjusting doses for all current medications
 * Returns updated state if any improvements found
 * Uses adaptive granularity based on optimization state
 */
function tryAdjustDoses(
  state: OptimizationState,
  referenceData: { day: number; estradiol: number; progesterone?: number }[],
  scheduleLength: number,
  steadyState: boolean,
  params: OptimizationParams
): { doses: Dose[]; score: number; improved: boolean } {
  const {
    granularity = 0.05,
    maxDosePerInjection = 10,
    minDosePerInjection = 0.1,
    esterConcentrations,
    progesteroneDoses = [100, 200]
  } = params;

  // Apply adaptive granularity multiplier
  const effectiveGranularity = granularity * state.currentGranularityMultiplier;

  let currentDoses = [...state.currentDoses];
  let currentScore = state.currentScore;
  let anyImprovement = false;

  for (let i = 0; i < currentDoses.length; i++) {
    const dose = currentDoses[i]!;
    const originalDose = dose.dose;
    const medication = dose.medication;

    let bestDose = originalDose;
    let bestScore = currentScore;

    // Handle progesterone with discrete doses
    if (isProgesteroneMedication(medication)) {
      for (const testDose of progesteroneDoses) {
        if (testDose === originalDose) continue;
        if (testDose > maxDosePerInjection || testDose < minDosePerInjection) continue;

        currentDoses[i]!.dose = testDose;
        const mse = calculateMSE(currentDoses, referenceData, scheduleLength, steadyState);
        const newScore = calculateMultiObjectiveScore(currentDoses, mse);

        if (newScore < bestScore) {
          bestScore = newScore;
          bestDose = testDose;
          anyImprovement = true;
        }
      }
    } else {
      // Estradiol: use volume-based dosing with adaptive granularity
      const concentration = esterConcentrations[medication.name] || 40;
      const originalVolumeMl = originalDose / concentration;

      // Try increasing volume
      for (let numSteps = 1; numSteps <= OPTIMIZATION_CONSTANTS.MAX_DOSE_ADJUSTMENT_STEPS; numSteps++) {
        const testVolumeMl = originalVolumeMl + (effectiveGranularity * numSteps);
        const testDose = testVolumeMl * concentration;

        if (testDose > maxDosePerInjection) break;

        currentDoses[i]!.dose = testDose;
        const mse = calculateMSE(currentDoses, referenceData, scheduleLength, steadyState);
        const newScore = calculateMultiObjectiveScore(currentDoses, mse);

        if (newScore < bestScore) {
          bestScore = newScore;
          bestDose = testDose;
          anyImprovement = true;
        }
      }

      // Reset and try decreasing
      currentDoses[i]!.dose = originalDose;

      for (let numSteps = 1; numSteps <= OPTIMIZATION_CONSTANTS.MAX_DOSE_ADJUSTMENT_STEPS; numSteps++) {
        const testVolumeMl = Math.max(0.01, originalVolumeMl - (effectiveGranularity * numSteps));
        const testDose = testVolumeMl * concentration;

        if (testDose < minDosePerInjection) break;

        currentDoses[i]!.dose = testDose;
        const mse = calculateMSE(currentDoses, referenceData, scheduleLength, steadyState);
        const newScore = calculateMultiObjectiveScore(currentDoses, mse);

        if (newScore < bestScore) {
          bestScore = newScore;
          bestDose = testDose;
          anyImprovement = true;
        }
      }
    }

    currentDoses[i]!.dose = bestDose;
    currentScore = bestScore;
  }

  return { doses: currentDoses, score: currentScore, improved: anyImprovement };
}

/**
 * Try switching medications for existing doses
 * Returns updated state if any improvements found
 */
function trySwitchMedications(
  state: OptimizationState,
  referenceData: { day: number; estradiol: number; progesterone?: number }[],
  scheduleLength: number,
  steadyState: boolean,
  params: OptimizationParams
): { doses: Dose[]; score: number; improved: boolean } {
  const {
    availableEsters,
    esterConcentrations,
    progesteroneDoses = [100, 200]
  } = params;

  if (availableEsters.length <= 1) {
    return { doses: state.currentDoses, score: state.currentScore, improved: false };
  }

  let currentDoses = [...state.currentDoses];
  let currentScore = state.currentScore;
  let anyImprovement = false;

  for (let i = 0; i < currentDoses.length; i++) {
    const originalEster = currentDoses[i]!.medication;
    const originalDose = currentDoses[i]!.dose;
    const currentDay = currentDoses[i]!.day;

    let bestEster = originalEster;
    let bestDose = originalDose;
    let bestEsterScore = currentScore;

    for (const ester of availableEsters) {
      if (ester.name === originalEster.name) continue;

      // Check rectal progesterone constraint
      if (isProgesteroneMedication(ester) && 'route' in ester && ester.route === 'rectal') {
        if (hasRectalProgesteroneOnDay(currentDoses, currentDay, i)) {
          continue;
        }
      }

      // Adjust dose when switching medication type
      let testDose = originalDose;
      if (isProgesteroneMedication(ester)) {
        testDose = progesteroneDoses.reduce((prev, curr) =>
          Math.abs(curr - originalDose) < Math.abs(prev - originalDose) ? curr : prev
        );
      } else if (isProgesteroneMedication(originalEster)) {
        const concentration = esterConcentrations[ester.name] || 40;
        testDose = OPTIMIZATION_CONSTANTS.DEFAULT_ESTRADIOL_STARTING_VOLUME_ML * concentration;
      }

      currentDoses[i]!.medication = ester;
      currentDoses[i]!.dose = testDose;
      const mse = calculateMSE(currentDoses, referenceData, scheduleLength, steadyState);
      const newScore = calculateMultiObjectiveScore(currentDoses, mse);

      if (newScore < bestEsterScore) {
        bestEsterScore = newScore;
        bestEster = ester;
        bestDose = testDose;
        anyImprovement = true;
      }
    }

    currentDoses[i]!.medication = bestEster;
    currentDoses[i]!.dose = bestDose;
    currentScore = bestEsterScore;
  }

  return { doses: currentDoses, score: currentScore, improved: anyImprovement };
}

/**
 * Try adding additional medications to the schedule
 * Returns updated state if any improvements found
 * Uses multi-objective scoring to avoid excessive complexity
 */
function tryAddMedications(
  state: OptimizationState,
  referenceData: { day: number; estradiol: number; progesterone?: number }[],
  scheduleLength: number,
  steadyState: boolean,
  params: OptimizationParams
): { doses: Dose[]; score: number; improved: boolean } {
  const {
    availableEsters,
    maxInjectionsPerCycle = 10,
    esterConcentrations,
    progesteroneDoses = [100, 200]
  } = params;

  if (availableEsters.length <= 1) {
    return { doses: state.currentDoses, score: state.currentScore, improved: false };
  }

  let currentDoses = [...state.currentDoses];
  let currentScore = state.currentScore;
  let anyImprovement = false;

  for (let day = 0; day < scheduleLength; day++) {
    for (const med of availableEsters) {
      if (!canAddMedicationToDay(med, day, currentDoses, maxInjectionsPerCycle)) {
        continue;
      }

      const concentration = esterConcentrations[med.name] || 100;
      const newDose: Dose = {
        day,
        dose: isProgesteroneMedication(med) ? progesteroneDoses[0]! : (OPTIMIZATION_CONSTANTS.DEFAULT_ESTRADIOL_STARTING_VOLUME_ML * concentration),
        medication: med
      };

      const testDoses = [...currentDoses, newDose];
      const mse = calculateMSE(testDoses, referenceData, scheduleLength, steadyState);
      const newScore = calculateMultiObjectiveScore(testDoses, mse);

      if (newScore < currentScore) {
        currentDoses = testDoses;
        currentScore = newScore;
        anyImprovement = true;
      }
    }
  }

  return { doses: currentDoses, score: currentScore, improved: anyImprovement };
}

/**
 * Optimize injection schedule using iterative improvement
 * Uses a greedy local search algorithm with multiple optimization phases
 */
export async function optimizeSchedule(
  params: OptimizationParams,
  onProgress?: ProgressCallback
): Promise<OptimizationResult> {
  const {
    availableEsters,
    scheduleLength,
    referenceCycleType,
    steadyState = false,
    minDosePerInjection = 0.1,
    maxInjectionsPerCycle = 10,
    esterConcentrations,
    progesteroneDoses = [100, 200] // Default: both doses available
  } = params;

  if (availableEsters.length === 0) {
    throw new Error('At least one ester must be available');
  }

  // Get reference cycle data
  const referenceData = generateReferenceCycle(scheduleLength, referenceCycleType);

  // Start with a reasonable initial schedule
  const candidateDays = generateCandidateDays(scheduleLength, maxInjectionsPerCycle);

  // Prefer starting with estradiol if available, since that's usually the primary hormone
  const primaryEster = availableEsters.find(e => isEstradiolMedication(e)) || availableEsters[0]!;

  // Initialize with evenly distributed doses
  let startingDose: number;
  if (isProgesteroneMedication(primaryEster)) {
    // Progesterone: start with first available dose
    startingDose = progesteroneDoses[0]!;
  } else {
    // Estradiol: start with default volume
    const primaryConcentration = esterConcentrations[primaryEster.name] || 40;
    startingDose = OPTIMIZATION_CONSTANTS.DEFAULT_ESTRADIOL_STARTING_VOLUME_ML * primaryConcentration;
  }

  const initialDoses: Dose[] = candidateDays.map(day => ({
    day,
    dose: startingDose,
    medication: primaryEster
  }));

  // Initialize optimization state with adaptive granularity and simulated annealing
  const initialGranularityMultiplier = OPTIMIZATION_CONSTANTS.ADAPTIVE_GRANULARITY_ENABLED
    ? OPTIMIZATION_CONSTANTS.INITIAL_GRANULARITY_MULTIPLIER
    : 1;

  const initialMSE = calculateMSE(initialDoses, referenceData, scheduleLength, steadyState);
  const initialScore = calculateMultiObjectiveScore(initialDoses, initialMSE);

  let state: OptimizationState = {
    currentDoses: initialDoses,
    currentScore: initialScore,
    iterations: 0,
    noImprovementCount: 0,
    bestScoreThisRun: initialScore,
    bestDosesThisRun: [...initialDoses],
    currentGranularityMultiplier: initialGranularityMultiplier,
    iterationsSinceRefinement: 0
  };

  // Optimization loop - run until no improvement found
  while (true) {
    state.iterations++;
    const previousScore = state.currentScore;

    // Report progress and yield to event loop for UI updates
    if (onProgress) {
      const estimatedProgress = Math.min(
        OPTIMIZATION_CONSTANTS.MAX_DISPLAYED_PROGRESS_UNTIL_COMPLETE,
        Math.round((1 - Math.exp(-state.iterations / OPTIMIZATION_CONSTANTS.PROGRESS_CONVERGENCE_RATE)) * 100)
      );
      onProgress(estimatedProgress, state.currentScore, state.iterations);
    }
    // Yield to event loop every iteration to allow UI updates
    await new Promise(resolve => setTimeout(resolve, 0));

    // Phase 1: Remove excess estradiol doses if over limit
    const removalResult = tryRemoveEstradiolDose(
      state,
      referenceData,
      scheduleLength,
      steadyState,
      maxInjectionsPerCycle
    );
    if (removalResult.improved) {
      state.currentDoses = removalResult.doses;
      state.currentScore = removalResult.score;
    }

    // Phase 2: Adjust dosages
    const adjustResult = tryAdjustDoses(
      state,
      referenceData,
      scheduleLength,
      steadyState,
      params
    );
    if (adjustResult.improved) {
      state.currentDoses = adjustResult.doses;
      state.currentScore = adjustResult.score;
    }

    // Phase 3: Try switching medications
    const switchResult = trySwitchMedications(
      state,
      referenceData,
      scheduleLength,
      steadyState,
      params
    );
    if (switchResult.improved) {
      state.currentDoses = switchResult.doses;
      state.currentScore = switchResult.score;
    }

    // Phase 4: Try adding medications
    const addResult = tryAddMedications(
      state,
      referenceData,
      scheduleLength,
      steadyState,
      params
    );
    if (addResult.improved) {
      state.currentDoses = addResult.doses;
      state.currentScore = addResult.score;
    }

    // Update best solution if current is better
    if (state.currentScore < state.bestScoreThisRun) {
      state.bestScoreThisRun = state.currentScore;
      state.bestDosesThisRun = [...state.currentDoses];
    }

    // Check for convergence and adaptive granularity refinement
    const improvement = previousScore - state.currentScore;
    const hasImproved = improvement > OPTIMIZATION_CONSTANTS.MIN_IMPROVEMENT_THRESHOLD;

    if (!hasImproved) {
      state.noImprovementCount++;
      state.iterationsSinceRefinement++;

      // Adaptive granularity: refine when stuck
      if (OPTIMIZATION_CONSTANTS.ADAPTIVE_GRANULARITY_ENABLED &&
          state.iterationsSinceRefinement >= OPTIMIZATION_CONSTANTS.GRANULARITY_REFINEMENT_TRIGGER &&
          state.currentGranularityMultiplier > OPTIMIZATION_CONSTANTS.MIN_GRANULARITY_MULTIPLIER) {

        // Reduce granularity by half (get finer)
        state.currentGranularityMultiplier = Math.max(
          OPTIMIZATION_CONSTANTS.MIN_GRANULARITY_MULTIPLIER,
          state.currentGranularityMultiplier / 2
        );
        state.iterationsSinceRefinement = 0;
        state.noImprovementCount = 0; // Reset to give refined granularity a chance
      } else if (state.noImprovementCount >= OPTIMIZATION_CONSTANTS.NO_IMPROVEMENT_ITERATIONS_LIMIT) {
        break; // Converged
      }
    } else {
      state.noImprovementCount = 0; // Reset counter on improvement
      state.iterationsSinceRefinement = 0; // Reset refinement counter
    }
  }

  // Use best solution found (important for simulated annealing)
  state.currentDoses = state.bestDosesThisRun;
  state.currentScore = state.bestScoreThisRun;

  // Extract final state
  const iterations = state.iterations;

  // Final progress update
  if (onProgress) {
    onProgress(100, state.currentScore, iterations);
  }

  // Remove very small doses and finalize
  let finalDoses = state.currentDoses.filter(d => d.dose >= minDosePerInjection);

  // Ensure all progesterone doses are valid (use closest available dose)
  finalDoses = finalDoses.map(d => {
    if (isProgesteroneMedication(d.medication)) {
      // Round to nearest available dose
      const roundedDose = progesteroneDoses.reduce((prev, curr) =>
        Math.abs(curr - d.dose) < Math.abs(prev - d.dose) ? curr : prev
      );
      return { ...d, dose: roundedDose };
    }
    return d;
  });

  // Doses are already at the correct granularity from optimization
  // Recalculate final score (always report MSE, not the penalized score)
  const finalScore = calculateMSE(finalDoses, referenceData, scheduleLength, steadyState);

  return {
    doses: finalDoses,
    score: finalScore,
    iterations
  };
}

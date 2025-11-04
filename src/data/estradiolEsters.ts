import { EstradiolMedication, MedicationType, AnyMedication } from '../types/medication';

/**
 * Legacy EstradiolEster interface for backward compatibility
 * @deprecated Use EstradiolMedication instead
 */
export interface EstradiolEster {
  name: string;
  D: number;
  k1: number;
  k2: number;
  k3: number;
}

/**
 * Dose interface supporting both estradiol and progesterone medications
 */
export interface Dose {
  day: number;
  time?: number; // Time of day (0-24 hours), optional for multiple doses per day
  dose: number;  // Amount in mg
  medication: AnyMedication;

  // Legacy support - will be removed in future version
  ester?: EstradiolEster;
}

/**
 * Convert legacy EstradiolEster to EstradiolMedication
 */
export function esterToMedication(ester: EstradiolEster): EstradiolMedication {
  return {
    type: MedicationType.ESTRADIOL,
    name: ester.name,
    D: ester.D,
    k1: ester.k1,
    k2: ester.k2,
    k3: ester.k3,
  };
}

/**
 * Estradiol ester medications for intramuscular injection
 */
export const ESTRADIOL_ESTERS: EstradiolMedication[] = [
  {
    type: MedicationType.ESTRADIOL,
    name: 'Estradiol benzoate',
    D: 1.7050e+08,
    k1: 3.22397192,
    k2: 0.58870148,
    k3: 70721.4018,
  },
  {
    type: MedicationType.ESTRADIOL,
    name: 'Estradiol valerate',
    D: 2596.05956,
    k1: 2.38229125,
    k2: 0.23345814,
    k3: 1.37642769,
  },
  {
    type: MedicationType.ESTRADIOL,
    name: 'Estradiol cypionate',
    D: 1920.89671,
    k1: 0.10321089,
    k2: 0.89854779,
    k3: 0.89359759,
  },
  {
    type: MedicationType.ESTRADIOL,
    name: 'Estradiol cypionate suspension',
    D: 1.5669e+08,
    k1: 0.13586726,
    k2: 2.51772731,
    k3: 74768.1493,
  },
  {
    type: MedicationType.ESTRADIOL,
    name: 'Estradiol enanthate',
    D: 333.874181,
    k1: 0.42412968,
    k2: 0.43452980,
    k3: 0.15291485,
  },
  {
    type: MedicationType.ESTRADIOL,
    name: 'Estradiol undecylate',
    D: 65.9493374,
    k1: 0.29634323,
    k2: 4799337.57,
    k3: 0.03141554,
  },
  {
    type: MedicationType.ESTRADIOL,
    name: 'Polyestradiol phosphate',
    D: 34.46836875,
    k1: 0.02456035,
    k2: 135643.711,
    k3: 0.10582368,
  },
];

// Default schedule uses Estradiol valerate
const EV = ESTRADIOL_ESTERS[1]!; // Estradiol valerate is always at index 1

export const DEFAULT_DOSES: Dose[] = [
  { day: 1, dose: 0.75, medication: EV },
  { day: 3, dose: 0.75, medication: EV },
  { day: 5, dose: 1, medication: EV },
  { day: 7, dose: 1, medication: EV },
  { day: 9, dose: 1.25, medication: EV },
  { day: 11, dose: 2, medication: EV },
  { day: 13, dose: 0.5, medication: EV },
  { day: 17, dose: 0.5, medication: EV },
  { day: 19, dose: 0.75, medication: EV },
  { day: 21, dose: 1, medication: EV },
  { day: 23, dose: 0.75, medication: EV },
  { day: 25, dose: 0.5, medication: EV },
  { day: 27, dose: 0.5, medication: EV },
];

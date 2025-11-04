/**
 * Medication type system for supporting both estradiol and progesterone
 */

export enum MedicationType {
  ESTRADIOL = 'estradiol',
  PROGESTERONE = 'progesterone'
}

/**
 * Base medication interface
 */
export interface Medication {
  type: MedicationType;
  name: string;
}

/**
 * Estradiol medication using three-compartment pharmacokinetic model
 * Administered via intramuscular injection
 */
export interface EstradiolMedication extends Medication {
  type: MedicationType.ESTRADIOL;
  // Three-compartment model parameters
  D: number;  // Distribution coefficient
  k1: number; // Rate constant 1
  k2: number; // Rate constant 2
  k3: number; // Rate constant 3
}

/**
 * Progesterone medication using one-compartment pharmacokinetic model
 * Administered via oral, rectal, or vaginal routes
 */
export interface ProgesteroneMedication extends Medication {
  type: MedicationType.PROGESTERONE;
  route: 'oral' | 'rectal' | 'vaginal';
  // One-compartment model parameters
  bioavailability: number;      // F (fraction absorbed, 0-1)
  absorptionRate: number;       // ka (1/hour)
  eliminationRate: number;      // ke (1/hour)
  volumeOfDistribution: number; // Vd (liters)
}

/**
 * Union type for any medication
 */
export type AnyMedication = EstradiolMedication | ProgesteroneMedication;

/**
 * Type guard to check if medication is estradiol
 */
export function isEstradiolMedication(med: AnyMedication): med is EstradiolMedication {
  return med.type === MedicationType.ESTRADIOL;
}

/**
 * Type guard to check if medication is progesterone
 */
export function isProgesteroneMedication(med: AnyMedication): med is ProgesteroneMedication {
  return med.type === MedicationType.PROGESTERONE;
}

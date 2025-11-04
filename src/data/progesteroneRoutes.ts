import { ProgesteroneMedication, MedicationType } from '../types/medication';

/**
 * Pharmacokinetic parameters for bioidentical progesterone administration routes
 * Based on clinical literature and research from transfemscience.org
 */

export const PROGESTERONE_ROUTES: ProgesteroneMedication[] = [
  {
    type: MedicationType.PROGESTERONE,
    name: 'Progesterone (oral)',
    route: 'oral',
    // Oral progesterone has poor bioavailability due to first-pass metabolism
    // Peak levels: ~2-3 ng/mL with 100mg dose
    // Time to peak: 2-4 hours
    // Half-life: 5-10 hours
    bioavailability: 0.02,    // ~2% (very low due to hepatic first-pass)
    absorptionRate: 0.35,     // ka: Tmax ~3h
    eliminationRate: 0.10,    // ke: T½ ~7h
    volumeOfDistribution: 50, // Vd in liters (estimated)
  },
  {
    type: MedicationType.PROGESTERONE,
    name: 'Progesterone (rectal)',
    route: 'rectal',
    // Rectal progesterone has good absorption, achieves luteal phase levels
    // Peak levels: ~20 ng/mL with 200mg dose, ~22.5 ng/mL with 100mg
    // Time to peak: 6-8 hours
    // Half-life: ~16 hours
    bioavailability: 0.30,    // ~30% (bypasses some hepatic first-pass)
    absorptionRate: 0.15,     // ka: Tmax ~7h
    eliminationRate: 0.043,   // ke: T½ ~16h
    volumeOfDistribution: 50, // Vd in liters
  },
  {
    type: MedicationType.PROGESTERONE,
    name: 'Progesterone (vaginal)',
    route: 'vaginal',
    // Vaginal progesterone has uterine first-pass effect
    // Peak levels: 10-15 ng/mL with 200mg dose
    // Time to peak: 4-6 hours
    // Half-life: ~16 hours
    bioavailability: 0.25,    // ~25% (uterine first-pass effect)
    absorptionRate: 0.20,     // ka: Tmax ~5h
    eliminationRate: 0.043,   // ke: T½ ~16h
    volumeOfDistribution: 50, // Vd in liters
  },
];

/**
 * Get progesterone medication by route
 */
export function getProgesteroneByRoute(route: 'oral' | 'rectal' | 'vaginal'): ProgesteroneMedication | undefined {
  return PROGESTERONE_ROUTES.find(p => p.route === route);
}

/**
 * Standard progesterone doses (in mg)
 */
export const PROGESTERONE_DOSES = [100, 200] as const;
export type ProgesteroneDose = typeof PROGESTERONE_DOSES[number];

/**
 * Check if a dose is a valid progesterone dose
 */
export function isValidProgesteroneDose(dose: number): dose is ProgesteroneDose {
  return PROGESTERONE_DOSES.includes(dose as ProgesteroneDose);
}

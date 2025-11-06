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
    // Source: transfemscience.org/articles/oral-p4-low-levels/
    // Peak levels: ~2 ng/mL with 100mg dose (LC-MS studies)
    // Time to peak: 1-2 hours
    // Half-life: 5-10 hours
    // Duration of elevated levels: 4-8 hours
    bioavailability: 0.10,    // ~10% apparent (though true may be ~1-2%, accounts for active metabolites)
    absorptionRate: 0.75,     // ka: Tmax ~1.5h (rapid absorption)
    eliminationRate: 0.10,    // ke: T½ ~7h
    volumeOfDistribution: 3,  // Vd adjusted to match observed Cmax ~2 ng/mL
  },
  {
    type: MedicationType.PROGESTERONE,
    name: 'Progesterone (rectal)',
    route: 'rectal',
    // Rectal progesterone has good absorption, achieves luteal phase levels
    // Source: transfemscience.org/articles/oral-p4-low-levels/
    // Limited formal studies, but reported to achieve luteal phase levels (10-20 ng/mL)
    // Estimated peak: ~15 ng/mL with 100mg, ~25-30 ng/mL with 200mg
    // Time to peak: 4-8 hours (slower absorption than oral)
    // Half-life: Similar to oral (~7-10h) as same hormone, but sustained levels
    bioavailability: 0.30,    // ~30% (bypasses hepatic first-pass)
    absorptionRate: 0.18,     // ka: Tmax ~6h (slower sustained absorption)
    eliminationRate: 0.08,    // ke: T½ ~9h
    volumeOfDistribution: 2,  // Vd adjusted to match estimated luteal phase levels (~15 ng/mL)
  },
  {
    type: MedicationType.PROGESTERONE,
    name: 'Progesterone (vaginal)',
    route: 'vaginal',
    // Vaginal progesterone has uterine first-pass effect (less relevant for transfem people)
    // Peak levels: Similar to rectal, achieves adequate systemic levels
    // Estimated: ~12 ng/mL with 100mg, ~20-25 ng/mL with 200mg
    // Time to peak: 4-6 hours
    // Half-life: ~7-10 hours
    bioavailability: 0.28,    // ~28% (bypasses hepatic first-pass, slightly lower than rectal)
    absorptionRate: 0.20,     // ka: Tmax ~5h
    eliminationRate: 0.08,    // ke: T½ ~9h
    volumeOfDistribution: 2,  // Vd adjusted to match expected systemic levels (~12 ng/mL)
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

export interface ReferencePoint {
  day: number;
  estradiol: number;
  progesterone?: number; // ng/mL, optional for backward compatibility
}

export type ReferenceCycleType = 'typical' | 'hrt-target' | 'conservative' | 'high-physiological';

export interface ReferenceCycleInfo {
  id: ReferenceCycleType;
  name: string;
  description: string;
  source: string;
  sourceUrl?: string;
  cycleLength: number; // Length of the reference cycle in days (e.g., 29 for menstrual cycle)
  data: ReferencePoint[];
}

// Based on research: "Extensive monitoring of the natural menstrual cycle using the serum biomarkers
// estradiol, luteinizing hormone and progesterone" (PMC8042396)
// Study standardized cycles to 29 days with ovulation at day 15
// Estradiol values converted from pmol/L to pg/mL (÷ 3.67)
// Progesterone values converted from nmol/L to ng/mL (÷ 3.18)
//
// Median estradiol values by sub-phase:
// - Early follicular: 125 pmol/L = 34 pg/mL
// - Intermediate follicular: 172 pmol/L = 47 pg/mL
// - Late follicular: 464 pmol/L = 126 pg/mL
// - Ovulation: 817 pmol/L = 223 pg/mL
// - Early luteal: 390 pmol/L = 106 pg/mL
// - Intermediate luteal: 505 pmol/L = 138 pg/mL
// - Late luteal: 396 pmol/L = 108 pg/mL
//
// Median progesterone values by sub-phase:
// - Follicular: 2.14 nmol/L = 0.67 ng/mL
// - Ovulation: 3.35 nmol/L = 1.05 ng/mL
// - Early luteal: 22.0 nmol/L = 6.92 ng/mL
// - Intermediate luteal: 46.0 nmol/L = 14.5 ng/mL
// - Late luteal: 11.4 nmol/L = 3.58 ng/mL
const TYPICAL_CYCLE_DATA: ReferencePoint[] = [
  // Early follicular phase (days 1-5)
  { day: 1, estradiol: 34, progesterone: 0.6 },
  { day: 2, estradiol: 36, progesterone: 0.6 },
  { day: 3, estradiol: 38, progesterone: 0.65 },
  { day: 4, estradiol: 42, progesterone: 0.65 },
  { day: 5, estradiol: 45, progesterone: 0.67 },

  // Intermediate follicular phase (days 6-10)
  { day: 6, estradiol: 47, progesterone: 0.67 },
  { day: 7, estradiol: 50, progesterone: 0.67 },
  { day: 8, estradiol: 55, progesterone: 0.67 },
  { day: 9, estradiol: 65, progesterone: 0.70 },
  { day: 10, estradiol: 85, progesterone: 0.75 },

  // Late follicular phase (days 11-14)
  { day: 11, estradiol: 110, progesterone: 0.80 },
  { day: 12, estradiol: 126, progesterone: 0.85 },
  { day: 13, estradiol: 175, progesterone: 0.92 },
  { day: 14, estradiol: 210, progesterone: 1.00 },

  // Ovulation (day 15)
  { day: 15, estradiol: 223, progesterone: 1.05 },

  // Early luteal phase (days 16-18)
  { day: 16, estradiol: 200, progesterone: 2.5 },
  { day: 17, estradiol: 150, progesterone: 5.0 },
  { day: 18, estradiol: 106, progesterone: 6.92 },

  // Intermediate luteal phase (days 19-25)
  { day: 19, estradiol: 100, progesterone: 9.5 },
  { day: 20, estradiol: 115, progesterone: 12.0 },
  { day: 21, estradiol: 125, progesterone: 13.5 },
  { day: 22, estradiol: 138, progesterone: 14.5 },
  { day: 23, estradiol: 135, progesterone: 13.8 },
  { day: 24, estradiol: 125, progesterone: 12.0 },
  { day: 25, estradiol: 115, progesterone: 9.0 },

  // Late luteal phase (days 26-29)
  { day: 26, estradiol: 108, progesterone: 6.5 },
  { day: 27, estradiol: 85, progesterone: 3.58 },
  { day: 28, estradiol: 55, progesterone: 1.5 },
  { day: 29, estradiol: 40, progesterone: 0.8 },
];

// HRT Target Ranges based on Transfeminine Science equivalent dosing guide
// Source: https://transfemscience.org/articles/e2-equivalent-doses/
// Progesterone targets for HRT based on physiological luteal phase levels
const HRT_TARGET_DATA: ReferencePoint[] = [
  // Follicular phase equivalent (~50 pg/mL) - days 1-10
  { day: 1, estradiol: 50, progesterone: 0.5 },
  { day: 2, estradiol: 50, progesterone: 0.5 },
  { day: 3, estradiol: 52, progesterone: 0.5 },
  { day: 4, estradiol: 55, progesterone: 0.6 },
  { day: 5, estradiol: 58, progesterone: 0.6 },
  { day: 6, estradiol: 62, progesterone: 0.7 },
  { day: 7, estradiol: 68, progesterone: 0.7 },
  { day: 8, estradiol: 75, progesterone: 0.7 },
  { day: 9, estradiol: 85, progesterone: 0.8 },
  { day: 10, estradiol: 100, progesterone: 0.9 },

  // Late follicular/pre-ovulation (~100-200 pg/mL) - days 11-14
  { day: 11, estradiol: 125, progesterone: 1.0 },
  { day: 12, estradiol: 150, progesterone: 1.1 },
  { day: 13, estradiol: 200, progesterone: 1.2 },
  { day: 14, estradiol: 250, progesterone: 1.5 },

  // Ovulation equivalent (~300 pg/mL) - day 15
  { day: 15, estradiol: 300, progesterone: 2.0 },

  // Early luteal (~200 pg/mL) - days 16-18
  { day: 16, estradiol: 250, progesterone: 4.0 },
  { day: 17, estradiol: 200, progesterone: 7.0 },
  { day: 18, estradiol: 200, progesterone: 10.0 },

  // Luteal phase equivalent (~200 pg/mL) - days 19-25
  { day: 19, estradiol: 200, progesterone: 12.0 },
  { day: 20, estradiol: 200, progesterone: 14.0 },
  { day: 21, estradiol: 200, progesterone: 15.0 },
  { day: 22, estradiol: 200, progesterone: 15.0 },
  { day: 23, estradiol: 195, progesterone: 14.0 },
  { day: 24, estradiol: 180, progesterone: 12.0 },
  { day: 25, estradiol: 160, progesterone: 9.0 },

  // Late luteal/return to follicular - days 26-29
  { day: 26, estradiol: 130, progesterone: 6.0 },
  { day: 27, estradiol: 100, progesterone: 3.0 },
  { day: 28, estradiol: 70, progesterone: 1.5 },
  { day: 29, estradiol: 55, progesterone: 0.8 },
];

// Conservative Range (5th percentile from PMC8042396)
// Progesterone 5th percentile: Follicular ~0.4 ng/mL, Luteal ~4-8 ng/mL
const CONSERVATIVE_CYCLE_DATA: ReferencePoint[] = [
  // Early follicular - 75.5 pmol/L = 21 pg/mL
  { day: 1, estradiol: 21, progesterone: 0.35 },
  { day: 2, estradiol: 22, progesterone: 0.35 },
  { day: 3, estradiol: 23, progesterone: 0.38 },
  { day: 4, estradiol: 24, progesterone: 0.38 },
  { day: 5, estradiol: 25, progesterone: 0.40 },

  // Intermediate follicular - 95.6 pmol/L = 26 pg/mL
  { day: 6, estradiol: 26, progesterone: 0.40 },
  { day: 7, estradiol: 28, progesterone: 0.40 },
  { day: 8, estradiol: 32, progesterone: 0.40 },
  { day: 9, estradiol: 40, progesterone: 0.42 },
  { day: 10, estradiol: 45, progesterone: 0.45 },

  // Late follicular - 182 pmol/L = 50 pg/mL
  { day: 11, estradiol: 50, progesterone: 0.48 },
  { day: 12, estradiol: 52, progesterone: 0.50 },
  { day: 13, estradiol: 55, progesterone: 0.55 },
  { day: 14, estradiol: 58, progesterone: 0.60 },

  // Ovulation - 222 pmol/L = 60 pg/mL
  { day: 15, estradiol: 60, progesterone: 0.65 },

  // Early luteal - 188 pmol/L = 51 pg/mL
  { day: 16, estradiol: 58, progesterone: 1.5 },
  { day: 17, estradiol: 54, progesterone: 3.0 },
  { day: 18, estradiol: 51, progesterone: 4.2 },

  // Intermediate luteal - 244 pmol/L = 66 pg/mL
  { day: 19, estradiol: 52, progesterone: 5.7 },
  { day: 20, estradiol: 58, progesterone: 7.2 },
  { day: 21, estradiol: 62, progesterone: 8.1 },
  { day: 22, estradiol: 66, progesterone: 8.7 },
  { day: 23, estradiol: 64, progesterone: 8.3 },
  { day: 24, estradiol: 60, progesterone: 7.2 },
  { day: 25, estradiol: 56, progesterone: 5.4 },

  // Late luteal - 111 pmol/L = 30 pg/mL
  { day: 26, estradiol: 48, progesterone: 3.9 },
  { day: 27, estradiol: 38, progesterone: 2.1 },
  { day: 28, estradiol: 30, progesterone: 0.9 },
  { day: 29, estradiol: 24, progesterone: 0.5 },
];

// High Physiological Range (95th percentile from PMC8042396)
// Progesterone 95th percentile: Follicular ~1.0 ng/mL, Luteal ~18-25 ng/mL
const HIGH_PHYSIOLOGICAL_DATA: ReferencePoint[] = [
  // Early follicular - 231 pmol/L = 63 pg/mL
  { day: 1, estradiol: 63, progesterone: 0.9 },
  { day: 2, estradiol: 65, progesterone: 0.9 },
  { day: 3, estradiol: 68, progesterone: 0.95 },
  { day: 4, estradiol: 72, progesterone: 0.95 },
  { day: 5, estradiol: 75, progesterone: 1.0 },

  // Intermediate follicular - 294 pmol/L = 80 pg/mL
  { day: 6, estradiol: 80, progesterone: 1.0 },
  { day: 7, estradiol: 85, progesterone: 1.0 },
  { day: 8, estradiol: 95, progesterone: 1.0 },
  { day: 9, estradiol: 120, progesterone: 1.05 },
  { day: 10, estradiol: 180, progesterone: 1.1 },

  // Late follicular - 858 pmol/L = 234 pg/mL
  { day: 11, estradiol: 234, progesterone: 1.2 },
  { day: 12, estradiol: 280, progesterone: 1.3 },
  { day: 13, estradiol: 400, progesterone: 1.4 },
  { day: 14, estradiol: 480, progesterone: 1.5 },

  // Ovulation - 2212 pmol/L = 603 pg/mL
  { day: 15, estradiol: 603, progesterone: 1.6 },

  // Early luteal - 658 pmol/L = 179 pg/mL
  { day: 16, estradiol: 450, progesterone: 3.8 },
  { day: 17, estradiol: 280, progesterone: 7.5 },
  { day: 18, estradiol: 179, progesterone: 10.4 },

  // Intermediate luteal - 1123 pmol/L = 306 pg/mL
  { day: 19, estradiol: 165, progesterone: 14.3 },
  { day: 20, estradiol: 220, progesterone: 18.0 },
  { day: 21, estradiol: 270, progesterone: 20.3 },
  { day: 22, estradiol: 306, progesterone: 21.8 },
  { day: 23, estradiol: 295, progesterone: 20.7 },
  { day: 24, estradiol: 260, progesterone: 18.0 },
  { day: 25, estradiol: 220, progesterone: 13.5 },

  // Late luteal - 815 pmol/L = 222 pg/mL
  { day: 26, estradiol: 200, progesterone: 9.8 },
  { day: 27, estradiol: 150, progesterone: 5.4 },
  { day: 28, estradiol: 100, progesterone: 2.3 },
  { day: 29, estradiol: 75, progesterone: 1.2 },
];

// All available reference cycles
export const REFERENCE_CYCLES: ReferenceCycleInfo[] = [
  {
    id: 'typical',
    name: 'Typical Cycle',
    description: 'Median levels from 23 cis women (PMC8042396)',
    source: 'PMC8042396',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8042396/',
    cycleLength: 29,
    data: TYPICAL_CYCLE_DATA
  },
  {
    id: 'hrt-target',
    name: 'HRT Target Ranges',
    description: 'Natural cycle equivalent targets for HRT',
    source: 'Transfeminine Science',
    sourceUrl: 'https://transfemscience.org/articles/e2-equivalent-doses/',
    cycleLength: 29,
    data: HRT_TARGET_DATA
  },
  {
    id: 'conservative',
    name: 'Conservative Range',
    description: 'Lower bound (5th percentile) of natural variation',
    source: 'PMC8042396',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8042396/',
    cycleLength: 29,
    data: CONSERVATIVE_CYCLE_DATA
  },
  {
    id: 'high-physiological',
    name: 'High Physiological',
    description: 'Upper bound (95th percentile) of natural variation',
    source: 'PMC8042396',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8042396/',
    cycleLength: 29,
    data: HIGH_PHYSIOLOGICAL_DATA
  }
];

// Legacy export for backwards compatibility
export const CIS_WOMEN_CYCLE = TYPICAL_CYCLE_DATA;

export function generateReferenceCycle(
  totalDays: number,
  cycleType: ReferenceCycleType = 'typical'
): ReferencePoint[] {
  const cycleInfo = REFERENCE_CYCLES.find(c => c.id === cycleType);
  if (!cycleInfo) {
    throw new Error(`Unknown cycle type: ${cycleType}`);
  }

  const cycleData = cycleInfo.data;
  const cycleLength = 29;
  const referenceData: ReferencePoint[] = [];

  for (let day = 0; day <= totalDays; day++) {
    const cycleDay = (day % cycleLength) + 1;
    const referencePoint = cycleData.find(p => p.day === cycleDay);

    if (referencePoint) {
      referenceData.push({
        day,
        estradiol: referencePoint.estradiol,
        progesterone: referencePoint.progesterone
      });
    } else {
      // Fallback interpolation if exact day not found
      const closestPoint = cycleData.reduce((prev, curr) =>
        Math.abs(curr.day - cycleDay) < Math.abs(prev.day - cycleDay) ? curr : prev
      );

      referenceData.push({
        day,
        estradiol: closestPoint.estradiol,
        progesterone: closestPoint.progesterone
      });
    }
  }

  return referenceData;
}

import { Dose, ESTRADIOL_ESTERS } from '../data/estradiolEsters';
import { ReferenceCycleType } from '../data/referenceData';

/**
 * Compact URL encoding for schedule data
 *
 * Format: d1,dose1,e1;d2,dose2,e2;...|schedLen|graphDays|r|c
 * - Each dose: day,dose*100,esterIndex (comma separated)
 * - Doses separated by semicolons
 * - Then: scheduleLength|graphDays|repeat(1/0)|cycleType(t/h/c/p)
 *
 * Example: 1,75,1;3,75,1;5,100,1|29|90|1|t
 * This is much shorter than JSON and compresses better
 */

const CYCLE_TYPE_MAP: Record<ReferenceCycleType, string> = {
  'typical': 't',
  'hrt-target': 'h',
  'conservative': 'c',
  'high-physiological': 'p'
};

const CYCLE_TYPE_REVERSE: Record<string, ReferenceCycleType> = {
  't': 'typical',
  'h': 'hrt-target',
  'c': 'conservative',
  'p': 'high-physiological'
};

export interface ScheduleData {
  doses: Dose[];
  scheduleLength: number;
  graphDays: number;
  repeat: boolean;
  cycleType: ReferenceCycleType;
}

export function encodeSchedule(data: ScheduleData): string {
  // Encode doses: day,dose*100,esterIndex
  const doseParts = data.doses.map(d => {
    const esterIndex = ESTRADIOL_ESTERS.findIndex(e => e.name === d.ester.name);
    const doseInt = Math.round(d.dose * 100);
    return `${d.day},${doseInt},${esterIndex}`;
  });

  const dosesStr = doseParts.join(';');
  const repeatChar = data.repeat ? '1' : '0';
  const cycleChar = CYCLE_TYPE_MAP[data.cycleType] || 't';

  const compact = `${dosesStr}|${data.scheduleLength}|${data.graphDays}|${repeatChar}|${cycleChar}`;

  // Use URL-safe base64
  return btoa(compact)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Remove padding
}

export function decodeSchedule(encoded: string): ScheduleData | null {
  try {
    // Restore standard base64
    let base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    const compact = atob(base64);
    const parts = compact.split('|');

    if (parts.length !== 5) {
      return null;
    }

    const [dosesStr, schedLenStr, graphDaysStr, repeatStr, cycleStr] = parts;

    // Parse doses
    const doses: Dose[] = [];
    if (dosesStr) {
      const doseParts = dosesStr.split(';');
      for (const dosePart of doseParts) {
        const [dayStr, doseStr, esterStr] = dosePart.split(',');
        const day = parseInt(dayStr);
        const dose = parseInt(doseStr) / 100;
        const esterIndex = parseInt(esterStr);
        const ester = ESTRADIOL_ESTERS[esterIndex] || ESTRADIOL_ESTERS[1];

        if (!isNaN(day) && !isNaN(dose)) {
          doses.push({ day, dose, ester });
        }
      }
    }

    return {
      doses,
      scheduleLength: parseInt(schedLenStr) || 29,
      graphDays: parseInt(graphDaysStr) || 90,
      repeat: repeatStr === '1',
      cycleType: CYCLE_TYPE_REVERSE[cycleStr] || 'typical'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Legacy decoder for backwards compatibility with old JSON format
 */
export function decodeLegacySchedule(encoded: string): ScheduleData | null {
  try {
    const decoded = JSON.parse(atob(encoded));
    const doses = decoded[0].map((d: any) => ({
      day: d[0],
      dose: d[1],
      ester: ESTRADIOL_ESTERS[d[2]] || ESTRADIOL_ESTERS[1]
    }));

    return {
      doses,
      scheduleLength: decoded[1] || 29,
      graphDays: decoded[2] || 90,
      repeat: decoded[3] || false,
      cycleType: decoded[4] || 'typical'
    };
  } catch (e) {
    return null;
  }
}

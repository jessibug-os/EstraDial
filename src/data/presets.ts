import { Dose, ESTRADIOL_ESTERS } from './estradiolEsters';

export interface Preset {
  id: string;
  name: string;
  description: string;
  doses: Dose[];
  scheduleLength: number;
  repeat?: boolean; // Whether to enable repeat mode
}

const EV = ESTRADIOL_ESTERS[1]!; // Estradiol valerate
const EC = ESTRADIOL_ESTERS[2]!; // Estradiol cypionate
const EEn = ESTRADIOL_ESTERS[4]!; // Estradiol enanthate

export const PRESETS: Preset[] = [
  {
    id: 'ev-5day',
    name: 'EV Every 5 Days',
    description: '3mg valerate every 5 days (common regimen)',
    doses: [
      { day: 0, dose: 3, medication: EV },
    ],
    scheduleLength: 5,
    repeat: true
  },
  {
    id: 'ev-weekly',
    name: 'EV Weekly',
    description: '5mg valerate once per week',
    doses: [
      { day: 0, dose: 5, medication: EV },
    ],
    scheduleLength: 7,
    repeat: true
  },
  {
    id: 'ec-weekly',
    name: 'EC Weekly',
    description: '4mg cypionate once per week',
    doses: [
      { day: 0, dose: 4, medication: EC },
    ],
    scheduleLength: 7,
    repeat: true
  },
  {
    id: 'ec-biweekly',
    name: 'EC Bi-weekly',
    description: '7mg cypionate every 2 weeks',
    doses: [
      { day: 0, dose: 7, medication: EC },
    ],
    scheduleLength: 14,
    repeat: true
  },
  {
    id: 'een-weekly',
    name: 'EEn Weekly',
    description: '4mg enanthate once per week',
    doses: [
      { day: 0, dose: 4, medication: EEn },
    ],
    scheduleLength: 7,
    repeat: true
  },
  {
    id: 'frontload',
    name: 'Frontload Start',
    description: 'Initial loading dose then maintenance (non-repeating)',
    doses: [
      { day: 0, dose: 6, medication: EV },
      { day: 3, dose: 3, medication: EV },
      { day: 7, dose: 3, medication: EV },
      { day: 11, dose: 3, medication: EV },
      { day: 15, dose: 3, medication: EV },
      { day: 19, dose: 3, medication: EV },
      { day: 23, dose: 3, medication: EV },
      { day: 27, dose: 3, medication: EV },
    ],
    scheduleLength: 30,
    repeat: false
  },
  {
    id: 'cycle-mimic',
    name: 'Cycle Mimicking',
    description: 'Variable doses to mimic natural cycle (with less severe lows)',
    doses: [
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
    ],
    scheduleLength: 29,
    repeat: true
  },
];

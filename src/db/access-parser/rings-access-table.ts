import { Ring } from '../../entities/ring-entity';
import { logger } from '../../configs/logger';

const identificationNumber = (item: any): string => {
  const { 'Identification series': series, 'Identification number': number } = item;
  if (!series || !number) {
    throw new Error(`Ring ${item.RN} haven't or series or number`);
  }
  return `${series}${'.'.repeat(10 - series.length - number.length)}${number}`;
};

// eslint-disable-next-line no-restricted-globals
const isNumber = (n: any): boolean => !isNaN(parseFloat(n)) && isFinite(n);

const date = (item: any): Date | null => {
  // eslint-disable-next-line prefer-const
  let { 'Date year': year, 'Date month': month, 'Date day': day, 'Time hour': hour, 'Time min': min } = item;
  if (!year || !isNumber(year)) {
    return null;
  }
  if (!hour || !isNumber(hour)) {
    hour = 12;
  }
  if (!min || !isNumber(min)) {
    min = 0;
  }
  return new Date(year, month || 5, day || 15, hour, min);
};

const geographicalCoordinates = (item: any): string | null => {
  const {
    'Lat side': laside,
    'Lat deg': lad,
    'Lat min': lam,
    'Lat sec': las,
    'Lon side': loside,
    'Lon deg': lod,
    'Lon min': lom,
    'Lon sec': los,
  } = item;
  if (!lad || !lod) {
    return null;
  }
  return `${laside || '+'}${lad}${lam}${las}${loside || '+'}${lod}${lom}${los}`;
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RingMap = { [index in keyof Omit<Ring, 'id' | 'observation'>]: ((item: any) => any) | string };

export const ringMap: RingMap = {
  identificationNumber,
  ringingScheme: 'Ringing Scheme',
  primaryIdentificationMethod: 'Primary identification method',
  verificationOfTheMetalRing: 'Verification of metal ring',
  metalRingInformation: 'Metal ring information',
  otherMarksInformation: 'Other mark information',
  speciesMentioned: 'Species by person',
  speciesConcluded: 'Species by Scheme',
  manipulated: 'Manipulated',
  movedBeforeTheCapture: 'Moved befor the (re)capture/recovery',
  catchingMethod: 'Catching method',
  catchingLures: 'Catching lures',
  sexMentioned: 'Sex by person',
  sexConcluded: 'Sex by Scheme',
  ageMentioned: 'Age by person',
  ageConcluded: 'Age by Scheme',
  status: 'Status',
  broodSize: 'Broodsize',
  pullusAge: 'Pullus age',
  accuracyOfPullusAge: 'Accuracy of pullus age',
  // TODO there is some place for improvements.
  // all rows have sec, but some havent coords, but have place code
  // sometimes they have coords but havent place code
  geographicalCoordinates,
  placeCode: 'Place code',
  accuracyOfCoordinates: 'Accuracy of co-ordinates',
  condition: 'Condition',
  circumstances: 'Circumstances',
  circumstancesPresumed: 'Circumstances presumed',
  date,
  accuracyOfDate: 'Accuracy of date',
  euringCodeIdentifier: 'Euring-code identifier',
  remarks: 'Note',
  // TODO this fields needed to be handled separately and additionaly by model
  //  but now model doesnt supports this
  // ringerInformation: (item: any): string => `${item.Ringer}; ${item['Place of ring']}`,
  ringerInformation: (): null => null,
  statusOfRing: 'Status of ring',
  // TODO missed fields. needs clarification
  // next 3 related to observations only. but 4 rows have it
  // Derived data distance
  // Derived data directions
  // Derived data elapsed time
  // Next related to identificationNumber
  // RN ~ Identification series + Dots + Identification number
  // other fields. Думаю, что часть всего этого можно сгрузить в remarks
  // Color ring
  // E-mail около 10
  // Color ring schem
  // Col{1-4}
  // Mark{1-6}
  // Age old
};

const ringKeys = Object.keys(ringMap);

export function ringMapper(dbRecords: any[]): Ring[] {
  const rings: Ring[] = dbRecords
    .map((dbRing: any) => {
      try {
        const ring = ringKeys.reduce((acc: { [index in keyof RingMap]: any }, key: keyof RingMap) => {
          const map = ringMap[key];
          acc[key] = typeof map === 'function' ? map(dbRing) : dbRing[map];
          return acc;
        }, {});
        return ring;
      } catch (e) {
        logger.error(`Ring ${dbRing.RN} can't be mapped: skipped`);
        return null;
      }
    })
    .filter(ring => !!ring)
    .map(mapped => Object.assign(new Ring(), mapped));
  return rings;
}

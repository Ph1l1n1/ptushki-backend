import { Ring } from '../../entities/ring-entity';
import { logger } from '../../utils/logger';
import { fromDegreesToDecimal } from '../../utils/coords-parser';

const identificationNumber = (item: any): string => {
  const { 'Identification series': series, 'Identification number': number } = item;
  if (!series || !number) {
    throw new Error(`Ring ${item.RN} haven't or series or number`);
  }
  try {
    return `${series}${'.'.repeat(10 - series.length - number.length)}${number}`;
  } catch {
    throw new Error(`Not able to process identification number & series`);
  }
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

const longitude = (item: any): number | null => {
  const { 'Lon side': loside, 'Lon deg': lod, 'Lon min': lom, 'Lon sec': los } = item;
  if (!lod) return null;
  try {
    return fromDegreesToDecimal(Number(lod), Number(lom) || 0, Number(los) || 0, loside === '-');
  } catch (e) {
    throw new Error(`Not able to process longitude`);
  }
};

const latitude = (item: any): number | null => {
  const { 'Lat side': laside, 'Lat deg': lad, 'Lat min': lam, 'Lat sec': las } = item;
  if (!lad) return null;
  try {
    return fromDegreesToDecimal(Number(lad), Number(lam) || 0, Number(las) || 0, laside === '-');
  } catch (e) {
    throw new Error(`Not able to process latitude`);
  }
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RingMap = {
  // todo review later excluded fields
  [index in keyof Omit<Ring, 'id' | 'observation' | 'exportEURING' | 'importEURING'>]: ((item: any) => any) | string
};

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

  longitude,
  latitude,
  placeCode: 'Place code',
  accuracyOfCoordinates: 'Accuracy of co-ordinates',
  condition: 'Condition',
  circumstances: 'Circumstances',
  circumstancesPresumed: 'Circumstances presumed',
  date,
  accuracyOfDate: 'Accuracy of date',
  euringCodeIdentifier: 'Euring-code identifier',
  remarks: 'Note',
  // README currently ringer will be handled as plain value not by reference with additional model
  offlineRinger: 'Ringer',
  ringerInformation: (): null => null,
  statusOfRing: 'Status of ring',

  // TODO unhandled fields. needs clarification

  // E-mail около 10. Избыточное, при условии добавления таблицы Ringer -- там есть emails, тем более все поля с email
  // содержат ссылку на Ringer

  // 'Place of ring' не имеет никаких аналогов в стандарте
  // observation имеет Place Name, что подобно по смыслу и содержанию

  // Остальные:
  // Color ring
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
        logger.warn(`Ring ${dbRing.RN} can't be mapped -- skipped: ${e}`);
        return null;
      }
    })
    .filter(ring => !!ring)
    .map(mapped => Object.assign(new Ring(), mapped));
  return rings;
}

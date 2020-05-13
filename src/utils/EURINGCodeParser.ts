import { EURINGCodeAsRawObject, EURINGCodeAsArray, EURINGCodeAsPreEntity } from '../entities/common-interfaces';
import { fromStringToValueOrNull } from './custom-parsers';
import { fromEuringToDate } from './date-parser';
import { DecimalCoordinates, fromEuringToDecimal } from './coords-parser';
import { CustomError } from './CustomError';

/* eslint-disable no-unused-vars */
const parseEURINGCodeToObject = (code: string): EURINGCodeAsRawObject => {
  const arrayOfCodes = code.split('|') as EURINGCodeAsArray;

  if (arrayOfCodes.length < 60) {
    throw new CustomError('Provided EURING code is invalid -- some codes are missed', 400);
  }

  if (arrayOfCodes.length > 60) {
    throw new CustomError('Provided EURING code is invalid -- provides to much codes', 400);
  }

  const [
    ringingScheme,
    primaryIdentificationMethod,
    identificationNumber,
    verificationOfTheMetalRing,
    metalRingInformation,
    otherMarksInformation,
    speciesMentioned,
    speciesConcluded,
    manipulated,
    movedBeforeTheCapture,
    catchingMethod,
    catchingLures,
    sexMentioned,
    sexConcluded,
    ageMentioned,
    ageConcluded,
    status,
    broodSize,
    pullusAge,
    accuracyOfPullusAge,
    date,
    accuracyOfDate,
    time,
    placeCode,
    latitudeLongitude,
    accuracyOfCoordinates,
    condition,
    circumstances,
    circumstancesPresumed,
    euringCodeIdentifier,
    distance,
    direction,
    elapsedTime, // wingLength // thirdPrimary // stateOfWingPoint // mass // moult // plumageCode // hindClaw // billLength // billMethod // totalHeadLength // tarsus // tarsusMethod // tailLength // tailDiffernce // fatScore // fatScoreMethod // pectoralMuscle // broodPatch // primaryScore // primaryMoult // oldGreaterCoverts // alula // carpalCovert // sexingMethod
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    placeName,
    remarks,
    reference,
  ] = arrayOfCodes;

  return {
    ringingScheme,
    primaryIdentificationMethod,
    identificationNumber,
    verificationOfTheMetalRing,
    metalRingInformation,
    otherMarksInformation,
    speciesMentioned,
    speciesConcluded,
    manipulated,
    movedBeforeTheCapture,
    catchingMethod,
    catchingLures,
    sexMentioned,
    sexConcluded,
    ageMentioned,
    ageConcluded,
    status,
    broodSize,
    pullusAge,
    accuracyOfPullusAge,
    date,
    accuracyOfDate,
    time,
    placeCode,
    latitudeLongitude,
    accuracyOfCoordinates,
    condition,
    circumstances,
    circumstancesPresumed,
    euringCodeIdentifier,
    distance,
    direction,
    elapsedTime,
    placeName,
    remarks,
    reference,
  };
};

export default (code: string): EURINGCodeAsPreEntity => {
  const object = parseEURINGCodeToObject(code);
  const { latitude, longitude }: DecimalCoordinates = fromEuringToDecimal(object.latitudeLongitude);
  return {
    ringingScheme: fromStringToValueOrNull(object.ringingScheme),
    primaryIdentificationMethod: fromStringToValueOrNull(object.primaryIdentificationMethod),
    verificationOfTheMetalRing: fromStringToValueOrNull(object.verificationOfTheMetalRing, Number),
    metalRingInformation: fromStringToValueOrNull(object.metalRingInformation, Number),
    otherMarksInformation: fromStringToValueOrNull(object.otherMarksInformation),
    broodSize: fromStringToValueOrNull(object.broodSize),
    euringCodeIdentifier: fromStringToValueOrNull(object.euringCodeIdentifier, Number),
    identificationNumber: fromStringToValueOrNull(object.identificationNumber),
    speciesMentioned: fromStringToValueOrNull(object.speciesMentioned),
    speciesConcluded: fromStringToValueOrNull(object.speciesConcluded),
    manipulated: fromStringToValueOrNull(object.manipulated),
    movedBeforeTheCapture: fromStringToValueOrNull(object.movedBeforeTheCapture, Number),
    catchingMethod: fromStringToValueOrNull(object.catchingMethod),
    catchingLures: fromStringToValueOrNull(object.catchingLures),
    sexMentioned: fromStringToValueOrNull(object.sexMentioned),
    sexConcluded: fromStringToValueOrNull(object.sexConcluded),
    ageMentioned: fromStringToValueOrNull(object.ageMentioned),
    ageConcluded: fromStringToValueOrNull(object.ageConcluded),
    status: fromStringToValueOrNull(object.status),
    pullusAge: fromStringToValueOrNull(object.pullusAge),
    accuracyOfPullusAge: fromStringToValueOrNull(object.accuracyOfPullusAge),
    date: fromEuringToDate(object.date, object.time),
    accuracyOfDate: fromStringToValueOrNull(object.accuracyOfDate, Number),
    placeCode: fromStringToValueOrNull(object.placeCode),
    latitude,
    longitude,
    accuracyOfCoordinates: fromStringToValueOrNull(object.accuracyOfCoordinates, Number),
    condition: fromStringToValueOrNull(object.condition, Number),
    circumstances: fromStringToValueOrNull(object.circumstances),
    circumstancesPresumed: fromStringToValueOrNull(object.circumstancesPresumed, Number),
    distance: fromStringToValueOrNull(object.distance, Number) as number,
    direction: fromStringToValueOrNull(object.direction, Number) as number,
    elapsedTime: fromStringToValueOrNull(object.elapsedTime, Number) as number,
    placeName: fromStringToValueOrNull(object.placeName) as string,
    remarks: fromStringToValueOrNull(object.remarks) as string,
  };
};

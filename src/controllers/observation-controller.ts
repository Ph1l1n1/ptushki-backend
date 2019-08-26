import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import { pipe } from 'ramda';
import AbstractController from './abstract-controller';
import { User } from '../entities/user-entity';
import { Observation, Verified } from '../entities/observation-entity';
import Exporter from '../services/export';
import Importer from '../services/import';
import { Ring } from '../entities/ring-entity';

import {
  parsePageParams,
  ObservationQuery,
  parseWhereParams,
  LocaleOrigin,
  mapLocale,
  sanitizeUser,
} from '../services/observation-service';
import { CustomError } from '../utils/CustomError';

interface RequestWithObservation extends Request {
  observation: Observation;
}

interface RequestWithPageParams extends Request {
  query: ObservationQuery;
}

type ObservationKeyUnion = keyof Observation;
interface AggregationsMap {
  [key: string]: { value: any; count: number }[];
}

export default class ObservationController extends AbstractController {
  private router: Router = Router();

  private observations: Repository<Observation>;

  private exporter: Exporter;

  private importer: Importer;

  private rings: Repository<Ring>;

  private requiredColumns: ObservationKeyUnion[] = ['speciesMentioned', 'verified', 'finder', 'ringMentioned'];

  public init(): Router {
    this.observations = getRepository(Observation);
    this.rings = getRepository(Ring);
    this.setMainEntity(this.observations, 'observation');
    this.exporter = new Exporter();
    this.importer = new Importer();

    this.router.param('id', this.checkId);
    this.router.get('/', this.getObservations);
    this.router.get('/aggregations', this.getAggregations);
    this.router.post('/', this.addObservation);
    this.router.post('/export/:type', this.exporter.handle('observations'));
    this.router.post('/import/:type', this.importer.handle('observations'));
    this.router.get('/:id', this.findObservation);
    this.router.post('/:id/export/:type', this.exporter.handle('observations'));
    this.router.put('/:id', this.editObservation);
    this.router.delete('/:id', this.removeObservation);
    this.router.post('/set-verification', this.setVerificationStatus);

    return this.router;
  }

  private getObservations = async (req: RequestWithPageParams, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lang = 'eng' }: { lang: string } = req.query;
      const langOrigin = LocaleOrigin[lang] ? LocaleOrigin[lang] : 'desc_eng';

      const paramsSearch = parsePageParams(req.query);
      const paramsAggregation = parseWhereParams(req.user, req.query);
      const observations = await this.observations.findAndCount(Object.assign(paramsSearch, paramsAggregation));

      const content = observations[0].map(obs => {
        // sanitaze user's data
        const finder = Object.assign({}, User.sanitizeUser(obs.finder));
        // transform 'observation'
        const observation = Object.entries(obs)
          // clear 'filter' field
          .filter(([ObservationField]) => ObservationField !== 'ring')
          // map 'lang' param according 'Locale'
          .map(entrie => mapLocale(entrie, langOrigin))
          .reduce(
            (acc, [ObservationField, ObservationValue]) => Object.assign(acc, { [ObservationField]: ObservationValue }),
            {},
          );
        return Object.assign({}, observation, { finder }, { ring: obs.ring.id });
      });

      res.json({
        content,
        pageNumber: paramsSearch.number,
        pageSize: paramsSearch.size,
        totalElements: observations[1],
      });
    } catch (error) {
      next(error);
    }
  };

  private getAggregations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lang = 'eng' }: { lang: string } = req.query;
      const langOrigin = LocaleOrigin[lang] ? LocaleOrigin[lang] : 'desc_eng';

      const paramsAggregation = parseWhereParams(req.user, req.query);
      const observations = await this.observations.find({ ...paramsAggregation });
      const aggregatinMap: AggregationsMap = {};
      const requiredColumnsMap = this.requiredColumns.reduce((acc, column) => {
        return Object.assign(acc, { [column]: [] });
      }, aggregatinMap);

      const aggregations = observations.reduce((acc, observation) => {
        this.requiredColumns.forEach(column => {
          const desired = acc[column].find(item => {
            if (typeof observation[column] === 'object' && observation[column] !== null) {
              return item.value.id === (observation[column] as any).id;
            }
            return item.value === observation[column];
          });
          if (desired) {
            desired.count += 1;
          } else {
            const f = pipe(
              (arg: [string, any]) => mapLocale(arg, langOrigin),
              (arg: [string, any]) => sanitizeUser(arg),
            );
            const [, obsValue] = f([column, observation[column]]);

            acc[column].push({ value: obsValue, count: 1 });
          }
        });
        return acc;
      }, requiredColumnsMap);

      res.json(aggregations);
    } catch (error) {
      next(error);
    }
  };

  private addObservation = async (req: Request, res: Response, next: NextFunction) => {
    const rawObservation = req.body;
    try {
      let { ring } = rawObservation;
      if (!ring) {
        ({ id: ring = null } =
          (await this.rings.findOne({ identificationNumber: rawObservation.ringMentioned })) || {});
      }
      const newObservation = await Observation.create({ ...rawObservation, ring, finder: req.user.id });
      await this.validate(newObservation);
      const result = await this.observations.save(newObservation);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  private findObservation = async (req: RequestWithObservation, res: Response, next: NextFunction) => {
    const { observation }: { observation: Observation } = req;
    try {
      res.json(observation);
    } catch (e) {
      next(e);
    }
  };

  private editObservation = async (req: RequestWithObservation, res: Response, next: NextFunction) => {
    const { observation }: { observation: Observation } = req;
    const rawObservation = req.body;
    try {
      let { ring } = rawObservation;
      if (!ring || rawObservation.ringMentioned !== observation.ringMentioned) {
        ({ id: ring = null } =
          (await this.rings.findOne({ identificationNumber: rawObservation.ringMentioned })) || {});
      }
      await this.validate(Object.assign(rawObservation, { ring }), observation);
      const updatedObservation = await this.observations.merge(observation, rawObservation);
      const result = await this.observations.save(updatedObservation);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  private removeObservation = async (req: RequestWithObservation, res: Response, next: NextFunction): Promise<void> => {
    const { observation }: { observation: Observation } = req;
    try {
      const result = await this.observations.remove(observation);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  private setVerificationStatus = async (
    req: RequestWithObservation,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { id, status }: { id: string; status: Verified } = req.body;
    try {
      if (!id || !status) {
        throw new CustomError('Id and status are required', 400);
      }
      await this.observations.findOneOrFail(id);
      await this.observations.update(id, { verified: status });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  };
}

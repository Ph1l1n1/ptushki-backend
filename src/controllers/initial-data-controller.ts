/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getCustomRepository, Repository } from 'typeorm';
import { GET, Path, QueryParam, Security } from 'typescript-rest';
import { Tags, Response } from 'typescript-rest-swagger';

import AbstractController from './abstract-controller';
import { cachedEURINGCodes } from '../entities/euring-codes/cached-entities-fabric';
import { CachedRepository } from '../entities/cached-repository';
import { executeInThreadedQueue } from '../utils/async-queue';
import { logger } from '../utils/logger';
import { CustomError } from '../utils/CustomError';

@Path('initial-data')
@Tags('initial-data')
@Security()
export default class InitialDataController extends AbstractController {
  public cached: Repository<any>[];

  public constructor() {
    super();
    this.cached = Object.keys(cachedEURINGCodes).map((entityName: string) =>
      getCustomRepository(cachedEURINGCodes[entityName]),
    );
  }

  public async heatUp() {
    try {
      await executeInThreadedQueue(
        this.cached.map((repository: CachedRepository<any>) => async () => repository.getAll()),
      );
      logger.info(`Initial data was heated up`);
    } catch (e) {
      logger.error(`Error while heated up initial data`);
    }
  }

  @GET
  @Path('/')
  @Response<{ [index: string]: any[] }>(200, 'All available EURING codes with descriptions.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async getInitialData(@QueryParam('lang') lang: string): Promise<{ [index: string]: any[] }> {
    return (await Promise.all(
      this.cached.map(async (repository: CachedRepository<any>) => ({
        records: await repository.filterDescsForLang(lang),
        tableName: repository.tableName,
      })),
    )).reduce((acc: { [index: string]: any[] }, { records, tableName }) => {
      acc[tableName] = records;
      return acc;
    }, {});
  }
}

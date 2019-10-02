import config from 'config';
import { Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { CustomError } from '../utils/CustomError';

const UUID_LENGTH = config.get('UUID_LENGTH');

interface ParsedErrors {
  [key: string]: string[];
}

export default abstract class AbstractController {
  private entity: Repository<any>;

  protected async checkId<TData>(id: string): Promise<TData> {
    if (!this.entity) {
      throw new CustomError('Before use checkId method, please specify used entity with setMainEntity method', 400);
    }

    if (id.length !== UUID_LENGTH) {
      throw new CustomError(`Provided ${this.entity.metadata.name} identifier (${id}) is incorrect`, 400);
    }

    const instance = await this.entity.findOne(id);

    if (!instance) {
      throw new CustomError(`${this.entity.metadata.name} with ${id} not exists`, 404);
    }
    return instance;
  }

  protected setMainEntity(entity: Repository<any>) {
    this.entity = entity;
  }

  // Argument 'data' it is a new data, and argument existedData is optional and needed for refreshing existing data in db
  protected async validate(data: any, existedData: any = {}): Promise<void> {
    const createdModel = await this.entity.create(Object.assign(existedData, data));
    const errors = await validate(createdModel);
    if (errors.length) {
      const parsedErrors = errors.reduce(
        (acc: ParsedErrors, error: ValidationError): ParsedErrors => ({
          ...acc,
          [error.property]: Object.values(error.constraints),
        }),
        {},
      );
      throw new CustomError(parsedErrors as string, 422);
    }
  }
}

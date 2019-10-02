import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsOptional, IsString } from 'class-validator';
import { IsAlphanumericWithHyphen } from '../../validation/custom-decorators';
import { equalLength } from '../../validation/validation-messages';
import { EntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Accuracy of pullus age'
@Entity()
export class AccuracyOfPullusAge implements EntityDto {
  @IsAlphanumericWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  @PrimaryColumn()
  public id: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => Ring, m => m.accuracyOfPullusAge)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.accuracyOfPullusAge)
  public observation: Observation[];
}

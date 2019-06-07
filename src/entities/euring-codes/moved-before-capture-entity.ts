import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { Dictionary } from './common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Moved before the capture'
@Entity()
export class MovedBeforeTheCapture implements Dictionary {
  public static unknown = 9;

  @IsInt()
  @Min(0)
  @Max(9)
  @PrimaryColumn()
  public id: number;

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

  @OneToMany(() => Ring, m => m.movedBeforeTheCapture)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.movedBeforeTheCapture)
  public observation: Observation[];
}

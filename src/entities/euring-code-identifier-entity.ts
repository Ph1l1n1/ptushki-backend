import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { RingData } from './ring-data-entity';

@Entity()
export class EURINGCodeIdentifier implements Dictionary {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => RingData, m => m.euringCodeIdentifier)
  public ringData: RingData[];
}

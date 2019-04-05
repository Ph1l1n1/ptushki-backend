import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { RingData } from './ring-data-entity';
import { BasaRing } from './basa-ring-entity';

@Entity()
export class Sex implements Dictionary {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @Column('varchar', { nullable: true, default: null }) public desc_eng: string | null;

  @Column('varchar', { nullable: true, default: null }) public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null }) public desc_byn: string | null;

  @OneToMany(() => RingData, m => m.sex)
  public ringData: RingData[];

  @OneToMany(() => BasaRing, m => m.species)
  public basaRing: BasaRing[];
}

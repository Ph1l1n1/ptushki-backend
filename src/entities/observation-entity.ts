import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user-entity';
import { Ring } from './ring-entity';
import { Sex } from './euring-codes/sex-entity';
import { Age } from './euring-codes/age-entity';
import { Species } from './euring-codes/species-entity';

@Entity()
export class Observation {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => Ring, m => m.observation, {
    eager: true,
  })
  public ring: Ring;

  @ManyToOne(() => User, m => m.observation, {
    eager: true,
  })
  public finder: User;

  @ManyToOne(() => Species, m => m.observation, {
    eager: true,
  })
  public speciesMentioned: Species;

  @ManyToOne(() => Sex, m => m.observation, {
    eager: true,
  })
  public sexMentioned: Sex;

  @ManyToOne(() => Age, m => m.observation, {
    eager: true,
  })
  public ageMentioned: Age;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataDistance: string | null;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataDirection: string | null;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataElapsedTime: string | null;

  @Column('varchar', { nullable: true, default: null })
  public colorRing: string | null;

  @Column('varchar', { nullable: true, default: null })
  public note: string | null;

  @Column('boolean', { default: false })
  public verified: boolean;
}
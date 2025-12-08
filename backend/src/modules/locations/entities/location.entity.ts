import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum LocationType {
  COUNTRY = 'COUNTRY',
  STATE = 'STATE',
  CITY = 'CITY',
  REGION = 'REGION'
}

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: LocationType
  })
  type: LocationType;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_metropolitan', nullable: true })
  isMetropolitan: boolean;

  @Column({ nullable: true })
  code: string;

  @ManyToOne(() => Location, location => location.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Location;

  @OneToMany(() => Location, location => location.parent)
  children: Location[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    timezone?: string;
    population?: number;
    coordinates?: { lat: number; lng: number };
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'opened_at', nullable: true })
  openedAt: Date;

  @Column({ name: 'closed_at', nullable: true })
  closedAt: Date;
}

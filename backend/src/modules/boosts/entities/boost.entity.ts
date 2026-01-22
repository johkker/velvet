import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Talent } from '../../talents/entities/talent.entity';
import { Establishment } from '../../establishments/entities/establishment.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum BoostStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export enum BoostType {
    TALENT = 'TALENT',
    ESTABLISHMENT_PROFILE = 'ESTABLISHMENT_PROFILE',
    TALENT_BULK = 'TALENT_BULK',
}

@Entity('boosts')
export class Boost {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: BoostType,
        default: BoostType.TALENT,
    })
    type: BoostType;

    @ManyToOne(() => Talent, (talent) => talent.boosts, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'talent_id' })
    talent: Talent;

    @ManyToOne(() => Establishment, (establishment) => establishment.boosts, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'establishment_id' })
    establishment: Establishment;

    @ManyToOne(() => Establishment, (establishment) => establishment.purchasedBoosts, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'purchased_by_establishment_id' })
    purchasedByEstablishment: Establishment;

    @Column({ name: 'start_at', type: 'timestamptz', nullable: true })
    startAt: Date | null;

    @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
    endAt: Date | null;

    @Column({ name: 'duration_days', type: 'int', nullable: true })
    durationDays: number;

    @Column({ name: 'payment_id', type: 'uuid', nullable: true })
    paymentId: string;

    @Column({
        type: 'enum',
        enum: BoostStatus,
        default: BoostStatus.PENDING,
    })
    status: BoostStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'talent_ids', type: 'jsonb', nullable: true })
    talentIds: string[] | null;

    @Column({ name: 'boost_tier', type: 'varchar', nullable: true })
    boostTier: string | null;

    @Column({ name: 'discount_percentage', type: 'int', default: 0 })
    discountPercentage: number;

    @OneToMany(() => Payment, (payment) => payment.boost)
    payments: Payment[];
}

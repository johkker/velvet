import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Establishment } from '../../establishments/entities/establishment.entity';
import { Talent } from '../../talents/entities/talent.entity';

export enum InvitationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

@Entity('invitations')
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Establishment, (establishment) => establishment.invitations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'establishment_id' })
    establishment: Establishment;

    @ManyToOne(() => Talent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'talent_id' })
    talent: Talent;

    @Column('text', { nullable: true })
    message: string;

    @Column({
        type: 'enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING,
    })
    status: InvitationStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

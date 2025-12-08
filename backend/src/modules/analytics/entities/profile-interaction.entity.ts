import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ProfileType {
    TALENT = 'TALENT',
    ESTABLISHMENT = 'ESTABLISHMENT',
}

export enum InteractionType {
    CONTACT_CLICK = 'CONTACT_CLICK',
    PHONE_REVEAL = 'PHONE_REVEAL',
    WHATSAPP_CLICK = 'WHATSAPP_CLICK',
    INVITE_CLICK = 'INVITE_CLICK',
    EMAIL_CLICK = 'EMAIL_CLICK',
}

@Entity('profile_interactions')
@Index(['profileType', 'profileId'])
@Index(['interactionType'])
@Index(['createdAt'])
export class ProfileInteraction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ProfileType,
        name: 'profile_type',
    })
    profileType: ProfileType;

    @Column({ name: 'profile_id', type: 'uuid' })
    profileId: string;

    @Column({
        type: 'enum',
        enum: InteractionType,
        name: 'interaction_type',
    })
    interactionType: InteractionType;

    @Column({ name: 'session_id', nullable: true })
    sessionId: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string;

    @Column('jsonb', { nullable: true })
    metadata: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

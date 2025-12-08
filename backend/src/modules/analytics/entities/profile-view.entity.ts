import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ProfileType {
    TALENT = 'TALENT',
    ESTABLISHMENT = 'ESTABLISHMENT',
}

export enum DeviceType {
    DESKTOP = 'desktop',
    MOBILE = 'mobile',
    TABLET = 'tablet',
}

@Entity('profile_views')
@Index(['profileType', 'profileId'])
@Index(['sessionId'])
@Index(['viewedAt'])
export class ProfileView {
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

    @Column({ name: 'session_id', nullable: true })
    sessionId: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string;

    @Column({ name: 'ip_address', length: 45, nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    referrer: string;

    @Column({
        type: 'enum',
        enum: DeviceType,
        name: 'device_type',
        nullable: true,
    })
    deviceType: DeviceType;

    @CreateDateColumn({ name: 'viewed_at' })
    viewedAt: Date;
}

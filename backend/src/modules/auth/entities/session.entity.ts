import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'refresh_token_hash' })
    refreshTokenHash: string;

    @Column('text', { name: 'user_agent', nullable: true })
    userAgent: string;

    @Column({ name: 'ip_address', length: 64, nullable: true })
    ipAddress: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;
}

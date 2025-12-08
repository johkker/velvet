import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 128, nullable: true })
    action: string;

    @Column({ name: 'resource_type', length: 64, nullable: true })
    resourceType: string;

    @Column({ name: 'resource_id', type: 'uuid', nullable: true })
    resourceId: string;

    @Column('jsonb', { nullable: true })
    payload: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

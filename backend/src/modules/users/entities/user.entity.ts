import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Talent } from '../../talents/entities/talent.entity';
import { Establishment } from '../../establishments/entities/establishment.entity';

export enum UserRole {
    TALENT = 'TALENT',
    ESTABLISHMENT = 'ESTABLISHMENT',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
    })
    role: UserRole;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => Talent, (talent) => talent.user)
    talent: Talent;

    @OneToOne(() => Establishment, (establishment) => establishment.user)
    establishment: Establishment;
}

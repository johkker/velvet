import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';
import { Boost } from '../../boosts/entities/boost.entity';

@Entity('establishments')
export class Establishment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.establishment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column('text', { nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Invitation, (invitation) => invitation.establishment)
    invitations: Invitation[];

    @OneToMany(() => Boost, (boost) => boost.establishment)
    boosts: Boost[];

    @OneToMany(() => Boost, (boost) => boost.purchasedByEstablishment)
    purchasedBoosts: Boost[];
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ProfileType {
    TALENT = 'TALENT',
    ESTABLISHMENT = 'ESTABLISHMENT',
}

@Entity('search_impressions')
@Index(['profileType', 'profileId'])
@Index(['createdAt'])
export class SearchImpression {
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

    @Column({ name: 'search_query', nullable: true })
    searchQuery: string;

    @Column({ type: 'int', nullable: true })
    position: number;

    @Column({ type: 'int', default: 1 })
    page: number;

    @Column({ name: 'session_id', nullable: true })
    sessionId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Talent } from '../../talents/entities/talent.entity';

export enum PhotoStatus {
    PROCESSING = 'PROCESSING',
    READY = 'READY',
    REJECTED = 'REJECTED',
}

@Entity('photos')
export class Photo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Talent, (talent) => talent.photos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'talent_id' })
    talent: Talent;

    @Column('text')
    url: string;

    @Column('text', { name: 'blur_url', nullable: true })
    blurUrl: string;

    @Column({ name: 'is_main', default: false })
    isMain: boolean;

    @Column({
        type: 'enum',
        enum: PhotoStatus,
        default: PhotoStatus.PROCESSING,
    })
    status: PhotoStatus;

    @Column({ nullable: true })
    width: number;

    @Column({ nullable: true })
    height: number;

    @CreateDateColumn({ name: 'uploaded_at' })
    uploadedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Photo } from '../../photos/entities/photo.entity';
import { Location } from '../../locations/entities/location.entity';
import { Boost } from '../../boosts/entities/boost.entity';

export enum TalentStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
}

export enum HairColor {
    BLONDE = 'Blonde',
    BRUNETTE = 'Brunette',
    RED = 'Red',
    BLACK = 'Black',
    GRAY = 'Gray',
    OTHER = 'Other',
}

export enum EyeColor {
    BLUE = 'Blue',
    BROWN = 'Brown',
    GREEN = 'Green',
    HAZEL = 'Hazel',
    GRAY = 'Gray',
    OTHER = 'Other',
}

export enum BodyType {
    SLIM = 'Slim',
    ATHLETIC = 'Athletic',
    CURVY = 'Curvy',
    AVERAGE = 'Average',
    PLUS_SIZE = 'Plus Size',
}

export enum SkinTone {
    FAIR = 'Fair',
    MEDIUM = 'Medium',
    OLIVE = 'Olive',
    TAN = 'Tan',
    DARK = 'Dark',
}

export enum Ethnicity {
    WHITE = 'White',
    BLACK = 'Black',
    ASIAN = 'Asian',
    LATINA = 'Latina',
    MIXED = 'Mixed',
    OTHER = 'Other',
}

@Entity('talents')
export class Talent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.talent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ unique: true })
    slug: string;

    @Column({ name: 'display_name' })
    displayName: string;

    @Column('text', { nullable: true })
    bio: string;

    @Column({ type: 'smallint', nullable: true })
    age: number;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @Column('text', { array: true, default: '{}' })
    services: string[];

    @Column({ name: 'price_min', nullable: true })
    priceMin: number;

    @Column({
        type: 'enum',
        enum: TalentStatus,
        default: TalentStatus.OFFLINE,
    })
    status: TalentStatus;

    @Column({ name: 'is_boosted', default: false })
    isBoosted: boolean;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    // Physical Attributes
    @Column({
        type: 'enum',
        enum: HairColor,
        name: 'hair_color',
        nullable: true,
    })
    hairColor: HairColor;

    @Column({
        type: 'enum',
        enum: EyeColor,
        name: 'eye_color',
        nullable: true,
    })
    eyeColor: EyeColor;

    @Column({
        type: 'enum',
        enum: BodyType,
        name: 'body_type',
        nullable: true,
    })
    bodyType: BodyType;

    @Column({ type: 'smallint', nullable: true })
    height: number; // in centimeters

    @Column({
        type: 'enum',
        enum: SkinTone,
        name: 'skin_tone',
        nullable: true,
    })
    skinTone: SkinTone;

    @Column({
        type: 'enum',
        enum: Ethnicity,
        nullable: true,
    })
    ethnicity: Ethnicity;

    @Column({ nullable: true })
    measurements: string; // e.g., "34-24-36"

    @Column({ type: 'smallint', nullable: true })
    weight: number; // in kilograms

    @Column({ default: false })
    tattoos: boolean;

    @Column({ default: false })
    piercings: boolean;

    // Professional Fields
    @Column('text', { array: true, default: '{}' })
    languages: string[]; // e.g., ["English", "Portuguese", "Spanish"]

    @Column({ nullable: true })
    availability: string; // e.g., "24/7", "Weekdays", "Weekends"

    @Column({ default: false })
    outcall: boolean;

    @Column({ default: false })
    incall: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Photo, (photo) => photo.talent)
    photos: Photo[];

    @OneToMany(() => Boost, (boost) => boost.talent)
    boosts: Boost[];
}

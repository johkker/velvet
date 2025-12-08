import { IsString, IsNumber, IsArray, IsOptional, IsEnum, Min, ArrayMaxSize, ArrayUnique, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TalentStatus, HairColor, EyeColor, BodyType, SkinTone, Ethnicity } from '../entities/talent.entity';
import { Type } from 'class-transformer';

export class TalentCardDto {
    id: string;
    slug: string;
    displayName: string;
    city?: string;
    photoMain?: string;
    isBoosted?: boolean;
    isOnline?: boolean;
}

export class TalentProfileDto extends TalentCardDto {
    bio?: string;
    age?: number;
    services?: string[];
    priceMin?: number;
    isVerified?: boolean;
    photoGallery?: { url: string; isMain: boolean; blurUrl?: string }[];
    associatedEstablishment?: { name: string; slug: string };
    contactLink?: string;
    tags?: string[];
    
    // Physical attributes
    hairColor?: HairColor;
    eyeColor?: EyeColor;
    bodyType?: BodyType;
    height?: number;
    skinTone?: SkinTone;
    ethnicity?: Ethnicity;
    measurements?: string;
    weight?: number;
    tattoos?: boolean;
    piercings?: boolean;
    
    // Professional fields
    languages?: string[];
    availability?: string;
    outcall?: boolean;
    incall?: boolean;
}

export class UpdateTalentDto {
    @ApiPropertyOptional({
        description: 'Public display name',
        example: 'Sofia Martinez',
        type: String
    })
    @IsOptional()
    @IsString()
    displayName?: string;

    @ApiPropertyOptional({
        description: 'Biography and description',
        example: 'Professional model and companion with 5 years of experience...',
        type: String
    })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({
        description: 'Age (must be 18 or older)',
        example: 25,
        minimum: 18,
        type: Number
    })
    @IsOptional()
    @IsNumber()
    @Min(18)
    age?: number;

    @ApiPropertyOptional({
        description: 'Services offered (maximum 10, unique values)',
        example: ['GFE', 'Dinner Date', 'Travel', 'Events'],
        maxItems: 10,
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10, { message: 'Maximum 10 services allowed' })
    @ArrayUnique({ message: 'Services must be unique' })
    services?: string[];

    @ApiPropertyOptional({
        description: 'Starting price in USD',
        example: 300,
        minimum: 0,
        type: Number
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    priceMin?: number;

    @ApiPropertyOptional({
        description: 'City location',
        example: 'New York',
        type: String
    })
    @IsOptional()
    @IsString()
    city?: string;

    // Physical Attributes
    @ApiPropertyOptional({ enum: HairColor, description: 'Hair color' })
    @IsOptional()
    @IsEnum(HairColor)
    hairColor?: HairColor;

    @ApiPropertyOptional({ enum: EyeColor, description: 'Eye color' })
    @IsOptional()
    @IsEnum(EyeColor)
    eyeColor?: EyeColor;

    @ApiPropertyOptional({ enum: BodyType, description: 'Body type' })
    @IsOptional()
    @IsEnum(BodyType)
    bodyType?: BodyType;

    @ApiPropertyOptional({ description: 'Height in centimeters', example: 170 })
    @IsOptional()
    @IsNumber()
    @Min(140)
    height?: number;

    @ApiPropertyOptional({ enum: SkinTone, description: 'Skin tone' })
    @IsOptional()
    @IsEnum(SkinTone)
    skinTone?: SkinTone;

    @ApiPropertyOptional({ enum: Ethnicity, description: 'Ethnicity' })
    @IsOptional()
    @IsEnum(Ethnicity)
    ethnicity?: Ethnicity;

    @ApiPropertyOptional({ description: 'Measurements (e.g., 34-24-36)', example: '34-24-36' })
    @IsOptional()
    @IsString()
    measurements?: string;

    @ApiPropertyOptional({ description: 'Weight in kilograms', example: 60 })
    @IsOptional()
    @IsNumber()
    @Min(40)
    weight?: number;

    @ApiPropertyOptional({ description: 'Has tattoos', example: false })
    @IsOptional()
    @IsBoolean()
    tattoos?: boolean;

    @ApiPropertyOptional({ description: 'Has piercings', example: false })
    @IsOptional()
    @IsBoolean()
    piercings?: boolean;

    // Professional Fields
    @ApiPropertyOptional({ 
        description: 'Languages spoken', 
        example: ['English', 'Spanish'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    languages?: string[];

    @ApiPropertyOptional({ description: 'Availability', example: '24/7' })
    @IsOptional()
    @IsString()
    availability?: string;

    @ApiPropertyOptional({ description: 'Offers outcall services', example: true })
    @IsOptional()
    @IsBoolean()
    outcall?: boolean;

    @ApiPropertyOptional({ description: 'Offers incall services', example: true })
    @IsOptional()
    @IsBoolean()
    incall?: boolean;
}

export class SearchTalentsDto {
    @ApiPropertyOptional({
        description: 'Filter by city',
        example: 'New York',
        type: String
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        description: 'Filter by services (comma-separated)',
        example: 'GFE,Dinner Date',
        type: String
    })
    @IsOptional()
    services?: string;

    @ApiPropertyOptional({
        description: 'Minimum price filter',
        example: 200,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    price_min?: number;

    @ApiPropertyOptional({
        description: 'Maximum price filter',
        example: 500,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    price_max?: number;

    @ApiPropertyOptional({
        description: 'Filter by talent status',
        enum: TalentStatus,
        example: TalentStatus.ONLINE
    })
    @IsOptional()
    @IsEnum(TalentStatus)
    status?: TalentStatus;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'created_at',
        type: String
    })
    @IsOptional()
    @IsString()
    sort?: string;

    @ApiPropertyOptional({
        description: 'Number of results to return',
        example: 20,
        default: 20,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number = 20;

    @ApiPropertyOptional({
        description: 'Pagination offset',
        example: 0,
        default: 0,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    offset?: number = 0;

    // Physical Attribute Filters
    @ApiPropertyOptional({ enum: HairColor, description: 'Filter by hair color' })
    @IsOptional()
    @IsEnum(HairColor)
    hairColor?: HairColor;

    @ApiPropertyOptional({ enum: EyeColor, description: 'Filter by eye color' })
    @IsOptional()
    @IsEnum(EyeColor)
    eyeColor?: EyeColor;

    @ApiPropertyOptional({ enum: BodyType, description: 'Filter by body type' })
    @IsOptional()
    @IsEnum(BodyType)
    bodyType?: BodyType;

    @ApiPropertyOptional({ description: 'Minimum height in cm', example: 160 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    heightMin?: number;

    @ApiPropertyOptional({ description: 'Maximum height in cm', example: 180 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    heightMax?: number;

    @ApiPropertyOptional({ enum: SkinTone, description: 'Filter by skin tone' })
    @IsOptional()
    @IsEnum(SkinTone)
    skinTone?: SkinTone;

    @ApiPropertyOptional({ enum: Ethnicity, description: 'Filter by ethnicity' })
    @IsOptional()
    @IsEnum(Ethnicity)
    ethnicity?: Ethnicity;

    @ApiPropertyOptional({ description: 'Has tattoos', example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    tattoos?: boolean;

    @ApiPropertyOptional({ description: 'Has piercings', example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    piercings?: boolean;

    // Professional Filters
    @ApiPropertyOptional({ description: 'Filter by language (e.g., English)', example: 'English' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Offers outcall services', example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    outcall?: boolean;

    @ApiPropertyOptional({ description: 'Offers incall services', example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    incall?: boolean;
}

import { IsEnum, IsUUID, IsString, IsInt, IsOptional } from 'class-validator';

export enum ProfileType {
    TALENT = 'TALENT',
    ESTABLISHMENT = 'ESTABLISHMENT',
}

export class TrackImpressionDto {
    @IsEnum(ProfileType)
    profileType: ProfileType;

    @IsUUID()
    profileId: string;

    @IsInt()
    position: number;

    @IsInt()
    @IsOptional()
    page?: number;

    @IsString()
    sessionId: string;

    @IsString()
    @IsOptional()
    searchQuery?: string;
}

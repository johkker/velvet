import { IsEnum, IsUUID, IsString, IsOptional } from 'class-validator';

export enum ProfileType {
    TALENT = 'TALENT',
    ESTABLISHMENT = 'ESTABLISHMENT',
}

export enum DeviceType {
    DESKTOP = 'desktop',
    MOBILE = 'mobile',
    TABLET = 'tablet',
}

export class TrackViewDto {
    @IsEnum(ProfileType)
    profileType: ProfileType;

    @IsUUID()
    profileId: string;

    @IsString()
    sessionId: string;

    @IsString()
    @IsOptional()
    referrer?: string;

    @IsEnum(DeviceType)
    @IsOptional()
    deviceType?: DeviceType;
}

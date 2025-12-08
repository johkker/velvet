import { IsEnum, IsUUID, IsString, IsOptional, IsObject } from 'class-validator';

export enum ProfileType {
    TALENT = 'TALENT',
    ESTABLISHMENT = 'ESTABLISHMENT',
}

export enum InteractionType {
    CONTACT_CLICK = 'CONTACT_CLICK',
    PHONE_REVEAL = 'PHONE_REVEAL',
    WHATSAPP_CLICK = 'WHATSAPP_CLICK',
    INVITE_CLICK = 'INVITE_CLICK',
    EMAIL_CLICK = 'EMAIL_CLICK',
}

export class TrackInteractionDto {
    @IsEnum(ProfileType)
    profileType: ProfileType;

    @IsUUID()
    profileId: string;

    @IsEnum(InteractionType)
    interactionType: InteractionType;

    @IsString()
    sessionId: string;

    @IsObject()
    @IsOptional()
    metadata?: any;
}

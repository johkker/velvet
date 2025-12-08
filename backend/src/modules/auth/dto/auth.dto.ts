import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class LoginDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        type: String
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters)',
        example: 'password123',
        minLength: 6,
        type: String
    })
    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterTalentDto {
    @ApiProperty({
        description: 'User email address',
        example: 'talent@example.com',
        type: String
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters)',
        example: 'securepassword123',
        minLength: 6,
        type: String
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'Public display name for the talent profile',
        example: 'Sofia Martinez',
        type: String
    })
    @IsString()
    displayName: string;

    @ApiProperty({
        description: 'City where the talent is located',
        example: 'New York',
        type: String
    })
    @IsString()
    city: string;
}

export class RegisterEstablishmentDto {
    @ApiProperty({
        description: 'Establishment email address',
        example: 'contact@establishment.com',
        type: String
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Account password (minimum 6 characters)',
        example: 'securepassword123',
        minLength: 6,
        type: String
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'Establishment business name',
        example: 'Velvet Lounge',
        type: String
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'URL-friendly slug for the establishment',
        example: 'velvet-lounge-nyc',
        type: String
    })
    @IsString()
    slug: string;

    @ApiProperty({
        description: 'Establishment address',
        example: '123 Main St, Suite 100',
        type: String
    })
    @IsString()
    address: string;

    @ApiProperty({
        description: 'City where the establishment is located',
        example: 'New York',
        type: String
    })
    @IsString()
    city: string;
}

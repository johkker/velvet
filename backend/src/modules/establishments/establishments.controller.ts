import { Controller, Post, Body, UseGuards, Request, Get, Put, Param } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

class SendInvitationDto {
    @IsString()
    @IsNotEmpty()
    talentId: string;

    @IsString()
    @IsOptional()
    message?: string;
}

class UpdateEstablishmentDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;
}

@ApiTags('Establishments')
@Controller('establishments')
export class EstablishmentsController {
    constructor(private readonly establishmentsService: EstablishmentsService) { }

    @Get()
    @ApiOperation({ summary: 'List all establishments' })
    listEstablishments() {
        return this.establishmentsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get current establishment profile' })
    getMyProfile(@Request() req) {
        return this.establishmentsService.findOne(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('me')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update current establishment profile' })
    updateProfile(@Request() req, @Body() dto: UpdateEstablishmentDto) {
        return this.establishmentsService.updateProfile(req.user.id, dto);
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get establishment profile by slug' })
    getBySlug(@Param('slug') slug: string) {
        return this.establishmentsService.findBySlug(slug);
    }

    @UseGuards(JwtAuthGuard)
    @Post('invitations/send')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Send invitation to talent' })
    sendInvitation(@Request() req, @Body() dto: SendInvitationDto) {
        return this.establishmentsService.sendInvitation(req.user.id, dto.talentId, dto.message);
    }
}

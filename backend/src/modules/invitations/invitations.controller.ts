import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    @UseGuards(JwtAuthGuard)
    @Get('incoming')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get incoming invitations (for talents)' })
    findIncoming(@Request() req) {
        return this.invitationsService.findIncoming(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('sent')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get sent invitations (for establishments)' })
    findSent(@Request() req) {
        return this.invitationsService.findSent(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('managed-talents')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get managed talents (accepted invitations for establishments)' })
    getManagedTalents(@Request() req) {
        return this.invitationsService.getManagedTalents(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('accept/:id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Accept invitation' })
    accept(@Request() req, @Param('id') id: string) {
        return this.invitationsService.accept(req.user.id, id);
    }
}

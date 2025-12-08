import { Controller, Post, Body, Req, Ip, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TrackViewDto } from './dto/track-view.dto';
import { TrackInteractionDto } from './dto/track-interaction.dto';
import { TrackImpressionDto } from './dto/track-impression.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Post('track/view')
    @ApiOperation({ summary: 'Registrar visualização de perfil' })
    async trackView(
        @Body() dto: TrackViewDto,
        @Req() req: any,
        @Ip() ip: string,
    ) {
        const userAgent = req.headers['user-agent'];
        const userId = req.user?.id;

        return this.analyticsService.trackView(dto, ip, userAgent, userId);
    }

    @Post('track/interaction')
    @ApiOperation({ summary: 'Registrar interação com perfil' })
    async trackInteraction(
        @Body() dto: TrackInteractionDto,
        @Req() req: any,
    ) {
        const userId = req.user?.id;

        return this.analyticsService.trackInteraction(dto, userId);
    }

    @Post('track/impression')
    @ApiOperation({ summary: 'Registrar impressão em busca' })
    async trackImpression(@Body() dto: TrackImpressionDto) {
        return this.analyticsService.trackImpression(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('metrics/talent/:talentId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obter métricas de um talento' })
    async getTalentMetrics(
        @Param('talentId') talentId: string,
        @Query('period') period?: string,
    ) {
        return this.analyticsService.getTalentMetrics(talentId, period);
    }

    @UseGuards(JwtAuthGuard)
    @Get('metrics/my-metrics')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obter suas próprias métricas' })
    async getMyMetrics(
        @Request() req: any,
        @Query('period') period?: string,
    ) {
        return this.analyticsService.getMyMetrics(req.user.id, period);
    }

    @UseGuards(JwtAuthGuard)
    @Get('metrics/establishment/:establishmentId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obter métricas de um estabelecimento' })
    async getEstablishmentMetrics(
        @Param('establishmentId') establishmentId: string,
        @Query('period') period?: string,
    ) {
        return this.analyticsService.getEstablishmentMetrics(establishmentId, period);
    }

    @UseGuards(JwtAuthGuard)
    @Get('metrics/establishment/:establishmentId/talents')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obter métricas dos talentos gerenciados por um estabelecimento' })
    async getManagedTalentsMetrics(
        @Param('establishmentId') establishmentId: string,
    ) {
        return this.analyticsService.getManagedTalentsMetrics(establishmentId);
    }
}

import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BoostHistoryService } from './boost-history.service';
import { BoostHistoryQueryDto } from './dto/boost-history-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Boost History')
@Controller('boost-history')
export class BoostHistoryController {
    constructor(private readonly boostHistoryService: BoostHistoryService) {}

    @UseGuards(JwtAuthGuard)
    @Get('talent')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obter histórico de boosts do talento' })
    async getTalentHistory(
        @Request() req: any,
        @Query() query: BoostHistoryQueryDto,
    ) {
        return this.boostHistoryService.getTalentHistory(req.user.id, query);
    }

    @UseGuards(JwtAuthGuard)
    @Get('establishment')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obter histórico de compras de boosts do estabelecimento' })
    async getEstablishmentHistory(
        @Request() req: any,
        @Query() query: BoostHistoryQueryDto,
    ) {
        return this.boostHistoryService.getEstablishmentHistory(req.user.id, query);
    }
}

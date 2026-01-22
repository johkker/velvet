import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BoostsService } from './boosts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

class CreateBoostDto {
    @IsString()
    @IsNotEmpty()
    boostType: string;
}

class PurchaseBoostForTalentsDto {
    @IsArray()
    @IsNotEmpty()
    talentIds: string[];

    @IsString()
    @IsNotEmpty()
    boostType: string;
}

class PurchaseEstablishmentBoostDto {
    @IsString()
    @IsNotEmpty()
    boostType: string;
}

@ApiTags('Boosts')
@Controller('boosts')
export class BoostsController {
    constructor(private readonly boostsService: BoostsService) { }

    @UseGuards(JwtAuthGuard)
    @Get('active')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get active boost for current user' })
    async getActiveBoost(@Request() req) {
        return this.boostsService.getActiveBoost(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('purchase')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Purchase a boost with Abacate Pay' })
    async purchase(@Request() req, @Body() dto: CreateBoostDto) {
        return this.boostsService.purchaseBoost(req.user.id, dto.boostType);
    }

    @UseGuards(JwtAuthGuard)
    @Post('purchase-for-talents')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Purchase boosts for multiple talents (establishments only)' })
    async purchaseForTalents(@Request() req, @Body() dto: PurchaseBoostForTalentsDto) {
        return this.boostsService.purchaseBoostForTalents(req.user.id, dto.talentIds, dto.boostType);
    }

    @UseGuards(JwtAuthGuard)
    @Post('purchase-establishment')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Purchase an establishment boost' })
    async purchaseEstablishment(@Request() req, @Body() dto: PurchaseEstablishmentBoostDto) {
        return this.boostsService.purchaseEstablishmentBoost(req.user.id, dto.boostType);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() dto: any) {
        return this.boostsService.createBoost(req.user.id, dto.durationDays, dto.paymentMethod);
    }
}

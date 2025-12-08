import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostHistoryService } from './boost-history.service';
import { BoostHistoryController } from './boost-history.controller';
import { Boost } from '../boosts/entities/boost.entity';
import { Talent } from '../talents/entities/talent.entity';
import { Establishment } from '../establishments/entities/establishment.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Boost,
            Talent,
            Establishment,
            Payment,
        ]),
    ],
    controllers: [BoostHistoryController],
    providers: [BoostHistoryService],
    exports: [BoostHistoryService],
})
export class BoostHistoryModule {}

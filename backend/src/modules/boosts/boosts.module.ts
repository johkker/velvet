import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostsService } from './boosts.service';
import { BoostsController } from './boosts.controller';
import { Boost } from './entities/boost.entity';
import { Talent } from '../talents/entities/talent.entity';
import { Establishment } from '../establishments/entities/establishment.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Boost, Talent, Establishment, Invitation, Payment]),
        forwardRef(() => PaymentsModule),
    ],
    controllers: [BoostsController],
    providers: [BoostsService],
    exports: [BoostsService],
})
export class BoostsModule { }

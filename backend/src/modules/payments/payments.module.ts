import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { AbacatePayService } from './abacate-pay.service';
import { BoostsModule } from '../boosts/boosts.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Payment]),
        forwardRef(() => BoostsModule),
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService, AbacatePayService],
    exports: [PaymentsService, AbacatePayService],
})
export class PaymentsModule { }

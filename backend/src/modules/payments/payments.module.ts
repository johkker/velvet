import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { AbacatePayService } from './abacate-pay.service';
import { BoostsModule } from '../boosts/boosts.module';
import { Talent } from '../talents/entities/talent.entity';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../emails/email.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Payment, Talent, User]),
        forwardRef(() => BoostsModule),
        EmailModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService, AbacatePayService],
    exports: [PaymentsService, AbacatePayService],
})
export class PaymentsModule { }

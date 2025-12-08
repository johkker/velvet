import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstablishmentsService } from './establishments.service';
import { EstablishmentsController } from './establishments.controller';
import { Establishment } from './entities/establishment.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Talent } from '../talents/entities/talent.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Establishment, Invitation, Talent])],
    controllers: [EstablishmentsController],
    providers: [EstablishmentsService],
    exports: [EstablishmentsService],
})
export class EstablishmentsModule { }

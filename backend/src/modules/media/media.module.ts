import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Photo } from '../photos/entities/photo.entity';
import { Talent } from '../talents/entities/talent.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Photo, Talent])],
    controllers: [MediaController],
    providers: [MediaService],
    exports: [MediaService],
})
export class MediaModule { }

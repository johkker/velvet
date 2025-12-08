import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ProfileView } from './entities/profile-view.entity';
import { ProfileInteraction } from './entities/profile-interaction.entity';
import { SearchImpression } from './entities/search-impression.entity';
import { Talent } from '../talents/entities/talent.entity';
import { Establishment } from '../establishments/entities/establishment.entity';
import { Boost } from '../boosts/entities/boost.entity';
import { Invitation } from '../invitations/entities/invitation.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProfileView,
            ProfileInteraction,
            SearchImpression,
            Talent,
            Establishment,
            Boost,
            Invitation,
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule {}

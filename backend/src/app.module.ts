import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/users/entities/user.entity';
import { Talent } from './modules/talents/entities/talent.entity';
import { Establishment } from './modules/establishments/entities/establishment.entity';
import { Photo } from './modules/photos/entities/photo.entity';
import { Invitation } from './modules/invitations/entities/invitation.entity';
import { Boost } from './modules/boosts/entities/boost.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Session } from './modules/auth/entities/session.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';
import { Location } from './modules/locations/entities/location.entity';
import { ProfileView } from './modules/analytics/entities/profile-view.entity';
import { ProfileInteraction } from './modules/analytics/entities/profile-interaction.entity';
import { SearchImpression } from './modules/analytics/entities/search-impression.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TalentsModule } from './modules/talents/talents.module';
import { EstablishmentsModule } from './modules/establishments/establishments.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { MediaModule } from './modules/media/media.module';
import { BoostsModule } from './modules/boosts/boosts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BoostHistoryModule } from './modules/boost-history/boost-history.module';
import { EmailModule } from './modules/emails/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Dynamic SSL configuration based on environment variable
        const useSSL = configService.get<string>('DATABASE_SSL', 'true').toLowerCase() === 'true';
        
        const config: any = {
          type: 'postgres',
          url: configService.get('DATABASE_URL'),
          schema: configService.get('DATABASE_SCHEMA'),
          entities: [User, Talent, Establishment, Photo, Invitation, Boost, Payment, Session, AuditLog, Location, ProfileView, ProfileInteraction, SearchImpression],
          synchronize: false, // Use migrations instead
          logging: true,
          migrationsRun: true, // Auto-run migrations on startup
          migrations: ['dist/migrations/**/*.js'],
        };

        // Add SSL config only if enabled
        if (useSSL) {
          config.ssl = process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: true }
            : { rejectUnauthorized: false };
        }

        return config;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TalentsModule,
    EstablishmentsModule,
    InvitationsModule,
    MediaModule,
    BoostsModule,
    PaymentsModule,
    LocationsModule,
    AnalyticsModule,
    BoostHistoryModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

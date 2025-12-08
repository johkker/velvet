import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ProfileView, ProfileType } from './entities/profile-view.entity';
import { ProfileInteraction, InteractionType } from './entities/profile-interaction.entity';
import { SearchImpression } from './entities/search-impression.entity';
import { Talent } from '../talents/entities/talent.entity';
import { Establishment } from '../establishments/entities/establishment.entity';
import { Boost } from '../boosts/entities/boost.entity';
import { Invitation, InvitationStatus } from '../invitations/entities/invitation.entity';
import { TrackViewDto } from './dto/track-view.dto';
import { TrackInteractionDto } from './dto/track-interaction.dto';
import { TrackImpressionDto } from './dto/track-impression.dto';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(ProfileView)
        private profileViewsRepository: Repository<ProfileView>,
        @InjectRepository(ProfileInteraction)
        private profileInteractionsRepository: Repository<ProfileInteraction>,
        @InjectRepository(SearchImpression)
        private searchImpressionsRepository: Repository<SearchImpression>,
        @InjectRepository(Talent)
        private talentsRepository: Repository<Talent>,
        @InjectRepository(Establishment)
        private establishmentsRepository: Repository<Establishment>,
        @InjectRepository(Boost)
        private boostsRepository: Repository<Boost>,
        @InjectRepository(Invitation)
        private invitationsRepository: Repository<Invitation>,
    ) {}

    async trackView(dto: TrackViewDto, ipAddress?: string, userAgent?: string, userId?: string) {
        const view = this.profileViewsRepository.create({
            profileType: dto.profileType,
            profileId: dto.profileId,
            sessionId: dto.sessionId,
            referrer: dto.referrer,
            deviceType: dto.deviceType,
            ipAddress: ipAddress,
            userAgent: userAgent,
            userId: userId,
        });

        await this.profileViewsRepository.save(view);

        const response = {
            success: true,
        };

        return response;
    }

    async trackInteraction(dto: TrackInteractionDto, userId?: string) {
        const interaction = this.profileInteractionsRepository.create({
            profileType: dto.profileType,
            profileId: dto.profileId,
            interactionType: dto.interactionType,
            sessionId: dto.sessionId,
            metadata: dto.metadata,
            userId: userId,
        });

        await this.profileInteractionsRepository.save(interaction);

        const response = {
            success: true,
        };

        return response;
    }

    async trackImpression(dto: TrackImpressionDto) {
        const impression = this.searchImpressionsRepository.create({
            profileType: dto.profileType,
            profileId: dto.profileId,
            searchQuery: dto.searchQuery,
            position: dto.position,
            page: dto.page || 1,
            sessionId: dto.sessionId,
        });

        await this.searchImpressionsRepository.save(impression);

        const response = {
            success: true,
        };

        return response;
    }

    async getTalentMetrics(talentId: string, period?: string) {
        const talent = await this.talentsRepository.findOne({
            where: { id: talentId },
            relations: ['boosts'],
        });

        if (!talent) {
            throw new NotFoundException('Talento não encontrado');
        }

        const dateRange = this.getDateRange(period);

        const viewsQuery = this.profileViewsRepository
            .createQueryBuilder('view')
            .where('view.profile_type = :profileType', { profileType: ProfileType.TALENT })
            .andWhere('view.profile_id = :profileId', { profileId: talentId });

        const interactionsQuery = this.profileInteractionsRepository
            .createQueryBuilder('interaction')
            .where('interaction.profile_type = :profileType', { profileType: ProfileType.TALENT })
            .andWhere('interaction.profile_id = :profileId', { profileId: talentId });

        if (dateRange.start && dateRange.end) {
            viewsQuery.andWhere('view.viewed_at BETWEEN :start AND :end', dateRange);
            interactionsQuery.andWhere('interaction.created_at BETWEEN :start AND :end', dateRange);
        }

        const totalViews = await viewsQuery.getCount();
        
        const uniqueViews = await viewsQuery
            .select('COUNT(DISTINCT view.session_id)', 'count')
            .getRawOne();

        const viewsByPeriod = await viewsQuery
            .select("DATE(view.viewed_at)", 'date')
            .addSelect('COUNT(*)', 'count')
            .groupBy('DATE(view.viewed_at)')
            .orderBy('DATE(view.viewed_at)', 'ASC')
            .getRawMany();

        const totalInteractions = await interactionsQuery.getCount();

        const interactionsByType = await interactionsQuery
            .select('interaction.interaction_type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('interaction.interaction_type')
            .getRawMany();

        const contactClicks = interactionsByType.find(
            i => i.type === InteractionType.CONTACT_CLICK
        )?.count || 0;

        const ctr = totalViews > 0 ? (contactClicks / totalViews) * 100 : 0;
        const engagementRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;

        const activeBoost = talent.boosts?.find(
            boost => boost.status === 'ACTIVE' &&
                boost.endAt &&
                new Date(boost.endAt) > new Date()
        );

        let boostImpact: any = null;
        if (activeBoost && activeBoost.startAt) {
            const viewsDuringBoost = await this.profileViewsRepository
                .createQueryBuilder('view')
                .where('view.profile_type = :profileType', { profileType: ProfileType.TALENT })
                .andWhere('view.profile_id = :profileId', { profileId: talentId })
                .andWhere('view.viewed_at >= :startAt', { startAt: activeBoost.startAt })
                .getCount();

            const daysBeforeBoost = 7;
            const startBeforeBoost = new Date(activeBoost.startAt);
            startBeforeBoost.setDate(startBeforeBoost.getDate() - daysBeforeBoost);

            const viewsBeforeBoost = await this.profileViewsRepository
                .createQueryBuilder('view')
                .where('view.profile_type = :profileType', { profileType: ProfileType.TALENT })
                .andWhere('view.profile_id = :profileId', { profileId: talentId })
                .andWhere('view.viewed_at BETWEEN :start AND :end', {
                    start: startBeforeBoost,
                    end: activeBoost.startAt,
                })
                .getCount();

            const avgViewsBefore = viewsBeforeBoost / daysBeforeBoost;
            const daysSinceBoost = Math.ceil(
                (new Date().getTime() - new Date(activeBoost.startAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            const avgViewsDuring = daysSinceBoost > 0 ? viewsDuringBoost / daysSinceBoost : 0;

            const viewsIncrease = avgViewsBefore > 0
                ? ((avgViewsDuring - avgViewsBefore) / avgViewsBefore) * 100
                : 0;

            boostImpact = {
                viewsIncrease: viewsIncrease > 0 ? `+${viewsIncrease.toFixed(1)}%` : `${viewsIncrease.toFixed(1)}%`,
                avgViewsBefore: avgViewsBefore.toFixed(1),
                avgViewsDuring: avgViewsDuring.toFixed(1),
            };
        }

        const impressionsCount = await this.searchImpressionsRepository
            .createQueryBuilder('impression')
            .where('impression.profile_type = :profileType', { profileType: ProfileType.TALENT })
            .andWhere('impression.profile_id = :profileId', { profileId: talentId })
            .getCount();

        const avgPosition = await this.searchImpressionsRepository
            .createQueryBuilder('impression')
            .where('impression.profile_type = :profileType', { profileType: ProfileType.TALENT })
            .andWhere('impression.profile_id = :profileId', { profileId: talentId })
            .select('AVG(impression.position)', 'avg')
            .getRawOne();

        const byTypeObj = {};
        interactionsByType.forEach(item => {
            byTypeObj[item.type] = parseInt(item.count);
        });

        const metrics = {
            profileViews: {
                total: totalViews,
                unique: parseInt(uniqueViews.count) || 0,
                byPeriod: viewsByPeriod.map(v => ({
                    date: v.date,
                    count: parseInt(v.count),
                })),
            },
            interactions: {
                total: totalInteractions,
                contactClicks: contactClicks,
                clickThroughRate: parseFloat(ctr.toFixed(2)),
                byType: byTypeObj,
            },
            searchImpressions: {
                total: impressionsCount,
                averagePosition: avgPosition?.avg ? parseFloat(avgPosition.avg).toFixed(1) : null,
            },
            performance: {
                engagementRate: parseFloat(engagementRate.toFixed(2)),
                boostImpact: boostImpact,
            },
        };

        const result = {
            data: metrics,
        };

        return result;
    }

    async getMyMetrics(userId: string, period?: string) {
        const talent = await this.talentsRepository.findOne({
            where: { user: { id: userId } },
            relations: ['boosts'],
        });

        if (!talent) {
            throw new NotFoundException('Perfil de talento não encontrado');
        }

        return this.getTalentMetrics(talent.id, period);
    }

    async getEstablishmentMetrics(establishmentId: string, period?: string) {
        const establishment = await this.establishmentsRepository.findOne({
            where: { id: establishmentId },
        });

        if (!establishment) {
            throw new NotFoundException('Estabelecimento não encontrado');
        }

        const dateRange = this.getDateRange(period);

        const viewsQuery = this.profileViewsRepository
            .createQueryBuilder('view')
            .where('view.profile_type = :profileType', { profileType: ProfileType.ESTABLISHMENT })
            .andWhere('view.profile_id = :profileId', { profileId: establishmentId });

        const interactionsQuery = this.profileInteractionsRepository
            .createQueryBuilder('interaction')
            .where('interaction.profile_type = :profileType', { profileType: ProfileType.ESTABLISHMENT })
            .andWhere('interaction.profile_id = :profileId', { profileId: establishmentId });

        if (dateRange.start && dateRange.end) {
            viewsQuery.andWhere('view.viewed_at BETWEEN :start AND :end', dateRange);
            interactionsQuery.andWhere('interaction.created_at BETWEEN :start AND :end', dateRange);
        }

        const totalViews = await viewsQuery.getCount();
        const uniqueViews = await viewsQuery
            .select('COUNT(DISTINCT view.session_id)', 'count')
            .getRawOne();

        const totalInteractions = await interactionsQuery.getCount();
        const interactionsByType = await interactionsQuery
            .select('interaction.interaction_type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('interaction.interaction_type')
            .getRawMany();

        const managedTalents = await this.invitationsRepository.find({
            where: {
                establishment: { id: establishmentId },
                status: InvitationStatus.ACCEPTED,
            },
            relations: ['talent'],
        });

        const talentIds = managedTalents.map(inv => inv.talent.id);

        let aggregatedTalentViews = 0;
        let aggregatedTalentClicks = 0;

        if (talentIds.length > 0) {
            const talentViewsQuery = this.profileViewsRepository
                .createQueryBuilder('view')
                .where('view.profile_type = :profileType', { profileType: ProfileType.TALENT })
                .andWhere('view.profile_id IN (:...talentIds)', { talentIds });

            if (dateRange.start && dateRange.end) {
                talentViewsQuery.andWhere('view.viewed_at BETWEEN :start AND :end', dateRange);
            }

            aggregatedTalentViews = await talentViewsQuery.getCount();

            const talentClicksQuery = this.profileInteractionsRepository
                .createQueryBuilder('interaction')
                .where('interaction.profile_type = :profileType', { profileType: ProfileType.TALENT })
                .andWhere('interaction.profile_id IN (:...talentIds)', { talentIds })
                .andWhere('interaction.interaction_type = :type', { type: InteractionType.CONTACT_CLICK });

            if (dateRange.start && dateRange.end) {
                talentClicksQuery.andWhere('interaction.created_at BETWEEN :start AND :end', dateRange);
            }

            aggregatedTalentClicks = await talentClicksQuery.getCount();
        }

        const byTypeObj = {};
        interactionsByType.forEach(item => {
            byTypeObj[item.type] = parseInt(item.count);
        });

        const ownMetrics = {
            profileViews: {
                total: totalViews,
                unique: parseInt(uniqueViews.count) || 0,
            },
            interactions: {
                total: totalInteractions,
                byType: byTypeObj,
            },
        };

        const managedTalentsMetrics = {
            totalTalents: managedTalents.length,
            aggregatedViews: aggregatedTalentViews,
            aggregatedClicks: aggregatedTalentClicks,
        };

        const metrics = {
            ownMetrics,
            managedTalentsMetrics,
        };

        const result = {
            data: metrics,
        };

        return result;
    }

    async getManagedTalentsMetrics(establishmentId: string) {
        const establishment = await this.establishmentsRepository.findOne({
            where: { id: establishmentId },
        });

        if (!establishment) {
            throw new NotFoundException('Estabelecimento não encontrado');
        }

        const managedTalents = await this.invitationsRepository.find({
            where: {
                establishment: { id: establishmentId },
                status: InvitationStatus.ACCEPTED,
            },
            relations: ['talent', 'talent.boosts'],
        });

        const talentsMetrics = await Promise.all(
            managedTalents.map(async (inv) => {
                const talent = inv.talent;

                const views = await this.profileViewsRepository
                    .createQueryBuilder('view')
                    .where('view.profile_type = :profileType', { profileType: ProfileType.TALENT })
                    .andWhere('view.profile_id = :profileId', { profileId: talent.id })
                    .getCount();

                const clicks = await this.profileInteractionsRepository
                    .createQueryBuilder('interaction')
                    .where('interaction.profile_type = :profileType', { profileType: ProfileType.TALENT })
                    .andWhere('interaction.profile_id = :profileId', { profileId: talent.id })
                    .andWhere('interaction.interaction_type = :type', { type: InteractionType.CONTACT_CLICK })
                    .getCount();

                const ctr = views > 0 ? (clicks / views) * 100 : 0;

                const hasActiveBoost = talent.boosts?.some(
                    boost => boost.status === 'ACTIVE' &&
                        boost.endAt &&
                        new Date(boost.endAt) > new Date()
                ) || false;

                const talentMetric = {
                    talentId: talent.id,
                    displayName: talent.displayName,
                    slug: talent.slug,
                    metrics: {
                        views,
                        clicks,
                        ctr: parseFloat(ctr.toFixed(2)),
                        hasActiveBoost,
                    },
                };

                return talentMetric;
            })
        );

        const result = {
            data: talentsMetrics,
        };

        return result;
    }

    private getDateRange(period?: string) {
        const now = new Date();
        let start: Date | null = null;
        let end: Date | null = null;

        if (!period || period === 'all') {
            return { start, end };
        }

        end = now;

        switch (period) {
            case 'day':
                start = new Date(now);
                start.setDate(start.getDate() - 1);
                break;
            case 'week':
                start = new Date(now);
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start = new Date(now);
                start.setMonth(start.getMonth() - 1);
                break;
            default:
                return { start, end };
        }

        return { start, end };
    }
}

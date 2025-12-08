import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boost } from '../boosts/entities/boost.entity';
import { Talent } from '../talents/entities/talent.entity';
import { Establishment } from '../establishments/entities/establishment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { BoostHistoryQueryDto } from './dto/boost-history-query.dto';

@Injectable()
export class BoostHistoryService {
    constructor(
        @InjectRepository(Boost)
        private boostsRepository: Repository<Boost>,
        @InjectRepository(Talent)
        private talentsRepository: Repository<Talent>,
        @InjectRepository(Establishment)
        private establishmentsRepository: Repository<Establishment>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
    ) {}

    async getTalentHistory(userId: string, query: BoostHistoryQueryDto) {
        const talent = await this.talentsRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!talent) {
            throw new NotFoundException('Perfil de talento não encontrado');
        }

        const [boosts, total] = await this.boostsRepository.findAndCount({
            where: { talent: { id: talent.id } },
            relations: ['purchasedByEstablishment', 'payments'],
            order: { createdAt: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });

        const history = await Promise.all(boosts.map(async (boost) => {
            const payment = await this.paymentsRepository.findOne({
                where: { id: boost.paymentId },
            });

            const paidBy = boost.purchasedByEstablishment ? 'ESTABLISHMENT' : 'SELF';
            
            const historyItem = {
                id: boost.id,
                boostType: this.getBoostTypeName(boost.durationDays),
                durationDays: boost.durationDays,
                startAt: boost.startAt,
                endAt: boost.endAt,
                status: boost.status,
                paidBy: paidBy,
                paidByEstablishment: boost.purchasedByEstablishment ? {
                    id: boost.purchasedByEstablishment.id,
                    name: boost.purchasedByEstablishment.name,
                } : null,
                payment: payment ? {
                    amount: parseInt(payment.amountCents) / 100,
                    paidAt: payment.createdAt,
                    status: payment.status,
                } : null,
            };

            return historyItem;
        }));

        const result = {
            data: history,
            meta: {
                total,
                limit: query.limit,
                offset: query.offset,
            },
        };

        return result;
    }

    async getEstablishmentHistory(userId: string, query: BoostHistoryQueryDto) {
        const establishment = await this.establishmentsRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!establishment) {
            throw new NotFoundException('Perfil de estabelecimento não encontrado');
        }

        const [boosts, total] = await this.boostsRepository.findAndCount({
            where: { purchasedByEstablishment: { id: establishment.id } },
            relations: ['talent', 'establishment', 'payments'],
            order: { createdAt: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });

        const history = await Promise.all(boosts.map(async (boost) => {
            const payment = await this.paymentsRepository.findOne({
                where: { id: boost.paymentId },
            });

            const type = boost.establishment ? 'SELF' : 'TALENT';
            
            const talents = boost.talent ? [{
                id: boost.talent.id,
                displayName: boost.talent.displayName,
                slug: boost.talent.slug,
            }] : [];

            const historyItem = {
                id: boost.id,
                type: type,
                boostType: this.getBoostTypeName(boost.durationDays),
                durationDays: boost.durationDays,
                startAt: boost.startAt,
                endAt: boost.endAt,
                status: boost.status,
                talents: talents,
                payment: payment ? {
                    amount: parseInt(payment.amountCents) / 100,
                    paidAt: payment.createdAt,
                    status: payment.status,
                } : null,
            };

            return historyItem;
        }));

        const totalSpent = history.reduce((sum, item) => {
            return sum + (item.payment?.amount || 0);
        }, 0);

        const result = {
            data: history,
            meta: {
                total,
                totalSpent,
                limit: query.limit,
                offset: query.offset,
            },
        };

        return result;
    }

    private getBoostTypeName(durationDays: number): string {
        const typeMap = {
            3: 'basic_3d',
            7: 'basic_7d',
            30: 'premium_30d',
        };

        return typeMap[durationDays] || `${durationDays}d`;
    }
}

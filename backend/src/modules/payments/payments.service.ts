import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { BoostsService } from '../boosts/boosts.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        @Inject(forwardRef(() => BoostsService))
        private boostsService: BoostsService,
    ) { }

    async createPayment(boostId: string, durationDays: number, method: string) {
        // Calculate amount based on duration (Mock logic)
        const amountCents = durationDays * 1000; // 10.00 BRL per day

        const payment = this.paymentsRepository.create({
            boostId,
            provider: method === 'PIX' ? 'PIX' : 'STRIPE',
            amountCents: amountCents.toString(),
            status: PaymentStatus.PENDING,
            currency: 'BRL',
        });

        return this.paymentsRepository.save(payment);
    }

    async processWebhook(payload: any) {
        // Mock webhook processing
        const { paymentId, status } = payload;

        const payment = await this.paymentsRepository.findOne({ where: { id: paymentId } });
        if (!payment) return { success: false };

        if (status === 'COMPLETED') {
            payment.status = PaymentStatus.COMPLETED;
            await this.paymentsRepository.save(payment);

            if (payment.boostId) {
                await this.boostsService.activateBoost(payment.boostId);
            }
        } else if (status === 'FAILED') {
            payment.status = PaymentStatus.FAILED;
            await this.paymentsRepository.save(payment);
        }

        return { success: true };
    }

    async findByBillingId(billingId: string): Promise<Payment | null> {
        return this.paymentsRepository.findOne({ where: { billingId } });
    }

    async findByPixId(pixId: string): Promise<Payment | null> {
        return this.paymentsRepository
            .createQueryBuilder('payment')
            .where("payment.metadata->>'pixId' = :pixId", { pixId })
            .getOne();
    }

    async updateStatus(paymentId: string, status: string): Promise<Payment> {
        const payment = await this.paymentsRepository.findOne({ 
            where: { id: paymentId } 
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        // Map Abacate status to our status
        switch (status) {
            case 'PAID':
                payment.status = PaymentStatus.COMPLETED;
                break;
            case 'CANCELLED':
            case 'REFUNDED':
                payment.status = PaymentStatus.FAILED;
                break;
            default:
                payment.status = PaymentStatus.PENDING;
        }

        return this.paymentsRepository.save(payment);
    }

    async findById(paymentId: string): Promise<Payment> {
        const payment = await this.paymentsRepository.findOne({ 
            where: { id: paymentId } 
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async getPaymentHistory(userId: string, filters?: {
        startDate?: string;
        endDate?: string;
        status?: PaymentStatus;
        limit?: number;
        offset?: number;
    }) {
        const limit = filters?.limit || 20;
        const offset = filters?.offset || 0;

        const queryBuilder = this.paymentsRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.boost', 'boost')
            .leftJoinAndSelect('boost.talent', 'talent')
            .leftJoinAndSelect('boost.purchasedByEstablishment', 'establishment')
            .where("payment.metadata->>'userId' = :userId", { userId });

        if (filters?.startDate) {
            queryBuilder.andWhere('payment.created_at >= :startDate', { 
                startDate: filters.startDate 
            });
        }

        if (filters?.endDate) {
            queryBuilder.andWhere('payment.created_at <= :endDate', { 
                endDate: filters.endDate 
            });
        }

        if (filters?.status) {
            queryBuilder.andWhere('payment.status = :status', { 
                status: filters.status 
            });
        }

        const [payments, total] = await queryBuilder
            .orderBy('payment.created_at', 'DESC')
            .take(limit)
            .skip(offset)
            .getManyAndCount();

        const totalSpent = payments
            .filter(p => p.status === PaymentStatus.COMPLETED)
            .reduce((sum, p) => sum + parseInt(p.amountCents), 0) / 100;

        const history = payments.map(payment => {
            const boost = payment.boost;
            let beneficiary = 'Seu Perfil';

            if (boost?.talent) {
                beneficiary = boost.talent.displayName;
            }

            const historyItem = {
                id: payment.id,
                amount: parseInt(payment.amountCents) / 100,
                status: payment.status,
                provider: payment.provider,
                createdAt: payment.createdAt,
                completedAt: payment.status === PaymentStatus.COMPLETED ? payment.updatedAt : null,
                boost: boost ? {
                    id: boost.id,
                    type: payment.metadata?.boostType || 'unknown',
                    duration: boost.durationDays,
                    beneficiary: beneficiary,
                } : null,
            };

            return historyItem;
        });

        const result = {
            data: history,
            meta: {
                total,
                totalSpent,
                limit,
                offset,
            },
        };

        return result;
    }
}

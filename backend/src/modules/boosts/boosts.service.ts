import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Boost, BoostStatus } from './entities/boost.entity';
import { Talent } from '../talents/entities/talent.entity';
import { Establishment } from '../establishments/entities/establishment.entity';
import { Invitation, InvitationStatus } from '../invitations/entities/invitation.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { AbacatePayService } from '../payments/abacate-pay.service';
import { ConfigService } from '@nestjs/config';

const BOOST_PRODUCTS = {
    basic_3d: {
        externalId: 'boost_basic_3d',
        name: 'Basic Boost - 3 Days',
        description: 'Featured profile for 3 days',
        price: 1990, // R$ 19.90 in centavos
        duration: 3,
    },
    basic_7d: {
        externalId: 'boost_basic_7d',
        name: 'Basic Boost - 7 Days',
        description: 'Featured profile for 7 days',
        price: 4900, // R$ 49.00
        duration: 7,
    },
    premium_7d: {
        externalId: 'boost_premium_7d',
        name: 'Premium Boost - 7 Days',
        description: 'Top position + featured for 7 days',
        price: 7900, // R$ 79.00
        duration: 7,
    },
    premium_30d: {
        externalId: 'boost_premium_30d',
        name: 'Premium Boost - 30 Days',
        description: 'Top position + featured for 30 days',
        price: 24900, // R$ 249.00
        duration: 30,
    },
};

@Injectable()
export class BoostsService {
    constructor(
        @InjectRepository(Boost)
        private boostsRepository: Repository<Boost>,
        @InjectRepository(Talent)
        private talentsRepository: Repository<Talent>,
        @InjectRepository(Establishment)
        private establishmentsRepository: Repository<Establishment>,
        @InjectRepository(Invitation)
        private invitationsRepository: Repository<Invitation>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        private abacatePayService: AbacatePayService,
        private configService: ConfigService,
    ) { }

    async purchaseBoost(userId: string, boostType: string) {
        const product = BOOST_PRODUCTS[boostType];
        if (!product) {
            throw new NotFoundException('Invalid boost type');
        }

        // Find talent
        const talent = await this.talentsRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        if (!talent) {
            throw new NotFoundException('Talent profile not found');
        }

        // Check if user already has an active boost
        const activeBoost = await this.boostsRepository.findOne({
            where: { 
                talent: { id: talent.id },
                status: BoostStatus.ACTIVE 
            },
            relations: ['talent'],
            order: { createdAt: 'DESC' }
        });

        if (activeBoost && activeBoost.endAt && new Date(activeBoost.endAt) > new Date()) {
            throw new BadRequestException(
                `You already have an active boost until ${activeBoost.endAt.toLocaleDateString('pt-BR')}. Wait for it to expire before purchasing a new one.`
            );
        }

        // Create billing on Abacate Pay
        const billing = await this.abacatePayService.createBilling({
            frequency: 'ONE_TIME',
            methods: ['PIX'],
            products: [
                {
                    externalId: product.externalId,
                    name: product.name,
                    description: `Profile boost for ${talent.displayName}`,
                    quantity: 1,
                    price: product.price,
                },
            ],
            returnUrl: `${this.configService.get('FRONTEND_URL')}/dashboard/boosts/success`,
            completionUrl: `${this.configService.get('FRONTEND_URL')}/dashboard/boosts/complete`,
            metadata: {
                talentId: talent.id,
                userId: userId,
                boostType: boostType,
            },
        });

        console.log('Abacate Pay billing response:', billing);

        // Generate PIX QR code separately
        const pixQRCode = await this.abacatePayService.createPixQRCode(
            product.price,
            `boost_${talent.id}_${Date.now()}`
        );

        console.log('PIX QR Code response:', pixQRCode);

        // Create payment record
        const payment = this.paymentsRepository.create({
            amountCents: product.price.toString(),
            currency: 'BRL',
            provider: 'ABACATE_PAY',
            status: PaymentStatus.PENDING,
            billingId: billing.id,
            pixQrCode: pixQRCode.brCode,
            pixQrCodeBase64: pixQRCode.brCodeBase64,
            paymentUrl: billing.url,
            expiresAt: pixQRCode.expiresAt ? new Date(pixQRCode.expiresAt) : null,
            metadata: {
                boostType,
                talentId: talent.id,
                pixId: pixQRCode.id,
            },
        });

        const savedPayment = await this.paymentsRepository.save(payment);

        // Create boost in pending state
        const boost = this.boostsRepository.create({
            talent: talent,
            durationDays: product.duration,
            status: BoostStatus.PENDING,
            paymentId: savedPayment.id,
        });

        await this.boostsRepository.save(boost);

        const response = {
            paymentId: savedPayment.id,
            billingId: billing.id,
            pixId: pixQRCode.id,
            amount: product.price,
            pixQrCode: pixQRCode.brCode,
            pixQrCodeBase64: pixQRCode.brCodeBase64,
            paymentUrl: billing.url,
            expiresAt: pixQRCode.expiresAt,
        };

        console.log('Response to frontend:', response);

        return response;
    }

    async getActiveBoost(userId: string) {
        const talent = await this.talentsRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!talent) {
            throw new NotFoundException('Talent profile not found');
        }

        const activeBoost = await this.boostsRepository.findOne({
            where: { 
                talent: { id: talent.id },
                status: BoostStatus.ACTIVE 
            },
            relations: ['talent'],
            order: { createdAt: 'DESC' }
        });

        // Verify the boost is not expired
        if (activeBoost && activeBoost.endAt && new Date(activeBoost.endAt) <= new Date()) {
            return {
                data: null,
                meta: {},
                error: null,
            };
        }

        return {
            data: activeBoost || null,
            meta: {},
            error: null,
        };
    }

    async activateBoostByPayment(paymentId: string) {
        const payment = await this.paymentsRepository.findOne({
            where: { id: paymentId },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const { talentId } = payment.metadata;

        // Find boost by payment
        const boost = await this.boostsRepository.findOne({
            where: { paymentId: payment.id },
            relations: ['talent'],
        });

        if (!boost) {
            throw new NotFoundException('Boost not found');
        }

        const now = new Date();
        const endAt = new Date();
        endAt.setDate(now.getDate() + boost.durationDays);

        boost.status = BoostStatus.ACTIVE;
        boost.startAt = now;
        boost.endAt = endAt;
        await this.boostsRepository.save(boost);

        // Update talent boost status
        await this.talentsRepository.update(talentId, { isBoosted: true });

        return boost;
    }

    async createBoost(userId: string, durationDays: number, paymentMethod: string) {
        const talent = await this.talentsRepository.findOne({ where: { user: { id: userId } } });
        if (!talent) {
            throw new NotFoundException('Talent profile not found');
        }

        const boost = this.boostsRepository.create({
            talent: talent,
            durationDays,
            status: BoostStatus.PENDING,
        });
        const savedBoost = await this.boostsRepository.save(boost);

        return {
            boostId: savedBoost.id,
            paymentUrl: `https://mock-payment.com/pay/${savedBoost.id}`,
        };
    }

    async activateBoost(boostId: string) {
        const boost = await this.boostsRepository.findOne({ where: { id: boostId }, relations: ['talent'] });
        if (!boost) return;

        const now = new Date();
        const endAt = new Date();
        endAt.setDate(now.getDate() + boost.durationDays);

        boost.status = BoostStatus.ACTIVE;
        boost.startAt = now;
        boost.endAt = endAt;
        await this.boostsRepository.save(boost);

        // Update talent status
        boost.talent.isBoosted = true;
        await this.talentsRepository.save(boost.talent);
    }

    async purchaseBoostForTalents(userId: string, talentIds: string[], boostType: string) {
        const product = BOOST_PRODUCTS[boostType];
        if (!product) {
            throw new NotFoundException('Invalid boost type');
        }

        const establishment = await this.establishmentsRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        if (!establishment) {
            throw new NotFoundException('Establishment profile not found');
        }

        const acceptedInvitations = await this.invitationsRepository.find({
            where: {
                establishment: { id: establishment.id },
                status: InvitationStatus.ACCEPTED,
            },
            relations: ['talent'],
        });

        const managedTalentIds = acceptedInvitations.map(inv => inv.talent.id);

        for (const talentId of talentIds) {
            if (!managedTalentIds.includes(talentId)) {
                throw new BadRequestException(`You can only boost talents who have accepted your invitation. Talent ID: ${talentId}`);
            }
        }

        const talents = await this.talentsRepository.find({
            where: { id: In(talentIds) }
        });

        for (const talent of talents) {
            const activeBoost = await this.boostsRepository.findOne({
                where: { 
                    talent: { id: talent.id },
                    status: BoostStatus.ACTIVE 
                },
                relations: ['talent'],
                order: { createdAt: 'DESC' }
            });

            if (activeBoost && activeBoost.endAt && new Date(activeBoost.endAt) > new Date()) {
                throw new BadRequestException(
                    `Talent ${talent.displayName} already has an active boost until ${activeBoost.endAt.toLocaleDateString('pt-BR')}`
                );
            }
        }

        const totalAmount = product.price * talentIds.length;

        const products = talentIds.map((talentId, index) => {
            const talent = talents.find(t => t.id === talentId);
            return {
                externalId: `${product.externalId}_${index}`,
                name: `${product.name} - ${talent?.displayName}`,
                description: `Profile boost for ${talent?.displayName}`,
                quantity: 1,
                price: product.price,
            };
        });

        const billing = await this.abacatePayService.createBilling({
            frequency: 'ONE_TIME',
            methods: ['PIX'],
            products: products,
            returnUrl: `${this.configService.get('FRONTEND_URL')}/dashboard/boosts/success`,
            completionUrl: `${this.configService.get('FRONTEND_URL')}/dashboard/boosts/complete`,
            metadata: {
                establishmentId: establishment.id,
                userId: userId,
                boostType: boostType,
                talentIds: talentIds,
            },
        });

        const pixQRCode = await this.abacatePayService.createPixQRCode(
            totalAmount,
            `boost_multi_${establishment.id}_${Date.now()}`
        );

        const payment = this.paymentsRepository.create({
            amountCents: totalAmount.toString(),
            currency: 'BRL',
            provider: 'ABACATE_PAY',
            status: PaymentStatus.PENDING,
            billingId: billing.id,
            pixQrCode: pixQRCode.brCode,
            pixQrCodeBase64: pixQRCode.brCodeBase64,
            paymentUrl: billing.url,
            expiresAt: pixQRCode.expiresAt ? new Date(pixQRCode.expiresAt) : null,
            metadata: {
                boostType,
                establishmentId: establishment.id,
                talentIds: talentIds,
                pixId: pixQRCode.id,
            },
        });

        const savedPayment = await this.paymentsRepository.save(payment);

        for (const talent of talents) {
            const boost = this.boostsRepository.create({
                talent: talent,
                purchasedByEstablishment: establishment,
                durationDays: product.duration,
                status: BoostStatus.PENDING,
                paymentId: savedPayment.id,
            });

            await this.boostsRepository.save(boost);
        }

        const response = {
            paymentId: savedPayment.id,
            billingId: billing.id,
            pixId: pixQRCode.id,
            amount: totalAmount,
            talentCount: talentIds.length,
            pixQrCode: pixQRCode.brCode,
            pixQrCodeBase64: pixQRCode.brCodeBase64,
            paymentUrl: billing.url,
            expiresAt: pixQRCode.expiresAt,
        };

        return response;
    }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { Talent } from '../talents/entities/talent.entity';
import { Establishment } from '../establishments/entities/establishment.entity';

@Injectable()
export class InvitationsService {
    constructor(
        @InjectRepository(Invitation)
        private invitationsRepository: Repository<Invitation>,
        @InjectRepository(Talent)
        private talentsRepository: Repository<Talent>,
        @InjectRepository(Establishment)
        private establishmentsRepository: Repository<Establishment>,
    ) { }

    async findIncoming(userId: string) {
        const talent = await this.talentsRepository.findOne({ where: { user: { id: userId } } });
        if (!talent) {
            throw new NotFoundException('Talent profile not found');
        }

        return this.invitationsRepository.find({
            where: { talent: { id: talent.id }, status: InvitationStatus.PENDING },
            relations: ['establishment'],
        });
    }

    async accept(userId: string, invitationId: string) {
        const talent = await this.talentsRepository.findOne({ where: { user: { id: userId } } });
        if (!talent) {
            throw new NotFoundException('Talent profile not found');
        }

        const invitation = await this.invitationsRepository.findOne({ where: { id: invitationId } });
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.talent.id !== talent.id) {
            throw new ForbiddenException('This invitation does not belong to you');
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new ForbiddenException('Invitation is not pending');
        }

        invitation.status = InvitationStatus.ACCEPTED;
        return this.invitationsRepository.save(invitation);
    }

    async findSent(userId: string) {
        const establishment = await this.establishmentsRepository.findOne({ 
            where: { user: { id: userId } } 
        });
        
        if (!establishment) {
            throw new NotFoundException('Establishment profile not found');
        }

        const invitations = await this.invitationsRepository.find({
            where: { establishment: { id: establishment.id } },
            relations: ['talent', 'talent.user', 'talent.location'],
            order: { createdAt: 'DESC' },
        });

        const result = invitations.map(inv => ({
            id: inv.id,
            status: inv.status,
            message: inv.message,
            createdAt: inv.createdAt,
            talent: {
                id: inv.talent.id,
                displayName: inv.talent.displayName,
                slug: inv.talent.slug,
                city: inv.talent.location?.name,
            },
        }));

        return result;
    }

    async getManagedTalents(userId: string) {
        const establishment = await this.establishmentsRepository.findOne({ 
            where: { user: { id: userId } } 
        });
        
        if (!establishment) {
            throw new NotFoundException('Establishment profile not found');
        }

        const acceptedInvitations = await this.invitationsRepository.find({
            where: { 
                establishment: { id: establishment.id },
                status: InvitationStatus.ACCEPTED 
            },
            relations: ['talent', 'talent.location', 'talent.boosts'],
            order: { createdAt: 'DESC' },
        });

        const managedTalents = acceptedInvitations.map(inv => {
            const activeBoost = inv.talent.boosts?.find(
                boost => boost.status === 'ACTIVE' && 
                         boost.endAt && 
                         new Date(boost.endAt) > new Date()
            );

            const talentData = {
                id: inv.talent.id,
                displayName: inv.talent.displayName,
                slug: inv.talent.slug,
                city: inv.talent.location?.name,
                isBoosted: inv.talent.isBoosted,
                activeBoost: activeBoost ? {
                    id: activeBoost.id,
                    endAt: activeBoost.endAt,
                    durationDays: activeBoost.durationDays,
                } : null,
                acceptedAt: inv.updatedAt,
            };

            return talentData;
        });

        return managedTalents;
    }
}

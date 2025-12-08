import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Establishment } from './entities/establishment.entity';
import { Invitation, InvitationStatus } from '../invitations/entities/invitation.entity';
import { Talent } from '../talents/entities/talent.entity';

@Injectable()
export class EstablishmentsService {
    constructor(
        @InjectRepository(Establishment)
        private establishmentsRepository: Repository<Establishment>,
        @InjectRepository(Invitation)
        private invitationsRepository: Repository<Invitation>,
        @InjectRepository(Talent)
        private talentsRepository: Repository<Talent>,
    ) { }

    async findAll() {
        const establishments = await this.establishmentsRepository.find({
            order: { createdAt: 'DESC' },
        });

        return {
            data: establishments.map(e => ({
                id: e.id,
                name: e.name,
                slug: e.slug,
                address: e.address,
                city: e.city,
                createdAt: e.createdAt,
            })),
        };
    }

    async findOne(userId: string) {
        const establishment = await this.establishmentsRepository.findOne({ 
            where: { user: { id: userId } },
            relations: ['user']
        });
        
        if (!establishment) {
            throw new NotFoundException('Establishment profile not found');
        }

        return {
            id: establishment.id,
            name: establishment.name,
            slug: establishment.slug,
            address: establishment.address,
            city: establishment.city,
            createdAt: establishment.createdAt,
        };
    }

    async findBySlug(slug: string) {
        const establishment = await this.establishmentsRepository.findOne({ 
            where: { slug },
        });
        
        if (!establishment) {
            throw new NotFoundException('Establishment not found');
        }

        return {
            id: establishment.id,
            name: establishment.name,
            slug: establishment.slug,
            address: establishment.address,
            city: establishment.city,
            createdAt: establishment.createdAt,
        };
    }

    async updateProfile(userId: string, updateData: Partial<{ name: string; address: string; city: string }>) {
        const establishment = await this.establishmentsRepository.findOne({ 
            where: { user: { id: userId } } 
        });
        
        if (!establishment) {
            throw new NotFoundException('Establishment profile not found');
        }

        Object.assign(establishment, updateData);
        await this.establishmentsRepository.save(establishment);

        return {
            id: establishment.id,
            name: establishment.name,
            slug: establishment.slug,
            address: establishment.address,
            city: establishment.city,
            createdAt: establishment.createdAt,
        };
    }

    async sendInvitation(establishmentUserId: string, talentId: string, message?: string) {
        const establishment = await this.establishmentsRepository.findOne({ where: { user: { id: establishmentUserId } } });
        if (!establishment) {
            throw new NotFoundException('Establishment profile not found');
        }

        const talent = await this.talentsRepository.findOne({ where: { id: talentId } });
        if (!talent) {
            throw new NotFoundException('Talent not found');
        }

        const existingInvitation = await this.invitationsRepository.findOne({
            where: {
                establishment: { id: establishment.id },
                talent: { id: talent.id },
                status: InvitationStatus.PENDING,
            },
        });

        if (existingInvitation) {
            throw new BadRequestException('Invitation already pending');
        }

        const invitation = this.invitationsRepository.create({
            establishment: establishment,
            talent: talent,
            message,
        });

        return this.invitationsRepository.save(invitation);
    }
}

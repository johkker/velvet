import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Talent, TalentStatus } from './entities/talent.entity';
import { SearchTalentsDto, UpdateTalentDto, TalentCardDto, TalentProfileDto } from './dto/talent.dto';

@Injectable()
export class TalentsService {
    constructor(
        @InjectRepository(Talent)
        private talentsRepository: Repository<Talent>,
    ) { }

    async findAll(searchDto: SearchTalentsDto) {
        const {
            city,
            services,
            price_min,
            price_max,
            status,
            sort,
            limit = 20,
            offset = 0,
        } = searchDto;

        const queryBuilder = this.talentsRepository.createQueryBuilder('talent');

        // Always join photos and location
        queryBuilder.leftJoinAndSelect('talent.photos', 'photo');
        queryBuilder.leftJoinAndSelect('talent.location', 'location');

        if (city) {
            queryBuilder.andWhere('location.name ILIKE :city', { city: `%${city}%` });
        }

        if (services) {
            // Assuming services is a comma-separated string in query param
            const serviceList = services.split(',');
            // Postgres array overlap operator &&
            queryBuilder.andWhere('talent.services && :services', { services: serviceList });
        }

        if (price_min) {
            queryBuilder.andWhere('talent.priceMin >= :priceMin', { priceMin: price_min });
        }

        if (price_max) {
            queryBuilder.andWhere('talent.priceMin <= :priceMax', { priceMax: price_max });
        }

        if (status) {
            queryBuilder.andWhere('talent.status = :status', { status });
        } else {
            // Default to showing only ONLINE or recently active if not specified? 
            // For now, let's show all public profiles or just ONLINE?
            // Spec says "Listagem principal", usually implies active/online.
            // Let's default to not filtering by status if not provided, or maybe just ONLINE?
            // Let's stick to explicit filter for now.
        }

        if (sort === 'boosted') {
            queryBuilder.orderBy('talent.isBoosted', 'DESC');
            queryBuilder.addOrderBy('talent.updatedAt', 'DESC');
        } else {
            queryBuilder.orderBy('talent.updatedAt', 'DESC');
        }

        queryBuilder.take(limit);
        queryBuilder.skip(offset);

        const [talents, total] = await queryBuilder.getManyAndCount();

        const data = talents.map(talent => this.mapToCardDto(talent));

        return {
            data,
            meta: {
                total,
                limit,
                offset,
            },
        };
    }

    async findFeatured() {
        const talents = await this.talentsRepository.find({
            where: { isBoosted: true, status: TalentStatus.ONLINE },
            relations: ['photos', 'location'],
            take: 10,
            order: { updatedAt: 'DESC' },
        });
        const data = talents.map(t => this.mapToCardDto(t));
        return { data, meta: {} };
    }

    // Smart search with featured/regular separation
    async smartSearch(searchDto: SearchTalentsDto) {
        const userCity = searchDto.city;
        
        // Step 1: Get featured talents
        const featuredQuery = this.talentsRepository.createQueryBuilder('talent')
            .leftJoinAndSelect('talent.photos', 'photo')
            .leftJoinAndSelect('talent.location', 'location')
            .where('talent.isBoosted = :boosted', { boosted: true })
            .andWhere('talent.status = :status', { status: TalentStatus.ONLINE });

        if (userCity) {
            featuredQuery.andWhere('location.name ILIKE :city', { city: `%${userCity}%` });
        }

        this.applyFilters(featuredQuery, searchDto);
        featuredQuery.orderBy('talent.updatedAt', 'DESC').take(10);

        const featuredTalents = await featuredQuery.getMany();
        const featuredIds = featuredTalents.map(t => t.id);

        // Step 2: Get regular talents (excluding featured)
        const regularQuery = this.talentsRepository.createQueryBuilder('talent')
            .leftJoinAndSelect('talent.photos', 'photo')
            .leftJoinAndSelect('talent.location', 'location')
            .where('talent.status = :status', { status: TalentStatus.ONLINE });

        if (featuredIds.length > 0) {
            regularQuery.andWhere('talent.id NOT IN (:...excludedIds)', { excludedIds: featuredIds });
        }

        if (userCity) {
            regularQuery.andWhere('location.name ILIKE :city', { city: `%${userCity}%` });
        }

        this.applyFilters(regularQuery, searchDto);
        regularQuery.orderBy('talent.updatedAt', 'DESC')
            .take(searchDto.limit || 20)
            .skip(searchDto.offset || 0);

        const [regularTalents, totalRegular] = await regularQuery.getManyAndCount();

        return {
            featured: featuredTalents.map(t => this.mapToCardDto(t)),
            regular: regularTalents.map(t => this.mapToCardDto(t)),
            meta: {
                city: userCity,
                totalFeatured: featuredTalents.length,
                totalRegular: totalRegular,
            },
        };
    }

    // Helper method to apply filters
    private applyFilters(qb: any, dto: SearchTalentsDto) {
        if (dto.services) {
            const serviceList = dto.services.split(',').map(s => s.trim());
            qb.andWhere('talent.services && :services', { services: serviceList });
        }
        if (dto.price_min) qb.andWhere('talent.priceMin >= :priceMin', { priceMin: dto.price_min });
        if (dto.price_max) qb.andWhere('talent.priceMin <= :priceMax', { priceMax: dto.price_max });
        if (dto.hairColor) qb.andWhere('talent.hairColor = :hairColor', { hairColor: dto.hairColor });
        if (dto.eyeColor) qb.andWhere('talent.eyeColor = :eyeColor', { eyeColor: dto.eyeColor });
        if (dto.bodyType) qb.andWhere('talent.bodyType = :bodyType', { bodyType: dto.bodyType });
        if (dto.heightMin) qb.andWhere('talent.height >= :heightMin', { heightMin: dto.heightMin });
        if (dto.heightMax) qb.andWhere('talent.height <= :heightMax', { heightMax: dto.heightMax });
        if (dto.skinTone) qb.andWhere('talent.skinTone = :skinTone', { skinTone: dto.skinTone });
        if (dto.ethnicity) qb.andWhere('talent.ethnicity = :ethnicity', { ethnicity: dto.ethnicity });
        if (dto.tattoos !== undefined) qb.andWhere('talent.tattoos = :tattoos', { tattoos: dto.tattoos });
        if (dto.piercings !== undefined) qb.andWhere('talent.piercings = :piercings', { piercings: dto.piercings });
        if (dto.language) qb.andWhere(':language = ANY(talent.languages)', { language: dto.language });
        if (dto.outcall !== undefined) qb.andWhere('talent.outcall = :outcall', { outcall: dto.outcall });
        if (dto.incall !== undefined) qb.andWhere('talent.incall = :incall', { incall: dto.incall });
    }

    async findOne(slug: string) {
        const talent = await this.talentsRepository.findOne({
            where: { slug },
            relations: ['photos', 'location'],
        });

        if (!talent) {
            throw new NotFoundException('Talent not found');
        }

        const data = this.mapToProfileDto(talent);
        return { data, meta: {} };
    }

    async update(userId: string, updateTalentDto: UpdateTalentDto) {
        const talent = await this.talentsRepository.findOne({ where: { user: { id: userId } } });
        if (!talent) {
            throw new NotFoundException('Talent profile not found');
        }

        Object.assign(talent, updateTalentDto);
        return this.talentsRepository.save(talent);
    }

    private mapToCardDto(talent: Talent): TalentCardDto {
        const mainPhoto = talent.photos?.find(p => p.isMain) || talent.photos?.[0];
        return {
            id: talent.id,
            slug: talent.slug,
            displayName: talent.displayName,
            city: talent.location?.name,
            photoMain: mainPhoto ? mainPhoto.url : undefined,
            isBoosted: talent.isBoosted,
            isOnline: talent.status === TalentStatus.ONLINE,
        };
    }

    private mapToProfileDto(talent: Talent): TalentProfileDto {
        const card = this.mapToCardDto(talent);
        return {
            ...card,
            bio: talent.bio,
            age: talent.age,
            services: talent.services,
            priceMin: talent.priceMin,
            isVerified: talent.isVerified,
            photoGallery: talent.photos?.map(p => ({
                url: p.url,
                isMain: p.isMain,
                blurUrl: p.blurUrl,
            })) || [],
            tags: [],
            contactLink: `https://wa.me/55...`,
            // Physical attributes
            hairColor: talent.hairColor,
            eyeColor: talent.eyeColor,
            bodyType: talent.bodyType,
            height: talent.height,
            skinTone: talent.skinTone,
            ethnicity: talent.ethnicity,
            measurements: talent.measurements,
            weight: talent.weight,
            tattoos: talent.tattoos,
            piercings: talent.piercings,
            // Professional fields
            languages: talent.languages,
            availability: talent.availability,
            outcall: talent.outcall,
            incall: talent.incall,
        };
    }
}

import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Talent } from '../talents/entities/talent.entity';
import { Establishment } from '../establishments/entities/establishment.entity';
import { Location, LocationType } from '../locations/entities/location.entity';
import { EmailService } from '../emails/email.service';
import { LoginDto, RegisterTalentDto, RegisterEstablishmentDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Talent)
        private talentsRepository: Repository<Talent>,
        @InjectRepository(Establishment)
        private establishmentsRepository: Repository<Establishment>,
        @InjectRepository(Location)
        private locationsRepository: Repository<Location>,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
            role: user.role,
        };
    }

    async registerTalent(registerDto: RegisterTalentDto) {
        const existingUser = await this.usersRepository.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, 10);

        // Transactional creation
        const user = this.usersRepository.create({
            email: registerDto.email,
            passwordHash,
            role: UserRole.TALENT,
        });
        const savedUser = await this.usersRepository.save(user);

        // Find location by city name (temporary solution until we update the DTO)
        const location = await this.locationsRepository.findOne({
            where: { name: registerDto.city, type: LocationType.CITY }
        });

        const talent = this.talentsRepository.create({
            user: savedUser,
            displayName: registerDto.displayName,
            location: location || undefined,
            slug: this.generateSlug(registerDto.displayName), // Simple slug generation
        });
        await this.talentsRepository.save(talent);

        // Send welcome email
        try {
            await this.emailService.sendWelcomeEmail(
                registerDto.email,
                registerDto.displayName,
                'TALENT'
            );
        } catch (error) {
            this.logger.warn(`Failed to send welcome email to ${registerDto.email}:`, error);
        }

        return this.login({ email: registerDto.email, password: registerDto.password });
    }

    async registerEstablishment(registerDto: RegisterEstablishmentDto) {
        const existingUser = await this.usersRepository.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, 10);

        const user = this.usersRepository.create({
            email: registerDto.email,
            passwordHash,
            role: UserRole.ESTABLISHMENT,
        });
        const savedUser = await this.usersRepository.save(user);

        const establishment = this.establishmentsRepository.create({
            user: savedUser,
            name: registerDto.name,
            slug: registerDto.slug || this.generateSlug(registerDto.name),
            address: registerDto.address,
            city: registerDto.city,
        });
        await this.establishmentsRepository.save(establishment);

        // Send welcome email
        try {
            await this.emailService.sendWelcomeEmail(
                registerDto.email,
                registerDto.name,
                'ESTABLISHMENT'
            );
        } catch (error) {
            this.logger.warn(`Failed to send welcome email to ${registerDto.email}:`, error);
        }

        return this.login({ email: registerDto.email, password: registerDto.password });
    }

    private generateSlug(name: string): string {
        return name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substr(2, 5);
    }
}

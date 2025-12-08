import { DataSource } from 'typeorm';
import { User, UserRole } from './modules/users/entities/user.entity';
import { Talent, TalentStatus, HairColor, EyeColor, BodyType, SkinTone, Ethnicity } from './modules/talents/entities/talent.entity';
import { Establishment } from './modules/establishments/entities/establishment.entity';
import { Photo, PhotoStatus } from './modules/photos/entities/photo.entity';
import { Invitation, InvitationStatus } from './modules/invitations/entities/invitation.entity';
import { Boost, BoostStatus } from './modules/boosts/entities/boost.entity';
import { Payment, PaymentStatus } from './modules/payments/entities/payment.entity';
import { Session } from './modules/auth/entities/session.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';
import { Location, LocationType } from './modules/locations/entities/location.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { sslConfig } from './app.module';

dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    ...sslConfig,
    url: process.env.DATABASE_URL,
    schema: process.env.DATABASE_SCHEMA,
    entities: [User, Talent, Establishment, Photo, Invitation, Boost, Payment, Session, AuditLog, Location],
    synchronize: true,
    logging: true,
});

// Sample photo URLs from Unsplash
const photoUrls = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557296387-5358ad7997bb?q=80&w=1000&auto=format&fit=crop',
];

// Location data structure
const locationData = {
    'Brazil': {
        code: 'BR',
        states: {
            'São Paulo': { code: 'SP', cities: ['São Paulo', 'Campinas', 'Santos'] },
            'Rio de Janeiro': { code: 'RJ', cities: ['Rio de Janeiro', 'Niterói'] },
            'Bahia': { code: 'BA', cities: ['Salvador'] },
            'Ceará': { code: 'CE', cities: ['Fortaleza'] },
            'Minas Gerais': { code: 'MG', cities: ['Belo Horizonte'] },
            'Paraná': { code: 'PR', cities: ['Curitiba'] },
            'Pernambuco': { code: 'PE', cities: ['Recife'] },
            'Rio Grande do Sul': { code: 'RS', cities: ['Porto Alegre'] },
            'Amazonas': { code: 'AM', cities: ['Manaus'] },
        }
    },
    'United States': {
        code: 'US',
        states: {
            'New York': { code: 'NY', cities: ['New York', 'Buffalo'] },
            'California': { code: 'CA', cities: ['Los Angeles', 'San Francisco'] },
            'Florida': { code: 'FL', cities: ['Miami', 'Orlando'] },
            'Nevada': { code: 'NV', cities: ['Las Vegas'] },
            'Illinois': { code: 'IL', cities: ['Chicago'] },
        }
    }
};

const services = [
    'GFE', 'Massagem', 'Jantar', 'Eventos', 'Viagem', 'Festas',
    'Acompanhante Executiva', 'Fotografia', 'Terapia Tântrica'
];

const firstNames = [
    'Sofia', 'Isabella', 'Valentina', 'Camila', 'Mariana', 'Gabriela', 'Beatriz', 'Amanda',
    'Julia', 'Carolina', 'Larissa', 'Fernanda', 'Natalia', 'Patricia', 'Alice', 'Luna',
    'Aurora', 'Stella', 'Victoria', 'Scarlett', 'Maya', 'Elena', 'Aria', 'Zoe',
    'Lucas', 'Gabriel', 'Rafael', 'Miguel', 'Daniel', 'André', 'Felipe', 'Bruno'
];

const lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Ferreira', 'Rodrigues', 'Almeida',
    'Nascimento', 'Lima', 'Araújo', 'Fernandes', 'Carvalho', 'Gomes', 'Martins', 'Rocha',
    'Ribeiro', 'Alves', 'Pereira', 'Monteiro', 'Mendes', 'Barbosa', 'Pinto', 'Moreira'
];

const bios = [
    'Experiente em eventos corporativos de alto nível.',
    'Acompanhante sofisticada, ideal para jantares e eventos sociais.',
    'Educada, carismática e versátil.',
    'Especialista em proporcionar momentos inesquecíveis.',
    'Discreta, elegante e atenciosa.',
    'Sempre pronta para viagens e novas experiências.',
    'Focada em proporcionar bem-estar e relaxamento.',
    'Parceira ideal para eventos sociais e corporativos.',
    'Carinhosa, inteligente e de ótima conversa.',
    'Aventureira e divertida, perfeita para festas.',
    'Profissional experiente em diversos tipos de eventos.',
    'Especializada em criar conexões autênticas.',
];

const establishmentNames = [
    'Velvet Lounge', 'Diamond Club', 'Elite Social', 'Luxe Entertainment',
    'Crystal Palace', 'Golden Circle', 'Platinum Events', 'Royal Companions',
    'Sapphire Society', 'Prestige House', 'Imperial Suite', 'Noble Affairs'
];

function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function seed() {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    const userRepository = AppDataSource.getRepository(User);
    const talentRepository = AppDataSource.getRepository(Talent);
    const establishmentRepository = AppDataSource.getRepository(Establishment);
    const photoRepository = AppDataSource.getRepository(Photo);
    const invitationRepository = AppDataSource.getRepository(Invitation);
    const boostRepository = AppDataSource.getRepository(Boost);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const locationRepository = AppDataSource.getRepository(Location);

    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Creating admin user...');
    let adminUser = await userRepository.findOne({ where: { email: 'admin@velvet.com' } });
    if (!adminUser) {
        adminUser = userRepository.create({
            email: 'admin@velvet.com',
            passwordHash,
            role: UserRole.ADMIN,
        });
        await userRepository.save(adminUser);
        console.log('✓ Admin user created');
    }

    // --- Create Location Hierarchy ---
    console.log('\nCreating location hierarchy...');
    const cityLocations: Location[] = [];
    
    for (const [countryName, countryData] of Object.entries(locationData)) {
        // Create or find country
        let country = await locationRepository.findOne({ 
            where: { name: countryName, type: LocationType.COUNTRY } 
        });
        
        if (!country) {
            country = locationRepository.create({
                name: countryName,
                type: LocationType.COUNTRY,
                code: countryData.code,
                isActive: true,
            });
            await locationRepository.save(country);
            console.log(`  ✓ Created country: ${countryName}`);
        }

        // Create states
        for (const [stateName, stateData] of Object.entries(countryData.states)) {
            let state = await locationRepository.findOne({
                where: { name: stateName, type: LocationType.STATE, parent: { id: country.id } }
            });

            if (!state) {
                state = locationRepository.create({
                    name: stateName,
                    type: LocationType.STATE,
                    code: stateData.code,
                    parent: country,
                    isActive: true,
                });
                await locationRepository.save(state);
            }

            // Create cities
            for (const cityName of stateData.cities) {
                let city = await locationRepository.findOne({
                    where: { name: cityName, type: LocationType.CITY, parent: { id: state.id } }
                });

                if (!city) {
                    city = locationRepository.create({
                        name: cityName,
                        type: LocationType.CITY,
                        parent: state,
                        isActive: true,
                        isMetropolitan: ['São Paulo', 'Rio de Janeiro', 'New York', 'Los Angeles', 'Miami', 'Chicago'].includes(cityName),
                    });
                    await locationRepository.save(city);
                }
                cityLocations.push(city);
            }
        }
    }
    console.log(`✓ Created location hierarchy with ${cityLocations.length} cities`);

    // --- Create 50 Talents ---
    console.log('\nCreating 50 talents...');
    const createdTalents: Talent[] = [];

    for (let i = 0; i < 50; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        const displayName = `${firstName} ${lastName}`;
        const email = `talent${i + 1}@velvet.com`;

        let user = await userRepository.findOne({ where: { email } });
        if (!user) {
            user = userRepository.create({
                email,
                passwordHash,
                role: UserRole.TALENT,
            });
            await userRepository.save(user);

            const talent = talentRepository.create({
                user: user,
                displayName: displayName,
                slug: generateSlug(displayName) + `-${i + 1}`,
                location: randomElement(cityLocations),
                services: randomElements(services, 2, 5),
                priceMin: [150, 200, 250, 300, 350, 400, 450, 500, 600, 800][Math.floor(Math.random() * 10)],
                bio: randomElement(bios),
                age: 20 + Math.floor(Math.random() * 15),
                status: Math.random() > 0.3 ? TalentStatus.ONLINE : TalentStatus.OFFLINE,
                isVerified: Math.random() > 0.2,
                isBoosted: Math.random() > 0.7,
                hairColor: randomElement([HairColor.BLONDE, HairColor.BRUNETTE, HairColor.RED, HairColor.BLACK, HairColor.GRAY, HairColor.OTHER]) as any,
                eyeColor: randomElement([EyeColor.BLUE, EyeColor.BROWN, EyeColor.GREEN, EyeColor.HAZEL, EyeColor.GRAY, EyeColor.OTHER]) as any,
                bodyType: randomElement([BodyType.SLIM, BodyType.ATHLETIC, BodyType.CURVY, BodyType.AVERAGE, BodyType.PLUS_SIZE]) as any,
                height: 155 + Math.floor(Math.random() * 30),
                skinTone: randomElement([SkinTone.FAIR, SkinTone.MEDIUM, SkinTone.OLIVE, SkinTone.TAN, SkinTone.DARK]) as any,
                ethnicity: randomElement([Ethnicity.WHITE, Ethnicity.BLACK, Ethnicity.ASIAN, Ethnicity.LATINA, Ethnicity.MIXED, Ethnicity.OTHER]) as any,
                measurements: `${32 + Math.floor(Math.random() * 6)}-${24 + Math.floor(Math.random() * 6)}-${34 + Math.floor(Math.random() * 8)}`,
                weight: 50 + Math.floor(Math.random() * 25),
                tattoos: Math.random() > 0.5,
                piercings: Math.random() > 0.6,
                languages: randomElements(['English', 'Portuguese', 'Spanish', 'French', 'Italian', 'German'], 1, 3),
                availability: randomElement(['24/7', 'Weekdays', 'Weekends', 'Evenings', 'By Appointment']),
                outcall: Math.random() > 0.3,
                incall: Math.random() > 0.4,
            });
            await talentRepository.save(talent);
            createdTalents.push(talent);

            // Create 2-5 photos per talent
            const photoCount = 2 + Math.floor(Math.random() * 4);
            for (let p = 0; p < photoCount; p++) {
                const photo = photoRepository.create({
                    talent: talent,
                    url: randomElement(photoUrls),
                    blurUrl: randomElement(photoUrls) + '&blur=20',
                    isMain: p === 0,
                    status: Math.random() > 0.1 ? PhotoStatus.READY : PhotoStatus.PROCESSING,
                    width: 1000,
                    height: 1000,
                });
                await photoRepository.save(photo);
            }

            if ((i + 1) % 10 === 0) {
                console.log(`  ✓ Created ${i + 1} talents...`);
            }
        }
    }
    console.log(`✓ Total talents created: ${createdTalents.length}`);

    // --- Create 12 Establishments ---
    console.log('\nCreating 12 establishments...');
    const createdEstablishments: Establishment[] = [];

    for (let i = 0; i < 12; i++) {
        const name = establishmentNames[i] || `Establishment ${i + 1}`;
        const email = `establishment${i + 1}@velvet.com`;

        let user = await userRepository.findOne({ where: { email } });
        if (!user) {
            user = userRepository.create({
                email,
                passwordHash,
                role: UserRole.ESTABLISHMENT,
            });
            await userRepository.save(user);

            const establishment = establishmentRepository.create({
                user,
                name,
                slug: generateSlug(name) + `-${i + 1}`,
                address: `${100 + i} Luxury Avenue, Suite ${i + 1}00`,
                city: randomElement(cityLocations).name,
            });
            await establishmentRepository.save(establishment);
            createdEstablishments.push(establishment);
            console.log(`  ✓ Created: ${name}`);
        }
    }
    console.log(`✓ Total establishments created: ${createdEstablishments.length}`);

    // --- Create 30 Invitations ---
    console.log('\nCreating 30 invitations...');
    if (createdTalents.length > 0 && createdEstablishments.length > 0) {
        for (let i = 0; i < 30; i++) {
            const establishment = randomElement(createdEstablishments);
            const talent = randomElement(createdTalents);

            const existingInvitation = await invitationRepository.findOne({
                where: {
                    establishment,
                    talent,
                }
            });

            if (!existingInvitation) {
                const statuses = [
                    InvitationStatus.PENDING,
                    InvitationStatus.PENDING,
                    InvitationStatus.PENDING,
                    InvitationStatus.ACCEPTED,
                    InvitationStatus.REJECTED,
                ];

                const invitation = invitationRepository.create({
                    establishment,
                    talent,
                    message: `Convite da ${establishment.name} para fazer parte de nosso time exclusivo.`,
                    status: randomElement(statuses),
                });
                await invitationRepository.save(invitation);
            }
        }
        console.log('✓ 30 invitations created');
    }

    // --- Create 25 Boosts with Payments ---
    console.log('\nCreating 25 boosts with payments...');
    if (createdTalents.length > 0) {
        for (let i = 0; i < 25; i++) {
            const talent = randomElement(createdTalents);
            const durationDays = [1, 3, 7, 15, 30][Math.floor(Math.random() * 5)];
            const now = new Date();
            const startAt = new Date(now.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000);
            const endAt = new Date(startAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

            const statuses = [
                BoostStatus.ACTIVE,
                BoostStatus.ACTIVE,
                BoostStatus.ACTIVE,
                BoostStatus.EXPIRED,
                BoostStatus.PENDING,
            ];
            const boostStatus = randomElement(statuses);

            const boost = new Boost();
            boost.talent = talent;
            boost.startAt = boostStatus !== BoostStatus.PENDING ? startAt : null;
            boost.endAt = boostStatus !== BoostStatus.PENDING ? endAt : null;
            boost.durationDays = durationDays;
            boost.status = boostStatus;
            await boostRepository.save(boost);

            // Create payment for boost
            const amountCents = durationDays * 5000; // R$ 50/day
            const payment = paymentRepository.create({
                boost: boost,
                provider: randomElement(['PIX', 'STRIPE', 'MERCADOPAGO']),
                providerPaymentId: `pay_${Math.random().toString(36).substring(7)}`,
                amountCents: amountCents.toString(),
                currency: 'BRL',
                status: boostStatus === BoostStatus.PENDING ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
                metadata: {
                    duration_days: durationDays,
                    boost_type: 'premium'
                },
            });
            await paymentRepository.save(payment);

            boost.paymentId = payment.id;
            await boostRepository.save(boost);
        }
        console.log('✓ 25 boosts with payments created');
    }

    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`
Summary:
  - 1 Admin user
  - ${createdTalents.length} Talents (with 2-5 photos each)
  - ${createdEstablishments.length} Establishments
  - 30 Invitations (mixed statuses)
  - 25 Boosts with Payments
  
Test Credentials:
  - Admin: admin@velvet.com / password123
  - Talent: talent1@velvet.com to talent50@velvet.com / password123
  - Establishment: establishment1@velvet.com to establishment12@velvet.com / password123
`);

    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});

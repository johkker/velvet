import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo, PhotoStatus } from '../photos/entities/photo.entity';
import { Talent } from '../talents/entities/talent.entity';

@Injectable()
export class MediaService {
    constructor(
        @InjectRepository(Photo)
        private photosRepository: Repository<Photo>,
        @InjectRepository(Talent)
        private talentsRepository: Repository<Talent>,
    ) { }

    async uploadPhoto(userId: string, file: any) {
        // In a real app, upload to S3 here.
        // For now, we'll just mock the URL.
        const mockUrl = `https://mock-s3.com/${file.originalname}`;

        const talent = await this.talentsRepository.findOne({ where: { user: { id: userId } } });
        if (!talent) {
            throw new Error('Talent not found');
        }

        const photo = this.photosRepository.create({
            talent: talent,
            url: mockUrl,
            status: PhotoStatus.PROCESSING,
            isMain: false, // Default to false, user can set later
        });

        const savedPhoto = await this.photosRepository.save(photo);

        // Simulate async processing (worker)
        this.simulateProcessing(savedPhoto.id);

        return savedPhoto;
    }

    private async simulateProcessing(photoId: string) {
        // Mock worker delay
        setTimeout(async () => {
            const photo = await this.photosRepository.findOne({ where: { id: photoId } });
            if (photo) {
                photo.status = PhotoStatus.READY;
                photo.blurUrl = 'data:image/jpeg;base64,...'; // Mock blurhash
                await this.photosRepository.save(photo);
            }
        }, 5000);
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location, LocationType } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  async getCountries() {
    return this.locationsRepository.find({
      where: { type: LocationType.COUNTRY, isActive: true },
      order: { name: 'ASC' }
    });
  }

  async getStates(countryId: string) {
    return this.locationsRepository.find({
      where: { 
        parent: { id: countryId }, 
        type: LocationType.STATE,
        isActive: true 
      },
      order: { name: 'ASC' }
    });
  }

  async getCities(stateId: string) {
    return this.locationsRepository.find({
      where: { 
        parent: { id: stateId }, 
        type: LocationType.CITY,
        isActive: true 
      },
      order: { name: 'ASC' }
    });
  }

  async getRegions(cityId: string) {
    return this.locationsRepository.find({
      where: { 
        parent: { id: cityId }, 
        type: LocationType.REGION,
        isActive: true 
      },
      order: { name: 'ASC' }
    });
  }

  async getLocationWithParents(locationId: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({
      where: { id: locationId },
      relations: ['parent', 'parent.parent', 'parent.parent.parent']
    });
    if (!location) {
      throw new Error(`Location with ID ${locationId} not found`);
    }
    return location;
  }

  async getMetropolitanCities() {
    return this.locationsRepository.find({
      where: { 
        type: LocationType.CITY,
        isMetropolitan: true,
        isActive: true 
      },
      relations: ['parent'],
      order: { name: 'ASC' }
    });
  }

  async findByNameAndType(name: string, type: LocationType, parentId?: string): Promise<Location> {
    const where: any = { name, type };
    if (parentId) {
      where.parent = { id: parentId };
    }
    const location = await this.locationsRepository.findOne({ where });
    if (!location) {
      throw new Error(`Location with name ${name} and type ${type} not found`);
    }
    return location;
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({ status: 200, description: 'List of countries' })
  getCountries() {
    return this.locationsService.getCountries();
  }

  @Get('states')
  @ApiOperation({ summary: 'Get states by country' })
  @ApiQuery({ name: 'countryId', required: true })
  getStates(@Query('countryId') countryId: string) {
    return this.locationsService.getStates(countryId);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get cities by state' })
  @ApiQuery({ name: 'stateId', required: true })
  getCities(@Query('stateId') stateId: string) {
    return this.locationsService.getCities(stateId);
  }

  @Get('regions')
  @ApiOperation({ summary: 'Get regions by city' })
  @ApiQuery({ name: 'cityId', required: true })
  getRegions(@Query('cityId') cityId: string) {
    return this.locationsService.getRegions(cityId);
  }

  @Get('metropolitan')
  @ApiOperation({ summary: 'Get metropolitan cities' })
  getMetropolitanCities() {
    return this.locationsService.getMetropolitanCities();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id' })
  getLocation(@Param('id') id: string) {
    return this.locationsService.getLocationWithParents(id);
  }
}

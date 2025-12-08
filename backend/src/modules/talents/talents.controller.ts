import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TalentsService } from './talents.service';
import { SearchTalentsDto, UpdateTalentDto } from './dto/talent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Talents')
@Controller('talents')
export class TalentsController {
    constructor(private readonly talentsService: TalentsService) { }

    @Get('featured')
    @ApiOperation({ 
        summary: 'Get featured talents',
        description: 'Returns a list of boosted and online talents for the home page.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'List of featured talents retrieved successfully',
        schema: {
            example: {
                data: [{
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    slug: 'sofia-martinez-nyc',
                    displayName: 'Sofia Martinez',
                    city: 'New York',
                    photoMain: 'https://images.unsplash.com/photo-...',
                    isBoosted: true,
                    isOnline: true
                }],
                meta: {},
                error: null
            }
        }
    })
    getFeatured() {
        return this.talentsService.findFeatured();
    }

    @Get('search')
    @ApiOperation({ 
        summary: 'Search talents',
        description: 'Search and filter talents by city, services, price range, and other criteria.'
    })
    @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
    @ApiQuery({ name: 'services', required: false, description: 'Filter by services offered' })
    @ApiQuery({ name: 'price_min', required: false, type: Number, description: 'Minimum price' })
    @ApiQuery({ name: 'price_max', required: false, type: Number, description: 'Maximum price' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of results', example: 20 })
    @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Pagination offset', example: 0 })
    @ApiResponse({ 
        status: 200, 
        description: 'Search results retrieved successfully'
    })
    findAll(@Query() searchDto: SearchTalentsDto) {
        return this.talentsService.findAll(searchDto);
    }

    @Get('smart-search')
    @ApiOperation({ 
        summary: 'Smart search with featured/regular separation',
        description: 'Returns talents separated into featured and regular sections with no duplicates.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Smart search results retrieved successfully'
    })
    smartSearch(@Query() searchDto: SearchTalentsDto) {
        return this.talentsService.smartSearch(searchDto);
    }

    @Get(':slug')
    @ApiOperation({ 
        summary: 'Get talent profile by slug',
        description: 'Returns detailed information about a specific talent including photos, services, and bio.'
    })
    @ApiParam({ name: 'slug', description: 'Unique talent slug', example: 'sofia-martinez-nyc' })
    @ApiResponse({ 
        status: 200, 
        description: 'Talent profile retrieved successfully',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    slug: 'sofia-martinez-nyc',
                    displayName: 'Sofia Martinez',
                    city: 'New York',
                    bio: 'Professional model and companion...',
                    age: 25,
                    services: ['GFE', 'Dinner Date', 'Travel'],
                    priceMin: 300,
                    isVerified: true,
                    photoGallery: [
                        { url: 'https://...', isMain: true, blurUrl: 'data:image/...' }
                    ]
                },
                meta: {},
                error: null
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Talent not found' })
    findOne(@Param('slug') slug: string) {
        return this.talentsService.findOne(slug);
    }

    @UseGuards(JwtAuthGuard)
    @Patch()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Update talent profile',
        description: 'Update the authenticated talent\'s profile information. Requires JWT authentication.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Profile updated successfully'
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Validation error - Invalid data provided'
    })
    update(@Request() req, @Body() updateTalentDto: UpdateTalentDto) {
        return this.talentsService.update(req.user.id, updateTalentDto);
    }
}

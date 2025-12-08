import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get current user profile',
        description: 'Returns the authenticated user information without password hash.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User retrieved successfully',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    email: 'user@example.com',
                    role: 'TALENT',
                    createdAt: '2025-01-01T00:00:00.000Z'
                },
                meta: {},
                error: null
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@Request() req) {
        const user = await this.usersService.findOne(req.user.id);
        // Remove password hash before returning
        if (!user) return null;
        const { passwordHash, ...result } = user;
        return result;
    }
}

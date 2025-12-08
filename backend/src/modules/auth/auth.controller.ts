import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterTalentDto, RegisterEstablishmentDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiOperation({ 
        summary: 'User login',
        description: 'Authenticate user with email and password. Returns access token and refresh token.'
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Login successful. Returns JWT tokens.',
        schema: {
            example: {
                data: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    role: 'TALENT'
                },
                meta: {},
                error: null
            }
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Invalid credentials',
        schema: {
            example: {
                data: null,
                meta: {},
                error: {
                    code: 'Unauthorized',
                    message: 'Invalid credentials',
                    details: []
                }
            }
        }
    })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register/talent')
    @ApiOperation({ 
        summary: 'Register new talent',
        description: 'Create a new talent account. Automatically creates user and talent profile.'
    })
    @ApiBody({ type: RegisterTalentDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Registration successful. Returns JWT tokens.',
        schema: {
            example: {
                data: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    role: 'TALENT'
                },
                meta: {},
                error: null
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Validation error or user already exists',
        schema: {
            example: {
                data: null,
                meta: {},
                error: {
                    code: 'Bad Request',
                    message: ['email must be a valid email', 'password must be at least 6 characters'],
                    details: ['email must be a valid email', 'password must be at least 6 characters']
                }
            }
        }
    })
    async registerTalent(@Body() registerDto: RegisterTalentDto) {
        return this.authService.registerTalent(registerDto);
    }

    @Post('register/establishment')
    @ApiOperation({ 
        summary: 'Register new establishment',
        description: 'Create a new establishment account (venue, club, etc). Automatically creates user and establishment profile.'
    })
    @ApiBody({ type: RegisterEstablishmentDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Registration successful. Returns JWT tokens.',
        schema: {
            example: {
                data: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    role: 'ESTABLISHMENT'
                },
                meta: {},
                error: null
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Validation error or user already exists',
        schema: {
            example: {
                data: null,
                meta: {},
                error: {
                    code: 'Bad Request',
                    message: 'Email already exists',
                    details: []
                }
            }
        }
    })
    async registerEstablishment(@Body() registerDto: RegisterEstablishmentDto) {
        return this.authService.registerEstablishment(registerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get current user profile',
        description: 'Returns the authenticated user\'s profile information. Requires valid JWT token.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User profile retrieved successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'user@example.com',
                role: 'TALENT',
                sub: '123e4567-e89b-12d3-a456-426614174000'
            }
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing token'
    })
    getProfile(@Request() req) {
        return req.user;
    }
}

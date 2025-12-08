import { Controller, Post, Body, Get, Param, Logger, Headers, HttpException, HttpStatus, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { BoostsService } from '../boosts/boosts.service';
import { AbacatePayService } from './abacate-pay.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentStatus } from './entities/payment.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);

    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly boostsService: BoostsService,
        private readonly abacatePayService: AbacatePayService,
    ) { }

    @Post('simulate/:pixId')
    @ApiOperation({ summary: 'Simulate payment in dev mode' })
    async simulatePayment(@Param('pixId') pixId: string) {
        try {
            // Simulate on Abacate Pay
            await this.abacatePayService.simulatePayment(pixId);
            
            // Find payment by pixId in metadata
            const payment = await this.paymentsService.findByPixId(pixId);
            
            if (payment) {
                // Update payment status to PAID
                await this.paymentsService.updateStatus(payment.id, 'PAID');
                
                // Activate the boost
                await this.boostsService.activateBoostByPayment(payment.id);
                
                this.logger.log(`Simulated payment and activated boost for: ${pixId}`);
            }
            
            return {
                data: { success: true, message: 'Payment simulated and processed successfully' },
                meta: {},
                error: null,
            };
        } catch (error) {
            throw new HttpException(
                {
                    data: null,
                    meta: {},
                    error: { message: error.message },
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('status/:billingId')
    @ApiOperation({ summary: 'Check payment status by billing ID' })
    async checkStatus(@Param('billingId') billingId: string) {
        const payment = await this.paymentsService.findByBillingId(billingId);
        
        if (!payment) {
            // Check directly from Abacate Pay
            const billing = await this.abacatePayService.checkStatus(billingId);
            return {
                data: {
                    status: billing.status,
                    amount: billing.amount.toString(),
                    expiresAt: null,
                },
                meta: {},
                error: null,
            };
        }

        return {
            data: {
                status: payment.status,
                amount: payment.amountCents,
                expiresAt: payment.expiresAt,
            },
            meta: {},
            error: null,
        };
    }

    @Post('webhooks/abacate')
    @ApiOperation({ summary: 'Handle Abacate Pay webhook notifications' })
    async handleAbacateWebhook(
        @Body() payload: any,
        @Headers('x-abacatepay-signature') signature: string,
    ) {
        this.logger.log(`Received Abacate webhook: ${JSON.stringify(payload)}`);

        // TODO: Verify webhook signature for security
        // For now, we trust the webhook in development

        const { event, data } = payload;

        if (event === 'billing.paid') {
            // Find payment by billingId
            const payment = await this.paymentsService.findByBillingId(data.id);

            if (!payment) {
                this.logger.error(`Payment not found for billing: ${data.id}`);
                return { received: true };
            }

            // Update payment status
            await this.paymentsService.updateStatus(payment.id, 'PAID');

            // Activate boost
            await this.boostsService.activateBoostByPayment(payment.id);

            this.logger.log(`Boost activated for payment: ${payment.id}`);
        } else if (event === 'billing.cancelled' || event === 'billing.refunded') {
            const payment = await this.paymentsService.findByBillingId(data.id);
            if (payment) {
                await this.paymentsService.updateStatus(payment.id, data.status);
            }
        }

        return { received: true };
    }

    @UseGuards(JwtAuthGuard)
    @Get('history')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obter histórico completo de pagamentos' })
    async getPaymentHistory(
        @Request() req: any,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('status') status?: PaymentStatus,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        const filters = {
            startDate,
            endDate,
            status,
            limit: limit ? parseInt(limit.toString()) : 20,
            offset: offset ? parseInt(offset.toString()) : 0,
        };

        return this.paymentsService.getPaymentHistory(req.user.id, filters);
    }
}

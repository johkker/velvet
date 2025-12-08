import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateBillingDto {
  frequency: 'ONE_TIME' | 'MONTHLY' | 'YEARLY';
  methods: string[];
  products: Array<{
    externalId: string;
    name: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  returnUrl?: string;
  completionUrl?: string;
  customer?: {
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
  };
  metadata?: Record<string, any>;
}

export interface BillingResponse {
  id: string;
  url: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'COMPLETED';
  devMode: boolean;
  amount: number;
  fee: number;
  methods: {
    pix?: {
      qrCode: string;
      qrCodeUrl: string;
      expiresAt: string;
    };
  };
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PixQRCodeResponse {
  id: string;
  amount: number;
  status: string;
  devMode: boolean;
  brCode: string;
  brCodeBase64: string;
  platformFee: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AbacatePayService {
  private readonly logger = new Logger(AbacatePayService.name);
  private readonly baseUrl = 'https://api.abacatepay.com/v1';
  private readonly apiKey: string;
  private readonly devMode: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACATE_PAY_API_KEY') || '';
    this.devMode = this.configService.get<string>('ABACATE_PAY_MODE') === 'development';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      this.logger.error(`Abacate Pay API error: ${JSON.stringify(data)}`);
      throw new Error(data.error || 'Abacate Pay API request failed');
    }

    return data.data;
  }

  /**
   * Create a new billing (cobrança)
   */
  async createBilling(data: CreateBillingDto): Promise<BillingResponse> {
    try {
      this.logger.log(`Creating billing: ${JSON.stringify(data)}`);
      
      const billing = await this.request<BillingResponse>('/billing/create', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          devMode: this.devMode,
        }),
      });

      this.logger.log(`Billing created: ${JSON.stringify(billing)}`);
      return billing;
    } catch (error) {
      this.logger.error(`Failed to create billing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create standalone PIX QR code
   */
  async createPixQRCode(
    amount: number,
    externalId?: string,
  ): Promise<PixQRCodeResponse> {
    try {
      const qrCode = await this.request<PixQRCodeResponse>('/pixQrCode/create', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          externalId,
          devMode: this.devMode,
        }),
      });

      return qrCode;
    } catch (error) {
      this.logger.error(`Failed to create PIX QR code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check billing status
   */
  async checkStatus(billingId: string): Promise<BillingResponse> {
    try {
      const billing = await this.request<BillingResponse>(
        `/billing/${billingId}/status`,
      );
      return billing;
    } catch (error) {
      this.logger.error(`Failed to check status: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all billings
   */
  async listBillings(): Promise<BillingResponse[]> {
    try {
      const billings = await this.request<BillingResponse[]>('/billing/list');
      return billings;
    } catch (error) {
      this.logger.error(`Failed to list billings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simulate payment (dev mode only)
   */
  async simulatePayment(pixId: string): Promise<void> {
    if (!this.devMode) {
      throw new Error('Payment simulation is only available in dev mode');
    }

    try {
      this.logger.log(`Simulating payment for PIX: ${pixId}`);
      
      await this.request(`/pixQrCode/simulate-payment?id=${pixId}`, {
        method: 'POST',
        body: JSON.stringify({
          metadata: {}
        }),
      });

      this.logger.log(`Payment simulated successfully for PIX: ${pixId}`);
    } catch (error) {
      this.logger.error(`Failed to simulate payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create customer
   */
  async createCustomer(customer: {
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
  }) {
    try {
      const newCustomer = await this.request('/customer/create', {
        method: 'POST',
        body: JSON.stringify(customer),
      });
      return newCustomer;
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw error;
    }
  }
}

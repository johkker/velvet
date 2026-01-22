export class CreateTalentBoostDto {
    boostType: 'basic_3d' | 'basic_7d' | 'premium_7d' | 'premium_30d';
}

export class CreateEstablishmentBoostDto {
    boostType: 'establishment_3d' | 'establishment_7d' | 'establishment_30d';
}

export class CreateTalentBulkBoostDto {
    talentIds: string[];
    boostType: 'talent_bulk_3d' | 'talent_bulk_7d' | 'talent_bulk_30d';
    quantity: number;
}

export class PurchaseBoostResponseDto {
    paymentId: string;
    billingId: string;
    pixId: string;
    amount: number;
    pixQrCode: string;
    pixQrCodeBase64: string;
    paymentUrl: string;
    expiresAt: string;
    talentCount?: number;
    discountPercentage?: number;
}

export class BoostDetailsDto {
    id: string;
    type: string;
    status: string;
    startAt: Date | null;
    endAt: Date | null;
    durationDays: number;
    talentIds: string[] | null;
    boostTier: string | null;
    discountPercentage: number;
    createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Boost } from '../../boosts/entities/boost.entity';

export enum PaymentStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Boost, (boost) => boost.payments, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'boost_id' })
    boost: Boost;

    @Column({ name: 'boost_id', nullable: true })
    boostId: string;

    @Column({ length: 64 })
    provider: string;

    @Column({ name: 'provider_payment_id', length: 255, nullable: true })
    providerPaymentId: string;

    @Column({ name: 'amount_cents', type: 'bigint' })
    amountCents: string; // TypeORM bigint maps to string in JS

    @Column({ length: 8, default: 'BRL' })
    currency: string;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
    })
    status: PaymentStatus;

    @Column('jsonb', { default: {} })
    metadata: any;

    // Abacate Pay specific fields
    @Column({ name: 'billing_id', nullable: true })
    billingId: string;

    @Column({ name: 'pix_qr_code', type: 'text', nullable: true })
    pixQrCode: string;

    @Column({ name: 'pix_qr_code_base64', type: 'text', nullable: true })
    pixQrCodeBase64: string;

    @Column({ name: 'payment_url', nullable: true })
    paymentUrl: string;

    @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
    expiresAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

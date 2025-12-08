'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    amount: number;
    pixQrCode: string;
    pixQrCodeBase64: string;
    paymentUrl: string;
    expiresAt: string;
    billingId: string;
    pixId?: string;
  } | null;
  onSuccess: () => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  paymentData, 
  onSuccess 
}: PaymentModalProps) {
  const [status, setStatus] = useState<'pending' | 'checking' | 'paid' | 'expired'>('pending');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !paymentData?.billingId) {
      console.log('Skipping polling - no billing ID:', { isOpen, billingId: paymentData?.billingId });
      return;
    }

    console.log('Starting payment polling for:', paymentData.billingId);

    // Poll for payment status every 5 seconds
    const interval = setInterval(async () => {
      try {
        setStatus('checking');
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/payments/status/${paymentData.billingId}`;
        console.log('Polling payment status:', url);
        
        const res = await fetch(url);
        const response = await res.json();
        
        console.log('Payment status response:', response);
        
        // Extract status from wrapped response
        const paymentStatus = response.data?.status || response.status;
        
        if (paymentStatus === 'PAID' || paymentStatus === 'COMPLETED') {
          setStatus('paid');
          clearInterval(interval);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else if (paymentStatus === 'EXPIRED' || paymentStatus === 'CANCELLED') {
          setStatus('expired');
          clearInterval(interval);
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        setStatus('pending');
      }
    }, 5000);

    return () => {
      console.log('Stopping payment polling');
      clearInterval(interval);
    };
  }, [isOpen, paymentData?.billingId, onSuccess, onClose]);

  const copyPixCode = () => {
    if (paymentData) {
      navigator.clipboard.writeText(paymentData.pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const simulatePayment = async () => {
    if (!paymentData?.pixId) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/payments/simulate/${paymentData.pixId}`, {
        method: 'POST',
      });
      
      if (res.ok) {
        console.log('Payment simulated successfully');
        // The polling will detect the payment
      } else {
        const error = await res.json();
        console.error('Failed to simulate payment:', error);
      }
    } catch (error) {
      console.error('Error simulating payment:', error);
    }
  };

  if (!isOpen || !paymentData) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {status === 'paid' ? (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>Pagamento Confirmado!</h2>
            <p>Seu boost está ativo agora</p>
          </div>
        ) : status === 'expired' ? (
          <div className="payment-expired">
            <h2>Pagamento Expirado</h2>
            <p>Por favor, tente novamente</p>
            <button onClick={onClose} className="retry-button">Fechar</button>
          </div>
        ) : (
          <>
            <h2>Pagar com PIX</h2>
            <p className="amount">R$ {(paymentData.amount / 100).toFixed(2)}</p>
            
            <div className="qr-code-container">
              {paymentData.pixQrCodeBase64 && (
                <Image
                  src={paymentData.pixQrCodeBase64}
                  alt="QR Code PIX"
                  width={300}
                  height={300}
                  unoptimized
                />
              )}
            </div>

            <div className="pix-code-section">
              <p className="instructions">Ou copie o código PIX:</p>
              <div className="pix-code-box">
                <code>{paymentData.pixQrCode?.substring(0, 50)}...</code>
                <button onClick={copyPixCode} className="copy-button">
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <p className="expires-at">
              Expira em: {new Date(paymentData.expiresAt).toLocaleString('pt-BR')}
            </p>

            {/* Dev mode simulation button */}
            {process.env.NODE_ENV === 'development' && (
              <button onClick={simulatePayment} className="simulate-button">
                🧪 Simular Pagamento (Dev Mode)
              </button>
            )}

            {status === 'checking' && (
              <div className="checking-status">
                <div className="spinner"></div>
                <p>Verificando pagamento...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

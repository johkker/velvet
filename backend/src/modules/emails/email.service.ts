import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as brevo from 'sib-api-v3-sdk';

export interface EmailTemplate {
    to: string;
    subject: string;
    templateId: number;
    params?: Record<string, string>;
}

export interface SimpleEmail {
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private brevoClient: brevo.TransactionalEmailsApi;
    private senderEmail: string;
    private senderName: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('BREVO_API_KEY');
        const defaultClient = brevo.ApiClient.instance;
        defaultClient.authentications['api-key'].apiKey = apiKey;

        this.brevoClient = new brevo.TransactionalEmailsApi();
        this.senderEmail = this.configService.get<string>(
            'EMAIL_SENDER',
            'noreply@velvet.com'
        );
        this.senderName = this.configService.get<string>(
            'EMAIL_SENDER_NAME',
            'Velvet'
        );
    }

    /**
     * Send email using Brevo template
     */
    async sendTemplateEmail(template: EmailTemplate): Promise<{ messageId: string }> {
        try {
            const sendSmtpEmail = new brevo.SendSmtpEmail();
            sendSmtpEmail.to = [{ email: template.to }];
            sendSmtpEmail.sender = {
                name: this.senderName,
                email: this.senderEmail,
            };
            sendSmtpEmail.templateId = template.templateId;
            sendSmtpEmail.params = template.params || {};

            const response = await this.brevoClient.sendTransacEmail(sendSmtpEmail);
            this.logger.log(
                `Template email sent to ${template.to} with template ${template.templateId}`
            );
            return { messageId: response.messageId };
        } catch (error) {
            this.logger.error(
                `Failed to send template email to ${template.to}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Send simple HTML email
     */
    async sendSimpleEmail(email: SimpleEmail): Promise<{ messageId: string }> {
        try {
            const sendSmtpEmail = new brevo.SendSmtpEmail();
            sendSmtpEmail.to = [{ email: email.to }];
            sendSmtpEmail.sender = {
                name: this.senderName,
                email: this.senderEmail,
            };
            sendSmtpEmail.subject = email.subject;
            sendSmtpEmail.htmlContent = email.htmlContent;
            if (email.textContent) {
                sendSmtpEmail.textContent = email.textContent;
            }

            const response = await this.brevoClient.sendTransacEmail(sendSmtpEmail);
            this.logger.log(`Simple email sent to ${email.to}`);
            return { messageId: response.messageId };
        } catch (error) {
            this.logger.error(`Failed to send simple email to ${email.to}:`, error);
            throw error;
        }
    }

    /**
     * Send invitation email
     */
    async sendInvitationEmail(
        recipientEmail: string,
        talentName: string,
        establishmentName: string,
        invitationLink: string
    ): Promise<{ messageId: string }> {
        const htmlContent = `
            <h2>Novo Convite de Estabelecimento</h2>
            <p>Olá ${talentName},</p>
            <p><strong>${establishmentName}</strong> enviou um convite para você!</p>
            <p>Clique no botão abaixo para ver o convite:</p>
            <a href="${invitationLink}" style="background-color: #D4AF37; color: black; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Ver Convite
            </a>
            <p style="margin-top: 20px; color: #666;">
                Ou copie e cole este link no seu navegador:<br/>
                ${invitationLink}
            </p>
        `;

        return this.sendSimpleEmail({
            to: recipientEmail,
            subject: `${establishmentName} enviou um convite para você!`,
            htmlContent,
        });
    }

    /**
     * Send boost activation email
     */
    async sendBoostActivationEmail(
        recipientEmail: string,
        recipientName: string,
        boostType: string,
        boostDays: number,
        endDate: string
    ): Promise<{ messageId: string }> {
        const htmlContent = `
            <h2>Seu Boost foi Ativado! 🚀</h2>
            <p>Oi ${recipientName},</p>
            <p>Seu boost <strong>${boostType}</strong> foi ativado com sucesso!</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Duração:</strong> ${boostDays} dias</p>
                <p><strong>Ativo até:</strong> ${endDate}</p>
            </div>
            <p>Seu perfil agora está em destaque e terá maior visibilidade!</p>
            <a href="https://velvet.com/dashboard/analytics" style="background-color: #D4AF37; color: black; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Ver Métricas
            </a>
        `;

        return this.sendSimpleEmail({
            to: recipientEmail,
            subject: `Seu Boost ${boostType} está Ativo!`,
            htmlContent,
        });
    }

    /**
     * Send payment confirmation email
     */
    async sendPaymentConfirmationEmail(
        recipientEmail: string,
        recipientName: string,
        amount: number,
        productName: string,
        paymentDate: string,
        orderId: string
    ): Promise<{ messageId: string }> {
        const htmlContent = `
            <h2>Pagamento Confirmado ✓</h2>
            <p>Oi ${recipientName},</p>
            <p>Seu pagamento foi recebido com sucesso!</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Produto:</strong> ${productName}</p>
                <p><strong>Valor:</strong> R$ ${(amount / 100).toFixed(2)}</p>
                <p><strong>Data:</strong> ${paymentDate}</p>
                <p><strong>ID do Pedido:</strong> ${orderId}</p>
            </div>
            <p>Obrigado por usar a Velvet!</p>
        `;

        return this.sendSimpleEmail({
            to: recipientEmail,
            subject: `Pagamento Confirmado - ${productName}`,
            htmlContent,
        });
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(
        recipientEmail: string,
        recipientName: string,
        role: string
    ): Promise<{ messageId: string }> {
        const isDashboardLink = role === 'TALENT' 
            ? 'https://velvet.com/dashboard/profile'
            : 'https://velvet.com/dashboard/talents';

        const htmlContent = `
            <h2>Bem-vindo à Velvet! 🎉</h2>
            <p>Olá ${recipientName},</p>
            <p>Sua conta foi criada com sucesso! Estamos felizes em tê-lo na nossa plataforma.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Seu Perfil:</strong> ${role === 'TALENT' ? 'Talento' : 'Estabelecimento'}</p>
            </div>
            <p>Próximos passos:</p>
            <ul>
                <li>Complete seu perfil</li>
                <li>Adicione fotos e descrição</li>
                <li>Configure suas preferências</li>
            </ul>
            <a href="${isDashboardLink}" style="background-color: #D4AF37; color: black; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Ir para Dashboard
            </a>
        `;

        return this.sendSimpleEmail({
            to: recipientEmail,
            subject: 'Bem-vindo à Velvet',
            htmlContent,
        });
    }
}

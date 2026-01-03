# Brevo Email Integration Setup Guide

## Overview
Velvet Platform now uses **Brevo (formerly Sendinblue)** for transactional emails. Brevo offers a free tier with 300 emails/day, perfect for development and small-scale deployments.

## Features Implemented

### Email Types
1. **Welcome Email** - Sent on registration to talents and establishments
2. **Invitation Email** - Sent when an establishment invites a talent
3. **Payment Confirmation Email** - Sent when a payment is completed
4. **Boost Activation Email** - Sent when a boost becomes active

### Email Automation
- Emails are sent automatically upon triggering events
- Failed email sends don't block main application flow (logged as warnings)
- All emails include proper error handling

## Setup Instructions

### Step 1: Create Brevo Account
1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key
1. Log in to your Brevo dashboard
2. Go to **Settings → API Keys → SMTP & API**
3. Create a new API key or copy your existing one
4. Copy the **v3 API Key** (not the SMTP password)

### Step 3: Verify Sender Email
1. In Brevo dashboard, go to **Senders & List → Senders**
2. Add your sender email address (e.g., `noreply@velvet.com`)
3. Verify the sender email by clicking the link sent by Brevo
4. Once verified, you can use it for sending emails

### Step 4: Environment Configuration
Add the following to your `.env` file:

```bash
# Brevo Email Configuration
BREVO_API_KEY=your_api_key_here
EMAIL_SENDER=noreply@velvet.com
EMAIL_SENDER_NAME=Velvet
```

### Step 5: Verify Configuration
Restart the backend server:
```bash
npm run start:dev
```

Check logs for successful email module initialization.

## Testing Emails

### Test Registration Email
1. Register a new talent or establishment account
2. Check the email inbox for a welcome email
3. Verify it contains proper formatting and your branding

### Test Invitation Email
1. As an establishment, send an invitation to a talent
2. Check the talent's email inbox
3. Verify the invitation link is correct

### Test Payment Email
1. Complete a boost payment
2. Check the email inbox for payment confirmation and boost activation emails
3. Verify all details are correct

## Brevo Free Tier Limits

- **300 emails per day**
- **Unlimited contacts**
- **Basic reporting**
- Perfect for development and testing

### Upgrade Options
For production deployments with higher volume:
- Standard Plan: 600 emails/day + more features
- Enterprise: Custom limits and support

## Email Templates

All emails are built using HTML templates with:
- Professional styling
- Velvet branding (Gold accent color #D4AF37)
- Responsive design
- Clear call-to-action buttons
- Portuguese language (pt-BR)

## Troubleshooting

### Emails Not Sending
1. Verify `BREVO_API_KEY` is correct
2. Check sender email is verified in Brevo dashboard
3. Check application logs for errors
4. Verify email address is valid (no typos)

### Emails Going to Spam
1. Add SPF and DKIM records to your domain (if using custom domain)
2. Verify sender email reputation in Brevo dashboard
3. Use authenticated sender email addresses

### Rate Limiting
If you exceed 300 emails/day:
1. Upgrade to a paid Brevo plan
2. Implement email queue for off-peak sending
3. Monitor usage in Brevo dashboard

## Code Integration Points

### EmailService
Located in: `backend/src/modules/emails/email.service.ts`

Methods:
- `sendTemplateEmail()` - For Brevo templates
- `sendSimpleEmail()` - For HTML emails
- `sendInvitationEmail()` - Invitation notifications
- `sendBoostActivationEmail()` - Boost confirmations
- `sendPaymentConfirmationEmail()` - Payment receipts
- `sendWelcomeEmail()` - Welcome messages

### Module Integration
- **AuthModule**: Sends welcome emails on registration
- **EstablishmentsModule**: Sends invitation emails
- **PaymentsModule**: Sends payment and boost activation emails

## Best Practices

1. **Always use try-catch** - Email failures shouldn't crash the app
2. **Log email sends** - Track what was sent and when
3. **Test before production** - Send test emails before going live
4. **Monitor email delivery** - Check Brevo dashboard for bounce/complaint rates
5. **Update sender info** - Keep sender name and email consistent

## Future Enhancements

Potential improvements:
- [ ] Email templates with dynamic content
- [ ] Unsubscribe links
- [ ] Email tracking (open rates, clicks)
- [ ] Scheduled email sending
- [ ] Email retry mechanism
- [ ] Multiple sender addresses per environment

## Support

For issues with Brevo integration:
1. Check Brevo documentation: https://www.brevo.com/resources/
2. Review application logs
3. Contact Brevo support: https://www.brevo.com/contact/

---

**Configuration Status**: ✅ Ready for Development  
**Last Updated**: 2026-01-03  
**Brevo Free Tier**: 300 emails/day

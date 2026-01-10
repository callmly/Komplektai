import { Resend } from 'resend';
import type { Lead, SelectedOptionData } from '@shared/schema';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'noreply@resend.dev'
  };
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

function generateEmailHtml(lead: Lead, isAdmin: boolean = false): string {
  const options = (lead.selectedOptions || []) as SelectedOptionData[];
  
  const optionsHtml = options.map(opt => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${opt.label}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${opt.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(opt.totalPrice)}</td>
    </tr>
  `).join('');

  const greeting = isAdmin 
    ? `<p style="color: #374151; font-size: 16px;">Gauta nauja užklausa iš <strong>${lead.name}</strong>.</p>`
    : `<p style="color: #374151; font-size: 16px;">Sveiki, <strong>${lead.name}</strong>!</p>
       <p style="color: #374151; font-size: 16px;">Dėkojame už jūsų užklausą. Štai jūsų pasirinkta konfigūracija:</p>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">KNX Namų Automatizacija</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px;">${isAdmin ? 'Nauja užklausa' : 'Jūsų užklausos patvirtinimas'}</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px;">
      ${greeting}
      
      <!-- Plan Info -->
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h2 style="margin: 0 0 8px 0; color: #1e40af; font-size: 18px;">Pasirinktas planas</h2>
        <p style="margin: 0; color: #374151; font-size: 20px; font-weight: 600;">${lead.planName || 'Nenurodyta'}</p>
      </div>
      
      <!-- Options Table -->
      ${options.length > 0 ? `
      <h3 style="color: #374151; font-size: 16px; margin-bottom: 12px;">Pasirinktos opcijos</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 12px; text-align: left; font-size: 14px; color: #6b7280;">Opcija</th>
            <th style="padding: 12px; text-align: center; font-size: 14px; color: #6b7280;">Kiekis</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; color: #6b7280;">Kaina</th>
          </tr>
        </thead>
        <tbody>
          ${optionsHtml}
        </tbody>
      </table>
      ` : ''}
      
      <!-- Total -->
      <div style="background-color: #1e40af; border-radius: 8px; padding: 20px; text-align: center;">
        <p style="margin: 0 0 4px 0; color: #bfdbfe; font-size: 14px;">Bendra kaina</p>
        <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">${formatPrice(lead.totalPriceCents)}</p>
      </div>
      
      <!-- Contact Info -->
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <h3 style="color: #374151; font-size: 16px; margin-bottom: 12px;">Kontaktinė informacija</h3>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280; width: 120px;">El. paštas:</td>
            <td style="padding: 4px 0; color: #374151;">${lead.email}</td>
          </tr>
          ${lead.phone ? `
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Telefonas:</td>
            <td style="padding: 4px 0; color: #374151;">${lead.phone}</td>
          </tr>
          ` : ''}
          ${lead.city ? `
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Miestas/Objektas:</td>
            <td style="padding: 4px 0; color: #374151;">${lead.city}</td>
          </tr>
          ` : ''}
        </table>
        ${lead.comment ? `
        <div style="margin-top: 16px;">
          <p style="color: #6b7280; margin: 0 0 8px 0;">Komentaras:</p>
          <p style="color: #374151; margin: 0; padding: 12px; background-color: #f9fafb; border-radius: 6px;">${lead.comment}</p>
        </div>
        ` : ''}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        ${isAdmin ? 'Susisiekite su klientu kuo greičiau.' : 'Su jumis susisieksime artimiausiu metu.'}
      </p>
      <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} KNX Namų Automatizacija
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendLeadEmails(lead: Lead, adminEmail?: string): Promise<void> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    // Send confirmation to customer
    await client.emails.send({
      from: fromEmail,
      to: lead.email,
      subject: `Jūsų užklausa - ${lead.planName || 'KNX Planas'}`,
      html: generateEmailHtml(lead, false),
    });
    
    // Send notification to admin if email provided
    if (adminEmail) {
      await client.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `Nauja užklausa: ${lead.name} - ${lead.planName}`,
        html: generateEmailHtml(lead, true),
      });
    }
    
    console.log('Emails sent successfully for lead:', lead.id);
  } catch (error) {
    console.error('Failed to send emails:', error);
    throw error;
  }
}

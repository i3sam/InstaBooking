// Email template generator with glass morphism design matching BookingGen branding

export interface EmailTemplateData {
  businessName: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined' | 'rescheduled';
  appointmentId?: string;
  contactEmail?: string;
  contactPhone?: string;
  note?: string;
  originalDate?: string;
  originalTime?: string;
}

const getStatusColor = (status: string): { bg: string; text: string; label: string } => {
  switch (status) {
    case 'accepted':
      return { bg: '#10b981', text: '#ffffff', label: 'Confirmed' };
    case 'pending':
      return { bg: '#f59e0b', text: '#ffffff', label: 'Pending Review' };
    case 'declined':
      return { bg: '#ef4444', text: '#ffffff', label: 'Declined' };
    case 'rescheduled':
      return { bg: '#3b82f6', text: '#ffffff', label: 'Rescheduled' };
    default:
      return { bg: '#6b7280', text: '#ffffff', label: 'Unknown' };
  }
};

const getGreeting = (status: string, customerName: string): string => {
  switch (status) {
    case 'accepted':
      return `Great news, ${customerName}! 🎉`;
    case 'pending':
      return `Thank you for your request, ${customerName}!`;
    case 'declined':
      return `Hello ${customerName},`;
    case 'rescheduled':
      return `Hello ${customerName},`;
    default:
      return `Hello ${customerName},`;
  }
};

const getMessage = (status: string, businessName: string): string => {
  switch (status) {
    case 'accepted':
      return `Your appointment with <strong>${businessName}</strong> has been confirmed!`;
    case 'pending':
      return `We've received your appointment request for <strong>${businessName}</strong>. We'll review it and get back to you soon.`;
    case 'declined':
      return `We regret to inform you that your appointment request with <strong>${businessName}</strong> could not be confirmed. Please feel free to book another time slot.`;
    case 'rescheduled':
      return `Your appointment with <strong>${businessName}</strong> has been rescheduled to a new date and time.`;
    default:
      return `Your appointment status has been updated.`;
  }
};

export function generateEmailTemplate(data: EmailTemplateData): string {
  const statusInfo = getStatusColor(data.status);
  const greeting = getGreeting(data.status, data.customerName);
  const message = getMessage(data.status, data.businessName);
  
  // Generate reschedule link (will work after we create the public reschedule page)
  const rescheduleUrl = data.appointmentId 
    ? `${process.env.BASE_URL || 'https://bookinggen.xyz'}/reschedule/${data.appointmentId}`
    : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Update - ${data.businessName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      line-height: 1.6;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
      padding: 32px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
    }
    
    .content {
      padding: 40px 32px;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 16px;
    }
    
    .message {
      font-size: 16px;
      color: #4a5568;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .status-badge {
      display: inline-block;
      background: ${statusInfo.bg};
      color: ${statusInfo.text};
      padding: 8px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
    }
    
    .detail-value {
      color: #4a5568;
      font-size: 14px;
      text-align: right;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
    }
    
    .button-secondary {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      box-shadow: none;
      border: 1px solid rgba(102, 126, 234, 0.3);
    }
    
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    
    .contact-section {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 16px;
      padding: 20px;
      margin-top: 24px;
    }
    
    .contact-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 12px;
    }
    
    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      color: #4a5568;
      font-size: 14px;
    }
    
    .contact-icon {
      margin-right: 8px;
    }
    
    .footer {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .footer-text {
      color: #718096;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .footer-brand {
      color: #667eea;
      font-weight: 600;
      text-decoration: none;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
      margin: 24px 0;
    }
    
    @media only screen and (max-width: 600px) {
      body {
        padding: 20px 10px;
      }
      
      .content {
        padding: 24px 20px;
      }
      
      .greeting {
        font-size: 20px;
      }
      
      .glass-card {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">BookingGen</div>
      <div class="tagline">Effortless Appointment Management</div>
    </div>
    
    <div class="content">
      <div class="greeting">${greeting}</div>
      <div class="message">${message}</div>
      
      <div class="glass-card">
        <div class="status-badge">${statusInfo.label}</div>
        
        ${data.status === 'rescheduled' && data.originalDate ? `
          <div style="margin-bottom: 20px; padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
            <div style="font-size: 12px; color: #991b1b; font-weight: 600; margin-bottom: 8px;">PREVIOUS APPOINTMENT</div>
            <div style="font-size: 14px; color: #4a5568;">
              <strong>Date:</strong> ${data.originalDate} &nbsp;&nbsp; <strong>Time:</strong> ${data.originalTime}
            </div>
          </div>
          <div style="margin-bottom: 12px; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
            <div style="font-size: 12px; color: #065f46; font-weight: 600; margin-bottom: 8px;">NEW APPOINTMENT</div>
        ` : ''}
        
        <div class="detail-row">
          <div class="detail-label">📍 Business</div>
          <div class="detail-value">${data.businessName}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">💼 Service</div>
          <div class="detail-value">${data.serviceName}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">📅 Date</div>
          <div class="detail-value">${data.date}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">🕐 Time</div>
          <div class="detail-value">${data.time}</div>
        </div>
        
        ${data.status === 'rescheduled' && data.originalDate ? '</div>' : ''}
      </div>
      
      ${data.note ? `
        <div class="glass-card" style="background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.3);">
          <div style="font-weight: 600; color: #92400e; margin-bottom: 8px;">📝 Note from ${data.businessName}</div>
          <div style="color: #4a5568; font-size: 14px;">${data.note}</div>
        </div>
      ` : ''}
      
      ${data.status === 'accepted' || data.status === 'pending' || data.status === 'rescheduled' ? `
        <div class="button-container">
          ${rescheduleUrl ? `
            <a href="${rescheduleUrl}" class="button">
              📅 Reschedule Appointment
            </a>
          ` : ''}
        </div>
      ` : ''}
      
      ${data.contactEmail || data.contactPhone ? `
        <div class="contact-section">
          <div class="contact-title">Need Help? Contact Us</div>
          <div class="contact-info">
            ${data.contactEmail ? `
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <a href="mailto:${data.contactEmail}" style="color: #667eea; text-decoration: none;">${data.contactEmail}</a>
              </div>
            ` : ''}
            ${data.contactPhone ? `
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <a href="tel:${data.contactPhone}" style="color: #667eea; text-decoration: none;">${data.contactPhone}</a>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <div class="footer-text">
        Powered by <a href="https://bookinggen.xyz" class="footer-brand">BookingGen</a>
      </div>
      <div class="footer-text" style="font-size: 12px; color: #a0aec0;">
        Effortless appointment management for modern businesses
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

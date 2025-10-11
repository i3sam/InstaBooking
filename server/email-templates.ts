// Email template generator optimized for email clients (including mobile)

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
  baseUrl?: string;
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
  
  const rescheduleUrl = data.appointmentId && data.baseUrl
    ? `${data.baseUrl}/reschedule/${data.appointmentId}`
    : null;

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Appointment Update - ${data.businessName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f0f4f8;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">BookingGen</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Effortless Appointment Management</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #1a202c;">${greeting}</h2>
              
              <!-- Message -->
              <p style="margin: 0 0 32px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">${message}</p>
              
              <!-- Status Badge -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: ${statusInfo.bg}; color: ${statusInfo.text}; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
                      ${statusInfo.label}
                    </div>
                  </td>
                </tr>
              </table>
              
              ${data.status === 'rescheduled' && data.originalDate ? `
              <!-- Previous Appointment Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px; background-color: #fef2f2; border-radius: 8px; padding: 16px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #991b1b; font-weight: 600; letter-spacing: 0.5px;">PREVIOUS APPOINTMENT</p>
                    <p style="margin: 0; font-size: 14px; color: #4a5568;">
                      <strong>Date:</strong> ${data.originalDate} &nbsp;&nbsp; <strong>Time:</strong> ${data.originalTime}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- New Appointment Label -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td>
                    <p style="margin: 0; padding: 12px 16px 8px 16px; font-size: 12px; color: #065f46; font-weight: 600; background-color: #d1fae5; border-radius: 8px 8px 0 0; letter-spacing: 0.5px;">NEW APPOINTMENT</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Appointment Details Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                
                <!-- Customer -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">👤</span>Customer:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.customerName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Business -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">📍</span>Business:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.businessName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Service -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">💼</span>Service:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.serviceName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Date -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">📅</span>Date:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.date}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Time -->
                <tr>
                  <td style="padding: 16px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">🕐</span>Time:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.time}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
              
              ${data.note ? `
              <!-- Note Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; background-color: #fef3c7; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #92400e;">
                      <span style="margin-right: 8px;">📝</span>Note from ${data.businessName}:
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.5;">
                      ${data.note}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              ${data.status === 'accepted' || data.status === 'pending' || data.status === 'rescheduled' ? `
              ${rescheduleUrl ? `
              <!-- Reschedule Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${rescheduleUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      <span style="margin-right: 8px;">📅</span>Reschedule Appointment
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              ` : ''}
              
              ${data.contactEmail || data.contactPhone ? `
              <!-- Contact Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #2d3748;">Need Help? Contact Us</p>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      ${data.contactEmail ? `
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="margin-right: 6px;">📧</span>
                          <a href="mailto:${data.contactEmail}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">${data.contactEmail}</a>
                        </td>
                      </tr>
                      ` : ''}
                      ${data.contactPhone ? `
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="margin-right: 6px;">📞</span>
                          <a href="tel:${data.contactPhone}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">${data.contactPhone}</a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
                Powered by <a href="https://www.bookinggen.xyz" style="color: #3b82f6; text-decoration: none; font-weight: 600;">BookingGen</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Effortless appointment management for modern businesses
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Template for business owner notifications
export function generateBusinessNotificationTemplate(data: EmailTemplateData): string {
  const statusInfo = getStatusColor(data.status);
  
  const rescheduleUrl = data.appointmentId && data.baseUrl
    ? `${data.baseUrl}/dashboard`
    : null;

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Appointment Request - ${data.businessName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f0f4f8;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                <span style="margin-right: 8px;">🔔</span>You have a new appointment!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Message -->
              <p style="margin: 0 0 32px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                A customer has requested an appointment with <strong>${data.businessName}</strong>. Review the details below and take action in your dashboard.
              </p>
              
              <!-- Status Badge -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: ${statusInfo.bg}; color: ${statusInfo.text}; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
                      ${statusInfo.label}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Appointment Details Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                
                <!-- Customer -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">👤</span>Customer:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.customerName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                ${data.contactEmail ? `
                <!-- Email -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">📧</span>Email:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          <a href="mailto:${data.contactEmail}" style="color: #3b82f6; text-decoration: none;">${data.contactEmail}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                
                ${data.contactPhone ? `
                <!-- Phone -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">📞</span>Phone:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          <a href="tel:${data.contactPhone}" style="color: #3b82f6; text-decoration: none;">${data.contactPhone}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Business -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">📍</span>Business:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.businessName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Service -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">💼</span>Service:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.serviceName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Date -->
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">📅</span>Date:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.date}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Time -->
                <tr>
                  <td style="padding: 16px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40%" style="font-size: 14px; font-weight: 600; color: #2d3748;">
                          <span style="margin-right: 8px;">🕐</span>Time:
                        </td>
                        <td width="60%" style="font-size: 14px; color: #4a5568; text-align: right;">
                          ${data.time}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
              
              ${rescheduleUrl ? `
              <!-- Dashboard Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${rescheduleUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      <span style="margin-right: 8px;">📊</span>View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
                Powered by <a href="https://www.bookinggen.xyz" style="color: #3b82f6; text-decoration: none; font-weight: 600;">BookingGen</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Effortless appointment management for modern businesses
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

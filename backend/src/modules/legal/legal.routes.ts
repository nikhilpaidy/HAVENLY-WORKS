import { Router, Request, Response } from 'express';
import { apiSuccess } from '../../utils/response.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

let supportHotlineConfig = {
  supportHotline: '+91 (040) 4892-7100',
  supportEmail: 'support@havenlywork.com',
  emergencyContact: '+91 98490 12345',
  whatsappNumber: '+91 98490 12345',
  operatingHours: '24/7 Helpline & On-Site Concierge'
};

router.get('/support', (_req: Request, res: Response) => {
  return apiSuccess(res, supportHotlineConfig);
});

router.put(
  '/support',
  authenticateJwt,
  requireRole(UserRole.SUPER_ADMIN, UserRole.COWORKING_ADMIN),
  (req: Request, res: Response) => {
    const { supportHotline, supportEmail, emergencyContact, whatsappNumber, operatingHours } = req.body;
    if (supportHotline) supportHotlineConfig.supportHotline = supportHotline.trim();
    if (supportEmail) supportHotlineConfig.supportEmail = supportEmail.trim();
    if (emergencyContact) supportHotlineConfig.emergencyContact = emergencyContact.trim();
    if (whatsappNumber) supportHotlineConfig.whatsappNumber = whatsappNumber.trim();
    if (operatingHours) supportHotlineConfig.operatingHours = operatingHours.trim();
    return apiSuccess(res, supportHotlineConfig, 'Helpline updated successfully');
  }
);

router.get('/', (_req: Request, res: Response) => {
  return apiSuccess(res, {
    appName: 'HavenlyWork',
    tagline: 'SPACE FOR TOGETHERNESS',
    version: '2.4.0',
    supportHotline: supportHotlineConfig.supportHotline,
    supportEmail: supportHotlineConfig.supportEmail,
    emergencyContact: supportHotlineConfig.emergencyContact,
    whatsappNumber: supportHotlineConfig.whatsappNumber,
    operatingHours: supportHotlineConfig.operatingHours,
    termsOfService: {
      lastUpdated: 'November 2026',
      sections: [
        {
          title: '1. Membership and Access Rights',
          content: 'Membership grants authorized access to assigned coworking hubs, meeting rooms, and shared workspaces subject to space availability and enterprise plan entitlements.'
        },
        {
          title: '2. Code of Workplace Conduct',
          content: 'All occupants must maintain a respectful, safe, and professional environment. Quiet zones and shared breakout lounges must be preserved in accordance with hub guidelines.'
        },
        {
          title: '3. Booking and Cancellation Policy',
          content: 'Room bookings may be cancelled up to 30 minutes prior to scheduled start time without quota deduction. No-show reservations are deducted from annual enterprise allocation.'
        },
        {
          title: '4. Enterprise Account Management',
          content: 'Enterprise staff accounts are issued and provisioned by the parent organization. Personal modification is restricted to profile imagery to ensure corporate compliance.'
        }
      ]
    },
    privacyPolicy: {
      lastUpdated: 'November 2026',
      sections: [
        {
          title: '1. Information We Collect',
          content: 'We collect account credentials, organization affiliation, check-in logs, and helpdesk communications to facilitate coworking access and facility support.'
        },
        {
          title: '2. Data Protection and Deletion',
          content: 'Users maintain the right to deactivate or delete their accounts. Discussion threads cleared via our helpdesk are permanently purged across all databases.'
        },
        {
          title: '3. Security Standards',
          content: 'All communication is encrypted using industry standard TLS protocols with strict role-based access control governing multi-tenant space segregation.'
        }
      ]
    }
  });
});

export default router;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../modules/users/user.model.js';
import { CoworkingOrganization } from '../modules/organizations/organization.model.js';
import { Location } from '../modules/locations/location.model.js';
import { MeetingRoom } from '../modules/rooms/room.model.js';
import { Company } from '../modules/companies/company.model.js';
import { AllowancePeriod, AllowanceLedgerEntry } from '../modules/allowances/allowance.model.js';
import { Booking } from '../modules/bookings/booking.model.js';
import { InventorySlot } from '../modules/inventory/inventory.model.js';
import { Invoice } from '../modules/billing/invoice.model.js';
import { PaymentRecord } from '../modules/payments/payment.model.js';
import { BlogPost } from '../modules/blogs/blog.model.js';
import { Notification } from '../modules/notifications/notification.model.js';
import { Ticket } from '../modules/tickets/ticket.model.js';
import { EmergencyOverride } from '../modules/overrides/override.model.js';
import { 
  UserRole, 
  BlogPostStatus, 
  NotificationType, 
  BookingStatus, 
  InvoiceStatus, 
  PaymentMethod, 
  PaymentStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  OverrideRequestStatus
} from '../types/index.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is required in environment');
  process.exit(1);
}

async function runSeed() {
  console.log('--- Connecting to MongoDB for clean re-seeding ---');
  await mongoose.connect(MONGO_URI!);
  console.log('Connected to Atlas Cluster.');

  console.log('Clearing all collections...');
  await Promise.all([
    User.deleteMany({}),
    CoworkingOrganization.deleteMany({}),
    Location.deleteMany({}),
    MeetingRoom.deleteMany({}),
    Company.deleteMany({}),
    AllowancePeriod.deleteMany({}),
    AllowanceLedgerEntry.deleteMany({}),
    Booking.deleteMany({}),
    InventorySlot.deleteMany({}),
    Invoice.deleteMany({}),
    PaymentRecord.deleteMany({}),
    BlogPost.deleteMany({}),
    Notification.deleteMany({}),
    Ticket.deleteMany({}),
    EmergencyOverride.deleteMany({})
  ]);
  console.log('All collections cleared cleanly.');

  const superAdminPasswordHash = await bcrypt.hash('Nikhil@123', 10);
  const cwsAdminPasswordHash = await bcrypt.hash('Cws@2026', 10);
  const aptaClientPasswordHash = await bcrypt.hash('Apta@2026', 10);
  const clientPasswordHash = await bcrypt.hash('Client@123', 10);
  const kavyaClientPasswordHash = await bcrypt.hash('Kavya@2026', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10);

  console.log('Seeding Super Admin: paidynikhil@gmail.com ...');
  const superAdmin = await User.create({
    name: 'Nikhil Paidy',
    email: 'paidynikhil@gmail.com',
    passwordHash: superAdminPasswordHash,
    role: UserRole.SUPER_ADMIN,
    phone: '+91 98450 99887',
    isActive: true
  });

  console.log('Seeding Organization: CWS ONE Coworking Space ...');
  const organization = await CoworkingOrganization.create({
    name: 'CWS ONE Coworking Space',
    slug: 'cws-one-coworking',
    email: 'support@cwsone.com',
    phone: '+91 98450 12345',
    website: 'https://cwsone.in',
    address: {
      street: 'Prestige Meridian, 29 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001'
    },
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    settings: {
      allowOverdraft: true,
      requireBookingApproval: false,
      cancellationNoticeHours: 2
    },
    isActive: true
  });

  console.log('Seeding Coworking Admin: support@cwsone.com & cwsone@gmail.com ...');
  const adminUser = await User.create({
    name: 'CWS ONE Operations Director',
    email: 'support@cwsone.com',
    passwordHash: cwsAdminPasswordHash,
    role: UserRole.COWORKING_ADMIN,
    organizationId: organization._id,
    phone: '+91 98450 12345',
    isActive: true
  });

  await User.create({
    name: 'CWS ONE Helpdesk Manager',
    email: 'cwsone@gmail.com',
    passwordHash: cwsAdminPasswordHash,
    role: UserRole.COWORKING_ADMIN,
    organizationId: organization._id,
    phone: '+91 98450 12346',
    isActive: true
  });

  console.log('Seeding Hub Locations in Bangalore, Mumbai, and Hyderabad...');
  const locationBLR = await Location.create({
    organizationId: organization._id,
    name: 'CWS ONE Horizon, MG Road',
    slug: 'cws-one-horizon-mg-road',
    address: {
      street: 'Prestige Meridian, 29 MG Road, Central Business District',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001'
    },
    timezone: 'Asia/Kolkata',
    businessHours: [
      { dayOfWeek: 0, openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 6, openTime: '09:00', closeTime: '20:00', isOpen: true }
    ],
    isActive: true
  });

  const locationBOM = await Location.create({
    organizationId: organization._id,
    name: 'CWS ONE Signature, BKC',
    slug: 'cws-one-signature-bkc',
    address: {
      street: 'G Block, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400051'
    },
    timezone: 'Asia/Kolkata',
    businessHours: [
      { dayOfWeek: 0, openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 6, openTime: '09:00', closeTime: '20:00', isOpen: true }
    ],
    isActive: true
  });

  const locationHYD = await Location.create({
    organizationId: organization._id,
    name: 'CWS ONE Cyber City, HITEC',
    slug: 'cws-one-cyber-city-hitec',
    address: {
      street: 'Phase 2, HITEC City, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500081'
    },
    timezone: 'Asia/Kolkata',
    businessHours: [
      { dayOfWeek: 0, openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 6, openTime: '09:00', closeTime: '20:00', isOpen: true }
    ],
    isActive: true
  });

  console.log('Seeding Meeting Rooms with realistic INR pricing...');
  const roomBLR1 = await MeetingRoom.create({
    organizationId: organization._id,
    locationId: locationBLR._id,
    name: 'The Sovereign Boardroom',
    slug: 'the-sovereign-boardroom-blr',
    code: 'BLR-SOV-01',
    capacity: 16,
    hourlyRate: 1800,
    bufferMinutes: 15,
    slotIntervalMinutes: 30,
    minBookingMinutes: 30,
    maxBookingMinutes: 480,
    amenities: [
      'Dual 85" 4K HDR Displays',
      'Cisco Room Kit Pro',
      'Polycom Trio Acoustic Array',
      'Panoramic MG Road Skyline Views',
      'Barista Espresso Service',
      'Magnetic Glass Whiteboard'
    ],
    description:
      'Premier executive boardroom in MG Road featuring studio-grade telepresence acoustics, custom walnut conference table, and encrypted high-definition AV feeds.',
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    ],
    isActive: true
  });

  const roomBLR2 = await MeetingRoom.create({
    organizationId: organization._id,
    locationId: locationBLR._id,
    name: 'Horizon Strategy Suite',
    slug: 'horizon-strategy-suite-blr',
    code: 'BLR-HOR-02',
    capacity: 10,
    hourlyRate: 950,
    bufferMinutes: 15,
    slotIntervalMinutes: 30,
    minBookingMinutes: 30,
    maxBookingMinutes: 360,
    amenities: [
      '75" Interactive 4K Touch Canvas',
      'Neat Bar Pro',
      'Digital Whiteboarding',
      'Herman Miller Ergonomic Seating',
      'Wi-Fi 6E High-Speed Network'
    ],
    description:
      'Tailored for executive strategic alignment, quarterly board reviews, and hybrid product roadmap sessions with interactive digital canvas.',
    photos: [
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80'
    ],
    isActive: true
  });

  const roomBLR3 = await MeetingRoom.create({
    organizationId: organization._id,
    locationId: locationBLR._id,
    name: 'Vanguard Agile Pod',
    slug: 'vanguard-agile-pod-blr',
    code: 'BLR-VAN-03',
    capacity: 6,
    hourlyRate: 600,
    bufferMinutes: 15,
    slotIntervalMinutes: 30,
    minBookingMinutes: 30,
    maxBookingMinutes: 240,
    amenities: [
      '65" 4K OLED Display',
      'Logitech Rally Bar Mini',
      'Magnetic Glass Whiteboard',
      'Acoustic Felt Wall Paneling'
    ],
    description:
      'Agile breakout studio tailored for engineering sprint syncs, architectural reviews, and cross-functional team standups.',
    photos: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ],
    isActive: true
  });

  const roomBOM1 = await MeetingRoom.create({
    organizationId: organization._id,
    locationId: locationBOM._id,
    name: 'BKC Executive Council Room',
    slug: 'bkc-executive-council-room-bom',
    code: 'BOM-BKC-01',
    capacity: 14,
    hourlyRate: 2200,
    bufferMinutes: 15,
    slotIntervalMinutes: 30,
    minBookingMinutes: 30,
    maxBookingMinutes: 480,
    amenities: [
      'Dual 75" 4K HDR Displays',
      'Ceiling Array Beamforming Mics',
      'Private Butler & Beverage Bar',
      'Panoramic BKC Financial Hub Views',
      'Automated Privacy Glass'
    ],
    description:
      'Prestigious executive meeting venue in Bandra Kurla Complex designed for institutional investor conferences, private M&A deliberations, and board votes.',
    photos: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80'
    ],
    isActive: true
  });

  const roomBOM2 = await MeetingRoom.create({
    organizationId: organization._id,
    locationId: locationBOM._id,
    name: 'Acoustic Focus Studio',
    slug: 'acoustic-focus-studio-bom',
    code: 'BOM-FOC-02',
    capacity: 4,
    hourlyRate: 750,
    bufferMinutes: 15,
    slotIntervalMinutes: 30,
    minBookingMinutes: 30,
    maxBookingMinutes: 240,
    amenities: [
      'STC 52 Sound Isolation Acoustic Walls',
      'Rode Broadcast Microphone',
      '4K Studio Webcam',
      'High-Speed Symmetrical Fiber'
    ],
    description:
      'Ultra-private acoustic workspace in BKC for high-stakes investor calls, confidential executive recruitment, and audio/video interviews.',
    photos: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    isActive: true
  });

  const roomHYD1 = await MeetingRoom.create({
    organizationId: organization._id,
    locationId: locationHYD._id,
    name: 'Cyber Innovators Forum',
    slug: 'cyber-innovators-forum-hyd',
    code: 'HYD-CYB-01',
    capacity: 12,
    hourlyRate: 1400,
    bufferMinutes: 15,
    slotIntervalMinutes: 30,
    minBookingMinutes: 30,
    maxBookingMinutes: 360,
    amenities: [
      '75" 4K Video Presentation Wall',
      'Poly Studio X70 AI Camera',
      'Ceiling Beamforming Array',
      'Smart Whiteboard Instant Cloud Sync',
      'Nespresso Artisan Coffee Lounge'
    ],
    description:
      'High-tech presentation suite in HITEC City featuring AI speaker tracking, automated digital whiteboarding, and ergonomic executive leather seating.',
    photos: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80'
    ],
    isActive: true
  });

  console.log('Seeding Client Company: Aptapace Private Limited ...');
  const clientCompany = await Company.create({
    organizationId: organization._id,
    name: 'Aptapace Private Limited',
    billingEmail: 'aptapace@gmail.com',
    phone: '+91 98450 88990',
    gstin: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    verificationStatus: 'VERIFIED',
    verificationProofUrl: 'https://cwsone.in/docs/aptapace-incorporation-gst.pdf',
    status: 'ACTIVE',
    allowanceConfig: {
      monthlyFreeHours: 20,
      annualFreeHours: 240,
      allowancePeriodType: 'MONTHLY',
      additionalHourlyRate: 800,
      currency: 'INR',
      billingCycleStartDay: 1,
      rolloverAllowed: false
    }
  });

  console.log('Seeding Second Client Company: Kavya Infotech Solutions ...');
  const secondCompany = await Company.create({
    organizationId: organization._id,
    name: 'Kavya Infotech Solutions Pvt Ltd',
    billingEmail: 'kavya@gmail.com',
    phone: '+91 98450 77112',
    gstin: '29AABCU9603R1ZM',
    panNumber: 'AABCU9603R',
    verificationStatus: 'VERIFIED',
    verificationProofUrl: 'https://cwsone.in/docs/kavya-gst-certificate.pdf',
    status: 'ACTIVE',
    allowanceConfig: {
      monthlyFreeHours: 15,
      annualFreeHours: 180,
      allowancePeriodType: 'MONTHLY',
      additionalHourlyRate: 800,
      currency: 'INR',
      billingCycleStartDay: 1,
      rolloverAllowed: false
    }
  });

  console.log('Seeding Client Users: aptapace@gmail.com & client@aptapace.com ...');
  const clientOwner = await User.create({
    name: 'Aditya Sharma',
    email: 'aptapace@gmail.com',
    passwordHash: aptaClientPasswordHash,
    role: UserRole.COMPANY_OWNER,
    organizationId: organization._id,
    companyId: clientCompany._id,
    phone: '+91 98450 88990',
    isActive: true
  });

  const clientMember = await User.create({
    name: 'Pooja Verma',
    email: 'client@aptapace.com',
    passwordHash: clientPasswordHash,
    role: UserRole.COMPANY_BOOKING_MANAGER,
    organizationId: organization._id,
    companyId: clientCompany._id,
    phone: '+91 98450 44556',
    isActive: true
  });

  console.log('Seeding Client Owner for Kavya Infotech: kavya@gmail.com ...');
  const kavyaOwner = await User.create({
    name: 'Kavya Ramanathan',
    email: 'kavya@gmail.com',
    passwordHash: kavyaClientPasswordHash,
    role: UserRole.COMPANY_OWNER,
    organizationId: organization._id,
    companyId: secondCompany._id,
    phone: '+91 98450 77112',
    designation: 'Managing Director',
    isActive: true
  });

  console.log('Seeding Allowance Period & Ledger for Aptapace Private Limited ...');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const startOfMonth = new Date(Date.UTC(currentYear, now.getMonth(), 1, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(currentYear, now.getMonth() + 1, 0, 23, 59, 59, 999));

  const allowance = await AllowancePeriod.create({
    companyId: clientCompany._id,
    organizationId: organization._id,
    periodYear: currentYear,
    periodMonth: currentMonth,
    periodStart: startOfMonth,
    periodEnd: endOfMonth,
    grantedHours: 20,
    consumedHours: 2,
    reservedHours: 2,
    balanceHours: 16
  });

  await AllowanceLedgerEntry.create([
    {
      companyId: clientCompany._id,
      organizationId: organization._id,
      allowancePeriodId: allowance._id,
      changeType: 'GRANT',
      hours: 20,
      balanceAfter: 20,
      notes: `Monthly complimentary quota grant of 20 hours for ${currentMonth}/${currentYear}`,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      companyId: clientCompany._id,
      organizationId: organization._id,
      allowancePeriodId: allowance._id,
      changeType: 'CONSUME',
      hours: -2,
      balanceAfter: 18,
      notes: 'Consumed 2 hr(s) for booking BK-2026-0988 (Horizon Strategy Suite)',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      companyId: clientCompany._id,
      organizationId: organization._id,
      allowancePeriodId: allowance._id,
      changeType: 'RESERVE',
      hours: -2,
      balanceAfter: 16,
      notes: 'Reserved 2 hr(s) for booking BK-2026-1001 (The Sovereign Boardroom)',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      companyId: clientCompany._id,
      organizationId: organization._id,
      allowancePeriodId: allowance._id,
      changeType: 'RELEASE',
      hours: 1,
      balanceAfter: 16,
      notes: 'Released 1 hr(s) from cancelled booking BK-2026-0985 (Vanguard Agile Pod)',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ]);

  const allowanceKavya = await AllowancePeriod.create({
    companyId: secondCompany._id,
    organizationId: organization._id,
    periodYear: currentYear,
    periodMonth: currentMonth,
    periodStart: startOfMonth,
    periodEnd: endOfMonth,
    grantedHours: 15,
    consumedHours: 0,
    reservedHours: 0,
    balanceHours: 15
  });

  await AllowanceLedgerEntry.create({
    companyId: secondCompany._id,
    organizationId: organization._id,
    allowancePeriodId: allowanceKavya._id,
    changeType: 'GRANT',
    hours: 15,
    balanceAfter: 15,
    notes: `Monthly complimentary quota grant of 15 hours for ${currentMonth}/${currentYear}`,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  });

  console.log('Seeding Realistic Bookings with all statuses for Aptapace Private Limited ...');
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(12, 0, 0, 0); 

  const upcomingBooking = await Booking.create({
    bookingNumber: 'BK-2026-1001',
    organizationId: organization._id,
    locationId: locationBLR._id,
    roomId: roomBLR1._id,
    companyId: clientCompany._id,
    bookedByUserId: clientOwner._id,
    title: 'Executive Boardroom Quarterly Review',
    purpose: 'Strategic Q3 Review with Board of Directors and Founders',
    attendeeCount: 12,
    startTime: tomorrowStart,
    endTime: tomorrowEnd,
    durationHours: 2,
    status: BookingStatus.CONFIRMED,
    pricingSnapshot: {
      baseHourlyRate: 1800,
      freeHoursApplied: 2,
      chargeableHours: 0,
      additionalHourlyRate: 800,
      totalAmount: 0,
      currency: 'INR'
    }
  });

  const slot1 = new Date(tomorrowStart);
  const slot2 = new Date(tomorrowStart.getTime() + 30 * 60 * 1000);
  const slot3 = new Date(tomorrowStart.getTime() + 60 * 60 * 1000);
  const slot4 = new Date(tomorrowStart.getTime() + 90 * 60 * 1000);

  await InventorySlot.create([
    {
      roomId: roomBLR1._id,
      organizationId: organization._id,
      companyId: clientCompany._id,
      slotTime: slot1,
      bookingId: upcomingBooking._id,
      status: 'CONFIRMED'
    },
    {
      roomId: roomBLR1._id,
      organizationId: organization._id,
      companyId: clientCompany._id,
      slotTime: slot2,
      bookingId: upcomingBooking._id,
      status: 'CONFIRMED'
    },
    {
      roomId: roomBLR1._id,
      organizationId: organization._id,
      companyId: clientCompany._id,
      slotTime: slot3,
      bookingId: upcomingBooking._id,
      status: 'CONFIRMED'
    },
    {
      roomId: roomBLR1._id,
      organizationId: organization._id,
      companyId: clientCompany._id,
      slotTime: slot4,
      bookingId: upcomingBooking._id,
      status: 'CONFIRMED'
    }
  ]);

  const pastStart = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  pastStart.setHours(14, 0, 0, 0);
  const pastEnd = new Date(pastStart);
  pastEnd.setHours(16, 0, 0, 0);

  await Booking.create({
    bookingNumber: 'BK-2026-0988',
    organizationId: organization._id,
    locationId: locationBLR._id,
    roomId: roomBLR2._id,
    companyId: clientCompany._id,
    bookedByUserId: clientOwner._id,
    title: 'Leadership Strategy Session',
    purpose: 'Product Engineering Alignment and Sprint OKRs',
    attendeeCount: 8,
    startTime: pastStart,
    endTime: pastEnd,
    durationHours: 2,
    status: BookingStatus.COMPLETED,
    checkedInAt: pastStart,
    pricingSnapshot: {
      baseHourlyRate: 950,
      freeHoursApplied: 2,
      chargeableHours: 0,
      additionalHourlyRate: 800,
      totalAmount: 0,
      currency: 'INR'
    }
  });

  const cancelledStart = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  cancelledStart.setHours(11, 0, 0, 0);
  const cancelledEnd = new Date(cancelledStart);
  cancelledEnd.setHours(12, 0, 0, 0);

  await Booking.create({
    bookingNumber: 'BK-2026-0985',
    organizationId: organization._id,
    locationId: locationBLR._id,
    roomId: roomBLR3._id,
    companyId: clientCompany._id,
    bookedByUserId: clientOwner._id,
    title: 'Vendor Partnership Review',
    purpose: 'Quarterly evaluation of cloud infrastructure vendors',
    attendeeCount: 4,
    startTime: cancelledStart,
    endTime: cancelledEnd,
    durationHours: 1,
    status: BookingStatus.CANCELLED,
    cancellationReason: 'Client requested cancellation due to travel rescheduling',
    cancelledAt: new Date(cancelledStart.getTime() - 2 * 60 * 60 * 1000),
    cancelledBy: clientOwner._id,
    pricingSnapshot: {
      baseHourlyRate: 600,
      freeHoursApplied: 0,
      chargeableHours: 0,
      additionalHourlyRate: 800,
      totalAmount: 0,
      currency: 'INR'
    }
  });

  const expiredStart = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  expiredStart.setHours(16, 0, 0, 0);
  const expiredEnd = new Date(expiredStart);
  expiredEnd.setHours(17, 0, 0, 0);

  await Booking.create({
    bookingNumber: 'BK-2026-0970',
    organizationId: organization._id,
    locationId: locationBLR._id,
    roomId: roomBLR2._id,
    companyId: clientCompany._id,
    bookedByUserId: clientOwner._id,
    title: 'Candidate Interview Round',
    purpose: 'Senior Staff Frontend Architect Screening',
    attendeeCount: 3,
    startTime: expiredStart,
    endTime: expiredEnd,
    durationHours: 1,
    status: BookingStatus.EXPIRED,
    cancellationReason: 'Reservation window expired without check-in confirmation',
    cancelledAt: expiredStart,
    pricingSnapshot: {
      baseHourlyRate: 950,
      freeHoursApplied: 0,
      chargeableHours: 0,
      additionalHourlyRate: 800,
      totalAmount: 0,
      currency: 'INR'
    }
  });

  console.log('Seeding Realistic INR Invoices for Aptapace Private Limited ...');
  
  const inv1 = await Invoice.create({
    invoiceNumber: 'INV-2026-10-001',
    organizationId: organization._id,
    companyId: clientCompany._id,
    billingPeriodStart: new Date(Date.UTC(currentYear, now.getMonth() - 1, 1)),
    billingPeriodEnd: new Date(Date.UTC(currentYear, now.getMonth(), 0, 23, 59, 59)),
    issueDate: new Date(Date.UTC(currentYear, now.getMonth(), 1)),
    dueDate: new Date(Date.UTC(currentYear, now.getMonth(), 15)),
    lineItems: [
      {
        description: 'Meeting Room Additional Hours (6 hrs @ ₹800/hr)',
        quantityHours: 6,
        unitPrice: 800,
        amount: 4800
      }
    ],
    subtotal: 4800,
    taxAmount: 0,
    totalAmount: 4800,
    amountPaid: 4800,
    amountDue: 0,
    currency: 'INR',
    status: InvoiceStatus.PAID,
    notes: 'Remitted via Corporate NEFT / IMPS. Payment verified.'
  });

  await PaymentRecord.create({
    receiptNumber: 'REC-2026-10-001',
    organizationId: organization._id,
    companyId: clientCompany._id,
    invoiceId: inv1._id,
    amount: 4800,
    currency: 'INR',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    paymentReference: 'NEFT-HDFC-98834710',
    paymentDate: new Date(Date.UTC(currentYear, now.getMonth(), 5)),
    status: PaymentStatus.VERIFIED,
    notes: 'Direct RTGS corporate bank transfer cleared',
    recordedByUserId: adminUser._id
  });

  await Invoice.create({
    invoiceNumber: 'INV-2026-10-002',
    organizationId: organization._id,
    companyId: clientCompany._id,
    billingPeriodStart: startOfMonth,
    billingPeriodEnd: endOfMonth,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    lineItems: [
      {
        description: 'Chargeable Overdraft Meeting Hours (3 hrs @ ₹800/hr)',
        quantityHours: 3,
        unitPrice: 800,
        amount: 2400
      }
    ],
    subtotal: 2400,
    taxAmount: 0,
    totalAmount: 2400,
    amountPaid: 0,
    amountDue: 2400,
    currency: 'INR',
    status: InvoiceStatus.ISSUED,
    notes: 'Monthly overage statement. Please remit via Corporate NEFT or UPI to CWS ONE.'
  });

  console.log('Seeding 4 High-Quality Blog Posts in INR Context ...');
  await BlogPost.create([
    {
      title: 'The Evolution of Premium Hybrid Workspaces in India: 2026 Outlook',
      slug: 'evolution-of-premium-hybrid-workspaces-india-2026',
      excerpt:
        'How enterprise Bengaluru and Mumbai campuses are adopting double-entry meeting room allowances, studio telepresence, and STC 50+ acoustics.',
      content: `
# The Evolution of Premium Hybrid Workspaces in India: 2026 Outlook

The landscape of corporate real estate across India's top metropolitan hubs—Bangalore, Mumbai, and Hyderabad—has transitioned from static multi-year leases to dynamic executive campus memberships.

## Why Companies Are Choosing Dedicated Executive Hubs

Modern corporate leadership teams require high-specification physical venues for critical alignment:
- **Boardroom Approvals & Annual General Meetings**: Private STC 50+ soundproof chambers with encrypted telepresence.
- **Enterprise Client Pitches**: Ultra-reliable high-definition presentation infrastructure that reflects corporate prestige.
- **Sprint War-Rooms**: Interactive touch surfaces with instant cloud synchronization.

## Transparent Quota Governance in Indian Rupees

Rather than unpredictable billing surprises, our platform guarantees:
1. **Predictable Monthly Free Quotas**: Every corporate member receives a fixed bucket of complimentary meeting hours (e.g. 20 hrs/month).
2. **Transparent Overdraft Protection**: Additional hours transition automatically to pre-negotiated corporate rates (e.g. ₹800/hr) without interrupting executive sessions.
3. **Audited Double-Entry Ledgers**: Every reservation hold, cancellation refund, and consumption event is recorded with complete audit precision.
      `,
      author: {
        name: 'Nikhil Paidy',
        role: 'Platform Architect & Founder'
      },
      categories: ['Workspace Trends'],
      tags: ['Hybrid Work', 'Executive Hubs', 'Acoustics', 'Enterprise India'],
      readTimeMinutes: 5,
      coverImageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Optimizing Corporate Meeting Room Quotas & Financial Governance',
      slug: 'optimizing-corporate-meeting-room-quotas-governance',
      excerpt:
        'A comprehensive guide for finance heads and office administrators to eliminate phantom reservations and enforce transparent room allowance policies.',
      content: `
# Optimizing Corporate Meeting Room Quotas & Financial Governance

Meeting room waste is one of the most persistent operational costs for corporate tenants. Ghost bookings—where reserved rooms sit unoccupied while other teams are turned away—drain corporate productivity.

## Double-Entry Quota Accounting

Our reservation engine treats corporate meeting hours like financial capital:
- **Instant Escrow Holds**: When an employee books a room, the required complimentary hours are locked in escrow immediately.
- **Automated Refund on Cancellation**: If plans change and a reservation is cancelled within policy (e.g. 2 hours notice), the hours are refunded to the corporate pool in real-time.
- **Zero Double-Bookings**: Atomic inventory locking at the millisecond database level prevents overlapping reservations entirely.
      `,
      author: {
        name: 'CWS ONE Advisory',
        role: 'Facility Operations'
      },
      categories: ['Operations & Finance'],
      tags: ['Cost Control', 'Quota Governance', 'Enterprise Billing', 'INR'],
      readTimeMinutes: 6,
      coverImageUrl:
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Acoustic Engineering in Executive Boardrooms: Beyond Soundproofing',
      slug: 'acoustic-engineering-executive-boardrooms',
      excerpt:
        'How NC-25 background ratings, beamforming microphone arrays, and decoupled wall cavities create pristine telepresence audio.',
      content: `
# Acoustic Engineering in Executive Boardrooms: Beyond Soundproofing

In hybrid board meetings, audio fidelity is paramount. When board members join remotely from Singapore or London to converse with directors in MG Road, Bangalore, echo and muffled voices directly disrupt decision-making.

## Core Architectural Specifications

- **Decoupled Dual-Stud Drywalls**: Attenuates external noise by over 52 decibels.
- **Ceiling Baffle Geometry**: High-density fiberglass clouds tuned to absorb frequencies between 250 Hz and 4 kHz.
- **Intelligent Auto-Framing Cameras**: AI cameras track active speakers without manual pan-tilt-zoom adjustments.
      `,
      author: {
        name: 'Nikhil Paidy',
        role: 'Platform Architect'
      },
      categories: ['Architecture & Tech'],
      tags: ['Acoustics', 'Telepresence', 'Architecture', 'Hardware'],
      readTimeMinutes: 4,
      coverImageUrl:
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Zero Double-Bookings: The Distributed Locking Architecture',
      slug: 'zero-double-bookings-distributed-locking-architecture',
      excerpt:
        'The database algorithms and half-open time interval models ensuring zero reservation conflicts across hundreds of simultaneous requests.',
      content: `
# Zero Double-Bookings: The Distributed Locking Architecture

When two teams schedule the same executive boardroom for an investor sync, failure is unacceptable.

## Half-Open Interval Model \`[startTime, endTime)\`

We model discrete meeting slots as half-open time ranges. A 10:00 to 11:00 meeting and an 11:00 to 12:00 meeting share an exact timestamp boundary with zero collision.

Combined with unique compound database indexes on \`{ roomId: 1, slotTime: 1 }\`, duplicate submissions are rejected at the storage engine level with an immediate HTTP 409 Conflict.
      `,
      author: {
        name: 'Nikhil Paidy',
        role: 'Platform Architect'
      },
      categories: ['Engineering & Architecture'],
      tags: ['MongoDB', 'ACID Transactions', 'Concurrency', 'Algorithms'],
      readTimeMinutes: 7,
      coverImageUrl:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    }
  ]);

  console.log('Seeding Staff Accounts for Super Admin, Coworking Admin, and Client Company...');
  const superAdminStaff = await User.create({
    name: 'Priya Sundaram',
    email: 'priya.ops@nikvora.com',
    passwordHash: staffPasswordHash,
    role: UserRole.SUPER_ADMIN_STAFF,
    phone: '+91 98450 11223',
    designation: 'Platform Operations Lead',
    permissions: ['view_spaces', 'view_analytics', 'manage_blogs'],
    parentUserId: superAdmin._id,
    isActive: true
  });

  const coworkingAdminStaff = await User.create({
    name: 'Rohan Mehra',
    email: 'desk.mgroad@cwsone.com',
    passwordHash: staffPasswordHash,
    role: UserRole.COWORKING_ADMIN_STAFF,
    organizationId: organization._id,
    phone: '+91 98450 33445',
    designation: 'Front Desk & Facilities Executive',
    permissions: ['manage_bookings', 'manage_tickets', 'view_clients', 'manage_rooms'],
    parentUserId: adminUser._id,
    isActive: true
  });

  const clientStaff = await User.create({
    name: 'Ananya Deshmukh',
    email: 'hr@aptapace.com',
    passwordHash: staffPasswordHash,
    role: UserRole.COMPANY_STAFF,
    organizationId: organization._id,
    companyId: clientCompany._id,
    phone: '+91 98450 55667',
    designation: 'People & Culture Partner',
    permissions: ['book_rooms', 'view_allowance', 'raise_tickets'],
    parentUserId: clientOwner._id,
    isActive: true
  });

  console.log('Seeding Realistic Complaint & Facilities Tickets...');
  await Ticket.create([
    {
      ticketNumber: 'TCK-2026-001',
      organizationId: organization._id,
      companyId: clientCompany._id,
      raisedByUserId: clientOwner._id,
      locationId: locationBLR._id,
      category: TicketCategory.WIFI_NETWORK,
      priority: TicketPriority.HIGH,
      title: '5GHz Executive Boardroom SSID Dropping Packets',
      description: 'Experiencing 15% packet drops during Microsoft Teams video calls in Boardroom BLR-SOV-01.',
      status: TicketStatus.RESOLVED,
      resolutionNotes: 'Replaced AP channel configuration to UNII-3 DFS clean band. Verified 350 Mbps symmetrical throughput.',
      resolvedByUserId: adminUser._id,
      resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      comments: [
        {
          authorId: clientOwner._id,
          authorName: 'Aditya Sharma',
          authorRole: 'Client Owner',
          message: 'Packets were dropping during board presentation.',
          createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000)
        },
        {
          authorId: adminUser._id,
          authorName: 'CWS ONE Operations Director',
          authorRole: 'Coworking Admin',
          message: 'AP firmware restarted and frequency shifted. Resolved.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      ticketNumber: 'TCK-2026-002',
      organizationId: organization._id,
      companyId: clientCompany._id,
      raisedByUserId: clientMember._id,
      locationId: locationBLR._id,
      category: TicketCategory.AIR_CONDITIONING,
      priority: TicketPriority.MEDIUM,
      title: 'Boardroom Thermostat Setpoint Calibration',
      description: 'Thermostat in Horizon Suite is reading 26°C despite setpoint of 21°C. Please inspect cooling duct dampers.',
      status: TicketStatus.IN_PROGRESS,
      comments: [
        {
          authorId: clientMember._id,
          authorName: 'Pooja Verma',
          authorRole: 'Client Staff',
          message: 'Room was getting quite warm this afternoon.',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ]
    },
    {
      ticketNumber: 'TCK-2026-003',
      organizationId: organization._id,
      companyId: secondCompany._id,
      raisedByUserId: kavyaOwner._id,
      locationId: locationBLR._id,
      category: TicketCategory.WATER_REFRESHMENTS,
      priority: TicketPriority.LOW,
      title: 'Espresso Bean Restock - 4th Floor Executive Pantry',
      description: 'Espresso machine hopper needs medium-dark roast arabica beans restocked for visiting partners.',
      status: TicketStatus.OPEN,
      comments: []
    }
  ]);

  console.log('Seeding Emergency Slot Override Request...');
  await EmergencyOverride.create({
    organizationId: organization._id,
    roomId: roomBLR1._id,
    requestingCompanyId: secondCompany._id,
    requestingUserId: kavyaOwner._id,
    existingBookingId: upcomingBooking._id,
    existingCompanyId: clientCompany._id,
    requestedStartTime: upcomingBooking.startTime,
    requestedEndTime: upcomingBooking.endTime,
    urgencyReason: 'Urgent European Investor Audit delegation arriving unexpectedly. STC 50+ boardroom with telepresence required.',
    attendeeCount: 14,
    status: OverrideRequestStatus.PENDING
  });

  console.log('Seeding Realistic Notifications ...');
  await Notification.create([
    {
      recipientUserId: superAdmin._id,
      title: 'CWS ONE Platform Initialization Complete',
      message: 'System initialization complete. Database clean seeded with CWS ONE and Aptapace Private Limited.',
      type: 'SYSTEM',
      isRead: false
    },
    {
      recipientUserId: adminUser._id,
      organizationId: organization._id,
      title: 'Aptapace Private Limited Active',
      message: 'Client company Aptapace Private Limited onboarded with 20 complimentary monthly meeting hours.',
      type: 'SYSTEM',
      isRead: false
    },
    {
      recipientUserId: clientOwner._id,
      organizationId: organization._id,
      title: 'Reservation Confirmed: The Sovereign Boardroom',
      message: 'Your reservation BK-2026-1001 for tomorrow at 10:00 AM IST has been locked and confirmed.',
      type: NotificationType.BOOKING_CONFIRMED,
      isRead: false
    },
    {
      recipientUserId: clientOwner._id,
      organizationId: organization._id,
      title: 'Monthly Complimentary Quota Allocated',
      message: '20 free hours meeting room allowance has been credited to Aptapace Private Limited for October 2026.',
      type: NotificationType.ALLOWANCE_GRANTED,
      isRead: false
    }
  ]);

  console.log('--- SEEDING COMPLETE ---');
  console.log('Summary of Seeded Production Accounts:');
  console.log('1. Super Admin: paidynikhil@gmail.com / Nikhil@123 (Nikhil Paidy)');
  console.log('   Super Admin Staff: priya.ops@nikvora.com / Staff@123');
  console.log('2. Coworking Admin: support@cwsone.com / Cws@2026 (CWS ONE Coworking Space)');
  console.log('   Alias Admin: cwsone@gmail.com / Cws@2026');
  console.log('   Coworking Admin Staff: desk.mgroad@cwsone.com / Staff@123');
  console.log('3. Client Owner 1: aptapace@gmail.com / Apta@2026 (Aptapace Private Limited)');
  console.log('   Client Member 1: client@aptapace.com / Client@123');
  console.log('   Client Staff 1: hr@aptapace.com / Staff@123');
  console.log('4. Client Owner 2: kavya@gmail.com / Kavya@2026 (Kavya Infotech Solutions)');
  console.log('5. Currency: INR (₹) throughout all screens');

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});

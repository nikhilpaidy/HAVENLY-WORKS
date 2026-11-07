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
  TicketStatus
} from '../types/index.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is required in environment');
  process.exit(1);
}

async function runSeed() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI!);

  console.log('Clearing old collections...');
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

  const superAdminPasswordHash = await bcrypt.hash('Nikhil@123', 10);
  const cwsAdminPasswordHash = await bcrypt.hash('Cws@2026', 10);
  const aptaClientPasswordHash = await bcrypt.hash('Apta@2026', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10);

  const superAdmin = await User.create({
    name: 'Nikhil Paidy',
    email: 'paidynikhil@gmail.com',
    passwordHash: superAdminPasswordHash,
    role: UserRole.SUPER_ADMIN,
    phone: '+91 98450 99887',
    isActive: true
  });

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
      cancellationWindowHours: 2,
      maxAdvanceBookingDays: 60
    },
    isActive: true
  });

  const cwsAdmin = await User.create({
    name: 'CWS Admin',
    email: 'cwsone@gmail.com',
    passwordHash: cwsAdminPasswordHash,
    role: UserRole.COWORKING_ADMIN,
    organizationId: organization._id,
    phone: '+91 98450 12345',
    isActive: true
  });

  const locations = await Location.create([
    {
      organizationId: organization._id,
      name: 'The Nexora Space',
      slug: 'the-nexora-space',
      address: {
        street: '789 Park Avenue, 100ft Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560038'
      },
      latitude: 12.9784,
      longitude: 77.6408,
      geoLocation: {
        type: 'Point',
        coordinates: [77.6408, 12.9784]
      },
      phone: '+91 98450 12345',
      email: 'nexora@cwsone.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Olivia Bennett',
      managerPhone: '+91 98450 12345',
      managerEmail: 'olivia.bennett@cwsone.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'cwsone@icici',
      rating: 4.9,
      reviewCount: 2500,
      tagline: 'Modern Coworking Destination for Innovators',
      description: 'The Nexora Space is a modern coworking destination designed for professionals, entrepreneurs, freelancers, and growing enterprise teams.',
      amenities: ['High-Speed WiFi', 'Parking', 'Printer', 'Phone Booth', 'Coffee Bar', 'Meeting Rooms', '24/7 Access', 'Outdoor Terrace'],
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
      ],
      isActive: true
    },
    {
      organizationId: organization._id,
      name: 'The Workspace Club',
      slug: 'the-workspace-club',
      address: {
        street: '125 MG Road, Central Business District',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001'
      },
      latitude: 12.9754,
      longitude: 77.6094,
      geoLocation: {
        type: 'Point',
        coordinates: [77.6094, 12.9754]
      },
      phone: '+91 98450 12346',
      email: 'club@cwsone.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Jenny Doe',
      managerPhone: '+91 98450 12346',
      managerEmail: 'jenny.doe@cwsone.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'cwsone@icici',
      rating: 4.9,
      reviewCount: 1850,
      tagline: 'Elite Workspaces in the Heart of the CBD',
      description: 'Experience premium executive workspaces right in the city center with ergonomic furnishings, soundproof phone booths, and concierge support.',
      amenities: ['High-Speed WiFi', 'Valet Parking', 'Printer', 'Phone Booth', 'Artisanal Cafe', 'Boardrooms'],
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80'
      ],
      isActive: true
    },
    {
      organizationId: organization._id,
      name: 'The Virelle Workspace',
      slug: 'the-virelle-workspace',
      address: {
        street: '410 80ft Road, 4th Block, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560034'
      },
      latitude: 12.9352,
      longitude: 77.6245,
      geoLocation: {
        type: 'Point',
        coordinates: [77.6245, 12.9352]
      },
      phone: '+91 98450 12347',
      email: 'virelle@cwsone.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Shella Lemke',
      managerPhone: '+91 98450 12347',
      managerEmail: 'shella.lemke@cwsone.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'cwsone@icici',
      rating: 4.8,
      reviewCount: 1200,
      tagline: 'Vibrant Coworking for Startups & Scaleups',
      description: 'A thriving ecosystem in Koramangala surrounded by top tech startups, venture firms, and cafes.',
      amenities: ['High-Speed WiFi', 'Parking', 'Printer', 'Phone Booth', 'Unlimited Tea/Coffee', 'Podcast Studio'],
      images: [
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&q=80',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80'
      ],
      isActive: true
    },
    {
      organizationId: organization._id,
      name: 'The Lumora Hub',
      slug: 'the-lumora-hub',
      address: {
        street: 'Sector 1, 27th Main Road, HSR Layout',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560102'
      },
      latitude: 12.9121,
      longitude: 77.6446,
      geoLocation: {
        type: 'Point',
        coordinates: [77.6446, 12.9121]
      },
      phone: '+91 98450 12348',
      email: 'lumora@cwsone.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Dale Thiel',
      managerPhone: '+91 98450 12348',
      managerEmail: 'dale.thiel@cwsone.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'cwsone@icici',
      rating: 4.7,
      reviewCount: 980,
      tagline: 'Peaceful Work Haven in HSR Layout',
      description: 'Lush greenery, natural sunlight, ergonomic Herman Miller seating, and quiet focus zones.',
      amenities: ['High-Speed WiFi', 'Parking', 'Printer', 'Phone Booth', 'Coffee Bar', 'Rooftop Lounge'],
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
      ],
      isActive: true
    }
  ]);

  const [nexoraLoc, clubLoc, virelleLoc, lumoraLoc] = locations;

  const rooms = await MeetingRoom.create([
    {
      organizationId: organization._id,
      locationId: nexoraLoc._id,
      name: 'Open Flex Desk (Day Pass)',
      code: 'NX-DAY-01',
      workspaceType: 'DAY_PASS',
      description: 'Flexible hot desk with high-speed fiber internet and access to common lounge.',
      capacity: 1,
      hourlyRate: 150,
      dailyRate: 699,
      rating: 4.9,
      reviewCount: 420,
      saveBadge: 'Save 15%',
      photos: [
        'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
      ],
      amenities: ['High-Speed WiFi', 'Coffee Bar', 'Power Sockets', 'Phone Booth Access'],
      slotIntervalMinutes: 60,
      minBookingMinutes: 60,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: nexoraLoc._id,
      name: 'Executive Hot Desk',
      code: 'NX-DESK-02',
      workspaceType: 'HOT_DESK',
      description: 'Ergonomic seat with dual monitors available and quiet focus environment.',
      capacity: 1,
      hourlyRate: 200,
      dailyRate: 899,
      rating: 4.8,
      reviewCount: 310,
      saveBadge: 'Save 10%',
      photos: [
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80'
      ],
      amenities: ['High-Speed WiFi', 'Dual Monitor', 'Ergonomic Chair', 'Coffee Bar'],
      slotIntervalMinutes: 30,
      minBookingMinutes: 30,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: nexoraLoc._id,
      name: 'The Apex Conference Room',
      code: 'NX-CONF-01',
      workspaceType: 'MEETING_ROOM',
      description: '8-seater modern glass conference room with 4K display and video conferencing bar.',
      capacity: 8,
      hourlyRate: 650,
      dailyRate: 3800,
      rating: 4.9,
      reviewCount: 290,
      saveBadge: 'Save 10%',
      photos: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80'
      ],
      amenities: ['4K TV Display', 'Video Conferencing Bar', 'Whiteboard', 'Air Conditioning', 'High-Speed WiFi'],
      slotIntervalMinutes: 30,
      minBookingMinutes: 30,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: nexoraLoc._id,
      name: 'Grand Boardroom Horizon',
      code: 'NX-BOARD-01',
      workspaceType: 'BOARDROOM',
      description: '16-seater executive boardroom with soundproof walls and presentation controls.',
      capacity: 16,
      hourlyRate: 1200,
      dailyRate: 7500,
      rating: 5.0,
      reviewCount: 180,
      saveBadge: 'Save 20%',
      photos: [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80'
      ],
      amenities: ['Dual 75-inch Displays', 'Polycom Video System', 'Wireless Presentation', 'Coffee & Tea Service'],
      slotIntervalMinutes: 60,
      minBookingMinutes: 60,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: clubLoc._id,
      name: 'Club Dedicated Desk',
      code: 'CLUB-DESK-01',
      workspaceType: 'DEDICATED_DESK',
      description: 'Personal permanent desk with lockable storage in a quiet zone.',
      capacity: 1,
      hourlyRate: 250,
      dailyRate: 999,
      rating: 4.8,
      reviewCount: 140,
      saveBadge: 'Save 10%',
      photos: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80'
      ],
      amenities: ['Lockable Pedestal', 'High-Speed WiFi', 'Printer Access', 'Lounge Access'],
      slotIntervalMinutes: 60,
      minBookingMinutes: 60,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: clubLoc._id,
      name: 'Private Team Office (4 Seats)',
      code: 'CLUB-PRIV-01',
      workspaceType: 'PRIVATE_OFFICE',
      description: 'Private enclosed glass office for small teams with magnetic whiteboard and acoustic ceiling.',
      capacity: 4,
      hourlyRate: 850,
      dailyRate: 4900,
      rating: 4.9,
      reviewCount: 110,
      saveBadge: 'Save 10%',
      photos: [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
      ],
      amenities: ['Lockable Keycard Entry', 'Private Whiteboard', 'Dedicated AC Control', 'High-Speed LAN & WiFi'],
      slotIntervalMinutes: 60,
      minBookingMinutes: 60,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: virelleLoc._id,
      name: 'Virelle Innovation Suite',
      code: 'VIR-MEET-01',
      workspaceType: 'MEETING_ROOM',
      description: 'Creative meeting space with ergonomic modular tables and interactive touchscreen.',
      capacity: 10,
      hourlyRate: 750,
      dailyRate: 4200,
      rating: 4.9,
      reviewCount: 220,
      saveBadge: 'Save 15%',
      photos: [
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80'
      ],
      amenities: ['Touchscreen Interactive Display', 'Wireless Casting', 'Acoustic Soundproofing'],
      slotIntervalMinutes: 30,
      minBookingMinutes: 30,
      maxBookingMinutes: 480,
      isActive: true
    }
  ]);

  const company = await Company.create({
    organizationId: organization._id,
    name: 'Aptapace Private Limited',
    billingEmail: 'aptapace@gmail.com',
    phone: '+91 98451 55667',
    gstin: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    verificationStatus: 'VERIFIED',
    address: {
      street: 'Tower B, 4th Floor, Tech Hub',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038'
    },
    status: 'ACTIVE',
    allowanceConfig: {
      allowancePeriodType: 'MONTHLY',
      monthlyFreeHours: 20,
      additionalHourlyRate: 500,
      currency: 'INR',
      rolloverAllowed: true,
      billingCycleStartDay: 1
    }
  });

  const clientOwner = await User.create({
    name: 'Aptapace Director',
    email: 'aptapace@gmail.com',
    passwordHash: aptaClientPasswordHash,
    role: UserRole.COMPANY_OWNER,
    organizationId: organization._id,
    companyId: company._id,
    phone: '+91 98451 55667',
    isActive: true
  });

  const staffUsers = await User.create([
    {
      name: 'Aptapace HR Manager',
      email: 'hr@aptapace.com',
      passwordHash: staffPasswordHash,
      role: UserRole.COMPANY_STAFF,
      organizationId: organization._id,
      companyId: company._id,
      phone: '+91 98451 55668',
      isActive: true
    },
    {
      name: 'Aptapace Ops Lead',
      email: 'operations@aptapace.com',
      passwordHash: staffPasswordHash,
      role: UserRole.COMPANY_BOOKING_MANAGER,
      organizationId: organization._id,
      companyId: company._id,
      phone: '+91 98451 55669',
      isActive: true
    }
  ]);

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const allowance = await AllowancePeriod.create({
    companyId: company._id,
    organizationId: organization._id,
    periodYear: now.getFullYear(),
    periodMonth: now.getMonth() + 1,
    periodStart,
    periodEnd,
    grantedHours: 20,
    consumedHours: 2,
    reservedHours: 0,
    balanceHours: 18
  });

  await AllowanceLedgerEntry.create([
    {
      companyId: company._id,
      organizationId: organization._id,
      allowancePeriodId: allowance._id,
      changeType: 'GRANT',
      hours: 20,
      balanceAfter: 20,
      notes: 'Initial workspace quota granted'
    },
    {
      companyId: company._id,
      organizationId: organization._id,
      allowancePeriodId: allowance._id,
      changeType: 'CONSUME',
      hours: -2,
      balanceAfter: 18,
      notes: 'Consumed 2 hrs for strategy review meeting'
    }
  ]);

  const meetingRoom = rooms[2];
  const startTime1 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const endTime1 = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const activeBooking = await Booking.create({
    bookingNumber: 'BK-NX-2026-001',
    organizationId: organization._id,
    locationId: nexoraLoc._id,
    roomId: meetingRoom._id,
    companyId: company._id,
    bookedByUserId: clientOwner._id,
    isGuestBooking: false,
    workspaceType: 'MEETING_ROOM',
    bookingType: 'HOURLY',
    title: 'Product Roadmap & Strategy Alignment',
    purpose: 'Quarterly review with engineering and design team',
    attendeeCount: 6,
    startTime: startTime1,
    endTime: endTime1,
    durationHours: 2,
    status: BookingStatus.CONFIRMED,
    paymentMethod: 'ALLOWANCE',
    paymentStatus: 'VERIFIED',
    pricingSnapshot: {
      baseHourlyRate: meetingRoom.hourlyRate,
      freeHoursApplied: 2,
      chargeableHours: 0,
      additionalHourlyRate: 500,
      totalAmount: 0,
      currency: 'INR'
    }
  });

  const guestRoom = rooms[0];
  const guestStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const guestEnd = new Date(now.getTime() + 32 * 60 * 60 * 1000);

  const guestBooking = await Booking.create({
    bookingNumber: 'GST-NX-2026-092',
    organizationId: organization._id,
    locationId: nexoraLoc._id,
    roomId: guestRoom._id,
    isGuestBooking: true,
    guestName: 'Rahul Sharma',
    guestEmail: 'rahul.sharma@gmail.com',
    guestPhone: '+91 98765 43210',
    workspaceType: 'DAY_PASS',
    bookingType: 'DAY_PASS',
    title: 'Full Day Pass - Rahul Sharma',
    attendeeCount: 1,
    startTime: guestStart,
    endTime: guestEnd,
    durationHours: 8,
    status: BookingStatus.PENDING_CONFIRMATION,
    paymentMethod: 'UPI_QR',
    paymentStatus: 'PENDING_VERIFICATION',
    paymentReference: 'UPI-REF-8849204910',
    pricingSnapshot: {
      baseHourlyRate: 150,
      freeHoursApplied: 0,
      chargeableHours: 8,
      additionalHourlyRate: 150,
      totalAmount: 699,
      currency: 'INR'
    }
  });

  const pastStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const pastEnd = new Date(now.getTime() - 46 * 60 * 60 * 1000);

  await Booking.create({
    bookingNumber: 'BK-NX-2026-000',
    organizationId: organization._id,
    locationId: nexoraLoc._id,
    roomId: meetingRoom._id,
    companyId: company._id,
    bookedByUserId: clientOwner._id,
    isGuestBooking: false,
    workspaceType: 'MEETING_ROOM',
    bookingType: 'HOURLY',
    title: 'Client Onboarding Presentation',
    purpose: 'Kickoff meeting with overseas partners',
    attendeeCount: 5,
    startTime: pastStart,
    endTime: pastEnd,
    durationHours: 2,
    status: BookingStatus.COMPLETED,
    paymentMethod: 'ALLOWANCE',
    paymentStatus: 'VERIFIED',
    pricingSnapshot: {
      baseHourlyRate: meetingRoom.hourlyRate,
      freeHoursApplied: 2,
      chargeableHours: 0,
      additionalHourlyRate: 500,
      totalAmount: 0,
      currency: 'INR'
    }
  });

  await Ticket.create({
    ticketNumber: 'TCK-2026-001',
    organizationId: organization._id,
    locationId: nexoraLoc._id,
    companyId: company._id,
    raisedByUserId: clientOwner._id,
    title: 'High-Speed 5GHz WiFi SSID check on 2nd floor',
    description: 'The 5GHz network showed momentary packet drop during video call yesterday. Please inspect the access point.',
    category: TicketCategory.WIFI_NETWORK,
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    resolutionNotes: 'AP firmware updated and channel 36 dedicated. Signal quality verified.'
  });

  await Notification.create([
    {
      recipientUserId: clientOwner._id,
      organizationId: organization._id,
      companyId: company._id,
      title: 'Welcome to CWS ONE Coworking!',
      message: 'Your Aptapace workspace membership is live. Explore conference rooms and high-speed desks.',
      type: NotificationType.BROADCAST_ANNOUNCEMENT,
      isRead: false
    },
    {
      recipientUserId: clientOwner._id,
      organizationId: organization._id,
      companyId: company._id,
      title: 'Booking Confirmed: The Apex Conference Room',
      message: 'Your meeting is confirmed for today. Ref: #BK-NX-2026-001',
      type: NotificationType.BOOKING_CONFIRMED,
      isRead: true
    },
    {
      recipientUserId: cwsAdmin._id,
      organizationId: organization._id,
      title: 'New Guest Day Pass Request',
      message: 'Rahul Sharma (+91 98765 43210) requested a Day Pass for tomorrow. Please call and verify payment.',
      type: NotificationType.GUEST_INQUIRY,
      isRead: false,
      metadata: { bookingId: guestBooking._id, guestPhone: '+91 98765 43210' }
    },
    {
      recipientUserId: clientOwner._id,
      organizationId: organization._id,
      companyId: company._id,
      title: 'Festive Greeting: Happy Diwali & New Year Offers!',
      message: 'Enjoy 15% discount on all weekend private office bookings this month. Have a great working week!',
      type: NotificationType.FESTIVAL_GREETING,
      isRead: false
    }
  ]);

  await BlogPost.create({
    title: 'Designing High-Performance Workspaces for Remote-First Teams',
    slug: 'designing-high-performance-workspaces',
    excerpt: 'How hybrid teams leverage flexible coworking hubs to elevate creativity, team connection, and deep focus.',
    content: 'The modern workplace is no longer a static office. Coworking environments like Hubbly provide an agile hybrid infrastructure where focus and collaboration seamlessly coalesce...',
    coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    author: {
      name: 'Nikhil Paidy',
      role: 'Platform Founder',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
    },
    categories: ['Productivity', 'Coworking'],
    tags: ['Productivity', 'Coworking', 'Hybrid Work', 'Design'],
    readTimeMinutes: 4,
    status: BlogPostStatus.PUBLISHED,
    publishedAt: new Date()
  });

  console.log('Database cleanly seeded with realistic Hubbly coworking data in Indian Rupees!');
  console.log('Credentials Summary:');
  console.log('Super Admin: paidynikhil@gmail.com / Nikhil@123');
  console.log('CWS Admin:   cwsone@gmail.com / Cws@2026');
  console.log('Aptapace:    aptapace@gmail.com / Apta@2026');
  console.log('Staff:       hr@aptapace.com / Staff@123');

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

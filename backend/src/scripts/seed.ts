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
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const clientPasswordHash = await bcrypt.hash('Client@123', 10);
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
    name: 'HavenlyWork Coworking Spaces',
    slug: 'havenlywork-spaces',
    email: 'support@havenlywork.com',
    phone: '+91 98450 12345',
    website: 'https://havenlywork.com',
    address: {
      street: 'Cyber Towers Junction, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500081'
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
    name: 'HavenlyWork Admin',
    email: 'cwsadmin@gmail.com',
    passwordHash: adminPasswordHash,
    role: UserRole.COWORKING_ADMIN,
    organizationId: organization._id,
    phone: '+91 98450 12345',
    isActive: true
  });

  const locations = await Location.create([
    {
      organizationId: organization._id,
      name: 'HavenlyWork Apex Hub (Madhapur)',
      slug: 'havenlywork-apex-madhapur',
      address: {
        street: 'Plot 12, Hitech City Road, Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500081'
      },
      latitude: 17.4483,
      longitude: 78.3915,
      geoLocation: {
        type: 'Point',
        coordinates: [78.3915, 17.4483]
      },
      phone: '+91 98450 12345',
      email: 'madhapur@havenlywork.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Olivia Bennett',
      managerPhone: '+91 98450 12345',
      managerEmail: 'olivia@havenlywork.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'havenlywork@icici',
      rating: 4.9,
      reviewCount: 2850,
      tagline: 'SPACE FOR TOGETHERNESS • COWORK • CONNECT • GROW',
      description: 'HavenlyWork Apex in Madhapur offers premium workstations, high-speed fiber internet, private phone booths, and collaborative lounges in the center of IT corridor.',
      amenities: ['High-Speed WiFi', 'Valet Parking', 'Color Printer', 'Phone Booth', 'Artisanal Cafe', 'Meeting Rooms', '24/7 Access', 'Outdoor Terrace'],
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
      ],
      isActive: true
    },
    {
      organizationId: organization._id,
      name: 'HavenlyWork Knowledge City (Hitec City)',
      slug: 'havenlywork-hitec-city',
      address: {
        street: 'Knowledge City, Cyber Gateway Road, Hitec City',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500081'
      },
      latitude: 17.4435,
      longitude: 78.3772,
      geoLocation: {
        type: 'Point',
        coordinates: [78.3772, 17.4435]
      },
      phone: '+91 98450 12346',
      email: 'hiteccity@havenlywork.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Jenny Doe',
      managerPhone: '+91 98450 12346',
      managerEmail: 'jenny@havenlywork.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'havenlywork@icici',
      rating: 4.9,
      reviewCount: 2100,
      tagline: 'SPACE FOR TOGETHERNESS',
      description: 'Premier executive workspaces in Hitec City equipped with high-tech boardrooms, ergonomic Herman Miller seating, and concierge services.',
      amenities: ['High-Speed WiFi', 'Underground Parking', 'Printer', 'Private Booths', 'Espresso Bar', 'Executive Boardrooms'],
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80'
      ],
      isActive: true
    },
    {
      organizationId: organization._id,
      name: 'HavenlyWork Financial Vista (Gachibowli)',
      slug: 'havenlywork-gachibowli',
      address: {
        street: 'Financial District, Near DLF Cybercity, Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500032'
      },
      latitude: 17.4401,
      longitude: 78.3489,
      geoLocation: {
        type: 'Point',
        coordinates: [78.3489, 17.4401]
      },
      phone: '+91 98450 12347',
      email: 'gachibowli@havenlywork.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Shella Lemke',
      managerPhone: '+91 98450 12347',
      managerEmail: 'shella@havenlywork.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'havenlywork@icici',
      rating: 4.8,
      reviewCount: 1650,
      tagline: 'COWORK • CONNECT • GROW',
      description: 'Sprawling campus in Gachibowli tailored for high-growth tech ventures, remote squads, and enterprise teams.',
      amenities: ['High-Speed WiFi', 'Reserved Parking', 'Printing Hub', 'Soundproof Booths', 'Lounge Bar', 'Podcast Studio'],
      images: [
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&q=80',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80'
      ],
      isActive: true
    },
    {
      organizationId: organization._id,
      name: 'HavenlyWork Pavilion (Jubilee Hills)',
      slug: 'havenlywork-jubilee-hills',
      address: {
        street: 'Road No. 36, Near Metro Station, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500033'
      },
      latitude: 17.4319,
      longitude: 78.4073,
      geoLocation: {
        type: 'Point',
        coordinates: [78.4073, 17.4319]
      },
      phone: '+91 98450 12348',
      email: 'jubileehills@havenlywork.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Dale Thiel',
      managerPhone: '+91 98450 12348',
      managerEmail: 'dale@havenlywork.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'havenlywork@icici',
      rating: 4.9,
      reviewCount: 1420,
      tagline: 'SPACE FOR TOGETHERNESS',
      description: 'Boutique luxury workspace on Road 36 with natural sunlight, greenery, and executive client meeting suites.',
      amenities: ['High-Speed WiFi', 'Valet Parking', 'Printer', 'Phone Booth', 'Rooftop Cafe', '24/7 Security'],
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
      ],
      isActive: true
    },
    {
      organizationId: organization._id,
      name: 'HavenlyWork Silicon Hub (Kondapur)',
      slug: 'havenlywork-kondapur',
      address: {
        street: 'Kothaguda Junction, Near Botanical Garden, Kondapur',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500084'
      },
      latitude: 17.4699,
      longitude: 78.3578,
      geoLocation: {
        type: 'Point',
        coordinates: [78.3578, 17.4699]
      },
      phone: '+91 98450 12349',
      email: 'kondapur@havenlywork.com',
      timezone: 'Asia/Kolkata',
      managerName: 'Olivia Bennett',
      managerPhone: '+91 98450 12345',
      managerEmail: 'olivia@havenlywork.com',
      managerAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      paymentQrCodeUrl: '/uploads/cws-upi-qr.png',
      upiId: 'havenlywork@icici',
      rating: 4.8,
      reviewCount: 950,
      tagline: 'COWORK • CONNECT • GROW',
      description: 'Tranquil coworking destination with ergonomic desks, focus pods, and high-speed enterprise connectivity.',
      amenities: ['High-Speed WiFi', 'Parking', 'Printer', 'Phone Booth', 'Coffee Bar', 'Focus Pods'],
      images: [
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&q=80'
      ],
      isActive: true
    }
  ]);

  const [madhapurLoc, hitecLoc, gachiLoc, jubileeLoc, kondaLoc] = locations;

  const rooms = await MeetingRoom.create([
    {
      organizationId: organization._id,
      locationId: madhapurLoc._id,
      name: 'Flex Hot Desk (Day Pass)',
      code: 'MDP-DAY-01',
      workspaceType: 'DAY_PASS',
      description: 'Flexible hot desk with 500 Mbps internet, power outlets, and full lounge access.',
      capacity: 1,
      hourlyRate: 150,
      dailyRate: 699,
      rating: 4.9,
      reviewCount: 520,
      saveBadge: 'Save 15%',
      photos: [
        'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
      ],
      amenities: ['High-Speed WiFi', 'Artisanal Coffee', 'Power Outlets', 'Phone Booth Access'],
      slotIntervalMinutes: 60,
      minBookingMinutes: 60,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: madhapurLoc._id,
      name: 'Dedicated Ergonomic Desk',
      code: 'MDP-DESK-02',
      workspaceType: 'DEDICATED_DESK',
      description: 'Assigned personal desk with lockable storage drawer and dual monitor support.',
      capacity: 1,
      hourlyRate: 200,
      dailyRate: 899,
      rating: 4.8,
      reviewCount: 340,
      saveBadge: 'Save 10%',
      photos: [
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80'
      ],
      amenities: ['High-Speed WiFi', 'Dual Monitor Support', 'Ergonomic Herman Miller Chair', 'Coffee Bar'],
      slotIntervalMinutes: 30,
      minBookingMinutes: 30,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: madhapurLoc._id,
      name: 'Cyber Conference Suite',
      code: 'MDP-CONF-01',
      workspaceType: 'MEETING_ROOM',
      description: '8-seater acoustic glass conference room with 4K display and Jabra video conferencing bar.',
      capacity: 8,
      hourlyRate: 650,
      dailyRate: 3800,
      rating: 4.9,
      reviewCount: 310,
      saveBadge: 'Save 10%',
      photos: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80'
      ],
      amenities: ['4K Smart TV', 'Jabra Video Bar', 'Digital Whiteboard', 'Climate Control', 'High-Speed WiFi'],
      slotIntervalMinutes: 30,
      minBookingMinutes: 30,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: madhapurLoc._id,
      name: 'Grand Executive Boardroom',
      code: 'MDP-BOARD-01',
      workspaceType: 'BOARDROOM',
      description: '16-seater luxury boardroom with soundproof walls and presentation controls.',
      capacity: 16,
      hourlyRate: 1200,
      dailyRate: 7500,
      rating: 5.0,
      reviewCount: 220,
      saveBadge: 'Save 20%',
      photos: [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80'
      ],
      amenities: ['Dual 75-inch UHD Displays', 'Polycom Video System', 'Wireless Presentation', 'Beverage Service'],
      slotIntervalMinutes: 60,
      minBookingMinutes: 60,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: hitecLoc._id,
      name: 'Private Squad Office (6 Seats)',
      code: 'HTC-PRIV-01',
      workspaceType: 'PRIVATE_OFFICE',
      description: 'Sound-insulated private team cabin with magnetic glass board and dedicated AC.',
      capacity: 6,
      hourlyRate: 950,
      dailyRate: 5400,
      rating: 4.9,
      reviewCount: 160,
      saveBadge: 'Save 10%',
      photos: [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
      ],
      amenities: ['RFID Keycard Entry', 'Private Whiteboard', 'Independent AC', 'High-Speed LAN'],
      slotIntervalMinutes: 60,
      minBookingMinutes: 60,
      maxBookingMinutes: 480,
      isActive: true
    },
    {
      organizationId: organization._id,
      locationId: gachiLoc._id,
      name: 'Financial Vista Meeting Room',
      code: 'GCH-MEET-01',
      workspaceType: 'MEETING_ROOM',
      description: '10-seater contemporary collaboration space with ergonomic seating and interactive screen.',
      capacity: 10,
      hourlyRate: 750,
      dailyRate: 4200,
      rating: 4.8,
      reviewCount: 190,
      saveBadge: 'Save 15%',
      photos: [
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80'
      ],
      amenities: ['Interactive Touchscreen', 'Wireless Casting', 'Acoustic Wall Panels'],
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
    gstin: '36ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    verificationStatus: 'VERIFIED',
    address: {
      street: '4th Floor, Tech Hub, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500081'
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
    passwordHash: clientPasswordHash,
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
    bookingNumber: 'BK-MDP-2026-001',
    organizationId: organization._id,
    locationId: madhapurLoc._id,
    roomId: meetingRoom._id,
    companyId: company._id,
    bookedByUserId: clientOwner._id,
    isGuestBooking: false,
    workspaceType: 'MEETING_ROOM',
    bookingType: 'HOURLY',
    title: 'Product Roadmap & Engineering Review',
    purpose: 'Quarterly architecture alignment with tech team',
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
    bookingNumber: 'GST-MDP-2026-092',
    organizationId: organization._id,
    locationId: madhapurLoc._id,
    roomId: guestRoom._id,
    isGuestBooking: true,
    guestName: 'Rahul Sharma',
    guestEmail: 'rahul.sharma@gmail.com',
    guestPhone: '+91 98765 43210',
    workspaceType: 'DAY_PASS',
    bookingType: 'DAY_PASS',
    title: 'Full Day Pass - Rahul Sharma (Madhapur)',
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

  await Ticket.create({
    ticketNumber: 'TCK-2026-001',
    organizationId: organization._id,
    locationId: madhapurLoc._id,
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
      title: 'Welcome to HavenlyWork Spaces!',
      message: 'Your Aptapace workspace membership in Madhapur is active. SPACE FOR TOGETHERNESS.',
      type: NotificationType.BROADCAST_ANNOUNCEMENT,
      isRead: false
    },
    {
      recipientUserId: clientOwner._id,
      organizationId: organization._id,
      companyId: company._id,
      title: 'Booking Confirmed: Cyber Conference Suite',
      message: 'Your meeting in Madhapur is confirmed for today. Ref: #BK-MDP-2026-001',
      type: NotificationType.BOOKING_CONFIRMED,
      isRead: true
    },
    {
      recipientUserId: cwsAdmin._id,
      organizationId: organization._id,
      title: 'New Guest Day Pass Request (Madhapur)',
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
      message: 'Enjoy 15% discount on all weekend private office bookings this month. SPACE FOR TOGETHERNESS!',
      type: NotificationType.FESTIVAL_GREETING,
      isRead: false
    }
  ]);

  await BlogPost.create({
    title: 'Designing High-Performance Workspaces for Hyderabad Innovators',
    slug: 'designing-high-performance-workspaces-hyderabad',
    excerpt: 'How tech teams across Madhapur and Hitec City leverage flexible coworking hubs to elevate creativity, team connection, and deep focus.',
    content: 'The modern workplace is no longer a static office. Coworking environments like HavenlyWork in Madhapur provide an agile hybrid infrastructure where focus and collaboration seamlessly coalesce...',
    coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    author: {
      name: 'Nikhil Paidy',
      role: 'Platform Founder',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
    },
    categories: ['Productivity', 'Coworking'],
    tags: ['Hyderabad', 'Madhapur', 'Coworking', 'Hybrid Work'],
    readTimeMinutes: 4,
    status: BlogPostStatus.PUBLISHED,
    publishedAt: new Date()
  });

  console.log('Database cleanly seeded with realistic HavenlyWork Hyderabad data in Indian Rupees!');
  console.log('Credentials Summary:');
  console.log('Super Admin: paidynikhil@gmail.com / Nikhil@123');
  console.log('Admin:       cwsadmin@gmail.com / Admin@123');
  console.log('Client:      aptapace@gmail.com / Client@123');

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

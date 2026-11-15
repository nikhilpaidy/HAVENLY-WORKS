import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../modules/users/user.model.js";
import { CoworkingOrganization } from "../modules/organizations/organization.model.js";
import { Location } from "../modules/locations/location.model.js";
import { MeetingRoom } from "../modules/rooms/room.model.js";
import { Company } from "../modules/companies/company.model.js";
import { AllowancePeriod, AllowanceLedgerEntry } from "../modules/allowances/allowance.model.js";
import { Booking } from "../modules/bookings/booking.model.js";
import { InventorySlot } from "../modules/inventory/inventory.model.js";
import { Invoice } from "../modules/billing/invoice.model.js";
import { PaymentRecord } from "../modules/payments/payment.model.js";
import { BlogPost } from "../modules/blogs/blog.model.js";
import { Notification } from "../modules/notifications/notification.model.js";
import { Ticket } from "../modules/tickets/ticket.model.js";
import { EmergencyOverride } from "../modules/overrides/override.model.js";
import { WorkspaceType } from "../modules/workspace-types/workspace-type.model.js";
import { AuditLog } from "../modules/audit-logs/audit-log.model.js";
import { IssueLog } from "../modules/monitoring/issue-log.model.js";
import {
  UserRole,
  BlogPostStatus,
  NotificationType,
  BookingStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  OverrideRequestStatus
} from "../types/index.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is required in environment");
  process.exit(1);
}

async function runSeed() {
  console.log("Connecting to database...");
  await mongoose.connect(MONGO_URI!);

  console.log("Clearing old collections...");
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
    EmergencyOverride.deleteMany({}),
    WorkspaceType.deleteMany({}),
    AuditLog.deleteMany({}),
    IssueLog.deleteMany({})
  ]);

  const superAdminPasswordHash = await bcrypt.hash("Nikhil@123", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const clientPasswordHash = await bcrypt.hash("Client@123", 10);
  const staffPasswordHash = await bcrypt.hash("Staff@123", 10);

  const superAdmin = await User.create({
    name: "Nikhil Paidy",
    email: "paidynikhil@gmail.com",
    passwordHash: superAdminPasswordHash,
    role: UserRole.SUPER_ADMIN,
    phone: "+91 98450 99887",
    isActive: true
  });

  const hubConfigs = [
    {
      orgName: "MySpace Coworking Spaces",
      slug: "myspace-coworking-spaces",
      adminName: "MySpace Admin",
      adminEmail: "myspace@gmail.com",
      hubName: "MySpace Apex Hub (Madhapur)",
      hubSlug: "myspace-apex-madhapur",
      street: "Plot 12, Hitech City Road, Madhapur",
      city: "Hyderabad",
      postalCode: "500081",
      lat: 17.4483,
      lng: 78.3915,
      phone: "+91 98450 12345",
      managerName: "Olivia Bennett",
      managerPhone: "+91 98450 12345",
      managerEmail: "olivia@myspace.com",
      rating: 4.9,
      reviewCount: 2850,
      upiId: "myspace@icici",
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
        "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
      ],
      clients: [
        { name: "Aptapace Private Limited", email: "aptapace@gmail.com", gstin: "36ABCDE1234F1Z5", pan: "ABCDE1234F" },
        { name: "Zensar Technologies India", email: "zensar@gmail.com", gstin: "36ZENSA1234F1Z1", pan: "ZENSA1234F" },
        { name: "Zenith AI Labs", email: "zenith@gmail.com", gstin: "36ZENIT1234F1Z2", pan: "ZENIT1234F" },
        { name: "CloudScale Solutions", email: "cloudscale@gmail.com", gstin: "36CLOUD1234F1Z3", pan: "CLOUD1234F" },
        { name: "FinVerge Capital", email: "finverge@gmail.com", gstin: "36FINVE1234F1Z4", pan: "FINVE1234F" },
        { name: "Quants Global Advisory", email: "quants@gmail.com", gstin: "36QUANT1234F1Z5", pan: "QUANT1234F" },
        { name: "MetaSurge Interactive", email: "metasurge@gmail.com", gstin: "36METAS1234F1Z6", pan: "METAS1234F" },
        { name: "Nova Infotech Systems", email: "novainfotech@gmail.com", gstin: "36NOVAI1234F1Z7", pan: "NOVAI1234F" },
        { name: "Hyperloop Freight Tech", email: "hyperloop@gmail.com", gstin: "36HYPER1234F1Z8", pan: "HYPER1234F" },
        { name: "Stride Analytics Hub", email: "strideanalytics@gmail.com", gstin: "36STRID1234F1Z9", pan: "STRID1234F" },
        { name: "AlphaCore Semiconductors", email: "alphacore@gmail.com", gstin: "36ALPHA1234F1Z0", pan: "ALPHA1234F" },
        { name: "BlueWave Logistics India", email: "bluewave@gmail.com", gstin: "36BLUEW1234F1Z1", pan: "BLUEW1234F" }
      ]
    },
    {
      orgName: "Hitec Cyber Gateway Hub",
      slug: "hitec-cyber-gateway-hub",
      adminName: "Hitec Gateway Admin",
      adminEmail: "hitecadmin@gmail.com",
      hubName: "Hitec Knowledge City Hub (Hitec City)",
      hubSlug: "hitec-knowledge-city",
      street: "Knowledge City, Cyber Gateway Road, Hitec City",
      city: "Hyderabad",
      postalCode: "500081",
      lat: 17.4435,
      lng: 78.3772,
      phone: "+91 98450 12346",
      managerName: "Jenny Doe",
      managerPhone: "+91 98450 12346",
      managerEmail: "jenny@hitecgway.com",
      rating: 4.9,
      reviewCount: 2100,
      upiId: "hitecgway@icici",
      images: [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
        "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80"
      ],
      clients: [
        { name: "Vortex Cloud Systems", email: "vortex@gmail.com", gstin: "36VORTE1234F1Z1", pan: "VORTE1234F" },
        { name: "Nexus Tech Solutions", email: "nexustech@gmail.com", gstin: "36NEXUS1234F1Z2", pan: "NEXUS1234F" },
        { name: "AgileSoft Dynamics", email: "agilesoft@gmail.com", gstin: "36AGILE1234F1Z3", pan: "AGILE1234F" },
        { name: "DataSphere Platform", email: "datasphere@gmail.com", gstin: "36DATAS1234F1Z4", pan: "DATAS1234F" },
        { name: "InfiniteSoft Technologies", email: "infinitesoft@gmail.com", gstin: "36INFIN1234F1Z5", pan: "INFIN1234F" },
        { name: "PixelCraft Digital", email: "pixelcraft@gmail.com", gstin: "36PIXEL1234F1Z6", pan: "PIXEL1234F" },
        { name: "Synapse Health Tech", email: "synapse@gmail.com", gstin: "36SYNAP1234F1Z7", pan: "SYNAP1234F" },
        { name: "Quantex Algorithms", email: "quantex@gmail.com", gstin: "36QUANX1234F1Z8", pan: "QUANX1234F" },
        { name: "Luminance Cloud Labs", email: "luminance@gmail.com", gstin: "36LUMIN1234F1Z9", pan: "LUMIN1234F" },
        { name: "VectorData Global", email: "vectordata@gmail.com", gstin: "36VECTO1234F1Z0", pan: "VECTO1234F" },
        { name: "OrbitLabs Aerospace", email: "orbitlabs@gmail.com", gstin: "36ORBIT1234F1Z1", pan: "ORBIT1234F" },
        { name: "CyberGuard Defense", email: "cyberguard@gmail.com", gstin: "36CYBER1234F1Z2", pan: "CYBER1234F" }
      ]
    },
    {
      orgName: "Financial Vista Spaces",
      slug: "financial-vista-spaces",
      adminName: "Financial Vista Admin",
      adminEmail: "gachibowliadmin@gmail.com",
      hubName: "Financial Vista Campus (Gachibowli)",
      hubSlug: "financial-vista-gachibowli",
      street: "Financial District, Near DLF Cybercity, Gachibowli",
      city: "Hyderabad",
      postalCode: "500032",
      lat: 17.4401,
      lng: 78.3489,
      phone: "+91 98450 12347",
      managerName: "Shella Lemke",
      managerPhone: "+91 98450 12347",
      managerEmail: "shella@finvista.com",
      rating: 4.8,
      reviewCount: 1650,
      upiId: "finvista@icici",
      images: [
        "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&q=80",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80"
      ],
      clients: [
        { name: "FinTech Hub Global", email: "fintechhub@gmail.com", gstin: "36FINTH1234F1Z1", pan: "FINTH1234F" },
        { name: "CapitalFlow Ventures", email: "capitalflow@gmail.com", gstin: "36CAPIT1234F1Z2", pan: "CAPIT1234F" },
        { name: "LedgerCloud Systems", email: "ledgercloud@gmail.com", gstin: "36LEDGE1234F1Z3", pan: "LEDGE1234F" },
        { name: "HedgePoint Securities", email: "hedgepoint@gmail.com", gstin: "36HEDGE1234F1Z4", pan: "HEDGE1234F" },
        { name: "TradeCraft Analytics", email: "tradecraft@gmail.com", gstin: "36TRADE1234F1Z5", pan: "TRADE1234F" },
        { name: "PrimeAsset Wealth", email: "primeasset@gmail.com", gstin: "36PRIME1234F1Z6", pan: "PRIME1234F" },
        { name: "AssetPro Advisory", email: "assetpro@gmail.com", gstin: "36ASSET1234F1Z7", pan: "ASSET1234F" },
        { name: "PayMatrix Payments", email: "paymatrix@gmail.com", gstin: "36PAYMA1234F1Z8", pan: "PAYMA1234F" },
        { name: "FinPeak Financials", email: "finpeak@gmail.com", gstin: "36FINPE1234F1Z9", pan: "FINPE1234F" },
        { name: "WealthCraft Partners", email: "wealthcraft@gmail.com", gstin: "36WEALT1234F1Z0", pan: "WEALT1234F" },
        { name: "BlockCore Ledger Tech", email: "blockcore@gmail.com", gstin: "36BLOCK1234F1Z1", pan: "BLOCK1234F" },
        { name: "Apex Equity Partners", email: "apexequity@gmail.com", gstin: "36APEXE1234F1Z2", pan: "APEXE1234F" }
      ]
    },
    {
      orgName: "Pavilion Executive Spaces",
      slug: "pavilion-executive-spaces",
      adminName: "Jubilee Pavilion Admin",
      adminEmail: "jubileeadmin@gmail.com",
      hubName: "Pavilion Hub (Jubilee Hills Road 36)",
      hubSlug: "pavilion-jubilee-hills",
      street: "Road No. 36, Near Metro Station, Jubilee Hills",
      city: "Hyderabad",
      postalCode: "500033",
      lat: 17.4319,
      lng: 78.4073,
      phone: "+91 98450 12348",
      managerName: "Dale Thiel",
      managerPhone: "+91 98450 12348",
      managerEmail: "dale@pavilionhub.com",
      rating: 4.9,
      reviewCount: 1420,
      upiId: "pavilion@icici",
      images: [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
      ],
      clients: [
        { name: "DesignStudio Luxury", email: "designstudio@gmail.com", gstin: "36DESIG1234F1Z1", pan: "DESIG1234F" },
        { name: "CreativeLabs India", email: "creativelabs@gmail.com", gstin: "36CREAT1234F1Z2", pan: "CREAT1234F" },
        { name: "LuxeMedia Productions", email: "luxemedia@gmail.com", gstin: "36LUXEM1234F1Z3", pan: "LUXEM1234F" },
        { name: "BrandStudio Global", email: "brandstudio@gmail.com", gstin: "36BRAND1234F1Z4", pan: "BRAND1234F" },
        { name: "Pulse Agency Network", email: "pulseagency@gmail.com", gstin: "36PULSE1234F1Z5", pan: "PULSE1234F" },
        { name: "Artisan Media House", email: "artisanmedia@gmail.com", gstin: "36ARTIS1234F1Z6", pan: "ARTIS1234F" },
        { name: "ApexDesign Architects", email: "apexdesign@gmail.com", gstin: "36APEXD1234F1Z7", pan: "APEXD1234F" },
        { name: "NovaMedia Communications", email: "novamedia@gmail.com", gstin: "36NOVAM1234F1Z8", pan: "NOVAM1234F" },
        { name: "StudioWorks Entertainment", email: "studioworks@gmail.com", gstin: "36STUDI1234F1Z9", pan: "STUDI1234F" },
        { name: "Prism Creative Bureau", email: "prismcreative@gmail.com", gstin: "36PRISM1234F1Z0", pan: "PRISM1234F" },
        { name: "CanvasWorks Interactive", email: "canvasworks@gmail.com", gstin: "36CANVA1234F1Z1", pan: "CANVA1234F" },
        { name: "Velvet Craft Agency", email: "velvetcraft@gmail.com", gstin: "36VELVE1234F1Z2", pan: "VELVE1234F" }
      ]
    },
    {
      orgName: "Silicon Kondapur Hub",
      slug: "silicon-kondapur-hub",
      adminName: "Silicon Kondapur Admin",
      adminEmail: "kondapuradmin@gmail.com",
      hubName: "Silicon Botanical Hub (Kondapur)",
      hubSlug: "silicon-kondapur",
      street: "Kothaguda Junction, Near Botanical Garden, Kondapur",
      city: "Hyderabad",
      postalCode: "500084",
      lat: 17.4699,
      lng: 78.3578,
      phone: "+91 98450 12349",
      managerName: "Olivia Bennett",
      managerPhone: "+91 98450 12345",
      managerEmail: "olivia@siliconhub.com",
      rating: 4.8,
      reviewCount: 950,
      upiId: "siliconhub@icici",
      images: [
        "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&q=80"
      ],
      clients: [
        { name: "Botanical Tech Labs", email: "botanicaltech@gmail.com", gstin: "36BOTAN1234F1Z1", pan: "BOTAN1234F" },
        { name: "GreenCloud Infrastructure", email: "greencloud@gmail.com", gstin: "36GREEN1234F1Z2", pan: "GREEN1234F" },
        { name: "SiliconValley Matrix", email: "siliconvalley@gmail.com", gstin: "36SILIC1234F1Z3", pan: "SILIC1234F" },
        { name: "ByteFlow Systems", email: "byteflow@gmail.com", gstin: "36BYTEF1234F1Z4", pan: "BYTEF1234F" },
        { name: "StackForge Software", email: "stackforge@gmail.com", gstin: "36STACK1234F1Z5", pan: "STACK1234F" },
        { name: "CodeCraft Technologies", email: "codecraft@gmail.com", gstin: "36CODEC1234F1Z6", pan: "CODEC1234F" },
        { name: "DevOps Matrix India", email: "devopsmatrix@gmail.com", gstin: "36DEVOP1234F1Z7", pan: "DEVOP1234F" },
        { name: "CloudStride Networks", email: "cloudstride@gmail.com", gstin: "36CLOUDS1234F1Z8", pan: "CLOUDS1234F" },
        { name: "AlgoNova Robotics", email: "algonova@gmail.com", gstin: "36ALGON1234F1Z9", pan: "ALGON1234F" },
        { name: "NeuralPulse AI Systems", email: "neuralpulse@gmail.com", gstin: "36NEURA1234F1Z0", pan: "NEURA1234F" },
        { name: "CoreTech Engineering", email: "coretech@gmail.com", gstin: "36CORET1234F1Z1", pan: "CORET1234F" },
        { name: "TerraByte Solutions", email: "terrabyte@gmail.com", gstin: "36TERRA1234F1Z2", pan: "TERRA1234F" }
      ]
    }
  ];

  const now = new Date("2026-11-15T13:00:00.000Z");
  const currentYear = 2026;
  const periodStart = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59));

  let globalBookingCounter = 100;
  let globalInvoiceCounter = 100;
  let globalReceiptCounter = 100;
  let globalTicketCounter = 100;

  for (let hIdx = 0; hIdx < hubConfigs.length; hIdx++) {
    const hub = hubConfigs[hIdx];

    const org = await CoworkingOrganization.create({
      name: hub.orgName,
      slug: hub.slug,
      email: hub.adminEmail,
      phone: hub.phone,
      website: "https://havenlywork.com",
      address: {
        street: hub.street,
        city: hub.city,
        state: "Telangana",
        country: "India",
        postalCode: hub.postalCode
      },
      currency: "INR",
      timezone: "Asia/Kolkata",
      settings: {
        allowOverdraft: true,
        requireBookingApproval: false,
        cancellationWindowHours: 2,
        maxAdvanceBookingDays: 60
      },
      isActive: true
    });

    const hubAdmin = await User.create({
      name: hub.adminName,
      email: hub.adminEmail,
      passwordHash: adminPasswordHash,
      role: UserRole.COWORKING_ADMIN,
      organizationId: org._id,
      phone: hub.phone,
      isActive: true
    });

    const location = await Location.create({
      organizationId: org._id,
      name: hub.hubName,
      slug: hub.hubSlug,
      address: {
        street: hub.street,
        city: hub.city,
        state: "Telangana",
        country: "India",
        postalCode: hub.postalCode
      },
      latitude: hub.lat,
      longitude: hub.lng,
      geoLocation: {
        type: "Point",
        coordinates: [hub.lng, hub.lat]
      },
      phone: hub.phone,
      email: hub.adminEmail,
      timezone: "Asia/Kolkata",
      managerName: hub.managerName,
      managerPhone: hub.managerPhone,
      managerEmail: hub.managerEmail,
      managerAvatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      paymentQrCodeUrl: "/uploads/cws-upi-qr.png",
      upiId: hub.upiId,
      rating: hub.rating,
      reviewCount: hub.reviewCount,
      tagline: "SPACE FOR TOGETHERNESS • COWORK • CONNECT • GROW",
      description: hub.hubName + " offers premium desks, private cabins and collaborative meeting lounges in the core Hyderabad IT corridor.",
      amenities: ["High-Speed WiFi", "Valet Parking", "Color Printer", "Phone Booth", "Artisanal Cafe", "Meeting Rooms", "24/7 Access"],
      images: hub.images,
      isActive: true
    });

    await WorkspaceType.create([
      {
        organizationId: org._id,
        name: "Meeting Room",
        code: "MEETING_ROOM",
        description: "Collaborative rooms with interactive displays, video bar, and acoustic glass.",
        icon: "Users",
        capacityDefault: 8,
        hourlyRateDefault: 650
      },
      {
        organizationId: org._id,
        name: "Boardroom",
        code: "BOARDROOM",
        description: "Executive conference suites with premium audio-visual equipment and leather seating.",
        icon: "ShieldCheck",
        capacityDefault: 16,
        hourlyRateDefault: 1200
      },
      {
        organizationId: org._id,
        name: "Flex Desk",
        code: "FLEX_DESK",
        description: "Flexible open workstations with high-speed WiFi and coffee lounge access.",
        icon: "Laptop",
        capacityDefault: 1,
        hourlyRateDefault: 150
      },
      {
        organizationId: org._id,
        name: "Fixed Desk",
        code: "FIXED_DESK",
        description: "Dedicated reserved desk with lockable storage pedestal and ergonomic chair.",
        icon: "Briefcase",
        capacityDefault: 1,
        hourlyRateDefault: 200
      },
      {
        organizationId: org._id,
        name: "Private Office",
        code: "PRIVATE_OFFICE",
        description: "Enclosed team cabins with independent AC, biometric lock, and whiteboards.",
        icon: "Building2",
        capacityDefault: 6,
        hourlyRateDefault: 950
      },
      {
        organizationId: org._id,
        name: "Day Pass",
        code: "DAY_PASS",
        description: "All-day drop-in pass for freelancers and travelers with unlimited beverages.",
        icon: "Calendar",
        capacityDefault: 1,
        hourlyRateDefault: 120
      },
      {
        organizationId: org._id,
        name: "Hot Desk",
        code: "HOT_DESK",
        description: "On-demand communal desk seating in vibrant open atrium areas.",
        icon: "Coffee",
        capacityDefault: 1,
        hourlyRateDefault: 130
      },
      {
        organizationId: org._id,
        name: "Podcast Studio",
        code: "PODCAST_STUDIO",
        description: "Acoustically treated studio with broadcast microphones and audio mixer.",
        icon: "Mic",
        capacityDefault: 4,
        hourlyRateDefault: 800
      }
    ]);

    const rooms = await MeetingRoom.create([
      {
        organizationId: org._id,
        locationId: location._id,
        name: "Flex Hot Desk (Day Pass)",
        code: "HUB-" + (hIdx + 1) + "-DAY",
        workspaceType: "DAY_PASS",
        description: "Flexible hot desk with 500 Mbps internet, power outlets, and full lounge access.",
        capacity: 1,
        hourlyRate: 150,
        dailyRate: 699,
        floor: "2nd Floor - East Wing",
        floorManagerName: hub.managerName,
        floorManagerPhone: hub.managerPhone,
        floorManagerEmail: hub.managerEmail,
        rating: 4.9,
        reviewCount: 420,
        photos: [
          "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
        ],
        amenities: ["High-Speed WiFi", "Artisanal Coffee", "Power Outlets", "Phone Booth Access"],
        slotIntervalMinutes: 60,
        minBookingMinutes: 60,
        maxBookingMinutes: 480,
        bufferMinutes: 0,
        maintenanceBlocks: [],
        isActive: true
      },
      {
        organizationId: org._id,
        locationId: location._id,
        name: "Dedicated Ergonomic Desk",
        code: "HUB-" + (hIdx + 1) + "-DESK",
        workspaceType: "DEDICATED_DESK",
        description: "Assigned personal desk with lockable storage drawer and dual monitor support.",
        capacity: 1,
        hourlyRate: 200,
        dailyRate: 899,
        floor: "2nd Floor - Focus Area",
        floorManagerName: hub.managerName,
        floorManagerPhone: hub.managerPhone,
        floorManagerEmail: hub.managerEmail,
        rating: 4.8,
        reviewCount: 310,
        photos: [
          "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80"
        ],
        amenities: ["High-Speed WiFi", "Dual Monitor Support", "Ergonomic Herman Miller Chair"],
        slotIntervalMinutes: 30,
        minBookingMinutes: 30,
        maxBookingMinutes: 480,
        bufferMinutes: 15,
        maintenanceBlocks: [],
        isActive: true
      },
      {
        organizationId: org._id,
        locationId: location._id,
        name: "Executive Collaboration Suite",
        code: "HUB-" + (hIdx + 1) + "-MEET",
        workspaceType: "MEETING_ROOM",
        description: "8-seater acoustic glass conference room with 4K display and video bar.",
        capacity: 8,
        hourlyRate: 650,
        dailyRate: 3800,
        floor: "3rd Floor - Board Suite",
        floorManagerName: hub.managerName,
        floorManagerPhone: hub.managerPhone,
        floorManagerEmail: hub.managerEmail,
        rating: 4.9,
        reviewCount: 290,
        photos: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
          "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80"
        ],
        amenities: ["4K Smart TV", "Jabra Video Bar", "Digital Whiteboard", "Climate Control"],
        slotIntervalMinutes: 30,
        minBookingMinutes: 30,
        maxBookingMinutes: 480,
        bufferMinutes: 15,
        maintenanceBlocks: [],
        isActive: true
      },
      {
        organizationId: org._id,
        locationId: location._id,
        name: "Grand Boardroom Chamber",
        code: "HUB-" + (hIdx + 1) + "-BOARD",
        workspaceType: "BOARDROOM",
        description: "16-seater luxury boardroom with soundproof walls and presentation controls.",
        capacity: 16,
        hourlyRate: 1200,
        dailyRate: 7500,
        floor: "3rd Floor - Executive Suite",
        floorManagerName: hub.managerName,
        floorManagerPhone: hub.managerPhone,
        floorManagerEmail: hub.managerEmail,
        rating: 5.0,
        reviewCount: 190,
        photos: [
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80"
        ],
        amenities: ["Dual 75-inch UHD Displays", "Polycom Video System", "Wireless Presentation"],
        slotIntervalMinutes: 60,
        minBookingMinutes: 60,
        maxBookingMinutes: 480,
        bufferMinutes: 30,
        maintenanceBlocks: [],
        isActive: true
      },
      {
        organizationId: org._id,
        locationId: location._id,
        name: "Private Squad Office (6 Seats)",
        code: "HUB-" + (hIdx + 1) + "-PRIV",
        workspaceType: "PRIVATE_OFFICE",
        description: "Sound-insulated private team cabin with magnetic glass board and dedicated AC.",
        capacity: 6,
        hourlyRate: 950,
        dailyRate: 5400,
        floor: "4th Floor - Tech Suites",
        floorManagerName: hub.managerName,
        floorManagerPhone: hub.managerPhone,
        floorManagerEmail: hub.managerEmail,
        rating: 4.8,
        reviewCount: 145,
        photos: [
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
        ],
        amenities: ["RFID Keycard Entry", "Private Whiteboard", "Independent AC", "High-Speed LAN"],
        slotIntervalMinutes: 60,
        minBookingMinutes: 60,
        maxBookingMinutes: 480,
        bufferMinutes: 15,
        maintenanceBlocks: [],
        isActive: true
      }
    ]);

    for (let cIdx = 0; cIdx < hub.clients.length; cIdx++) {
      const cData = hub.clients[cIdx];

      const company = await Company.create({
        organizationId: org._id,
        locationId: location._id,
        name: cData.name,
        billingEmail: cData.email,
        phone: "+91 98451 " + (50000 + hIdx * 100 + cIdx),
        gstin: cData.gstin,
        panNumber: cData.pan,
        verificationStatus: "VERIFIED",
        address: {
          street: "Suite " + (cIdx + 1) + "01, " + hub.street,
          city: hub.city,
          state: "Telangana",
          country: "India",
          postalCode: hub.postalCode
        },
        status: "ACTIVE",
        allowanceConfig: {
          allowancePeriodType: "ANNUAL",
          annualFreeHours: 50,
          monthlyFreeHours: 0,
          additionalHourlyRate: 500,
          currency: "INR",
          rolloverAllowed: true,
          billingCycleStartDay: 1
        }
      });

      const clientOwner = await User.create({
        name: cData.name + " Director",
        email: cData.email,
        passwordHash: clientPasswordHash,
        role: UserRole.COMPANY_OWNER,
        organizationId: org._id,
        companyId: company._id,
        phone: "+91 98451 " + (50000 + hIdx * 100 + cIdx),
        isActive: true
      });

      const clientStaffEmail = "staff." + cData.email.split("@")[0] + "@gmail.com";
      const clientStaff = await User.create({
        name: cData.name + " Ops Lead",
        email: clientStaffEmail,
        passwordHash: staffPasswordHash,
        role: UserRole.COMPANY_STAFF,
        organizationId: org._id,
        companyId: company._id,
        phone: "+91 98451 " + (60000 + hIdx * 100 + cIdx),
        isActive: true
      });

      const consumedFromLastMonth = 8 + ((cIdx + hIdx) % 10);
      const reservedForUpcoming = 2 + (cIdx % 3);
      const remainingBalance = 50 - consumedFromLastMonth - reservedForUpcoming;

      const allowance = await AllowancePeriod.create({
        companyId: company._id,
        organizationId: org._id,
        periodYear: currentYear,
        periodMonth: 0,
        periodStart,
        periodEnd,
        grantedHours: 50,
        consumedHours: consumedFromLastMonth,
        reservedHours: reservedForUpcoming,
        balanceHours: remainingBalance,
        notes: "2026 Annual Quota (50 Hours) for " + cData.name
      });

      await AllowanceLedgerEntry.create([
        {
          companyId: company._id,
          organizationId: org._id,
          allowancePeriodId: allowance._id,
          changeType: "GRANT",
          hours: 50,
          balanceAfter: 50,
          notes: "2026 Annual complimentary workspace quota granted"
        },
        {
          companyId: company._id,
          organizationId: org._id,
          allowancePeriodId: allowance._id,
          changeType: "CONSUME",
          hours: -consumedFromLastMonth,
          balanceAfter: 50 - consumedFromLastMonth,
          notes: "Consumed " + consumedFromLastMonth + " hrs in October 2026 for meetings and desks"
        },
        {
          companyId: company._id,
          organizationId: org._id,
          allowancePeriodId: allowance._id,
          changeType: "RESERVE",
          hours: -reservedForUpcoming,
          balanceAfter: remainingBalance,
          notes: "Reserved " + reservedForUpcoming + " hrs for upcoming strategy and client reviews"
        }
      ]);

      const octDay1 = 5 + (cIdx % 20);
      const octStart = new Date("2026-10-" + (octDay1 < 10 ? "0" + octDay1 : octDay1) + "T10:00:00.000Z");
      const octEnd = new Date(octStart.getTime() + 3 * 60 * 60 * 1000);
      globalBookingCounter++;
      const pastBooking1 = await Booking.create({
        bookingNumber: "BK-OCT-" + globalBookingCounter,
        organizationId: org._id,
        locationId: location._id,
        roomId: rooms[2]._id,
        companyId: company._id,
        bookedByUserId: clientOwner._id,
        isGuestBooking: false,
        workspaceType: "MEETING_ROOM",
        bookingType: "HOURLY",
        title: cData.name + " - October Product Sprint",
        purpose: "Architecture alignment and team design review",
        attendeeCount: 6,
        startTime: octStart,
        endTime: octEnd,
        durationHours: 3,
        status: BookingStatus.COMPLETED,
        paymentMethod: "ALLOWANCE",
        paymentStatus: "VERIFIED",
        pricingSnapshot: {
          baseHourlyRate: 650,
          freeHoursApplied: 3,
          chargeableHours: 0,
          additionalHourlyRate: 500,
          totalAmount: 0,
          currency: "INR"
        }
      });

      const novDay1 = 3 + (cIdx % 10);
      const novStart1 = new Date("2026-11-" + (novDay1 < 10 ? "0" + novDay1 : novDay1) + "T14:00:00.000Z");
      const novEnd1 = new Date(novStart1.getTime() + 2 * 60 * 60 * 1000);
      globalBookingCounter++;
      await Booking.create({
        bookingNumber: "BK-NOV-" + globalBookingCounter,
        organizationId: org._id,
        locationId: location._id,
        roomId: rooms[1]._id,
        companyId: company._id,
        bookedByUserId: clientOwner._id,
        isGuestBooking: false,
        workspaceType: "DEDICATED_DESK",
        bookingType: "HOURLY",
        title: cData.name + " - Engineering Deep Work",
        purpose: "Focused deep work and code review",
        attendeeCount: 1,
        startTime: novStart1,
        endTime: novEnd1,
        durationHours: 2,
        status: BookingStatus.COMPLETED,
        paymentMethod: "ALLOWANCE",
        paymentStatus: "VERIFIED",
        pricingSnapshot: {
          baseHourlyRate: 200,
          freeHoursApplied: 2,
          chargeableHours: 0,
          additionalHourlyRate: 500,
          totalAmount: 0,
          currency: "INR"
        }
      });

      const upDay = 18 + (cIdx % 10);
      const upStart = new Date("2026-11-" + upDay + "T11:00:00.000Z");
      const upEnd = new Date(upStart.getTime() + reservedForUpcoming * 60 * 60 * 1000);
      globalBookingCounter++;
      const upcomingBooking = await Booking.create({
        bookingNumber: "BK-NOV-" + globalBookingCounter,
        organizationId: org._id,
        locationId: location._id,
        roomId: rooms[2]._id,
        companyId: company._id,
        bookedByUserId: clientOwner._id,
        isGuestBooking: false,
        workspaceType: "MEETING_ROOM",
        bookingType: "HOURLY",
        title: cData.name + " - Executive Client Briefing",
        purpose: "Demo and quarterly contract finalization",
        attendeeCount: 8,
        startTime: upStart,
        endTime: upEnd,
        durationHours: reservedForUpcoming,
        status: BookingStatus.CONFIRMED,
        paymentMethod: "ALLOWANCE",
        paymentStatus: "VERIFIED",
        pricingSnapshot: {
          baseHourlyRate: 650,
          freeHoursApplied: reservedForUpcoming,
          chargeableHours: 0,
          additionalHourlyRate: 500,
          totalAmount: 0,
          currency: "INR"
        }
      });

      globalInvoiceCounter++;
      const invoiceNum = "INV-2026-10-" + globalInvoiceCounter;
      const subtotal = 4500 + (cIdx * 250);
      const gst = Math.round(subtotal * 0.18);
      const totalAmount = subtotal + gst;
      const isPaid = cIdx % 4 !== 0;

      const invoice = await Invoice.create({
        invoiceNumber: invoiceNum,
        organizationId: org._id,
        companyId: company._id,
        billingPeriodStart: new Date("2026-10-01T00:00:00.000Z"),
        billingPeriodEnd: new Date("2026-10-31T23:59:59.000Z"),
        issueDate: new Date("2026-11-01T09:00:00.000Z"),
        dueDate: new Date("2026-11-15T18:00:00.000Z"),
        lineItems: [
          {
            description: "October 2026 Base Membership & Facility Fee",
            quantityHours: 1,
            unitPrice: subtotal,
            amount: subtotal
          }
        ],
        subtotal,
        taxAmount: gst,
        totalAmount,
        amountPaid: isPaid ? totalAmount : 0,
        amountDue: isPaid ? 0 : totalAmount,
        currency: "INR",
        status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.ISSUED,
        notes: "Monthly statement for " + cData.name
      });

      if (isPaid) {
        globalReceiptCounter++;
        await PaymentRecord.create({
          receiptNumber: "REC-2026-11-" + globalReceiptCounter,
          organizationId: org._id,
          companyId: company._id,
          invoiceId: invoice._id,
          amount: totalAmount,
          currency: "INR",
          paymentMethod: PaymentMethod.UPI_QR,
          paymentReference: "UPI-AXIS-" + (8800000000 + globalReceiptCounter),
          paymentDate: new Date("2026-11-04T11:30:00.000Z"),
          status: PaymentStatus.VERIFIED,
          notes: "Settled via corporate UPI QR",
          recordedByUserId: clientOwner._id,
          verifiedByUserId: hubAdmin._id,
          verifiedAt: new Date("2026-11-04T12:00:00.000Z")
        });
      }

      globalTicketCounter++;
      const isTicketResolved = cIdx % 2 === 0;
      await Ticket.create({
        organizationId: org._id,
        companyId: company._id,
        raisedByUserId: clientOwner._id,
        locationId: location._id,
        ticketNumber: "TCK-2026-" + globalTicketCounter,
        category: (cIdx % 3 === 0) ? TicketCategory.WIFI_NETWORK : (cIdx % 3 === 1 ? TicketCategory.AIR_CONDITIONING : TicketCategory.DISPLAY_AV),
        priority: (cIdx % 3 === 0) ? TicketPriority.HIGH : TicketPriority.MEDIUM,
        title: (cIdx % 3 === 0)
          ? "5GHz WiFi SSID Channel Optimization"
          : (cIdx % 3 === 1)
          ? "Meeting Room AC temperature setting to 22C"
          : "Dual-monitor HDMI adapter request in Focus pod",
        description: "Raised by " + cData.name + " regarding meeting room setup.",
        status: isTicketResolved ? TicketStatus.RESOLVED : TicketStatus.OPEN,
        resolutionNotes: isTicketResolved ? "Service completed by floor engineer. Access verified." : undefined,
        resolvedByUserId: isTicketResolved ? hubAdmin._id : undefined,
        resolvedAt: isTicketResolved ? new Date("2026-11-10T15:00:00.000Z") : undefined,
        comments: [
          {
            authorId: clientOwner._id,
            authorName: cData.name + " Director",
            authorRole: "COMPANY_OWNER",
            message: "Please attend to this before our scheduled customer session.",
            createdAt: new Date("2026-11-09T09:30:00.000Z")
          }
        ]
      });

      if (cIdx === 0) {
        await EmergencyOverride.create({
          organizationId: org._id,
          roomId: rooms[3]._id,
          requestingCompanyId: company._id,
          requestingUserId: clientOwner._id,
          existingBookingId: upcomingBooking._id,
          existingCompanyId: company._id,
          requestedStartTime: new Date("2026-11-16T14:00:00.000Z"),
          requestedEndTime: new Date("2026-11-16T18:00:00.000Z"),
          urgencyReason: "Urgent investor due diligence meeting with international delegation.",
          attendeeCount: 14,
          status: OverrideRequestStatus.APPROVED,
          adminReviewNotes: "Approved by Hub Director. Chamber prepped.",
          reviewedByUserId: hubAdmin._id,
          reviewedAt: new Date("2026-11-15T10:00:00.000Z")
        });
      }

      await Notification.create([
        {
          recipientUserId: clientOwner._id,
          organizationId: org._id,
          companyId: company._id,
          title: "Welcome to " + hub.hubName,
          message: "Your membership for " + cData.name + " is active. Annual Quota: 50 Hours.",
          type: NotificationType.BROADCAST_ANNOUNCEMENT,
          isRead: false
        },
        {
          recipientUserId: clientOwner._id,
          organizationId: org._id,
          companyId: company._id,
          title: "Booking Confirmed: Executive Collaboration Suite",
          message: "Your upcoming session is confirmed. Ref: #" + upcomingBooking.bookingNumber,
          type: NotificationType.BOOKING_CONFIRMED,
          isRead: true
        }
      ]);
    }

    globalBookingCounter++;
    await Booking.create({
      bookingNumber: "GST-MDP-" + globalBookingCounter,
      organizationId: org._id,
      locationId: location._id,
      roomId: rooms[0]._id,
      isGuestBooking: true,
      guestName: "Arjun Verma",
      guestEmail: "arjun.verma@gmail.com",
      guestPhone: "+91 98888 77766",
      workspaceType: "DAY_PASS",
      bookingType: "DAY_PASS",
      title: "Guest Day Pass - Arjun Verma (" + hub.hubName + ")",
      attendeeCount: 1,
      startTime: new Date("2026-11-16T09:00:00.000Z"),
      endTime: new Date("2026-11-16T18:00:00.000Z"),
      durationHours: 9,
      status: BookingStatus.PENDING_CONFIRMATION,
      paymentMethod: "UPI_QR",
      paymentStatus: "PENDING_VERIFICATION",
      paymentReference: "UPI-GUEST-" + (9900000000 + hIdx),
      pricingSnapshot: {
        baseHourlyRate: 150,
        freeHoursApplied: 0,
        chargeableHours: 9,
        additionalHourlyRate: 150,
        totalAmount: 699,
        currency: "INR"
      }
    });

    await Notification.create({
      recipientUserId: hubAdmin._id,
      organizationId: org._id,
      title: "New Guest Day Pass Request",
      message: "Arjun Verma requested a Day Pass for tomorrow at " + hub.hubName + ". Verify payment.",
      type: NotificationType.BOOKING_CONFIRMED,
      isRead: false
    });
  }

  await IssueLog.create([
    {
      level: "INFO",
      method: "GET",
      path: "/api/v1/health",
      statusCode: 200,
      message: "System health check passed. MongoDB latency 4ms.",
      resolved: true,
      resolvedAt: new Date("2026-10-31T23:59:00.000Z"),
      resolvedBy: "System Daemon"
    },
    {
      level: "WARN",
      method: "POST",
      path: "/api/v1/auth/refresh",
      statusCode: 200,
      message: "Token refreshed smoothly after user inactive period.",
      resolved: true,
      resolvedAt: new Date("2026-11-08T14:22:00.000Z"),
      resolvedBy: "Auth Monitor"
    },
    {
      level: "INFO",
      method: "GET",
      path: "/api/v1/rooms",
      statusCode: 200,
      message: "Public workspaces catalog query served in 18ms.",
      resolved: true,
      resolvedAt: new Date("2026-11-15T12:00:00.000Z"),
      resolvedBy: "APM Monitor"
    }
  ]);

  await BlogPost.create([
    {
      title: "Designing High-Performance Workspaces for Hyderabad Innovators",
      slug: "designing-high-performance-workspaces-hyderabad",
      excerpt: "How tech teams across Madhapur, Hitec City and Gachibowli leverage agile coworking hubs to elevate deep focus and team synergy.",
      content: "The modern workplace is no longer a static office. Coworking environments like HavenlyWork in Madhapur provide an agile hybrid infrastructure where focus and collaboration seamlessly coalesce...",
      coverImageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
      author: {
        name: "Nikhil Paidy",
        role: "Platform Founder",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      categories: ["Productivity", "Coworking"],
      tags: ["Hyderabad", "Madhapur", "Coworking", "Hybrid Work"],
      readTimeMinutes: 4,
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date("2026-10-15T10:00:00.000Z")
    },
    {
      title: "Why Enterprise Teams Are Choosing Managed Flexibility in 2026",
      slug: "enterprise-teams-managed-flexibility-2026",
      excerpt: "From 50-hour meeting room quotas to dedicated desks, how businesses reduce overhead while maximizing employee satisfaction.",
      content: "Forward-thinking companies are moving away from restrictive multi-year commercial leases. By pairing annual 50-hour meeting quotas with dedicated desk clusters, organizations optimize capital expenditure...",
      coverImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
      author: {
        name: "Nikhil Paidy",
        role: "Platform Founder",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
      },
      categories: ["Enterprise", "Real Estate"],
      tags: ["Hyderabad", "Enterprise", "Quotas"],
      readTimeMinutes: 5,
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date("2026-11-01T08:30:00.000Z")
    }
  ]);

  console.log("Database seeded successfully with 5 Hubs, 5 Admins, 60 Clients, and 50-Hour Quotas!");
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

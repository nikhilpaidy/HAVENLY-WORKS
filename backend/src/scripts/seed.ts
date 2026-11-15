import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import https from "https";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/coworking";

function downloadImageBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const data: Buffer[] = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => resolve(Buffer.concat(data)));
      res.on("error", (err) => reject(err));
    }).on("error", (err) => reject(err));
  });
}

function randomUuid5(): string {
  return Math.random().toString(36).substring(2, 7);
}

const TEMPLATE_IMAGE_URLS = {
  boardroom: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  meeting: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
  office: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  flex: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
  hot: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  fixed: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80",
  daypass: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  hub: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80"
};

const ADMIN_ORGANIZATIONS = [
  {
    adminName: "MySpace Coworking Admin",
    adminEmail: "myspace@gmail.com",
    adminPhone: "+91 98450 11001",
    orgName: "MySpace Coworking Spaces",
    orgSlug: "myspace",
    address: { street: "Plot 12, Hitec City Main Rd", city: "Hyderabad", state: "Telangana", country: "India", postalCode: "500081" },
    hubs: [
      {
        slug: "apex-hub-madhapur",
        name: "MySpace Apex Hub (Madhapur)",
        code: "MS-HYD-01",
        street: "Kothaguda Junction, Near Botanical Garden, Madhapur",
        area: "Madhapur",
        city: "Hyderabad",
        postalCode: "500084",
        lat: 17.4483,
        lng: 78.3915,
        rating: 4.95,
        reviewCount: 148,
        upiId: "myspace.apex@icici",
        managerName: "Vikram Rao",
        managerPhone: "+91 98450 22001",
        managerEmail: "vikram.rao@myspace.in",
        companies: [
          { name: "Aptapace Private Limited", email: "aptapace@gmail.com", gstin: "36ABCDE1234F1Z5", pan: "ABCDE1234F" },
          { name: "AlphaCore Semiconductors", email: "alphacore@gmail.com", gstin: "36ALPHA1234F1Z0", pan: "ALPHA1234F" },
          { name: "BlueWave Logistics India", email: "bluewave@gmail.com", gstin: "36BLUEW1234F1Z1", pan: "BLUEW1234F" },
          { name: "CloudScale Solutions", email: "cloudscale@gmail.com", gstin: "36CLOUD1234F1Z3", pan: "CLOUD1234F" }
        ]
      },
      {
        slug: "knowledge-city-hitec",
        name: "MySpace Knowledge City Hub (Hitec City)",
        code: "MS-HYD-02",
        street: "Knowledge City, Cyber Gateway Rd, Hitec City",
        area: "Hitec City",
        city: "Hyderabad",
        postalCode: "500081",
        lat: 17.4435,
        lng: 78.3772,
        rating: 4.92,
        reviewCount: 124,
        upiId: "myspace.kc@icici",
        managerName: "Deepika Sharma",
        managerPhone: "+91 98450 22002",
        managerEmail: "deepika.s@myspace.in",
        companies: [
          { name: "FinVerge Capital", email: "finverge@gmail.com", gstin: "36FINVE1234F1Z4", pan: "FINVE1234F" },
          { name: "Hyperloop Freight Tech", email: "hyperloop@gmail.com", gstin: "36HYPER1234F1Z8", pan: "HYPER1234F" },
          { name: "InfraPulse Energy Systems", email: "infrapulse@gmail.com", gstin: "36INFRA1234F1Z9", pan: "INFRA1234F" },
          { name: "Kinetix Robotics India", email: "kinetix@gmail.com", gstin: "36KINET1234F1Z2", pan: "KINET1234F" }
        ]
      },
      {
        slug: "financial-hub-gachibowli",
        name: "MySpace Financial Hub (Gachibowli)",
        code: "MS-HYD-03",
        street: "ISB Road, Financial District, Gachibowli",
        area: "Gachibowli",
        city: "Hyderabad",
        postalCode: "500032",
        lat: 17.4401,
        lng: 78.3489,
        rating: 4.88,
        reviewCount: 98,
        upiId: "myspace.fin@icici",
        managerName: "Rajesh Varma",
        managerPhone: "+91 98450 22003",
        managerEmail: "rajesh.v@myspace.in",
        companies: [
          { name: "Lumina Therapeutics", email: "lumina@gmail.com", gstin: "36LUMIN1234F1Z7", pan: "LUMIN1234F" },
          { name: "MacroGrid Cloud Networks", email: "macrogrid@gmail.com", gstin: "36MACRO1234F1Z6", pan: "MACRO1234F" },
          { name: "NeuralPulse AI Systems", email: "neuralpulse@gmail.com", gstin: "36NEURA1234F1Z5", pan: "NEURA1234F" },
          { name: "OmniChannel Retail Stack", email: "omnichannel@gmail.com", gstin: "36OMNIC1234F1Z3", pan: "OMNIC1234F" }
        ]
      }
    ]
  },
  {
    adminName: "Innov8 Coworking Admin",
    adminEmail: "innov8@gmail.com",
    adminPhone: "+91 98450 11002",
    orgName: "Innov8 Hubs Telangana",
    orgSlug: "innov8",
    address: { street: "Cyber Pearl, Phase 2, Hitec City", city: "Hyderabad", state: "Telangana", country: "India", postalCode: "500081" },
    hubs: [
      {
        slug: "cyber-gateway-hitec",
        name: "Innov8 Cyber Gateway Hub (Hitec City)",
        code: "IN-HYD-01",
        street: "Phase 2, Cyber Gateway, Hitec City",
        area: "Hitec City",
        city: "Hyderabad",
        postalCode: "500081",
        lat: 17.4475,
        lng: 78.3768,
        rating: 4.91,
        reviewCount: 165,
        upiId: "innov8.cyber@hdfc",
        managerName: "Anand Kulkarni",
        managerPhone: "+91 98450 22004",
        managerEmail: "anand.k@innov8.in",
        companies: [
          { name: "Prism Creative Bureau", email: "prism@gmail.com", gstin: "36PRISM1234F1Z4", pan: "PRISM1234F" },
          { name: "QuantumLeap Biotech", email: "quantumleap@gmail.com", gstin: "36QUANT1234F1Z1", pan: "QUANT1234F" },
          { name: "Radix BioSciences", email: "radix@gmail.com", gstin: "36RADIX1234F1Z9", pan: "RADIX1234F" },
          { name: "Stride Analytics Hub", email: "stride@gmail.com", gstin: "36STRID1234F1Z8", pan: "STRID1234F" }
        ]
      },
      {
        slug: "prestige-tech-kondapur",
        name: "Innov8 Prestige Tech Hub (Kondapur)",
        code: "IN-HYD-02",
        street: "RTO Road, Near Silicon Valley, Kondapur",
        area: "Kondapur",
        city: "Hyderabad",
        postalCode: "500084",
        lat: 17.4682,
        lng: 78.3614,
        rating: 4.87,
        reviewCount: 112,
        upiId: "innov8.prestige@hdfc",
        managerName: "Pooja Hegde",
        managerPhone: "+91 98450 22005",
        managerEmail: "pooja.h@innov8.in",
        companies: [
          { name: "TeraByte Data Engineering", email: "terabyte@gmail.com", gstin: "36TERAB1234F1Z2", pan: "TERAB1234F" },
          { name: "UrbanVolt EV Mobility", email: "urbanvolt@gmail.com", gstin: "36URBAN1234F1Z0", pan: "URBAN1234F" },
          { name: "VectorData Global", email: "vectordata@gmail.com", gstin: "36VECTO1234F1Z7", pan: "VECTO1234F" },
          { name: "WealthCraft Partners", email: "wealthcraft@gmail.com", gstin: "36WEALT1234F1Z6", pan: "WEALT1234F" }
        ]
      },
      {
        slug: "botanika-gachibowli",
        name: "Innov8 Botanika Hub (Gachibowli)",
        code: "IN-HYD-03",
        street: "Botanical Garden Rd, Jayabheri Enclave, Gachibowli",
        area: "Gachibowli",
        city: "Hyderabad",
        postalCode: "500032",
        lat: 17.4521,
        lng: 78.3542,
        rating: 4.93,
        reviewCount: 130,
        upiId: "innov8.botanika@hdfc",
        managerName: "Sanjay Joshi",
        managerPhone: "+91 98450 22006",
        managerEmail: "sanjay.j@innov8.in",
        companies: [
          { name: "XenoGen Genomics", email: "xenogen@gmail.com", gstin: "36XENOG1234F1Z5", pan: "XENOG1234F" },
          { name: "YieldCurve Quantitative", email: "yieldcurve@gmail.com", gstin: "36YIELD1234F1Z3", pan: "YIELD1234F" },
          { name: "Zenith Aerospace Systems", email: "zenith@gmail.com", gstin: "36ZENIT1234F1Z1", pan: "ZENIT1234F" },
          { name: "Aegis Cyber Defense", email: "aegis@gmail.com", gstin: "36AEGIS1234F1Z9", pan: "AEGIS1234F" }
        ]
      }
    ]
  },
  {
    adminName: "Workafella Coworking Admin",
    adminEmail: "workafella@gmail.com",
    adminPhone: "+91 98450 11003",
    orgName: "Workafella Executive Workspaces",
    orgSlug: "workafella",
    address: { street: "Western Pearl, Hitec City", city: "Hyderabad", state: "Telangana", country: "India", postalCode: "500081" },
    hubs: [
      {
        slug: "western-pearl-hitec",
        name: "Workafella Western Pearl Hub (Hitec City)",
        code: "WF-HYD-01",
        street: "Kothaguda Junction, Western Pearl Building, Hitec City",
        area: "Hitec City",
        city: "Hyderabad",
        postalCode: "500081",
        lat: 17.4578,
        lng: 78.3684,
        rating: 4.94,
        reviewCount: 180,
        upiId: "workafella.wp@axis",
        managerName: "Arun Nair",
        managerPhone: "+91 98450 22007",
        managerEmail: "arun.n@workafella.in",
        companies: [
          { name: "Beacon MedTech Labs", email: "beacon@gmail.com", gstin: "36BEACO1234F1Z8", pan: "BEACO1234F" },
          { name: "CipherGate Security", email: "ciphergate@gmail.com", gstin: "36CIPHE1234F1Z7", pan: "CIPHE1234F" },
          { name: "DeltaWave Telecom", email: "deltawave@gmail.com", gstin: "36DELTA1234F1Z6", pan: "DELTA1234F" },
          { name: "EchoLogic Software", email: "echologic@gmail.com", gstin: "36ECHOL1234F1Z4", pan: "ECHOL1234F" }
        ]
      },
      {
        slug: "skyline-banjara-hills",
        name: "Workafella Skyline Hub (Banjara Hills)",
        code: "WF-HYD-02",
        street: "Road No. 12, MLA Colony, Banjara Hills",
        area: "Banjara Hills",
        city: "Hyderabad",
        postalCode: "500034",
        lat: 17.4156,
        lng: 78.4328,
        rating: 4.89,
        reviewCount: 95,
        upiId: "workafella.skyline@axis",
        managerName: "Kavitha Reddy",
        managerPhone: "+91 98450 22008",
        managerEmail: "kavitha.r@workafella.in",
        companies: [
          { name: "FluidDynamics Energy", email: "fluiddynamics@gmail.com", gstin: "36FLUID1234F1Z3", pan: "FLUID1234F" },
          { name: "GeoSpatial Mapping Corp", email: "geospatial@gmail.com", gstin: "36GEOSP1234F1Z2", pan: "GEOSP1234F" },
          { name: "Helix Bioscience India", email: "helix@gmail.com", gstin: "36HELIX1234F1Z1", pan: "HELIX1234F" },
          { name: "Ionix Battery Tech", email: "ionix@gmail.com", gstin: "36IONIX1234F1Z0", pan: "IONIX1234F" }
        ]
      },
      {
        slug: "central-begumpet",
        name: "Workafella Central Hub (Begumpet)",
        code: "WF-HYD-03",
        street: "Sardar Patel Road, Near US Consulate, Begumpet",
        area: "Begumpet",
        city: "Hyderabad",
        postalCode: "500016",
        lat: 17.4412,
        lng: 78.4721,
        rating: 4.86,
        reviewCount: 88,
        upiId: "workafella.central@axis",
        managerName: "Farhan Khan",
        managerPhone: "+91 98450 22009",
        managerEmail: "farhan.k@workafella.in",
        companies: [
          { name: "Javelin Defence Aerospace", email: "javelin@gmail.com", gstin: "36JAVEL1234F1Z9", pan: "JAVEL1234F" },
          { name: "KoreHealth Wellness", email: "korehealth@gmail.com", gstin: "36KOREH1234F1Z8", pan: "KOREH1234F" },
          { name: "LogicNode Semiconductors", email: "logicnode@gmail.com", gstin: "36LOGIC1234F1Z7", pan: "LOGIC1234F" },
          { name: "MetaSphere Virtual Labs", email: "metasphere@gmail.com", gstin: "36METAS1234F1Z5", pan: "METAS1234F" }
        ]
      }
    ]
  },
  {
    adminName: "Awfis Coworking Admin",
    adminEmail: "awfis@gmail.com",
    adminPhone: "+91 98450 11004",
    orgName: "Awfis Space Solutions Telangana",
    orgSlug: "awfis",
    address: { street: "One West, Financial District", city: "Hyderabad", state: "Telangana", country: "India", postalCode: "500032" },
    hubs: [
      {
        slug: "one-west-financial-district",
        name: "Awfis One West Hub (Financial District)",
        code: "AW-HYD-01",
        street: "Tower A, One West Building, Financial District, Nanakramguda",
        area: "Financial District",
        city: "Hyderabad",
        postalCode: "500032",
        lat: 17.4182,
        lng: 78.3419,
        rating: 4.96,
        reviewCount: 210,
        upiId: "awfis.onewest@sbi",
        managerName: "Harish Pillai",
        managerPhone: "+91 98450 22010",
        managerEmail: "harish.p@awfis.in",
        companies: [
          { name: "NexusPay Technologies", email: "nexuspay@gmail.com", gstin: "36NEXUS1234F1Z4", pan: "NEXUS1234F" },
          { name: "OptiFleet Telematics", email: "optifleet@gmail.com", gstin: "36OPTIF1234F1Z3", pan: "OPTIF1234F" },
          { name: "PrimeVentures Advisory", email: "primeventures@gmail.com", gstin: "36PRIME1234F1Z2", pan: "PRIME1234F" },
          { name: "Qubit Quantum Compute", email: "qubit@gmail.com", gstin: "36QUBIT1234F1Z1", pan: "QUBIT1234F" },
          { name: "RapidScale Infrastructure", email: "rapidscale@gmail.com", gstin: "36RAPID1234F1Z0", pan: "RAPID1234F" }
        ]
      },
      {
        slug: "jubilee-pride-jubilee-hills",
        name: "Awfis Jubilee Pride Hub (Jubilee Hills)",
        code: "AW-HYD-02",
        street: "Road No. 36, Near Peddamma Temple, Jubilee Hills",
        area: "Jubilee Hills",
        city: "Hyderabad",
        postalCode: "500033",
        lat: 17.4312,
        lng: 78.4065,
        rating: 4.90,
        reviewCount: 140,
        upiId: "awfis.jubilee@sbi",
        managerName: "Monika Sen",
        managerPhone: "+91 98450 22011",
        managerEmail: "monika.s@awfis.in",
        companies: [
          { name: "Starlight Digital Media", email: "starlight@gmail.com", gstin: "36STARL1234F1Z9", pan: "STARL1234F" },
          { name: "Trident Agritech Systems", email: "trident@gmail.com", gstin: "36TRIDE1234F1Z8", pan: "TRIDE1234F" },
          { name: "UltraSecure Identity Labs", email: "ultrasecure@gmail.com", gstin: "36ULTRA1234F1Z7", pan: "ULTRA1234F" },
          { name: "Vortex Gaming Studios", email: "vortex@gmail.com", gstin: "36VORTE1234F1Z6", pan: "VORTE1234F" },
          { name: "WaveMatrix AI Analytics", email: "wavematrix@gmail.com", gstin: "36WAVEM1234F1Z5", pan: "WAVEM1234F" }
        ]
      }
    ]
  },
  {
    adminName: "WeWork Coworking Admin",
    adminEmail: "wework@gmail.com",
    adminPhone: "+91 98450 11005",
    orgName: "WeWork Galaxy India",
    orgSlug: "wework",
    address: { street: "Rajapushpa Summit, Financial District", city: "Hyderabad", state: "Telangana", country: "India", postalCode: "500032" },
    hubs: [
      {
        slug: "rajapushpa-summit-financial",
        name: "WeWork Rajapushpa Summit Hub (Financial District)",
        code: "WW-HYD-01",
        street: "Financial District, Nanakramguda, Gachibowli Corridor",
        area: "Financial District",
        city: "Hyderabad",
        postalCode: "500032",
        lat: 17.4144,
        lng: 78.3445,
        rating: 4.98,
        reviewCount: 280,
        upiId: "wework.rajapushpa@kotak",
        managerName: "Devendra Singh",
        managerPhone: "+91 98450 22012",
        managerEmail: "devendra.s@wework.in",
        companies: [
          { name: "XpressChain Supply Stack", email: "xpresschain@gmail.com", gstin: "36XPRES1234F1Z4", pan: "XPRES1234F" },
          { name: "ZenPulse BioTelemetry", email: "zenpulse@gmail.com", gstin: "36ZENPU1234F1Z3", pan: "ZENPU1234F" },
          { name: "ApexClean Energy Labs", email: "apexclean@gmail.com", gstin: "36APEXC1234F1Z2", pan: "APEXC1234F" },
          { name: "BrightByte EdTech", email: "brightbyte@gmail.com", gstin: "36BRIGH1234F1Z1", pan: "BRIGH1234F" },
          { name: "CogniPath Brain Science", email: "cognipath@gmail.com", gstin: "36COGNI1234F1Z0", pan: "COGNI1234F" }
        ]
      },
      {
        slug: "krishe-emerald-kondapur",
        name: "WeWork Krishe Emerald Hub (Kondapur)",
        code: "WW-HYD-02",
        street: "Chanda Naik Nagar, Laxmi Cyber City, Kondapur",
        area: "Kondapur",
        city: "Hyderabad",
        postalCode: "500084",
        lat: 17.4642,
        lng: 78.3668,
        rating: 4.93,
        reviewCount: 175,
        upiId: "wework.krishe@kotak",
        managerName: "Neha Agarwal",
        managerPhone: "+91 98450 22013",
        managerEmail: "neha.a@wework.in",
        companies: [
          { name: "DataWeaver Neural Mesh", email: "dataweaver@gmail.com", gstin: "36DATAW1234F1Z9", pan: "DATAW1234F" },
          { name: "EnviroPure Climate Labs", email: "enviropure@gmail.com", gstin: "36ENVIR1234F1Z8", pan: "ENVIR1234F" },
          { name: "FrontierEdge Networks", email: "frontieredge@gmail.com", gstin: "36FRONT1234F1Z7", pan: "FRONT1234F" },
          { name: "GreenHaven Sustainable Tech", email: "greenhaven@gmail.com", gstin: "36GREEN1234F1Z6", pan: "GREEN1234F" },
          { name: "HorizonSky Aviation Stack", email: "horizonsky@gmail.com", gstin: "36HORIZ1234F1Z5", pan: "HORIZ1234F" }
        ]
      }
    ]
  }
];

const ROOM_TEMPLATES = [
  { name: "Grand Executive Boardroom", code: "BOARDROOM", typeKey: "boardroom", capacity: 16, hourlyRate: 1200, dailyRate: 7200, floor: "Floor 4" },
  { name: "Collaborative Meeting Studio", code: "MEETING_ROOM", typeKey: "meeting", capacity: 8, hourlyRate: 650, dailyRate: 3900, floor: "Floor 3" },
  { name: "Private Executive Suite", code: "PRIVATE_OFFICE", typeKey: "office", capacity: 6, hourlyRate: 950, dailyRate: 5700, floor: "Floor 3" },
  { name: "Flex Hot Desk Station", code: "FLEX_DESK", typeKey: "flex", capacity: 1, hourlyRate: 150, dailyRate: 800, floor: "Floor 2" },
  { name: "Dedicated Ergonomic Desk", code: "FIXED_DESK", typeKey: "fixed", capacity: 1, hourlyRate: 200, dailyRate: 1100, floor: "Floor 2" },
  { name: "Open Communal Desk", code: "HOT_DESK", typeKey: "hot", capacity: 1, hourlyRate: 130, dailyRate: 700, floor: "Floor 2" },
  { name: "Full Day Pass Bay", code: "DAY_PASS", typeKey: "daypass", capacity: 1, hourlyRate: 120, dailyRate: 600, floor: "Floor 1" }
];

const TICKET_SUBJECTS = [
  { title: "High-Speed 5GHz WiFi SSID check on 2nd floor", cat: TicketCategory.WIFI_NETWORK, desc: "Packet drop observed during executive video call in conference room." },
  { title: "Air conditioner temperature calibration in Boardroom", cat: TicketCategory.AIR_CONDITIONING, desc: "Thermostat is reading 19C; please adjust to comfortable 23C range." },
  { title: "Power socket voltage check in Team Cabin 4", cat: TicketCategory.POWER_ELECTRICAL, desc: "Power strip socket trips intermittently when dual monitors plugged in." },
  { title: "4K Projector HDMI cable replacement needed in Pod 2", cat: TicketCategory.DISPLAY_AV, desc: "HDMI cable pin is loose causing intermittent screen flickering." },
  { title: "Invoice GSTIN detail validation for October statement", cat: TicketCategory.OTHER, desc: "Please ensure GSTIN 36ABCDE1234F1Z5 is printed on formal tax invoice." },
  { title: "Dual-monitor display arm installation on Fixed Desk 8", cat: TicketCategory.DISPLAY_AV, desc: "Requested ergonomic dual VESA mount arm for permanent workstation." },
  { title: "Visitor parking validation for 3 client executives", cat: TicketCategory.OTHER, desc: "Client delegation arriving tomorrow 10am; please reserve basement parking." },
  { title: "Artisanal espresso machine bean refill in 3rd floor lounge", cat: TicketCategory.WATER_REFRESHMENTS, desc: "Coffee lounge hopper is empty; please refill arabica roast." },
  { title: "Acoustic glass panel soundproofing seal inspection", cat: TicketCategory.OTHER, desc: "Please verify door rubber seal to ensure complete acoustic privacy." },
  { title: "Deep cleaning request for private cabin after strategy meeting", cat: TicketCategory.WASHROOM_HYGIENE, desc: "Please sanitize whiteboard and desk surfaces this evening." }
];

const MEETING_PURPOSES = [
  "Sprint Planning & Backlog Grooming",
  "Quarterly OKR Executive Review",
  "Product Architecture Technical Sync",
  "Client Demonstration & Live Pilot",
  "Investor Due Diligence Presentation",
  "Full Day Focus Work & Deep Coding",
  "Design System Review & Prototyping",
  "Vendor Commercial Contract Negotiation",
  "Enterprise Security Audit Alignment",
  "Team Retrospective & Strategy Workshop",
  "Board Governance Meeting",
  "All-Hands Leadership Roundtable"
];

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB Atlas!");

  console.log("Downloading archetype room images for local file storage...");
  const downloadedBuffers: Record<string, Buffer> = {};
  for (const [key, url] of Object.entries(TEMPLATE_IMAGE_URLS)) {
    try {
      downloadedBuffers[key] = await downloadImageBuffer(url);
    } catch {
      downloadedBuffers[key] = Buffer.from("simulated-jpeg-data");
    }
  }

  const uploadsBase = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsBase)) {
    fs.mkdirSync(uploadsBase, { recursive: true });
  }

  console.log("Purging all existing database collections...");
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
  console.log("Super Admin seeded: paidynikhil@gmail.com / Nikhil@123");

  console.log("Seeding Global Standard Workspace Types (Created ONCE without duplicates)...");
  const globalTypes = await WorkspaceType.create([
    {
      organizationId: null,
      name: "Boardroom",
      code: "BOARDROOM",
      description: "Executive conference suites with premium audio-visual equipment and leather seating.",
      icon: "ShieldCheck",
      capacityDefault: 16,
      hourlyRateDefault: 1200,
      isActive: true
    },
    {
      organizationId: null,
      name: "Meeting Room",
      code: "MEETING_ROOM",
      description: "Collaborative rooms with interactive displays, video bar, and acoustic glass.",
      icon: "Users",
      capacityDefault: 8,
      hourlyRateDefault: 650,
      isActive: true
    },
    {
      organizationId: null,
      name: "Private Office",
      code: "PRIVATE_OFFICE",
      description: "Enclosed team cabins with independent AC, biometric lock, and whiteboards.",
      icon: "Building2",
      capacityDefault: 6,
      hourlyRateDefault: 950,
      isActive: true
    },
    {
      organizationId: null,
      name: "Flex Desk",
      code: "FLEX_DESK",
      description: "Flexible open workstations with high-speed WiFi and coffee lounge access.",
      icon: "Laptop",
      capacityDefault: 1,
      hourlyRateDefault: 150,
      isActive: true
    },
    {
      organizationId: null,
      name: "Fixed Desk",
      code: "FIXED_DESK",
      description: "Dedicated reserved desk with lockable storage pedestal and ergonomic chair.",
      icon: "Briefcase",
      capacityDefault: 1,
      hourlyRateDefault: 200,
      isActive: true
    },
    {
      organizationId: null,
      name: "Hot Desk",
      code: "HOT_DESK",
      description: "On-demand communal desk seating in vibrant open atrium areas.",
      icon: "Coffee",
      capacityDefault: 1,
      hourlyRateDefault: 130,
      isActive: true
    },
    {
      organizationId: null,
      name: "Day Pass",
      code: "DAY_PASS",
      description: "All-day drop-in pass for freelancers and travelers with unlimited beverages.",
      icon: "Calendar",
      capacityDefault: 1,
      hourlyRateDefault: 120,
      isActive: true
    },
    {
      organizationId: null,
      name: "Podcast Studio",
      code: "PODCAST_STUDIO",
      description: "Acoustically treated studio with broadcast microphones and audio mixer.",
      icon: "Mic",
      capacityDefault: 4,
      hourlyRateDefault: 800,
      isActive: true
    }
  ]);
  console.log(`Global Workspace Types seeded: ${globalTypes.length} unique standard types`);

  const allCreatedRooms: any[] = [];
  const allCreatedCompanies: any[] = [];
  const allCreatedUsers: any[] = [];
  const allCreatedHubs: any[] = [];

  for (let oIdx = 0; oIdx < ADMIN_ORGANIZATIONS.length; oIdx++) {
    const adminData = ADMIN_ORGANIZATIONS[oIdx];

    const org = await CoworkingOrganization.create({
      name: adminData.orgName,
      slug: adminData.orgSlug,
      email: adminData.adminEmail,
      currency: "INR",
      timezone: "Asia/Kolkata",
      phone: adminData.adminPhone,
      address: adminData.address,
      isActive: true
    });

    const adminUser = await User.create({
      name: adminData.adminName,
      email: adminData.adminEmail,
      passwordHash: adminPasswordHash,
      role: UserRole.COWORKING_ADMIN,
      organizationId: org._id,
      phone: adminData.adminPhone,
      isActive: true
    });
    allCreatedUsers.push(adminUser);

    if (oIdx === 0) {
      await WorkspaceType.create({
        organizationId: org._id,
        name: "VR Innovation Lab",
        code: "VR_DEMO_LAB",
        description: "Immersive VR testing headsets, greenscreen backdrop, and high-performance GPU rigs.",
        icon: "Cpu",
        capacityDefault: 6,
        hourlyRateDefault: 1500,
        isActive: true
      });
    }

    for (let hIdx = 0; hIdx < adminData.hubs.length; hIdx++) {
      const hubData = adminData.hubs[hIdx];
      const hubDir = path.join(uploadsBase, adminData.orgSlug, hubData.slug);
      if (!fs.existsSync(hubDir)) {
        fs.mkdirSync(hubDir, { recursive: true });
      }

      const hubImageUuid = randomUuid5();
      const hubImageFile = `hub-cover-${hubImageUuid}.jpg`;
      const hubImagePath = path.join(hubDir, hubImageFile);
      if (downloadedBuffers["hub"]) {
        fs.writeFileSync(hubImagePath, downloadedBuffers["hub"]);
      }
      const hubImageUrl = `/uploads/${adminData.orgSlug}/${hubData.slug}/${hubImageFile}`;

      const location = await Location.create({
        organizationId: org._id,
        name: hubData.name,
        slug: hubData.slug,
        address: {
          street: hubData.street,
          city: hubData.city,
          state: "Telangana",
          country: "India",
          postalCode: hubData.postalCode
        },
        phone: hubData.managerPhone,
        email: hubData.managerEmail,
        latitude: hubData.lat,
        longitude: hubData.lng,
        geoLocation: {
          type: "Point",
          coordinates: [hubData.lng, hubData.lat]
        },
        timezone: "Asia/Kolkata",
        operatingHours: {
          openTime: "07:00",
          closeTime: "23:00",
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
        },
        managerName: hubData.managerName,
        managerPhone: hubData.managerPhone,
        managerEmail: hubData.managerEmail,
        managerAvatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
        paymentQrCodeUrl: "/uploads/cws-upi-qr.png",
        upiId: hubData.upiId,
        rating: hubData.rating,
        reviewCount: hubData.reviewCount,
        tagline: "EXECUTIVE COWORKING • WORK • CONNECT • GROW",
        description: `${hubData.name} offers executive suites, ergonomic workstations and boardroom suites in ${hubData.area}, Hyderabad.`,
        amenities: ["High-Speed WiFi", "Valet Parking", "Color Printer", "Phone Booth", "Artisanal Cafe", "Meeting Rooms", "24/7 Power"],
        images: [hubImageUrl],
        isActive: true
      });
      allCreatedHubs.push(location);

      const staffEmail = `staff.${hubData.slug.replace(/[^a-z0-9]/g, "")}@gmail.com`;
      await User.create({
        name: hubData.managerName,
        email: staffEmail,
        passwordHash: staffPasswordHash,
        role: UserRole.COWORKING_ADMIN_STAFF,
        organizationId: org._id,
        phone: hubData.managerPhone,
        isActive: true
      });

      for (let rIdx = 0; rIdx < ROOM_TEMPLATES.length; rIdx++) {
        const tpl = ROOM_TEMPLATES[rIdx];
        const roomImgUuid = randomUuid5();
        const roomImgFile = `${tpl.typeKey}-${roomImgUuid}.jpg`;
        const roomImgPath = path.join(hubDir, roomImgFile);
        if (downloadedBuffers[tpl.typeKey]) {
          fs.writeFileSync(roomImgPath, downloadedBuffers[tpl.typeKey]);
        }
        const roomImgUrl = `/uploads/${adminData.orgSlug}/${hubData.slug}/${roomImgFile}`;

        const room = await MeetingRoom.create({
          organizationId: org._id,
          locationId: location._id,
          name: `${tpl.name} (${hubData.area})`,
          code: `${hubData.code}-R0${rIdx + 1}`,
          workspaceType: tpl.code,
          capacity: tpl.capacity,
          hourlyRate: tpl.hourlyRate,
          dailyRate: tpl.dailyRate,
          currency: "INR",
          description: `Premium ${tpl.name.toLowerCase()} featuring acoustic glass, 4K screen, and ergonomic seating on ${tpl.floor}.`,
          floor: tpl.floor,
          photos: [roomImgUrl],
          amenities: ["High-speed Wi-Fi", "4K Video Display", "Ergonomic Chairs", "Acoustic Glass", "Whiteboard"],
          rating: +(4.8 + Math.random() * 0.2).toFixed(1),
          floorManagerName: hubData.managerName,
          floorManagerPhone: hubData.managerPhone,
          isActive: true
        });
        allCreatedRooms.push(room);
      }

      for (let cIdx = 0; cIdx < hubData.companies.length; cIdx++) {
        const compData = hubData.companies[cIdx];
        const company = await Company.create({
          organizationId: org._id,
          locationId: location._id,
          name: compData.name,
          billingEmail: compData.email,
          phone: "+91 98451 " + (10000 + oIdx * 1000 + hIdx * 100 + cIdx),
          gstin: compData.gstin,
          panNumber: compData.pan,
          verificationStatus: "VERIFIED",
          address: {
            street: `Suite ${cIdx + 1}0${hIdx + 1}, ${hubData.street}`,
            city: hubData.city,
            state: "Telangana",
            country: "India",
            postalCode: hubData.postalCode
          },
          status: "ACTIVE",
          isActive: true,
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
        allCreatedCompanies.push(company);

        const clientUser = await User.create({
          name: `${compData.name} Director`,
          email: compData.email,
          passwordHash: clientPasswordHash,
          role: UserRole.COMPANY_OWNER,
          organizationId: org._id,
          companyId: company._id,
          phone: "+91 98451 " + (10000 + oIdx * 1000 + hIdx * 100 + cIdx),
          isActive: true
        });
        allCreatedUsers.push(clientUser);

        const clientStaffEmail = `staff.${compData.email.split("@")[0]}@gmail.com`;
        await User.create({
          name: `${compData.name} Lead`,
          email: clientStaffEmail,
          passwordHash: clientPasswordHash,
          role: UserRole.EMPLOYEE,
          organizationId: org._id,
          companyId: company._id,
          phone: "+91 98452 " + (10000 + oIdx * 1000 + hIdx * 100 + cIdx),
          isActive: true
        });

        await AllowancePeriod.create({
          companyId: company._id,
          organizationId: org._id,
          periodYear: 2026,
          periodMonth: 0,
          periodStart: new Date("2026-01-01T00:00:00.000Z"),
          periodEnd: new Date("2026-12-31T23:59:59.999Z"),
          grantedHours: 50,
          consumedHours: 0,
          reservedHours: 0,
          balanceHours: 50
        });
      }
    }
  }

  console.log(`Seeded: 5 Admins, ${allCreatedHubs.length} Hubs, ${allCreatedRooms.length} Workspace Units, ${allCreatedCompanies.length} Client Companies`);

  console.log("Generating 520+ Reservations from October 2026 onwards...");
  const bookingsToInsert: any[] = [];
  const baseStartDate = new Date("2026-10-01T09:00:00.000Z");
  const totalDays = 53;

  let bookingSerial = 1001;

  for (let i = 0; i < 470; i++) {
    const company = allCreatedCompanies[i % allCreatedCompanies.length];
    const hubRooms = allCreatedRooms.filter((r) => r.locationId.toString() === company.locationId.toString());
    const room = hubRooms.length > 0 ? hubRooms[i % hubRooms.length] : allCreatedRooms[i % allCreatedRooms.length];

    const dayOffset = Math.floor((i / 470) * totalDays);
    const bookingDate = new Date(baseStartDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

    const startHour = 9 + (i % 9);
    const startMinute = (i % 2) === 0 ? 0 : 30;
    bookingDate.setUTCHours(startHour, startMinute, 0, 0);

    const durationHours = (i % 6 === 0) ? 8 : (i % 4 === 0) ? 3 : (i % 3 === 0) ? 2 : 1;
    const endDate = new Date(bookingDate.getTime() + durationHours * 60 * 60 * 1000);

    let status = BookingStatus.COMPLETED;
    if (dayOffset >= 45 && dayOffset <= 47) {
      status = (i % 4 === 0) ? BookingStatus.CHECKED_IN : BookingStatus.CONFIRMED;
    } else if (dayOffset > 47) {
      status = BookingStatus.CONFIRMED;
    } else if (i % 15 === 0) {
      status = BookingStatus.CANCELLED;
    }

    const isDayPass = room.workspaceType === "DAY_PASS";
    const hourlyRate = room.hourlyRate || 500;
    const isFreeAllowance = !isDayPass && (i % 3 !== 0);
    const freeHoursApplied = isFreeAllowance ? durationHours : 0;
    const chargeableHours = isFreeAllowance ? 0 : durationHours;
    const totalAmount = isDayPass ? (room.dailyRate || 600) : (chargeableHours * hourlyRate);

    bookingsToInsert.push({
      bookingNumber: `HW-2026-${bookingSerial++}`,
      organizationId: company.organizationId,
      locationId: company.locationId,
      roomId: room._id,
      companyId: company._id,
      bookedByUserId: null,
      isGuestBooking: false,
      workspaceType: room.workspaceType,
      bookingType: isDayPass ? "DAY_PASS" : "HOURLY",
      title: MEETING_PURPOSES[i % MEETING_PURPOSES.length],
      purpose: `Reserved by ${company.name} for technical and strategic sessions.`,
      attendeeCount: room.capacity > 1 ? Math.min(room.capacity, 4 + (i % 5)) : 1,
      startTime: bookingDate,
      endTime: endDate,
      durationHours,
      status,
      paymentMethod: isFreeAllowance ? "ALLOWANCE" : "UPI_QR",
      paymentStatus: "VERIFIED",
      paymentReference: isFreeAllowance ? undefined : `UPI-2026-${100000 + i}`,
      pricingSnapshot: {
        baseHourlyRate: hourlyRate,
        freeHoursApplied,
        chargeableHours,
        additionalHourlyRate: 500,
        totalAmount,
        currency: "INR"
      },
      checkedInAt: status === BookingStatus.COMPLETED ? bookingDate : undefined,
      createdAt: new Date(bookingDate.getTime() - 2 * 24 * 60 * 60 * 1000)
    });
  }

  const GUEST_NAMES = [
    { name: "Rahul Sharma", email: "rahul.sharma@gmail.com", phone: "+91 98765 43210" },
    { name: "Ananya Sen", email: "ananya.sen@gmail.com", phone: "+91 98765 43211" },
    { name: "Karthik Rao", email: "karthik.rao@gmail.com", phone: "+91 98765 43212" },
    { name: "Priya Reddy", email: "priya.reddy@gmail.com", phone: "+91 98765 43213" },
    { name: "Amit Verma", email: "amit.verma@gmail.com", phone: "+91 98765 43214" },
    { name: "Sneha Patel", email: "sneha.patel@gmail.com", phone: "+91 98765 43215" },
    { name: "Vikram Singhania", email: "vikram.s@gmail.com", phone: "+91 98765 43216" },
    { name: "Deepak Joshi", email: "deepak.j@gmail.com", phone: "+91 98765 43217" },
    { name: "Meera Krishnan", email: "meera.k@gmail.com", phone: "+91 98765 43218" },
    { name: "Siddharth Malhotra", email: "sid.m@gmail.com", phone: "+91 98765 43219" }
  ];

  for (let g = 0; g < 55; g++) {
    const hub = allCreatedHubs[g % allCreatedHubs.length];
    const guestRooms = allCreatedRooms.filter((r) => r.locationId.toString() === hub._id.toString() && (r.workspaceType === "DAY_PASS" || r.workspaceType === "HOT_DESK" || r.workspaceType === "FLEX_DESK"));
    const room = guestRooms.length > 0 ? guestRooms[g % guestRooms.length] : allCreatedRooms[g % allCreatedRooms.length];
    const guest = GUEST_NAMES[g % GUEST_NAMES.length];

    const dayOffset = Math.floor((g / 55) * totalDays);
    const bookingDate = new Date(baseStartDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    bookingDate.setUTCHours(9, 0, 0, 0);
    const endDate = new Date(bookingDate.getTime() + 8 * 60 * 60 * 1000);

    const isDayPass = room.workspaceType === "DAY_PASS";
    const totalAmount = isDayPass ? (room.dailyRate || 600) : (8 * (room.hourlyRate || 150));

    bookingsToInsert.push({
      bookingNumber: `HW-2026-${bookingSerial++}`,
      organizationId: hub.organizationId,
      locationId: hub._id,
      roomId: room._id,
      isGuestBooking: true,
      guestName: guest.name,
      guestEmail: guest.email,
      guestPhone: guest.phone,
      workspaceType: room.workspaceType,
      bookingType: isDayPass ? "DAY_PASS" : "HOURLY",
      title: `Guest Day Pass - ${guest.name}`,
      purpose: "Independent workspace day pass reservation.",
      attendeeCount: 1,
      startTime: bookingDate,
      endTime: endDate,
      durationHours: 8,
      status: dayOffset > 45 ? BookingStatus.CONFIRMED : BookingStatus.COMPLETED,
      paymentMethod: "UPI_QR",
      paymentStatus: "VERIFIED",
      paymentReference: `UPI-GUEST-${200000 + g}`,
      pricingSnapshot: {
        baseHourlyRate: room.hourlyRate || 150,
        freeHoursApplied: 0,
        chargeableHours: 8,
        additionalHourlyRate: room.hourlyRate || 150,
        totalAmount,
        currency: "INR"
      },
      checkedInAt: dayOffset <= 45 ? bookingDate : undefined,
      createdAt: new Date(bookingDate.getTime() - 1 * 24 * 60 * 60 * 1000)
    });
  }

  await Booking.insertMany(bookingsToInsert);
  console.log(`Seeded ${bookingsToInsert.length} total reservations (Oct 1 - Nov 22, 2026)!`);

  console.log("Generating 215 Service Desk & Helpdesk Complaints...");
  const ticketsToInsert: any[] = [];
  let ticketSerial = 101;

  for (let t = 0; t < 215; t++) {
    const company = allCreatedCompanies[t % allCreatedCompanies.length];
    const hub = allCreatedHubs.find((h) => h._id.toString() === company.locationId.toString()) || allCreatedHubs[0];
    const subj = TICKET_SUBJECTS[t % TICKET_SUBJECTS.length];

    const dayOffset = Math.floor((t / 215) * totalDays);
    const ticketDate = new Date(baseStartDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

    let status = TicketStatus.RESOLVED;
    if (t % 8 === 0) {
      status = TicketStatus.OPEN;
    } else if (t % 5 === 0) {
      status = TicketStatus.IN_PROGRESS;
    }

    const priority = t % 10 === 0 ? TicketPriority.URGENT : t % 4 === 0 ? TicketPriority.HIGH : TicketPriority.MEDIUM;

    ticketsToInsert.push({
      organizationId: company.organizationId,
      companyId: company._id,
      raisedByUserId: company.organizationId,
      locationId: hub._id,
      ticketNumber: `TCK-2026-${ticketSerial++}`,
      category: subj.cat,
      priority,
      title: `${subj.title} - ${company.name}`,
      description: `${subj.desc} Raised by operations lead at ${company.name}.`,
      status,
      resolutionNotes: status === TicketStatus.RESOLVED ? "Issue inspected by on-site facilities technician Vikram Rao and successfully verified." : undefined,
      resolvedAt: status === TicketStatus.RESOLVED ? new Date(ticketDate.getTime() + 4 * 60 * 60 * 1000) : undefined,
      createdAt: ticketDate,
      comments: [
        {
          authorId: company.organizationId,
          authorName: `${company.name} Representative`,
          authorRole: "TENANT",
          message: subj.desc,
          createdAt: ticketDate
        }
      ]
    });
  }

  await Ticket.insertMany(ticketsToInsert);
  console.log(`Seeded ${ticketsToInsert.length} Service Desk tickets across 13 hubs and 56 companies!`);

  console.log("Generating Monthly Invoices for October and November 2026...");
  const invoicesToInsert: any[] = [];
  let invoiceSerial = 202601;

  for (let c = 0; c < allCreatedCompanies.length; c++) {
    const comp = allCreatedCompanies[c];
    const octBookings = bookingsToInsert.filter((b) => b.companyId && b.companyId.toString() === comp._id.toString() && b.pricingSnapshot.totalAmount > 0);
    const subtotal = octBookings.reduce((sum, b) => sum + (b.pricingSnapshot.totalAmount || 0), 0) + 1200;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    invoicesToInsert.push({
      organizationId: comp.organizationId,
      companyId: comp._id,
      invoiceNumber: `INV-${invoiceSerial++}`,
      billingPeriodStart: new Date("2026-10-01T00:00:00.000Z"),
      billingPeriodEnd: new Date("2026-10-31T23:59:59.999Z"),
      subtotal,
      taxAmount: tax,
      totalAmount: total,
      amountPaid: total,
      amountDue: 0,
      currency: "INR",
      status: InvoiceStatus.PAID,
      dueDate: new Date("2026-11-07T23:59:59.999Z"),
      lineItems: [
        { description: "Annual Plan - 50 Free Hours Allocation", quantityHours: 50, unitPrice: 0, amount: 0 },
        { description: "October Month Chargeable Sessions & Amenities", quantityHours: Math.max(1, octBookings.length * 2), unitPrice: Math.round(subtotal / Math.max(1, octBookings.length * 2)), amount: subtotal }
      ]
    });
  }

  await Invoice.insertMany(invoicesToInsert);
  console.log(`Seeded ${invoicesToInsert.length} corporate invoices in INR!`);

  console.log("---------------------------------------------------------------------------------");
  console.log("DATABASE SEEDING COMPLETE!");
  console.log("All data dealing in Indian Rupees (INR)");
  console.log("Global Workspace Types created ONCE globally without per-org duplicates.");
  console.log("All client companies set to ACTIVE with 50 hrs/yr annual quota.");
  console.log("Local images saved under uploads/{adminSlug}/{hubSlug}/.");
  console.log("---------------------------------------------------------------------------------");

  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});

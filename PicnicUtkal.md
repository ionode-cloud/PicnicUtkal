# PicnicUtkal — Complete Technical Documentation

> **Version**: 1.0.0 | **Last Updated**: July 2026 | **Status**: Pre-Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [User Workflow](#3-user-workflow)
4. [Admin Workflow](#4-admin-workflow)
5. [Booking Workflow](#5-booking-workflow)
6. [Database Schema](#6-database-schema)
7. [API Documentation](#7-api-documentation)
8. [Folder Structure](#8-folder-structure)
9. [Technology Stack](#9-technology-stack)
10. [UI Design Guidelines](#10-ui-design-guidelines)
11. [User Roles & Permissions](#11-user-roles--permissions)
12. [Razorpay Integration](#12-razorpay-integration)
13. [Maps Integration](#13-maps-integration)
14. [Email & SMS Workflow](#14-email--sms-workflow)
15. [Security Features](#15-security-features)
16. [Deployment Guide](#16-deployment-guide)
17. [Backup & Restore](#17-backup--restore)
18. [Future Enhancements](#18-future-enhancements)

---

## 1. Project Overview

**PicnicUtkal** is a commercial-grade, full-stack picnic zone booking platform built for Odisha, India.

| Property | Value |
|----------|-------|
| **Brand** | PicnicUtkal |
| **Tagline** | *Odisha's Premier Picnic Destination* |
| **Domain** | picnicutkal.com |
| **Target Market** | Families, Corporates, Youth, Tourists in Odisha |
| **Competitors** | Airbnb Experiences, Resort booking platforms |
| **Revenue Model** | Booking commission, Add-on services, Featured listings |
| **Primary Language** | English (Hindi + Odia supported) |

### Goals

- Allow users to discover, explore, and book premium picnic zones in Odisha
- Provide an end-to-end experience: booking, food pre-order, decoration, payment, digital ticket
- Give admins full control over spots, bookings, users, content, and analytics
- Be API-first for future Android/iOS mobile apps

---

## 2. Features

### User-Facing Features

#### Discovery
- Browse all picnic spots with filters (location, price, rating, capacity, zone type)
- Interactive Leaflet map with spot markers and nearby places
- Spot detail pages with image gallery, 360° view, zone breakdown, amenities
- Live capacity display per zone
- Real-time weather widget per spot (OpenWeatherMap)
- Nearby places: hotels, restaurants, temples, hospitals, ATMs, petrol pumps

#### Booking
- Airbnb-style availability calendar (Available / Limited / Booked / Holiday Pricing)
- Multi-zone selection in one booking
- Duration: 1 Day, 2 Days, 3 Days, Custom date range
- Dynamic pricing (weekend, holiday, festival, crowd, VIP multipliers)
- Vehicle parking booking (bike, car, bus, truck)
- Food pre-order (veg/non-veg, breakfast/lunch/dinner/BBQ/snacks/cake)
- Decoration package (birthday, wedding, anniversary, corporate, baby shower, proposal)
- Add-on services (DJ setup, photographer, tent, generator, guide)
- Coupon/promo code at checkout
- Wallet balance payment
- Razorpay checkout (UPI, cards, net banking, wallet)
- Booking confirmation via email + SMS + WhatsApp
- Digital QR ticket + PDF invoice

#### User Dashboard
- Profile management
- Booking history (upcoming, past, cancelled)
- Wallet (balance, recharge, transactions, cashback)
- Coupons (available, referral, used)
- Wishlist / Favorite spots
- Notification center
- Invoice downloads
- Support tickets
- Review management
- Referral program

#### Social & Discovery
- Wishlist & favorites
- Compare spots (side-by-side)
- Share spot (native share API)
- Download brochure (PDF)
- Review with photos/videos
- AI spot recommender
- Blog (travel, nature, camping tips)
- Multi-language: English, Hindi, Odia

### Admin Features
- Real-time dashboard KPIs and charts
- Full CRUD: spots, zones, bookings, users, employees, gallery, blog, CMS
- Dynamic pricing rule management
- Coupon and offer management
- Booking approval workflow
- Payment management and refunds
- Role-based employee portal
- GST and revenue reports (PDF/Excel/CSV export)
- Notification broadcaster (email, SMS, push)
- SEO management per page/spot
- Audit logs

---

## 3. User Workflow

```
Visit Website
     │
     ▼
Browse Home Page
     │
     ├─► Search (Location / Date / People)
     │         │
     │         ▼
     │   Picnic Spots List ──► Apply Filters
     │         │
     │         ▼
     │   Spot Detail Page
     │         │
     │         ├── View Image Gallery
     │         ├── Check Zone Availability
     │         ├── View Weather & Crowd
     │         ├── Read Reviews
     │         └── Click "Book Now"
     │                 │
     │                 ▼
     │         Booking Wizard
     │         Step 1: Select Zones
     │         Step 2: Choose Dates (Calendar)
     │         Step 3: Guest Count + Parking
     │         Step 4: Food Pre-Order
     │         Step 5: Add-ons / Decoration
     │         Step 6: Apply Coupon / Wallet
     │         Step 7: Review Summary
     │         Step 8: Pay (Razorpay)
     │                 │
     │                 ▼
     │         Payment Success
     │         │
     │         ├── Email: Booking Confirmation + Invoice PDF
     │         ├── SMS: Booking details
     │         ├── WhatsApp: QR Ticket
     │         └── Dashboard: Booking visible
     │
     ▼
Visit on Booking Date
     │
     └── QR Scan at Entry (Staff App / Admin Panel)
               │
               └── Status: Checked In → Checked Out → Review Prompt
```

---

## 4. Admin Workflow

```
Admin Login
     │
     ▼
Admin Dashboard
     │
     ├── View KPIs (Revenue, Bookings, Users, Pending)
     ├── Check Today's Bookings
     ├── Approve / Confirm Pending Bookings
     │
     ├── Manage Spots
     │     ├── Add New Spot (name, location, images, pricing)
     │     ├── Add Zones to Spot
     │     ├── Set Dynamic Pricing Rules
     │     └── Set Availability Calendar
     │
     ├── Manage Bookings
     │     ├── Approve → Send Confirmation
     │     ├── Check-In (QR scan)
     │     ├── Check-Out
     │     └── Cancel / Refund
     │
     ├── Manage Users
     │     ├── View profiles, booking history
     │     ├── Suspend / Reactivate
     │     └── Manage wallet adjustments
     │
     ├── Manage Employees
     │     ├── Add staff with role + permissions
     │     └── View assigned spot bookings
     │
     ├── Reports
     │     ├── Revenue (daily/monthly/yearly)
     │     ├── GST report
     │     └── Export PDF / Excel
     │
     └── CMS
           ├── Edit Home page content
           ├── Manage Blog posts
           ├── Update FAQ / Privacy / Terms
           └── Manage Testimonials
```

---

## 5. Booking Workflow

```
User selects "Book Now" on Spot Detail Page
          │
          ▼
Step 1 — Zone Selection
  ├── Displays all available zones for the spot
  ├── Each zone shows: name, capacity, price, images
  └── User selects one or more zones

Step 2 — Date Selection
  ├── Airbnb-style calendar
  ├── Blocked dates shown (already booked)
  ├── Color coding: Available (green) / Limited (yellow) / Booked (red)
  ├── Holiday/weekend pricing shown on hover
  └── User selects check-in and check-out date

Step 3 — Guest & Parking
  ├── Adults count (spinner)
  ├── Children count (spinner)
  ├── Parking slots: bike, car, bus, truck
  └── Validation against zone capacity

Step 4 — Food Pre-Order
  ├── Optional food packages
  ├── Breakfast / Lunch / Dinner
  ├── BBQ / Snacks / Cake
  └── Veg / Non-Veg toggle

Step 5 — Add-on Services
  ├── Decoration Package (type + customization)
  ├── DJ Setup
  ├── Photographer
  ├── Tent
  ├── Generator
  └── Local Guide

Step 6 — Pricing Summary
  ├── Base price × days
  ├── Zone addon prices
  ├── Dynamic pricing multiplier (shown as label: "Weekend Rate")
  ├── Food + Add-ons subtotal
  ├── Coupon code input → discount applied
  ├── Wallet balance toggle
  ├── GST (18%) calculation
  └── Grand Total

Step 7 — Payment (Razorpay)
  ├── Razorpay modal opens
  ├── UPI / Card / Net Banking / Wallet
  ├── Payment verification (webhook)
  └── Booking created with status "Confirmed"

Step 8 — Confirmation
  ├── Success page with booking ID + QR code
  ├── Email sent (invoice PDF attached)
  ├── SMS sent (booking details)
  └── WhatsApp message (QR ticket image)
```

---

## 6. Database Schema

### User
```js
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,           // bcrypt hashed
  role: { enum: ['user','staff','manager','admin'] },
  avatar: String,             // Cloudinary URL
  isVerified: Boolean,
  otp: String,
  otpExpiry: Date,
  walletBalance: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  referralCode: String,       // unique, auto-generated
  referredBy: ObjectId,       // ref: User
  wishlist: [ObjectId],       // ref: PicnicSpot
  fcmToken: String,           // Firebase push token
  preferredLanguage: { enum: ['en','hi','or'], default: 'en' },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### PicnicSpot
```js
{
  _id: ObjectId,
  name: String,
  slug: String,               // URL-friendly, unique
  description: String,
  shortDescription: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],    // [longitude, latitude]
    address: String,
    city: String,
    district: String,
    state: { default: 'Odisha' },
    pincode: String
  },
  images: [String],           // Cloudinary URLs
  videos: [String],
  image360: String,
  zones: [ObjectId],          // ref: Zone
  basePrice: Number,          // per person per day
  dynamicPricing: {
    weekendMultiplier: Number,
    holidayMultiplier: Number,
    festivalMultiplier: Number,
    peakSeasonMultiplier: Number,
    offSeasonMultiplier: Number,
    highCrowdMultiplier: Number
  },
  capacity: Number,           // total spot capacity
  openingTime: String,        // "07:00"
  closingTime: String,        // "19:00"
  amenities: [String],
  rules: [String],
  rating: { type: Number, default: 0 },
  reviewCount: Number,
  isFeatured: Boolean,
  isActive: Boolean,
  seoMeta: {
    title: String,
    description: String,
    keywords: String,
    ogImage: String
  },
  createdBy: ObjectId,        // ref: User (admin)
  createdAt: Date,
  updatedAt: Date
}
```

### Zone
```js
{
  _id: ObjectId,
  spotId: ObjectId,           // ref: PicnicSpot
  name: String,
  type: { enum: ['swimming','cooking','music','camping','adventure','family','photo','garden','riverside','parking','custom'] },
  description: String,
  images: [String],
  videos: [String],
  price: Number,              // addon price per person
  capacity: Number,
  maxPeople: Number,
  timings: { open: String, close: String },
  rules: [String],
  status: { enum: ['active','inactive','maintenance'] },
  bookingLimit: Number,       // max concurrent bookings
  isActive: Boolean,
  createdAt: Date
}
```

### Booking
```js
{
  _id: ObjectId,
  bookingId: String,          // human-readable "PKU-2026-00123"
  userId: ObjectId,           // ref: User
  spotId: ObjectId,           // ref: PicnicSpot
  zones: [ObjectId],          // ref: Zone[]
  dates: { start: Date, end: Date },
  duration: Number,           // days
  guests: { adults: Number, children: Number },
  parking: { bike: Number, car: Number, bus: Number, truck: Number },
  food: [{
    itemId: ObjectId,
    name: String,
    quantity: Number,
    price: Number,
    type: String
  }],
  decoration: {
    type: String,
    packageId: ObjectId,
    price: Number,
    notes: String
  },
  addons: {
    djSetup: Boolean,
    photographer: Boolean,
    tent: Boolean,
    generator: Boolean,
    guide: Boolean
  },
  addonPrice: Number,
  couponCode: String,
  couponDiscount: Number,
  walletUsed: Number,
  subtotal: Number,
  gst: Number,
  grandTotal: Number,
  status: { enum: ['pending','confirmed','checkedIn','checkedOut','cancelled','refunded'] },
  payment: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    method: String,
    paidAt: Date,
    amount: Number
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    razorpayRefundId: String
  },
  qrCode: String,
  invoiceUrl: String,
  checkedInAt: Date,
  checkedOutAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Review
```js
{
  _id: ObjectId,
  userId: ObjectId,
  spotId: ObjectId,
  bookingId: ObjectId,        // verified badge
  rating: { type: Number, min: 1, max: 5 },
  title: String,
  comment: String,
  images: [String],
  videoUrl: String,
  isVerified: Boolean,
  helpfulVotes: Number,
  adminReply: { text: String, repliedAt: Date },
  isApproved: Boolean,
  createdAt: Date
}
```

### Coupon
```js
{
  _id: ObjectId,
  code: String,               // unique, uppercase
  type: { enum: ['flat','percentage'] },
  value: Number,
  minOrderAmount: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usedCount: Number,
  applicableTo: { enum: ['all','firstBooking','birthday','referral','festival'] },
  validFrom: Date,
  validUntil: Date,
  isActive: Boolean,
  createdBy: ObjectId
}
```

### WalletTransaction
```js
{
  _id: ObjectId,
  userId: ObjectId,
  type: { enum: ['credit','debit'] },
  amount: Number,
  source: { enum: ['recharge','refund','cashback','referral','reward','booking'] },
  referenceId: String,
  description: String,
  balanceAfter: Number,
  createdAt: Date
}
```

### Notification
```js
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  body: String,
  type: { enum: ['booking','payment','offer','system','review'] },
  isRead: Boolean,
  actionUrl: String,
  createdAt: Date
}
```

### FoodItem
```js
{
  _id: ObjectId,
  name: String,
  category: { enum: ['breakfast','lunch','dinner','bbq','snacks','drinks','cake','package'] },
  type: { enum: ['veg','nonveg','jain'] },
  description: String,
  image: String,
  price: Number,
  isAvailable: Boolean,
  spotId: ObjectId
}
```

### DecorationPackage
```js
{
  _id: ObjectId,
  name: String,
  type: { enum: ['birthday','wedding','anniversary','corporate','babyShower','proposal'] },
  items: [String],
  images: [String],
  price: Number,
  isAvailable: Boolean
}
```

### Blog
```js
{
  _id: ObjectId,
  title: String,
  slug: String,
  content: String,
  excerpt: String,
  category: { enum: ['travel','nature','camping','festival','tips','guide'] },
  coverImage: String,
  author: ObjectId,
  tags: [String],
  seoMeta: { title: String, description: String, keywords: String },
  isPublished: Boolean,
  publishedAt: Date,
  viewCount: Number,
  createdAt: Date
}
```

### Employee
```js
{
  _id: ObjectId,
  userId: ObjectId,
  role: { enum: ['manager','staff','security','guide','cleaner','cook'] },
  assignedSpots: [ObjectId],
  permissions: [String],
  isActive: Boolean,
  createdAt: Date
}
```

### AuditLog
```js
{
  _id: ObjectId,
  adminId: ObjectId,
  action: String,
  targetModel: String,
  targetId: ObjectId,
  changes: Object,
  ip: String,
  userAgent: String,
  createdAt: Date
}
```

### SupportTicket
```js
{
  _id: ObjectId,
  userId: ObjectId,
  subject: String,
  category: { enum: ['booking','payment','refund','technical','other'] },
  messages: [{ sender: ObjectId, text: String, sentAt: Date }],
  status: { enum: ['open','inProgress','resolved','closed'] },
  priority: { enum: ['low','medium','high'] },
  bookingRef: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 7. API Documentation

### Base URL
```
Development:  http://localhost:5000/api
Production:   https://api.picnicutkal.com/api
```

### Auth Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | None |
| POST | `/auth/verify-otp` | Verify email OTP | None |
| POST | `/auth/login` | Login → returns JWT | None |
| POST | `/auth/refresh` | Refresh access token | Refresh token |
| POST | `/auth/forgot-password` | Send reset OTP | None |
| POST | `/auth/reset-password` | Reset with OTP | None |
| POST | `/auth/logout` | Invalidate refresh token | Bearer |

### Spot Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/spots` | List spots (filter, search, paginate) | None |
| GET | `/spots/featured` | Featured spots | None |
| GET | `/spots/map` | All spots with coordinates | None |
| GET | `/spots/:id` | Single spot detail | None |
| POST | `/spots` | Create spot | Admin |
| PUT | `/spots/:id` | Update spot | Admin |
| DELETE | `/spots/:id` | Delete spot | Admin |
| POST | `/spots/:id/images` | Upload images (Cloudinary) | Admin |

### Zone Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/zones?spotId=` | Zones for a spot | None |
| GET | `/zones/:id` | Single zone | None |
| POST | `/zones` | Create zone | Admin |
| PUT | `/zones/:id` | Update zone | Admin |
| DELETE | `/zones/:id` | Delete zone | Admin |

### Booking Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/bookings` | My bookings | User |
| GET | `/bookings/:id` | Booking detail | User/Admin |
| POST | `/bookings` | Create booking | User |
| POST | `/bookings/check-availability` | Check slot availability | User |
| POST | `/bookings/:id/cancel` | Cancel booking | User/Admin |
| PUT | `/bookings/:id/status` | Update status | Admin |
| GET | `/bookings/:id/invoice` | Download invoice PDF | User |
| GET | `/bookings/:id/qr` | Download QR ticket | User |

### Payment Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/create-order` | Create Razorpay order | User |
| POST | `/payments/verify` | Verify payment signature | User |
| POST | `/payments/refund/:bookingId` | Initiate refund | Admin |
| GET | `/payments/transactions` | All transactions | Admin |

### Review Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reviews?spotId=` | Spot reviews | None |
| POST | `/reviews` | Submit review | User |
| PUT | `/reviews/:id` | Edit review | User |
| DELETE | `/reviews/:id` | Delete review | User/Admin |
| POST | `/reviews/:id/reply` | Admin reply | Admin |
| PUT | `/reviews/:id/approve` | Approve review | Admin |

### User Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | My profile | User |
| PUT | `/users/me` | Update profile | User |
| POST | `/users/me/avatar` | Upload avatar | User |
| GET | `/users/me/wishlist` | My wishlist | User |
| POST | `/users/me/wishlist/:spotId` | Toggle wishlist | User |
| GET | `/users/me/wallet` | Wallet balance + history | User |
| POST | `/users/me/wallet/recharge` | Recharge wallet | User |
| GET | `/users/me/notifications` | Notifications | User |
| PUT | `/users/me/notifications/read` | Mark all read | User |

### Admin Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/dashboard` | KPI stats + charts data | Admin |
| GET | `/admin/users` | All users (search, filter) | Admin |
| PUT | `/admin/users/:id/suspend` | Suspend/unsuspend | Admin |
| GET | `/admin/bookings` | All bookings | Admin |
| GET | `/admin/reports/revenue` | Revenue report | Admin |
| GET | `/admin/reports/gst` | GST report | Admin |
| GET | `/admin/reports/export` | Export CSV/PDF | Admin |
| GET | `/admin/audit-logs` | Audit log | Admin |

### Coupon Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/coupons/validate` | Validate + get discount | User |
| GET | `/coupons` | All coupons | Admin |
| POST | `/coupons` | Create coupon | Admin |
| PUT | `/coupons/:id` | Update coupon | Admin |
| DELETE | `/coupons/:id` | Delete coupon | Admin |

---

## 8. Folder Structure

```
picnicutkal/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── home/
│   │   │   ├── spots/
│   │   │   ├── booking/
│   │   │   ├── dashboard/
│   │   │   ├── map/
│   │   │   ├── gallery/
│   │   │   └── admin/
│   │   ├── pages/
│   │   ├── pages/admin/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── store/
│   │   ├── services/
│   │   ├── animations/
│   │   ├── utils/
│   │   ├── i18n/
│   │   └── types/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── database/
│   └── seeds/
├── docker/
├── nginx/
├── scripts/
├── documentation/
└── README.md
```

---

## 9. Technology Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework + fast build |
| TypeScript | Type safety |
| React Router DOM v6 | Routing |
| Framer Motion | Animations |
| GSAP + ScrollTrigger | Scroll parallax |
| Zustand | Global state |
| React Query | Server-state caching |
| Axios | HTTP client |
| React Leaflet | Maps |
| i18next | Multi-language |
| Swiper.js | Carousels |
| Recharts | Admin charts |
| React Helmet Async | SEO meta |
| vite-plugin-pwa | PWA support |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js 20 | Runtime |
| Express.js 4 | HTTP server |
| MongoDB 7 + Mongoose | Database |
| JWT + bcrypt | Auth + passwords |
| Multer + Cloudinary | File uploads |
| Nodemailer | Email |
| Fast2SMS | SMS |
| Firebase Admin | Push notifications |
| Razorpay SDK | Payments |
| PDFKit | Invoice PDF |
| qrcode | QR tickets |
| Helmet + CORS | Security |
| express-rate-limit | Rate limiting |

### DevOps
| Tool | Purpose |
|------|---------|
| Docker + Docker Compose | Containers |
| Nginx | Reverse proxy + SSL |
| Let's Encrypt | Free SSL |
| GitHub Actions | CI/CD |
| MongoDB Atlas | Cloud DB |
| Cloudinary | Media CDN |
| PM2 | Process manager |

---

## 10. UI Design Guidelines

### Color Palette
```css
:root {
  --color-forest-green:  #1B4332;
  --color-dark-green:    #0A2617;
  --color-medium-green:  #2D6A4F;
  --color-light-green:   #52B788;
  --color-mint:          #95D5B2;
  --color-gold:          #C9A84C;
  --color-gold-light:    #E6C97A;
  --color-cream:         #F5F0E8;
  --color-cream-dark:    #EDE8DC;
  --color-white:         #FFFFFF;
  --color-black:         #0D0D0D;
}
```

### Typography
- **Headings**: Playfair Display (serif, luxury feel)
- **Body**: Inter (clean, readable)
- **Mono/Prices**: JetBrains Mono

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

### Animation Principles
- Page transitions: 300ms fade + slight Y translate
- Card hover: scale(1.03) + shadow elevation
- Scroll reveals: fade-up with 60ms stagger
- Hero parallax: background at 0.5x scroll speed

---

## 11. User Roles & Permissions

| Permission | User | Staff | Manager | Admin |
|-----------|------|-------|---------|-------|
| View spots/zones | ✅ | ✅ | ✅ | ✅ |
| Book a spot | ✅ | — | — | ✅ |
| Submit review | ✅ | — | — | ✅ |
| QR scan check-in | — | ✅ | ✅ | ✅ |
| Approve/reject bookings | — | — | ✅ | ✅ |
| Create/edit spots | — | — | — | ✅ |
| Manage users | — | — | — | ✅ |
| Manage employees | — | — | — | ✅ |
| Process refunds | — | — | — | ✅ |
| Admin dashboard | — | — | — | ✅ |
| CMS / Blog | — | — | — | ✅ |
| Audit logs | — | — | — | ✅ |

---

## 12. Razorpay Integration

### Payment Flow
```
1. POST /api/payments/create-order
   → Backend creates Razorpay order { amount (paise), currency, receipt }
   → Returns { orderId, amount, key }

2. Frontend opens Razorpay modal
   → User pays via UPI / Card / Net Banking / Wallet

3. POST /api/payments/verify
   → Backend verifies HMAC-SHA256 signature
   → Booking confirmed, invoice + QR generated
   → Email + SMS + WhatsApp sent
```

### Refund Flow
```
Admin → POST /api/payments/refund/:bookingId
  → razorpay.payments.refund(paymentId, { amount })
  → Booking status → "refunded"
  → Wallet credited + user notified
```

### Environment Variables
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

---

## 13. Maps Integration

### Leaflet.js (Default — Free, No API Key)
- Custom forest-green spot markers
- Popup cards with image, price, rating, quick-book button
- Current location detection
- Layer toggles: hotels, restaurants, temples, hospitals, ATMs, petrol pumps

### Nearby Places (Overpass API — Free)
```js
const query = `[out:json]; node["amenity"="restaurant"](around:2000,${lat},${lon}); out body;`
fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
```

### Switching to Google Maps
```env
VITE_MAP_PROVIDER=google
VITE_GOOGLE_MAPS_KEY=AIzaSy...
```

---

## 14. Email & SMS Workflow

### Email Templates (Nodemailer)
| Trigger | Content |
|---------|---------|
| Registration | Welcome + OTP |
| Booking Confirmed | Details + PDF invoice + QR image |
| Booking Cancelled | Confirmation + refund info |
| Password Reset | OTP code |
| Review Request | Post-checkout review link |
| Admin Broadcast | Custom message |

### SMS (Fast2SMS)
```
PicnicUtkal: Booking Confirmed!
ID: PKU-2026-00123 | Spot: Nandankanan
Date: 15-Jul | Guests: 4 | Amount: ₹2400
Show QR at entry. Support: 1800-XXX-XXXX
```

### WhatsApp (WATI/Interakt)
- Booking confirmation + QR image
- 24-hour visit reminder

---

## 15. Security Features

| Layer | Implementation |
|-------|---------------|
| Authentication | JWT (15min) + Refresh token (7d, httpOnly cookie) |
| Authorization | RBAC middleware on all protected routes |
| Password | bcrypt, 12 salt rounds |
| Input Validation | Joi schemas on all POST/PUT |
| Rate Limiting | 100 req/15min per IP |
| HTTP Headers | Helmet.js |
| CORS | Whitelist: picnicutkal.com |
| XSS | xss-clean middleware |
| Payment Verification | HMAC-SHA256 on every payment |
| Audit Logs | All admin actions logged |

---

## 16. Deployment Guide

### Quick Start (Docker)
```bash
git clone https://github.com/yourusername/picnicutkal.git
cd picnicutkal
cp backend/.env.example backend/.env    # Fill API keys
cp frontend/.env.example frontend/.env # Fill API keys
docker-compose up -d --build
npm run seed  # Seed sample Odisha spots
```

### SSL (Let's Encrypt)
```bash
certbot certonly --standalone -d picnicutkal.com -d www.picnicutkal.com
```

### Nginx Config (Reverse Proxy)
```nginx
server {
    listen 443 ssl;
    server_name picnicutkal.com;
    location /    { proxy_pass http://frontend:80; }
    location /api { proxy_pass http://backend:5000; }
}
```

### CI/CD (GitHub Actions)
```yaml
on: push
jobs:
  deploy:
    steps:
      - uses: actions/checkout@v3
      - run: ssh server 'cd /picnicutkal && git pull && docker-compose up -d --build'
```

---

## 17. Backup & Restore

### Automated Daily Backup
```bash
# backup.sh (daily cron)
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGO_URI" --out="/backups/$DATE"
tar -czf "/backups/$DATE.tar.gz" "/backups/$DATE"
```

### Restore
```bash
tar -xzf /backups/20260712_120000.tar.gz -C /tmp/
mongorestore --uri="$MONGO_URI" /tmp/20260712_120000/
```

### Schedule
- Database: Daily (keep 30 days)
- Media: Cloudinary CDN (permanent)
- Logs: Weekly rotation (keep 90 days)

---

## 18. Future Enhancements

| Feature | Description |
|---------|-------------|
| **Mobile Apps** | React Native (iOS + Android) using same REST API |
| **Advanced AI** | ML-based recommendations, demand forecasting |
| **AR Preview** | WebXR: view spot in augmented reality |
| **Loyalty Tiers** | Bronze / Silver / Gold / Platinum membership |
| **B2B Portal** | Corporate bulk booking, PO/invoice, account manager |
| **Multi-Vendor** | Independent spot owners, revenue sharing |
| **AI Chatbot** | Odia/Hindi/English voice + text booking assistant |
| **Live Streaming** | Watch spots live before booking |
| **Carbon Credits** | Track and offset nature impact |

---

*PicnicUtkal Documentation — Maintained by the Development Team*
*For support: dev@picnicutkal.com*

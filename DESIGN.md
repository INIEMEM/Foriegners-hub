# Foreigners Hub Design System

## 1. Brand
**Brand Name:** Foreigners Hub

**Core Categories:**
1. Bikes
2. Apartments

*Important:* Bikes are the first operational service being launched, but Bikes are NOT the only or "main" Foreigners Hub service. Apartments must remain a first-class service category.

## 2. Brand Positioning
**Positioning Statement:** "Move around. Settle in."

The platform must communicate both core services (Bikes and Apartments). It must NOT position Foreigners Hub as simply a bicycle rental company.

*Note:* The phrase "Everything you need, while you're here" should NOT be used because it implies services beyond the current scope.

## 3. Target Audience
**Primary Audience:** Students and foreigners looking for reliable, transparent, and trustworthy bike and apartment rentals.

**Brand Personality:**
- Professional
- Premium
- Clean
- Modern
- Trustworthy
- Student-friendly
- Practical
- Human
- Established

## 4. Typography
**Approved Font:** Plus Jakarta Sans

**Implementation:**
The font is loaded via `next/font/google` in `app/layout.jsx` and injected as a CSS variable (`--font-plus-jakarta-sans`). It is the primary sans-serif font for the entire application.

**Font Weights:**
- 300 (Light)
- 400 (Regular) - Standard body text
- 500 (Medium) - Secondary UI text
- 600 (Semi-Bold) - Subheadings
- 700 (Bold) - Primary buttons and emphasis
- 800 (Extra-Bold) - Main page headings

**Typography Hierarchy (defined in `globals.css`):**
- `h1`: 2.25rem (36px), Extra-Bold (800)
- `h2`: 1.875rem (30px), Extra-Bold (800)
- `h3`: 1.5rem (24px), Semi-Bold (600)
- `h4`: 1.25rem (20px), Semi-Bold (600)
- `h5`: 1.125rem (18px), Medium (500)
- `h6`: 1rem (16px), Medium (500)

## 5. Colour System
The primary brand colour is **BLUE**. Supporting colours must not compete with the primary blue brand identity.

| Name | Hex Value | Usage |
| :--- | :--- | :--- |
| **Brand Blue** | `#315CFF` | Primary brand identity, buttons, links, active states |
| **Bikes Green** | `#16A34A` | Bike category accents, success states |
| **Apartments Orange** | `#EA580C` | Apartment category accents, warning states, pending payments |
| **Danger Red** | `#DC2626` | Errors, warnings, overdue states, cancellations |
| **Neutrals** | `#fbfcff`, `#f7f9fc`, `#ffffff` | Backgrounds, gradients, text, borders (`slate` palette) |

## 6. Logo
The official Foreigners Hub logo is an image asset (`public/logo.jpg`). It is rendered using the `Logo` component (`@/components/shared/Logo.jsx`) via `next/image` to optimize delivery.

*Important:* Do not invent a replacement logo or revert to a text-based placeholder. The logo component must be used across the Navigation, Footer, and Authentication pages.

## 7. Visual Direction
The design should be minimal but NOT empty. It relies on strong composition, typography, whitespace, imagery, hierarchy, and purposeful visual elements.

**Avoid these visual patterns:**
- Unnecessary or excessive gradients
- Glassmorphism (except for defined `.premium-card` usage)
- Random decorative blobs
- Excessive 3D decoration
- Excessive shadows
- Excessive rounded cards
- Generic AI/SaaS aesthetics
- Unnecessary animation
- Decorative elements without purpose

## 8. Imagery
**Philosophy:** Use high-quality real photography. AI-generated imagery may be used temporarily for development, but should not be treated as final client photography.

**Current State:**
Development imagery (e.g., Engwe M20 bike) is currently used as placeholders. These will be replaced with real client photography in the future.

## 9. Homepage
**Purpose:** Represents the Foreigners Hub brand and communicates both core services (Bikes and Apartments).

**Hierarchy:**
The homepage should balance the presence of both service lines, guiding users to either browse bikes or browse apartments. It utilizes the "Move around. Settle in." concept.

## 10. Navigation
**Public Navigation Links:**
- Why us
- Bikes
- Apartments
- How it works

**Actions:**
- Log in
- Primary CTA

**Experience Distinction:**
- **Public browsing:** Exploration of services, catalogues, and pricing.
- **Authenticated dashboard:** Management of active rentals, payments, and account history.

## 11. Bikes
**Bike Experience:**
Users can browse the catalogue, view details, and initiate rentals. Both regular and electric bicycles are supported. Each bike is identified by a unique `B-Code`.

**Pricing Rules:**
- 1 week — €55
- 2 weeks — €110
- 3 weeks — €150
- 4 weeks / 1 month — €170
- 2 months — €340
- 3 months — €450

**Deposit:** New rentals require a €50 refundable deposit. Qualifying continuous renewals do not require the deposit again.

## 12. Apartments
Apartments are a first-class category. Users should be able to browse actual apartment listings.

**Status:** The exact apartment catalogue and detail experience is structurally defined but specific business rules for apartments are currently marked as "Not yet defined."

## 13. Repairs
**Current repair services include:**
- Brake pad replacement
- Brake adjustment
- Tire repair
- Tube replacement
- Chain service
- Other services

*Rule:* Repair prices must NOT be displayed to the user.

## 14. User Dashboard
**Purpose:** Centralized management for authenticated users.

**Capabilities (Current & Planned):**
- Current rental overview (Bike/B-Code)
- Rental dates & progress tracking
- Payment status & history
- Access to electronic contract
- Rental history
- Notifications
- Rental extension (when implemented)

The dashboard design language remains consistent with the public Foreigners Hub styling (e.g., premium cards, clear status indicators).

## 15. Admin UI
**Design Principles:** The admin dashboard feels like the same Foreigners Hub product but is heavily optimized for operational focus.

**Patterns Used:**
- Filterable data tables and lists
- Clear status badges (e.g., Payment Verification)
- Modals/dialogs for detailed entity views (Users, Contracts)
- Calendar views for operational scheduling
- Segmented control tabs for navigation (Rentals, Payments, Bikes, Apartments, Users, etc.)

## 16. Responsive Design
**Philosophy:** Mobile should not simply be a compressed desktop version. The layout must adapt gracefully.

- **Desktop:** Multi-column layouts, rich side-by-side data presentation.
- **Tablet:** Adjusted grid columns, touch-friendly targets.
- **Mobile:** Hamburger navigation, stacked cards, full-width buttons, comfortable touch targets (min 44px), and optimized typography scales to prevent horizontal scrolling.

## 17. Components
**Current Conventions:**
- **Cards:** The `.premium-card` class applies a specific style: white background with slight transparency, a subtle border, strong drop shadow, and a backdrop blur.
- **Buttons:** Solid blue brand buttons for primary actions, ghost/outline buttons for secondary.
- **Border Radius:** Typically `rounded-xl` or `rounded-2xl` for cards, and `rounded-lg` or `rounded-full` for smaller interactive elements.
- **Badges:** Colored background with a darker text color (e.g., green-100 bg / green-800 text) for statuses.
- **Section Labels:** The `.section-eyebrow` class creates a tracked-out, uppercase label with an adjacent line accent.

## 18. Content Rules
**Strict Rule:** The UI must NOT invent business information.
Do not invent:
- Statistics
- Reviews
- Customer counts
- Awards
- Locations
- Pricing
- Business policies
- Testimonials
- Service claims

Use only approved business information and dynamic data.

## 19. Accessibility
**Guidelines:**
- Maintain high color contrast.
- Ensure all interactive elements have visible `:focus-visible` states (currently standardized in `globals.css` with a blue ring).
- Use semantic HTML.

## 20. Rules for AI Coding Agents
**AI Agents MUST adhere to the following:**
1. Preserve the Foreigners Hub design system.
2. Do not introduce TypeScript.
3. Do not introduce a different visual language.
4. Do not add gradients just because they are fashionable.
5. Do not introduce glassmorphism (beyond the established `.premium-card` usage).
6. Do not create generic AI/SaaS layouts.
7. Do not replace the official logo.
8. Do not invent business information.
9. Keep Blue as the dominant brand colour.
10. Treat Bikes and Apartments as the two core service categories.
11. Reuse existing components and design tokens where possible.
12. Make visual changes deliberately and consistently.

## 21. Open Decisions / Not Yet Defined
- Specific business rules, pricing, and exact user flows for the **Apartments** category.
- Comprehensive strategy for final client photography replacement.
- Logic and final design for automated rental extensions.

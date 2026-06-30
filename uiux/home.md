# UI/UX Specification: Public Site & Home Page

## 1. Design System & Visual Language

### Typography
Unlike the internal dashboards that use `Inter`, the public-facing pages utilize an elegant, modern Arabic-first typography to communicate the university's brand effectively.
- **Primary Font Family (All Headings & Body):** `Cairo`, sans-serif
- **Fallback Font:** `Roboto`, sans-serif

**Typographic Scale & Weights:**
- **Hero Title (H2 equivalent):** 3.5rem (Desktop), 2.5rem (Mobile), Weight: 800 (Extra Bold)
- **Hero Subtitle (H4 equivalent):** 2rem (Desktop), 1.5rem (Mobile), Weight: 600 (Semi-Bold)
- **Section Headers (H3 equivalent):** 2.25rem, Weight: Bold
- **Card Titles (H6 equivalent):** 1.25rem, Weight: Bold
- **Body Default:** 1rem, Line Height: 1.8, Weight: 400 (Regular)
- **Chips/Badges:** 0.875rem, Weight: Bold

### Color Palette
The public site uses a highly vibrant, deep-contrast theme to create a premium, welcoming aesthetic.

**Core Brand Colors:**
- **Primary Dark (Hero Background):** `#0A2342` (Midnight Blue) scaling to `#1a3a5c`.
- **Primary Accent:** `#FFC107` (Amber/Gold). Gradient variants go up to `#FFD54F`.
- **General Background:** `#fafbfc` (Very light gray/off-white)
- **Surface (Cards, Modals):** `rgba(255,255,255,0.9)` (Glassmorphic white)
- **Text Primary (on Light):** `#0A2342`
- **Text Secondary (on Light):** `#666666`
- **Text Primary (on Dark):** `#FFFFFF`

### Spacing & Geometry
- **Border Radii:** Heavy use of rounded corners. `16px` for Cards and Dialogs. Buttons use `12px` for a pill-like appearance.
- **Glassmorphism:** Feature cards use `rgba(255,255,255,0.9)` with a `backdropFilter: blur(10px)` and a subtle `1px solid rgba(0,0,0,0.08)` border.

---

## 2. Information Architecture & Navigation

### Complete Public Sitemap
- `/` - Home Page
- `/about` - About the College
- `/dean-word` - Message from the Dean
- `/vision-mission` - Vision & Mission
- `/regulations` - Academic Regulations
- `/ethics` - Code of Ethics
- `/departments` - Academic Departments Overview
- `/departments/civil` - Civil Engineering Department Page
- `/departments/arch` - Architectural Engineering Department Page
- `/departments/electrical` - Electrical Engineering Department Page
- `/staff` - Public Staff Directory
- `/contact` - Contact Information & Form
- `/student/results` - Public portal to query exam results using ID
- `/login` - Gateway to protected dashboards
- `/change-password` - Password recovery/change utility

### Step-by-Step User Journeys (Top 3 Core Actions)

**Action 1: Prospective Student Exploring Departments**
1. User lands on the Home Page hero section.
2. User clicks the "Discover More" (اكتشف المزيد) button.
3. System scrolls or navigates to the Academic Departments section.
4. User clicks on "Civil Engineering".
5. User reads the department description, views faculty, and sees the curriculum.

**Action 2: Reading the Latest University News**
1. User scrolls down the Home Page to the "Latest News and Events" section.
2. User sees a grid of News Cards displaying headlines, excerpts, and dates.
3. User clicks "Read More" (اقرأ المزيد) on a specific card.
4. A large, beautifully animated Modal (Dialog) opens showing the full article, high-resolution images, and downloadable attachments.

**Action 3: Logging into the System**
1. User lands on the Home Page.
2. User clicks the prominently pulsing "Login to System" (الدخول إلى النظام) button in the Hero section.
3. User is routed to the `/login` authentication screen.

---

## 3. Page-by-Page Layout & Interface Elements

### Screen 1: Home Page - Hero Section
- **Layout:** Min-height `85vh` (Desktop) or `90vh` (Mobile). Two-column grid on desktop (Text on left, Circular Logo on right).
- **UI Components:**
  - **Greeting Chip:** Yellow tinted chip "Welcome to the Engineering Portal".
  - **Typography:** Massive, drop-shadowed titles.
  - **Action Buttons:** "Login" (Outlined white, pulsing animation) and "Discover More" (Outlined white).
  - **Hero Image:** A 280px circular Logo wrapped in a pulsing aura.

### Screen 2: Home Page - Features Section
- **Layout:** 4-column grid intersecting the bottom of the Hero section (negative top margin `-8`).
- **UI Components (`FeatureCard`):**
  - High-elevation glass cards.
  - Icon block: 70x70px gradient yellow box.
  - Hover State: Card translates up by 10px. Icon block scales up 10% and rotates 5 degrees.

### Screen 3: Home Page - News Section
- **Layout:** 3-column masonry/grid layout. Centered section header.
- **UI Components (`NewsCard`):**
  - Top half: Image wrapper with an absolute positioned Date Chip.
  - Bottom half: Title, Content excerpt.
  - Action: "Read More" button spanning full width at the bottom.

### Screen 4: News Details Modal
- **Layout:** Material UI Dialog, `maxWidth="md"`.
- **UI Components:** Header Image, Content Body, Additional Images Grid, Attachments Area.

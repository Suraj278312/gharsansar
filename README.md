# 🌿 Ghar Sansar (घर संसार) — Modern Retail Storefront

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"Everything your home needs."**  
> A bespoke, high-performance editorial e-commerce platform designed for **Ghar Sansar**, a neighbourhood household, kitchenware, storage, and plastics store in **Bhuj, Gujarat**.

---

## 🌟 Overview

**Ghar Sansar** blends warmth and local familiarity with modern digital commerce. Built with **React 19**, **Next.js (Vinext)**, and an editorial design system, the application delivers a rich, fluid shopping journey filled with thoughtful micro-interactions, spring animations, and intuitive checkout workflows.

---

## ✨ Signature Features & Animations

### 🌟 1. Hero & First Impressions
- **Editorial Split-Line Typography Reveal:** Staggered headline animations with smooth upward masking (`Everything your home needs.`).
- **3D Hero Photo Tilt & Specular Glare:** Dynamic perspective tilt reacting to mouse position with realistic glass reflections.
- **Rotating Artisan Badge & Stamp:** Vintage circular SVG stamp (`GHAR SANSAR • BHUJ HOUSEHOLD • EST. 2026`) that gently rotates as you explore.
- **Infinite Announcement Marquee:** Continuous ticker highlighting free local delivery over ₹799 and store updates.

### 🛍️ 2. E-Commerce Delight & Micro-Interactions
- **Flying "Add to Cart" Particle Effect:** Adding any item launches a glowing thumbnail/particle that glides in a parabolic arc directly into the header bag icon, triggering a spring bounce and rolling badge increment.
- **Wishlist Sparkle Burst:** Tapping the heart button triggers an emerald & champagne gold micro-particle sparkle explosion.
- **Live Rolling Price Counter (CountUp):** Real-time odometer / slot-machine transition when changing quantities, updating subtotals, or modifying checkout items.
- **Magnetic Hover Buttons:** Primary action buttons gently track the user's cursor with spring physics and an ivory sheen travelling across the button face.

### 🖼️ 3. Product Cards & Catalog Polish
- **Interactive 3D Card Tilt:** Move your cursor over product cards to tilt them in 3D perspective with soft specular glare.
- **Secondary Image Crossfade on Hover:** Smooth transition revealing alternate product angles on hover.
- **Inertia Drag Product Carousel:** Touch/mouse momentum drag rail with real-time progress pill indicator and smooth navigation arrows.
- **Floating Cursor Follower Pill:** Fluid cursor pill displaying context-aware prompts (*"Quick View"*, *"Explore →"*, *"View Milton ↗"*).

### 🚚 4. Storytelling & Checkout Experience
- **Slide-Over Mini Cart Drawer:** Fast slide-out drawer featuring a live **Free Bhuj Delivery Progress Meter** (unlocks at ₹799+), quantity steppers, and quick checkout links.
- **3-Step Checkout:** Seamless 3-step checkout with delivery address validation (Bhuj PIN `370001`), order summary review, and simulated payment options (COD, UPI, Card).
- **Celebratory Order Confirmation:** High-performance HTML5 Canvas simulation shooting emerald leaves, champagne gold confetti, and an animated checkmark punch.
- **Animated Tracking Stepper:** Dynamic vertical pipeline with glowing status lines and pulsing radar active nodes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) / [Vinext](https://github.com/cloudflare/vinext) (React Server Components) |
| **UI Library** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Design System |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State Management**| React Context + LocalStorage Persistence (`lib/store/state.tsx`) |
| **Components** | Radix UI primitives, Sonner toasts, Vaul drawer |
| **Database ORM** | [Drizzle ORM](https://orm.drizzle.team/) & SQLite / Cloudflare D1 ready |

---

## 📁 Project Architecture

```plaintext
ghar-sansar/
├── app/
│   ├── globals.css          # Core design tokens, keyframes, typography & animations
│   ├── layout.tsx           # Root HTML layout with metadata
│   └── page.tsx             # Main entry point mounting the Storefront
├── components/
│   ├── store/
│   │   ├── storefront.tsx   # Core application views (Home, Shop, Detail, Cart, Checkout, Confirmation, Tracking)
│   │   └── use-store-motion.ts # Motion and scroll observer hooks
│   └── ui/                  # Accessible UI primitives (Dialog, Select, Checkbox, Skeleton, Empty)
├── lib/
│   └── store/
│       ├── catalog.ts       # 80+ sample household, kitchen & plastic products across 9 categories
│       ├── config.ts        # Pricing rules, free delivery threshold (₹799), and Bhuj delivery allowlist
│       └── state.tsx        # StoreProvider, cart & wishlist state, local demo authentication
├── public/
│   └── images/              # Hero photography, category banners, product mockups
├── package.json             # Scripts & dependencies
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v22.13.0` or higher
- **Package Manager**: `npm` (v10+)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Suraj278312/gharsansar.git
cd gharsansar
npm install
```

### 3. Running Locally

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

### 4. Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production server:

```bash
npm run start
```

---

## 🛍️ Demo Shopping Flow

1. **Browse & Filter:** Explore 80+ products across categories like *Kitchenware, Water Bottles & Flasks, Food Storage, Cleaning, Bathroom, and Utility Plastics*. Filter by price, brand (Milton, Boss), and ratings.
2. **Add to Bag:** Watch flying particle animations fly to your header bag. Open the **Slide-Over Mini Cart** to check your free delivery progress.
3. **Checkout:** Proceed to checkout and enter a demo Bhuj address:
   - **City:** `Bhuj`
   - **State:** `Gujarat`
   - **PIN:** `370001`
4. **Order Confirmation:** Enjoy the botanical leaf & gold confetti celebration upon placing your demo order.
5. **Live Tracking:** Jump to order tracking to watch the animated status stepper progress from *Placed* to *Delivered*.

---

## 🎨 Design System & Colors

```css
:root {
  --sand: #FAF8F0;          /* Warm background */
  --forest-green: #173C32;  /* Primary brand & text */
  --emerald-accent: #3D735C;/* Secondary interactive tone */
  --gold-warm: #D4AF37;     /* Highlight & badges */
  --clay-muted: #6B8577;    /* Subtle copy & metadata */
  --border-light: #DCE4DC;  /* Soft structural borders */
}
```

- **Accessibility:** Full `prefers-reduced-motion` compliance, semantic HTML5 landmarks, ARIA labels, and keyboard navigation support.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Crafted with care for <strong>Ghar Sansar · Bhuj</strong> 🏠✨
</p>

<div align="center">

# 🎨 SurabayArt

### Where Surabaya's art scene meets its audience.

A platform for discovering art events in Surabaya, booking tickets, and buying event merchandise, all in one place.

</div>

---

## ✨ About

Information about art events in Surabaya is scattered across social media, digital posters, and separate websites, and ticketing is often handled manually or on different platforms. **SurabayArt** brings it together in one website that connects **art organizers** with **audiences**.

Organizers can list anything from gallery exhibitions to live performances. Visitors can browse what is happening around the city, see event locations on a map, order tickets, and shop for event merchandise.

> 🎓 **Course project.** SurabayArt is a group project (Group 6) for the *Website Programming Practicum* (Praktikum Pemrograman Website), Faculty of Science and Technology, Universitas Airlangga, 2026.
>
> 🍴 This repository is a fork of [reisatanzil/surabayaart](https://github.com/reisatanzil/surabayaart).

<!--
## 📸 Screenshots
Add screenshots here, for example:
![Home](docs/home.png)
-->

## 🚀 Features

SurabayArt has three user roles, each with its own access and dashboard.

| 🎟️ Customers | 🎭 Organizers | 🛡️ Admins |
| --- | --- | --- |
| Sign up and sign in (email or Google) | Sign up as an organizer, then get verified by an admin | Dashboard with platform stats: users, organizers, events, transactions, revenue |
| Browse events that are currently showing | Upload events in a 3-step form: event info, merchandise (optional), payment info | Validate organizer registrations |
| View event details with an interactive map | Add merchandise with photo, price, stock, and description | Validate events before they go public |
| Add tickets to the cart and check out | Track submitted events and their approval status | Monitor users and block violators |
| Pay by bank transfer and upload proof of payment | Validate customer payments by reviewing proof of transfer | Monitor live events and take them down when needed |
| Get an e-ticket with a QR code after purchase | See sales and sold-ticket details per event | View ticket and merchandise sales |
| Leave ratings and reviews after attending | Read customer reviews | |

Every new organizer account and every uploaded event goes through admin approval before it appears publicly.

## 🧰 Tech Stack

**Frontend**
- ⚛️ **React 19** for the component-based UI
- ⚡ **Vite** for fast development and builds
- 🧭 **React Router 7** for single-page navigation
- 🔳 **qrcode.react** for e-ticket QR codes
- 🅰️ **Albert Sans** typography

**Backend**
- 🐘 **Supabase PostgreSQL** for users, events, orders, tickets, and merchandise
- 🗂️ **Supabase Storage** for event posters, merchandise images, and payment proofs
- 🔌 **Supabase JavaScript Client** for authentication and data access

**Tooling and hosting**
- 🧹 **ESLint** for code quality
- ▲ **Vercel** for deployment

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm
- A [Supabase](https://supabase.com/) project

### 1. Clone and install

```bash
git clone https://github.com/florecitazn/surabayaart.git
cd surabayaart
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and you are good to go. 🎉

## 📜 Available Scripts

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Build the app for production         |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

## 🗺️ App Routes

<details>
<summary><b>Click to see all pages</b></summary>

<br>

| Path                   | Role      | Page                   |
| ---------------------- | --------- | ---------------------- |
| `/`, `/signin`         | Public    | Sign in                |
| `/signup`              | Public    | Sign up                |
| `/terms`               | Public    | Terms and conditions   |
| `/home`                | Customer  | Dashboard              |
| `/reservasi`           | Customer  | Events now showing     |
| `/detail/:id`          | Customer  | Event detail           |
| `/cart`                | Customer  | Shopping cart          |
| `/profile`             | Customer  | Profile and tickets    |
| `/my-ticket/:orderId`  | Customer  | E-ticket               |
| `/organizer/dashboard` | Organizer | Organizer dashboard    |
| `/organizer/upload`    | Organizer | Upload event           |
| `/organizer/profile`   | Organizer | Organizer profile      |
| `/admin/dashboard`     | Admin     | Admin dashboard        |

</details>

## 🗄️ Database

The data model has nine entities: users, organizers, admins, events (`pergelaran`), tickets, ticket details, merchandise, orders, and order details.

## 📁 Project Structure

<details>
<summary><b>Click to see the folder layout</b></summary>

```
surabayaart/
├── public/              # Static assets
├── src/
│   ├── pages/
│   │   ├── auth/        # Sign in, sign up
│   │   ├── customer/    # Home, reservation, detail, cart, profile, my ticket
│   │   ├── organizer/   # Dashboard, upload event, profile
│   │   ├── admin/       # Admin dashboard
│   │   └── TermsConditions.jsx
│   └── App.jsx          # Route definitions
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

</details>

## ☁️ Deployment

The app is deployed on [Vercel](https://vercel.com/). To deploy your own copy, import the repository into Vercel and add the same environment variables in the project settings.

## 👥 Team

**Group 6**, Faculty of Science and Technology, Universitas Airlangga.

| Name                              | GitHub                                              |
| --------------------------------- | --------------------------------------------------- |
| Elsa Alfika Dyah Kurniawan P.     | [@elsaalfika](https://github.com/elsaalfika)        |
| Rehat Reisa Tanzil                | [@reisatanzil](https://github.com/reisatanzil)      |
| Zahra Mufida                      | [@zahramufida](https://github.com/zahramufida)      |
| Florecita Zulfa Nasifa            | [@florecitazn](https://github.com/florecitazn)      |

---

<div align="center">

Made with ❤️ for Surabaya's art community

</div>

# SurabayaArt

**SurabayaArt** is a web platform that connects art organizers with audiences in Surabaya. Organizers can list exhibitions, performances, and other art events, while visitors can discover what is happening in the city, buy tickets, and shop for event merchandise, all in one place.

**Live demo:** [surabayaart.vercel.app](https://surabayaart.vercel.app)

> This repository is a fork of [reisatanzil/surabayaart](https://github.com/reisatanzil/surabayaart).

## Features

**For visitors (customers)**
- Browse art events happening in Surabaya, from exhibitions to live performances
- View event details and reserve tickets
- Buy merchandise and manage items in a shopping cart
- Access purchased tickets from a personal "My Ticket" page
- Manage a personal profile

**For organizers**
- Register and publish art events
- Sell tickets for their events
- Manage events from a dedicated dashboard
- Maintain an organizer profile

**For admins**
- Oversee the platform from an admin dashboard

## Tech Stack

- [React 19](https://react.dev/) and [React Router 7](https://reactrouter.com/)
- [Vite](https://vite.dev/) for development and bundling
- [Supabase](https://supabase.com/) for backend services
- [qrcode.react](https://github.com/zpao/qrcode.react) for QR code generation
- [ESLint](https://eslint.org/) for linting
- [Vercel](https://vercel.com/) for deployment

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm
- A [Supabase](https://supabase.com/) project

### Installation

```bash
git clone https://github.com/florecitazn/surabayaart.git
cd surabayaart
npm install
```

### Environment Variables

Create a `.env` file in the project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Build the app for production         |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

## Routes

| Path                  | Role      | Page                   |
| --------------------- | --------- | ---------------------- |
| `/`, `/signin`        | Public    | Sign in                |
| `/signup`             | Public    | Sign up                |
| `/terms`              | Public    | Terms and conditions   |
| `/home`               | Customer  | Event listing          |
| `/reservasi`          | Customer  | Reservation            |
| `/detail/:id`         | Customer  | Event detail           |
| `/cart`               | Customer  | Shopping cart          |
| `/profile`            | Customer  | Profile                |
| `/my-ticket/:orderId` | Customer  | Purchased ticket       |
| `/organizer/dashboard`| Organizer | Organizer dashboard    |
| `/organizer/upload`   | Organizer | Create or upload event |
| `/organizer/profile`  | Organizer | Organizer profile      |
| `/admin/dashboard`    | Admin     | Admin dashboard        |

## Project Structure

```
surabayaart/
├── public/            # Static assets
├── src/
│   ├── pages/
│   │   ├── auth/      # Sign in, sign up
│   │   ├── customer/  # Home, reservation, detail, cart, profile, my ticket
│   │   ├── organizer/ # Dashboard, upload event, profile
│   │   ├── admin/     # Admin dashboard
│   │   └── TermsConditions.jsx
│   └── App.jsx        # Route definitions
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

## Deployment

The project is deployed on Vercel. To deploy your own copy, import the repository into Vercel and add the same environment variables from the section above in the project settings.

## Acknowledgements

Original project by [reisatanzil](https://github.com/reisatanzil/surabayaart).

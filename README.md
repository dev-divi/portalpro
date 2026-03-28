# PortalPro

A password-protected client portal builder for freelancers and creative agencies. Build beautiful, branded project dashboards for your clients — encrypted end-to-end, shareable as a magic link or `.enc` file.

## What It Does

PortalPro has two views:

**Builder (for you):** Set up a project with client name, deadline, status, accent color, logo, milestones, and resource links. When ready, encrypt the whole thing with a master password and get a shareable magic link or downloadable `.enc` file.

**Client Portal (for your client):** A polished, locked dashboard. Your client enters the access key, the project decrypts client-side, and they see a live timeline, progress bar, and resource vault — no server, no accounts, no database.

## Who It's For

Freelance designers, developers, photographers, and creative agencies who want to give clients a professional project-tracking experience without setting up a backend.

## Key Features

- **AES encryption** — all project data encrypted in the browser before sharing; nothing transmitted to a server
- **Magic link sharing** — encrypted payload embedded in URL hash; paste and send
- **Milestone timeline** — clients can approve individual milestones directly in the portal, with animated confirmation
- **Resource vault** — organized links to contracts, invoices, deliverables, and mood boards
- **Custom branding** — per-project accent color and logo upload
- **Deadline tracking** — live countdown with color-coded urgency
- **Draft autosave** — builder state saved to localStorage so you never lose work
- **Framer Motion animations** — smooth transitions between lock, portal, and builder views

## Tech Stack

- React 18
- Vite
- Framer Motion
- Lucide React (icons)
- Web Crypto API (AES-GCM encryption, no external crypto library)
- Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The app opens in Builder mode. Fill out your project details, upload a logo, set milestones and resources, then hit **Encrypt & Generate** with a master password. Copy the magic link and send it to your client — they open it in any browser, enter the password, and see their portal.

## How the Encryption Works

When you click Encrypt, the project JSON is encrypted using AES-GCM via the browser's native Web Crypto API. The encrypted blob is base64-encoded and placed in the URL hash (`#...`). The encryption key is derived from your password using PBKDF2. Nothing leaves the client's browser unencrypted.
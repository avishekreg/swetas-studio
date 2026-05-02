# Sweta's Studio

Boutique storefront and back-office app built with Vite, React, Firebase, and Netlify.

## Local development

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm run dev`
3. Verify types:
   `npm run lint`

## Netlify deployment

Build settings:
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Firebase access model

Current internal roles:
- `super_admin`: recovery lane, admin resets, access governance
- `admin`: daily boutique operations and limited staff management
- `order_fulfillment`
- `shipping`
- `customer_care`
- `promotions`
- `customer`

## Required Netlify environment variables for secure staff controls

Set these in Netlify before using the super-admin recovery tools:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_DATABASE_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

These power the server-side staff management function in `netlify/functions/admin-users.mjs`.

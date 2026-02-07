# **App Name**: OpsMarketplace

## Core Features:

- User Authentication: Firebase Authentication for SME, Consultant, and Admin roles with email/password login and profile storage in Firestore.
- Service Category Management: Predefined service categories (Labour Compliance, Payroll, HR, etc.) stored and managed in Firestore.
- Service Request Submission: SME users submit service requests via a simple form, with data stored in Firestore. Fields include service category, company details, and description.
- Consultant Profile Creation: Consultants create profiles detailing services offered, locations served, and contact information. Stored in Firestore.
- Lead Matching Engine: Cloud Function automatically matches new service requests with consultants based on service category and location, creating lead assignments in Firestore.
- Consultant Dashboard: Consultants view matching leads with request details and contact information.
- SME Request Dashboard: SME users track submitted requests and their statuses.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5), conveying professionalism and reliability, key for operational services.
- Background color: Very light grey (#F0F2F5), for a clean, modern backdrop.
- Accent color: Muted violet (#9575CD) used sparingly to highlight key actions and elements, analogous to indigo.
- Body and headline font: 'Inter', a sans-serif typeface providing excellent legibility and a neutral, modern aesthetic.
- Simple, professional icons from a consistent set (e.g., Material Design Icons) to represent service categories and actions.
- Clean, card-based layout to display service requests and consultant profiles clearly. Focus on readability and scannability.
- Subtle transitions and loading animations to provide feedback and enhance the user experience without being distracting.
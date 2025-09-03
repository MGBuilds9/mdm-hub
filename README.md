# MDM Hub - Construction Project Management

A comprehensive multi-tenant construction project management application built with Next.js 14, Supabase, and TypeScript.

## Features

### 🏗️ Multi-Tenant Architecture

- 5 divisions: Group, Contracting, Homes, Wood, Telecom
- Users can belong to multiple divisions with different roles
- Row Level Security (RLS) for data isolation
- Division-based project management

### 🔐 Dual Authentication System

- **Azure AD SSO** for internal staff
- **Supabase Email/OTP** for external users (clients, subcontractors)
- Role-based access control
- Session management and token refresh

### 📊 Project Management

- Project creation and management
- User assignment to projects
- Photo gallery with EXIF data
- Change orders with approval workflow
- Real-time notifications

### 🎨 Modern UI/UX

- Tailwind CSS with MDM brand colors
- Radix UI primitives for accessibility
- Mobile-first responsive design
- Loading states and error boundaries
- Toast notifications

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Architecture**: Hybrid Server/Client Components (App Router)
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Azure AD, Supabase Auth
- **State Management**: React Query, React Context
- **Validation**: Zod
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Azure AD app registration (for internal users)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mdm-hub
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Azure AD Configuration
NEXT_PUBLIC_AZURE_CLIENT_ID=your_azure_client_id
NEXT_PUBLIC_AZURE_TENANT_ID=your_azure_tenant_id
NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3000/auth/callback
```

4. Set up the database:

```bash
# Run the SQL schema in your Supabase SQL editor
# File: supabase/schema.sql
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router (Server Components)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout (Server)
│   ├── page.tsx           # Home page (Server)
│   ├── dashboard/         # Dashboard pages (Server)
│   ├── projects/          # Project pages (Server)
│   ├── team/              # Team pages (Server)
│   ├── settings/          # Settings pages (Server)
│   └── test/              # Test page (Server)
├── components/            # React components
│   ├── auth/              # Authentication components (Client)
│   ├── dashboard/         # Dashboard components (Mixed)
│   ├── layout/            # Layout components (Mixed)
│   ├── pages/             # Page wrappers (Client/Server)
│   │   ├── client-*.tsx   # Client component wrappers
│   │   └── server-*.tsx   # Server component wrappers
│   ├── providers/         # Context providers (Client)
│   └── ui/                # Reusable UI components (Mixed)
├── contexts/              # React contexts (Client)
├── hooks/                 # Custom hooks (Client)
├── lib/                   # Utility libraries
│   ├── database.ts        # Database operations
│   ├── realtime.ts        # Real-time subscriptions
│   ├── supabase.ts        # Supabase client
│   ├── validation.ts      # Zod schemas
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript types
└── middleware.ts          # Next.js middleware
```

### Architecture Overview

The application uses a **hybrid server/client architecture** to optimize performance and resolve SSR issues:

- **Server Components**: Handle static content, SEO, and initial page loads
- **Client Components**: Handle interactive features, state management, and user interactions
- **Hybrid Pages**: Server pages that render client components for interactivity

## Database Schema

The application uses a comprehensive PostgreSQL schema with:

- **Users**: User profiles and authentication
- **Divisions**: Multi-tenant organization structure
- **Projects**: Project management and tracking
- **Photos**: Photo gallery with EXIF data
- **Change Orders**: Approval workflow system
- **Notifications**: Real-time notification system
- **Audit Trail**: Complete change tracking

### Key Features:

- Row Level Security (RLS) policies
- Foreign key constraints
- Indexes for performance
- Triggers for audit trails
- Sample data for testing

## Authentication

### Azure AD (Internal Users)

- Single Sign-On (SSO) integration
- Automatic user provisioning
- Role-based access control

### Supabase Auth (External Users)

- Email/password authentication
- OTP verification
- Password reset functionality

## API Integration

### Supabase Client

- Type-safe database operations
- Real-time subscriptions
- File storage for photos
- Row Level Security enforcement

### React Query

- Data fetching and caching
- Optimistic updates
- Error handling
- Loading states

## UI Components

### Design System

- **Colors**: Orange (#FFAA33), Beige (#FFEFDB), Charcoal (#1B1B1A)
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Responsive**: Mobile-first approach

### Component Library

- Buttons with multiple variants
- Form inputs with validation
- Data tables with sorting/filtering
- Modal dialogs and dropdowns
- Toast notifications
- Photo upload components
- Loading states and error boundaries

## Recent Updates

### 🚀 Hybrid Architecture Implementation (Latest)

**Problem Solved**: React hooks SSR errors during build process
**Solution**: Implemented hybrid server/client component architecture

#### Key Changes:
- **Server Components**: Static content, SEO optimization, initial page loads
- **Client Components**: Interactive features, state management, user interactions
- **Clean Separation**: No more SSR conflicts with React hooks
- **Build Success**: ✅ All pages build successfully without errors

#### Benefits:
- **Performance**: Server components are pre-rendered, client components hydrate
- **SEO**: Static content is server-rendered for better search engine optimization
- **Maintainability**: Clear separation of concerns between server and client code
- **Deployability**: Ready for production deployment without SSR issues

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for git hooks (optional)

## Testing

Visit `/test` to access the implementation test page that verifies:

- Authentication system
- Database connectivity
- UI components
- Responsive design

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

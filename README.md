# MDM Construction Hub

A professional construction project management platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🏗️ **Project Management**: Track and manage construction projects from start to finish
- 👥 **Team Collaboration**: Manage team members and assign tasks
- 📊 **Dashboard Analytics**: Real-time project insights and progress tracking
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- 🎨 **Modern UI**: Clean, professional interface with MDM brand colors
- 🔒 **Type Safety**: Full TypeScript support with strict configuration
- ⚡ **Performance**: Optimized for speed and SEO

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier
- **Utilities**: clsx, tailwind-merge, date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mdm-construction-hub
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp env.example .env.local
```

4. Update the environment variables in `.env.local` with your actual values.

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── home/              # Home page components
│   ├── layout/            # Layout components (Navigation, Footer)
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   └── utils.ts           # Common utilities
└── types/                 # TypeScript type definitions
    └── index.ts           # Global types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Brand Colors

The application uses the following MDM brand colors:

- **Primary Orange**: `#FFAA33`
- **Background Beige**: `#FFEFDB`
- **Text Charcoal**: `#1B1B1A`
- **White**: `#FFFFFF`

## Environment Variables

Copy `env.example` to `.env.local` and configure the following variables:

- Database connection
- Authentication secrets
- API keys for external services
- File storage configuration
- App configuration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email info@mdmconstruction.com or create an issue in the repository.

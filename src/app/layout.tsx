import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { SupabaseProvider } from '@/components/providers/supabase-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/components/ui/toast-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MDM Hub - Construction Project Management',
  description: 'Multi-tenant construction project management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <SupabaseProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </SupabaseProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
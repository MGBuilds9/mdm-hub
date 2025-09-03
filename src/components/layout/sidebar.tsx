'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  BarChart3,
  FolderOpen,
  Camera,
  FileText,
  Bell,
  Settings,
  Users,
  Building2,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';

interface SidebarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    divisions: string[];
  };
  onLogout?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
  divisions?: string[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home as React.ComponentType<{ className?: string }>,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderOpen as React.ComponentType<{ className?: string }>,
  },
  {
    title: 'Photos',
    href: '/photos',
    icon: Camera as React.ComponentType<{ className?: string }>,
  },
  {
    title: 'Change Orders',
    href: '/change-orders',
    icon: FileText as React.ComponentType<{ className?: string }>,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3 as React.ComponentType<{ className?: string }>,
    roles: ['admin', 'manager'],
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users as React.ComponentType<{ className?: string }>,
    roles: ['admin', 'manager'],
  },
  {
    title: 'Divisions',
    href: '/divisions',
    icon: Building2 as React.ComponentType<{ className?: string }>,
    roles: ['admin'],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell as React.ComponentType<{ className?: string }>,
    badge: '3',
  },
];

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const filteredNavigation = navigation.filter(item => {
    if (!user) return false;
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-primary-50 hover:text-primary-700 hover:shadow-sm',
          isActive
            ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-sm border border-primary-200'
            : 'text-charcoal-600 hover:translate-x-1'
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        <div
          className={cn(
            'p-1.5 rounded-lg transition-all duration-200',
            isActive
              ? 'bg-primary-200 text-primary-700'
              : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-primary-200 group-hover:text-primary-600'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="flex-1">{item.title}</span>
        {item.badge && (
          <span className="ml-auto rounded-full bg-error-500 px-2 py-0.5 text-xs text-white font-semibold shadow-sm">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white/90 backdrop-blur-sm border-primary-200 hover:bg-primary-50 shadow-lg"
        >
          {isMobileOpen ? (
            <X className="h-4 w-4 text-primary-600" />
          ) : (
            <Menu className="h-4 w-4 text-primary-600" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 bg-white/95 backdrop-blur-xl border-r border-primary-100 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-primary-100 px-6 bg-gradient-to-r from-primary-50 to-white">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-charcoal-900 to-primary-600 bg-clip-text text-transparent">
                  MDM
                </span>
                <p className="text-xs text-charcoal-500">Construction Hub</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {filteredNavigation.map(item => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          {/* User section */}
          {user && (
            <div className="border-t border-primary-100 p-4 bg-gradient-to-r from-primary-50/50 to-white">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 p-3 h-auto hover:bg-primary-50 rounded-xl transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-primary-200">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold">
                        {user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-charcoal-900">
                        {user.name}
                      </span>
                      <span className="text-xs text-charcoal-500">
                        {user.role}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 backdrop-blur-xl border-primary-100 shadow-xl"
                >
                  <DropdownMenuLabel className="text-charcoal-900">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary-100" />
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-primary-50 focus:bg-primary-50"
                  >
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary-600" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-primary-50 focus:bg-primary-50"
                  >
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary-600" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-100" />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-error-600 hover:bg-red-50 focus:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

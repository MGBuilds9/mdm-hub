import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "lucide-react"

interface SidebarProps {
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    divisions: string[]
  }
  onLogout?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles?: string[]
  divisions?: string[]
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Photos",
    href: "/photos",
    icon: Camera,
  },
  {
    title: "Change Orders",
    href: "/change-orders",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["admin", "manager"],
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
    roles: ["admin", "manager"],
  },
  {
    title: "Divisions",
    href: "/divisions",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: "3",
  },
]

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const filteredNavigation = navigation.filter((item) => {
    if (!user) return false
    if (!item.roles) return true
    return item.roles.includes(user.role)
  })

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-charcoal-100 hover:text-charcoal-900",
          isActive
            ? "bg-primary-100 text-primary-700"
            : "text-charcoal-600"
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        <Icon className="h-4 w-4" />
        {item.title}
        {item.badge && (
          <span className="ml-auto rounded-full bg-error-500 px-2 py-0.5 text-xs text-white">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-charcoal-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-charcoal-200 px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary-500 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-charcoal-900">
                MDM Hub
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {filteredNavigation.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          {/* User section */}
          {user && (
            <div className="border-t border-charcoal-200 p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 p-2 h-auto"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-charcoal-500">
                        {user.role}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-error-600">
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
  )
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Search, ShoppingCart, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchDialog } from "@/components/search-dialog";
// ... (imports remain)

export function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  // useRouter is used inside SearchDialog if we move logic there, but we might keep it header too if needed?
  // Actually SearchDialog handles navigation. We don't need router here for search anymore.
  // We can remove searchQuery state and handleSearch function from Header if we move it to SearchDialog entirely.

  // Let's keep Header clean.

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 md:h-20 max-w-screen-2xl items-center px-4">
        <Link href="/" className="flex items-center mr-4 md:mr-6">
          <Image src="/logo.png" alt="4Fun Logo" width={72} height={72} className="h-12 w-12 md:h-[72px] md:w-[72px] object-contain" priority />
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          <Link href="/productos" className="transition-colors hover:text-primary">
            Productos
          </Link>
          <Link href="/contacto" className="transition-colors hover:text-primary">
            Contacto
          </Link>

          {/* Enlace de Gestión solo para Admins */}
          {user && user.role === 'admin' && (
            <Link href="/admin" className="transition-colors text-primary font-bold flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Gestión
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <SearchDialog
            trigger={
              <Button variant="outline" className="hidden lg:flex w-[200px] lg:w-[300px] justify-between text-muted-foreground relative h-9 px-4 py-2">
                <span className="inline-flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar...
                </span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            }
          />
          {/* Mobile Search Icon Trigger */}
          <SearchDialog
            trigger={
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Search className="h-5 w-5" />
              </Button>
            }
          />

          {/* Wishlist: solo para usuarios con sesión */}
          {user && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* Carrito: siempre visible para que los guest sepan dónde comprar */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label="Shopping cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {user.avatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">{(user.name || 'U')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.name || user.email}
                  <span className="block text-xs text-muted-foreground font-normal capitalize">
                    {user.role}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">Mi Cuenta</Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/products">Administrar Productos</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login" aria-label="Login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link href="/" className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 hover:text-primary transition-colors">
          ShelfLife
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <Link
                href="/books"
                data-testid="link-books"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                My Books
              </Link>
              <span
                data-testid="user-email"
                className="text-xs sm:text-sm font-medium text-gray-600 max-w-[90px] sm:max-w-[220px] truncate"
                title={user.email || ""}
              >
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="btn-logout"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/login")}
                data-testid="btn-login"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/register")}
                data-testid="btn-register"
              >
                Register
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

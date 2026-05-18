// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navLinks = [
    { href: "/generate", label: "Generate" },
    { href: "/trips", label: "My Trips" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.5.5l-.3.3c-.4.4-.5 1-.1 1.4L10 12l-4 4H4l-2 2 2 2 2-2v-2l4-4 3.6 7.1c.4.4 1 .3 1.4-.1l.3-.3c.4-.4.6-1 .5-1.5z"
            />
          </svg>
          <span>Wayfarer</span>
        </Link>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                pathname === link.href
                  ? "bg-white/10 text-white font-medium"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* AUTH */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-7 h-7 rounded-full"
                  />
                )}
                <span className="text-sm text-neutral-400">
                  {user.displayName}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-neutral-300 hover:bg-white/5 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="px-4 py-2 text-sm rounded-lg bg-white text-black font-medium hover:opacity-90 transition"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="md:hidden flex border-t border-white/10">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 text-center py-3 text-sm transition ${
              pathname === link.href
                ? "text-white font-medium bg-white/5"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

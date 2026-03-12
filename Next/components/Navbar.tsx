"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Accueil", page: "home" },
  { href: "/vote", label: "Voter", page: "vote" },
  { href: "/results", label: "Résultats", page: "results" },
  { href: "/dashboard", label: "Espace Candidat", page: "dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <div className="logo-icon">UPC</div>
          <span>Election Poll 2026</span>
        </Link>
        <button
          className={`burger ${open ? "active" : ""}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`nav-links-wrapper ${open ? "open" : ""}`}>
          <div className="nav-links" id="mobile-menu">
            {links.map((link) => {
              const active =
                (link.href === "/" && pathname === "/") ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${active ? "active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}


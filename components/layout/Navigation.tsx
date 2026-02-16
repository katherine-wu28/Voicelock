"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Mic, ShieldCheck, Users, Settings, Lock } from "lucide-react"
import { isAuthenticated } from "@/lib/auth-state"
import { cn } from "@/lib/utils"

const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/enroll", label: "Enroll", icon: Mic },
    { href: "/verify", label: "Verify", icon: ShieldCheck },
    { href: "/profiles", label: "Profiles", icon: Users },
    { href: "/about", label: "Settings", icon: Settings },
]

export function Navigation() {
    const pathname = usePathname()
    const [isAuthed, setIsAuthed] = useState(false)

    useEffect(() => {
        setIsAuthed(isAuthenticated())
    }, [pathname])

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong safe-bottom md:top-0 md:bottom-auto">
            <div className="container mx-auto flex h-16 items-center justify-around px-4 md:justify-end md:gap-1">

                {isAuthed && (
                    <Link
                        href="/dashboard"
                        className={cn(
                            "group relative flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300",
                            "md:flex-row md:gap-2 md:text-sm md:px-4",
                            pathname === "/dashboard"
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {pathname === "/dashboard" && (
                            <span className="absolute inset-0 rounded-xl bg-primary/10 md:bg-primary/5" />
                        )}
                        <span className={cn(
                            "relative z-10 transition-transform duration-300 group-hover:scale-110",
                            pathname === "/dashboard" && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        )}>
                            <Lock className="h-5 w-5 md:h-4 md:w-4" />
                        </span>
                        <span className={cn(
                            "relative z-10",
                            pathname === "/dashboard" && "font-semibold"
                        )}>
                            Dashboard
                        </span>
                        {pathname === "/dashboard" && (
                            <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent md:hidden" />
                        )}
                    </Link>
                )}


                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "group relative flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300",
                                "md:flex-row md:gap-2 md:text-sm md:px-4",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >

                            {isActive && (
                                <span className="absolute inset-0 rounded-xl bg-primary/10 md:bg-primary/5" />
                            )}


                            <span className={cn(
                                "relative z-10 transition-transform duration-300 group-hover:scale-110",
                                isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                            )}>
                                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                            </span>


                            <span className={cn(
                                "relative z-10",
                                isActive && "font-semibold"
                            )}>
                                {label}
                            </span>


                            {isActive && (
                                <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent md:hidden" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

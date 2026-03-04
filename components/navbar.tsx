"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { Separator } from "@/components/ui/separator"

import { PenBox } from "lucide-react"

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="group flex items-center gap-2 text-2xl font-black tracking-tighter transition-all hover:opacity-80">
                        <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                            <PenBox className="h-5 w-5" />
                        </div>
                        collegeBlog
                    </Link>
                    <div className="hidden md:flex gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-semibold transition-colors hover:text-primary ${pathname === "/" ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            Explore
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ModeToggle />
                    <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
                    {user ? (
                        <>
                            <Link href="/dashboard/new" className="hidden sm:block">
                                <Button variant="ghost" size="sm" className="gap-2 font-semibold">
                                    <PenBox className="h-4 w-4 text-primary" />
                                    Write
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="font-semibold">
                                    Dashboard
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-full px-4">
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-semibold">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="rounded-full px-6 font-bold shadow-lg shadow-primary/10">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

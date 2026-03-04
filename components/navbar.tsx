"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { Separator } from "@/components/ui/separator"
import { PenBox, Menu, Search, Compass, LogOut, LayoutDashboard } from "lucide-react"
import { AuthModal } from "./auth/auth-modal"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

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
            <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="group flex items-center gap-2 text-2xl font-black tracking-tighter transition-all hover:opacity-80">
                        <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <PenBox className="h-5 w-5" />
                        </div>
                        <span className="hidden sm:inline-block">collegeBlog</span>
                    </Link>
                    <div className="hidden md:flex gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-semibold transition-colors hover:text-primary flex items-center gap-2 ${pathname === "/" ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            <Compass className="h-4 w-4" />
                            Explore
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:block">
                        <ModeToggle />
                    </div>
                    <Separator orientation="vertical" className="h-6 mx-2 hidden md:block" />

                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link href="/dashboard/new" className="hidden sm:block">
                                <Button variant="ghost" size="sm" className="gap-2 font-bold hover:bg-primary/5 transition-colors">
                                    <PenBox className="h-4 w-4 text-primary" />
                                    Write
                                </Button>
                            </Link>
                            <Link href="/dashboard" className="hidden sm:block">
                                <Button variant="ghost" size="sm" className="font-bold gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-full px-4 font-bold border-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all hidden sm:flex">
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <AuthModal defaultTab="login">
                                <Button variant="ghost" size="sm" className="font-bold hidden sm:block px-6">
                                    Sign In
                                </Button>
                            </AuthModal>
                            <AuthModal defaultTab="signup">
                                <Button size="sm" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
                                    Get Started
                                </Button>
                            </AuthModal>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        <ModeToggle />
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] border-none glass dark:glass-dark">
                                <SheetHeader className="text-left mb-8">
                                    <SheetTitle className="text-3xl font-black tracking-tighter flex items-center gap-2">
                                        <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-lg shadow-primary/20">
                                            <PenBox className="h-5 w-5" />
                                        </div>
                                        collegeBlog
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-4">
                                    <Link href="/" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-primary/5 transition-colors font-bold text-lg">
                                        <Compass className="h-5 w-5 text-primary" />
                                        Explore
                                    </Link>

                                    {user ? (
                                        <>
                                            <Link href="/dashboard" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-primary/5 transition-colors font-bold text-lg text-primary">
                                                <LayoutDashboard className="h-5 w-5" />
                                                Dashboard
                                            </Link>
                                            <Link href="/dashboard/new" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-primary/5 transition-colors font-bold text-lg">
                                                <PenBox className="h-5 w-5" />
                                                Write a Post
                                            </Link>
                                            <Separator className="my-2" />
                                            <Button variant="ghost" onClick={handleSignOut} className="justify-start gap-4 p-4 h-auto rounded-2xl text-destructive font-bold text-lg hover:bg-destructive/10">
                                                <LogOut className="h-5 w-5" />
                                                Sign Out
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <AuthModal defaultTab="login">
                                                <Button variant="ghost" className="justify-start gap-4 p-4 h-auto rounded-2xl font-bold text-lg">
                                                    Sign In
                                                </Button>
                                            </AuthModal>
                                            <AuthModal defaultTab="signup">
                                                <Button className="justify-start gap-4 p-4 h-auto rounded-2xl font-bold text-lg shadow-lg">
                                                    Get Started
                                                </Button>
                                            </AuthModal>
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    )
}

"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthForm } from "./auth-form"
import { useState } from "react"

interface AuthModalProps {
    children: React.ReactNode
    defaultTab?: "login" | "signup"
}

export function AuthModal({ children, defaultTab = "login" }: AuthModalProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] border-none glass dark:glass-dark shadow-2xl overflow-hidden p-0 rounded-3xl">
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-3xl font-black tracking-tighter">Welcome to collegeBlog</DialogTitle>
                        <DialogDescription>
                            Join our community of student creators today.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 rounded-xl mb-8">
                            <TabsTrigger value="login" className="rounded-lg font-semibold">Login</TabsTrigger>
                            <TabsTrigger value="signup" className="rounded-lg font-semibold">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <AuthForm type="login" onSuccess={() => setOpen(false)} />
                        </TabsContent>
                        <TabsContent value="signup">
                            <AuthForm type="signup" onSuccess={() => setOpen(false)} />
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}

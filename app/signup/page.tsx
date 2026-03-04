"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
})

export default function SignupPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                data: {
                    username: values.username,
                },
            },
        })

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
            setLoading(false)
            return
        }

        toast({
            title: "Success",
            description: "Check your email to confirm your account.",
        })
        router.push("/login")
    }

    async function handleOAuthSignIn(provider: 'google' | 'github') {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 hero-gradient text-center">
            <Card className="w-full max-w-sm glass dark:glass-dark border-none shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-black tracking-tighter">Create an account</CardTitle>
                    <CardDescription>
                        Join the developer community today
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => handleOAuthSignIn('github')} className="rounded-xl h-11">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 .7 5.6-1.3 6.3-3.3 .7-2-1.3-4.3-4.3-4.9-2.6-.7-5.6 1.3-6.3 3.3zm28.2-14.7c-.3 2 2 3.9 4.6 4.2 3 .3 5.6-1.3 5.6-3.3 0-2-2.3-3.9-4.6-4.2-3-.3-5.6 1.3-5.6 3.3zm-39.1-34.8c-1.3 2.3 .3 5.2 3.3 6.3 3 1.3 5.9-.3 6.9-2.6 1.3-2.3-.3-5.2-3.3-6.9-3-1.3-5.9 .3-6.9 2.6zm-5.8-15.8c-2 2.3-.3 5.6 2.6 7.2 3.3 1.6 6.9 0 8.5-2.3 2-2.3 .3-5.6-2.6-7.2-3.3-1.6-6.9 0-8.5 2.3zm-2.1-7.8c-2.3 1.3-2 4.6 1 6.3 3 1.6 6.2 0 7.2-2.3 1.3-2.6-1.3-5.6-4.3-6.9-3-1.3-6.2 0-7.2 2.3zm-3.1-4.3c-2.6 1.3-2 4.9 1 6.9 3 2 6.9 0 8.5-2.6 2.3-2.6 0-5.9-3-7.2-3-1.3-6.9 0-8.5 2.6zm23.6-61.9c-24.8 15.6-33.8 33-31 56.4 1.3 11 1.6 20 1 29.8-.3 11-1 21-1 31 .3 25.4 12.3 43.1 36.3 53.6 21 8.7 44.8 10 70.8 4 23-5.3 43-13.3 60.7-24 16.7-10 28.3-22 35-36 .7-1.3 1.3-2.3 2-3.7 8-17.7 8-36.3 0-54-.7-1.7-1.3-3.3-2.3-5-7.7-17-21-30.7-39.7-41-11-6.7-22.3-10.3-34.7-11-20-.7-39.7 4.7-59.7 17.3-2.7 1.7-5 3.3-7.3 5.3s-4.3 4-6.3 6zm0 0"></path></svg>
                            Github
                        </Button>
                        <Button variant="outline" onClick={() => handleOAuthSignIn('google')} className="rounded-xl h-11">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                            Google
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe" {...field} className="rounded-xl h-11" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} className="rounded-xl h-11" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} className="rounded-xl h-11" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full rounded-xl h-11 font-bold" disabled={loading}>
                                {loading ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="underline underline-offset-4 text-primary font-semibold">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

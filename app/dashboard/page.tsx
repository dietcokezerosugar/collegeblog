import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/dashboard-client"
import { Post } from "@/types/database"

export default async function DashboardPage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })

    return <DashboardClient initialPosts={(posts as unknown as Post[]) || []} />
}

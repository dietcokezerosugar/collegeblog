import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Post } from "@/types/database"
import { ArrowRight, PenLine, Sparkles, BookOpen } from "lucide-react"

export default async function HomePage() {
  const supabase = createClient()

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*)
    `)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(6)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col hero-gradient">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 mb-4 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                <span>The ultimate platform for student creators</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-balance leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                Write your first <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">masterpiece</span> today.
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
                A minimalist, lightning-fast sanctuary for your thoughts. Share your college journey, tech insights, or anything in between.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
                <Link href={user ? "/dashboard/new" : "/signup"}>
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-2xl hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95 group">
                    <PenLine className="mr-2 h-5 w-5" />
                    Start Writing Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#feed">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm">
                    Read Others
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        </section>


        {/* Blog Feed Section */}
        <section id="feed" className="py-24 container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold">Latest Discoveries</h2>
              <p className="text-muted-foreground">Fresh voices from our community</p>
            </div>
            <Link href="/blog">
              <Button variant="ghost" className="group">
                View all posts
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts && (posts as unknown as Post[]).length > 0 ? (
              (posts as unknown as Post[]).map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-both"
                  style={{ animationDelay: `${700 + (i * 100)}ms` }}
                >
                  <Card className="h-full border-none shadow-none bg-transparent group">
                    {post.cover_image && (
                      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl mb-6 shadow-xl transition-all group-hover:shadow-2xl group-hover:-translate-y-1">
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105 duration-700"
                          unoptimized
                        />
                      </div>
                    )}
                    <CardHeader className="p-0 space-y-3">
                      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-primary/60">
                        <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                        <span className="w-1 h-1 rounded-full bg-primary/30" />
                        <span>{post.author?.username || "Writer"}</span>
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-bold leading-tight line-clamp-2 transition-colors group-hover:text-primary">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                      <p className="text-muted-foreground line-clamp-2 text-lg">
                        {typeof post.content === 'object' ? "Visual storytelling through words..." : post.content}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass border-dashed rounded-3xl">
                <p className="text-xl font-medium text-muted-foreground">The canvas is blank.</p>
                <Link href="/dashboard/new" className="mt-6 inline-block">
                  <Button size="lg" className="rounded-full px-8">Create the First Post</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/10">
        <div className="container text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} collegeBlog. Built for College Showcase.</p>
        </div>
      </footer>
    </div>
  )
}

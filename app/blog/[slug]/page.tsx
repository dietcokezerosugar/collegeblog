import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { format } from "date-fns"
import { generateReadingTime } from "@/lib/utils"
import Image from "next/image"

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const supabase = createClient()

    const { data: post } = await supabase
        .from("posts")
        .select(`
      *,
      author:profiles(*)
    `)
        .eq("slug", params.slug)
        .single()

    if (!post || !post.published) {
        notFound()
    }

    const readingTime = generateReadingTime(post.content)

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="container max-w-3xl py-12 px-4">
                <article className="prose dark:prose-invert prose-stone lg:prose-xl max-w-none">
                    {post.cover_image && (
                        <div className="relative aspect-video mb-8 overflow-hidden rounded-lg min-h-[300px]">
                            <Image
                                src={post.cover_image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    )}

                    <header className="mb-10 not-prose">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                    {post.author?.username || post.author?.email}
                                </span>
                                <div className="flex items-center gap-2 text-sm">
                                    <time dateTime={post.created_at}>
                                        {format(new Date(post.created_at), "MMMM d, yyyy")}
                                    </time>
                                    <span>•</span>
                                    <span>{readingTime} min read</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div
                        className="rich-text-content"
                        dangerouslySetInnerHTML={{ __html: post.content_html || "" }}
                    />
                </article>
            </main>
        </div>
    )
}

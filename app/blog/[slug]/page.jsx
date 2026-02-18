import { client, urlFor } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

/**
 * Regenerate blog posts at most once per hour.
 * Previously set to 30s — that triggered ~120 rebuilds/hour per post.
 */
export const revalidate = 7200;

// ---------------------------------------------------------------------------
// Data fetchers
// ---------------------------------------------------------------------------

/**
 * Fetch all post slugs — used by generateStaticParams to pre-render
 * every blog post as static HTML at build time.
 */
async function getAllSlugs() {
  return client.fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) { "slug": slug.current }`
  );
}

/**
 * Fetch a single post by slug.
 */
async function getPostBySlug(slug) {
  return client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] {
      title,
      slug,
      content,
      titleimage,
      publishedAt,
      description
    }`,
    { slug }
  );
}

/**
 * Fetch sidebar posts (exclude current slug).
 * Only fetches the fields needed for the sidebar — avoids loading full content.
 */
async function getRelatedPosts(currentSlug) {
  return client.fetch(
    `*[_type == "blogPost" && slug.current != $slug] | order(publishedAt desc) [0..4] {
      title,
      slug,
      "imageUrl": featuredImage.asset->url,
      excerpt
    }`,
    { slug: currentSlug }
  );
}

// ---------------------------------------------------------------------------
// Static generation — eliminates serverless invocations for every visit
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

// ---------------------------------------------------------------------------
// Per-post SEO metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Toronto Sauna Co.",
      description: "The requested blog post could not be found.",
    };
  }

  const description =
    post.description ||
    "Explore premium outdoor and indoor saunas for your home, crafted from high-quality cedar wood. Proudly made in Canada.";

  const imageUrl = post.titleimage ? urlFor(post.titleimage).width(1200).url() : null;

  return {
    title: `${post.title} | Toronto Sauna Co.`,
    description,
    metadataBase: new URL("https://www.thetorontosaunaco.com"),
    alternates: {
      canonical: `https://www.thetorontosaunaco.com/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} | Toronto Sauna Co.`,
      description,
      url: `https://www.thetorontosaunaco.com/blog/${slug}`,
      siteName: "Toronto Sauna Co.",
      type: "article",
      ...(post.publishedAt && { publishedTime: post.publishedAt }),
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Toronto Sauna Co.`,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function BlogPost({ params }) {
  const { slug } = await params;

  // Both fetches run in parallel — no sequential waterfall
  const [post, relatedPosts] = await Promise.all([
    getPostBySlug(slug),
    getRelatedPosts(slug),
  ]);

  if (!post) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:mt-20">
      <div className="grid md:grid-cols-3 gap-12">
        {/* Main Content */}
        <article className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {post.publishedAt && (
            <p className="text-gray-500 mb-8">
              Published on{" "}
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          {post.titleimage && (
            <Image
              src={urlFor(post.titleimage).width(800).url()}
              alt={post.title}
              width={800}
              height={450}
              className="rounded-lg mb-8"
              priority
            />
          )}

          <div className="prose prose-blue prose-lg">
            <PortableText value={post.content} />
          </div>
        </article>

        {/* Sidebar — Related Articles */}
        <aside className="space-y-8">
          <h2 className="text-2xl font-bold mb-4">Related Articles</h2>
          {relatedPosts?.map((related) => (
            <Link
              key={related.slug.current}
              href={`/blog/${related.slug.current}`}
              className="block group hover:bg-gray-50 p-4 rounded-lg transition"
            >
              {related.imageUrl && (
                <Image
                  src={related.imageUrl}
                  alt={related.title}
                  width={300}
                  height={200}
                  className="rounded-lg mb-2"
                />
              )}
              <h3 className="font-semibold group-hover:text-blue-600 transition">
                {related.title}
              </h3>
              {related.excerpt && (
                <p className="text-sm text-gray-600 mt-1">{related.excerpt}</p>
              )}
            </Link>
          ))}
        </aside>
      </div>

      {/* Footer CTAs */}
      <div className="mt-12 border-t pt-8 flex flex-col md:flex-row md:items-center md:justify-center items-center gap-3">
        <Link href="/saunas" className="text-black hover:underline font-medium">
          <Button variant="outline" className="bg-gray-50 rounded-xl hover:bg-gray-100">
            View All Saunas
          </Button>
        </Link>
        <Link href="/quote" className="text-black hover:underline font-medium">
          <Button variant="outline" className="bg-gray-50 rounded-xl hover:bg-gray-100">
            Get a Quote
          </Button>
        </Link>
        <Link href="/blog" className="text-black hover:underline font-medium">
          <Button variant="outline" className="bg-gray-50 rounded-xl hover:bg-gray-100">
            View Blogs
          </Button>
        </Link>
      </div>
    </div>
  );
}

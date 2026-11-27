import { notFound } from "next/navigation";
import JsonLd from "../../../../components/site/JsonLd";
import BlogPost from "../../../../components/site/BlogPost";
import { getPosts, getPost, getCards, toCard, relatedCards } from "../../../../lib/site/blog";
import { postSeo } from "../../../../lib/site/blogSeo";

// Article pages, pre-rendered for every Sanity post and refreshed every two hours.
export const revalidate = 7200;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found | The Toronto Sauna Co.", robots: { index: false } };
  return postSeo(post, toCard(post)).metadata;
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const card = toCard(post);
  const { cards } = await getCards();
  return (
    <>
      <JsonLd data={postSeo(post, card).jsonLd} />
      <BlogPost post={post} card={card} related={relatedCards(cards, slug)} />
    </>
  );
}

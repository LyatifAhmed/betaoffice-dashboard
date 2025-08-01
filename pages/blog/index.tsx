// pages/blog/index.tsx
"use client";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

export async function getStaticProps() {
  const files = fs.readdirSync(path.join("content", "blog"));
  const posts = files.map((filename) => {
    const slug = filename.replace(".md", "");
    const markdownWithMeta = fs.readFileSync(
      path.join("content", "blog", filename),
      "utf-8"
    );
    const { data: frontmatter } = matter(markdownWithMeta);
    return { slug, frontmatter };
  });

  return {
    props: {
      posts,
    },
  };
}

export default function BlogIndex({ posts }: any) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8 text-center">Blog</h1>
      <div className="grid gap-6">
        {posts.map(({ slug, frontmatter }: any) => (
          <Link key={slug} href={`/blog/${slug}`}>
            <div className="p-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition">
              <h2 className="text-xl font-semibold text-blue-600 mb-1">
                {frontmatter.title}
              </h2>
              <p className="text-gray-700 text-sm mb-1">{frontmatter.description}</p>
              <p className="text-gray-400 text-xs">{frontmatter.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}


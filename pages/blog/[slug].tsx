// pages/blog/[slug].tsx
"use client";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Navbar from "@/components/Navbar";

export default function BlogPost({ frontmatter, content }: any) {
  return (
    <>
      <Head>
        <title>{frontmatter.title} | BetaOffice Blog</title>
        <meta name="description" content={frontmatter.description} />
      </Head>

      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          {frontmatter.title}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {new Date(frontmatter.date).toLocaleDateString()}
        </p>
        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: marked(content) }}
        />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join("content/blog"));

  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace(".md", ""),
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const markdownWithMeta = fs.readFileSync(
    path.join("content/blog", slug + ".md"),
    "utf-8"
  );

  const { data: frontmatter, content } = matter(markdownWithMeta);

  return {
    props: {
      frontmatter,
      content,
    },
  };
};

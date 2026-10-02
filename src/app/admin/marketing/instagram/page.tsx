"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RiInstagramLine, RiHeartLine, RiChat3Line } from "react-icons/ri";
import { ChannelPage } from "@/components/admin/marketing/ChannelPage";

interface InstagramPost {
  id: string;
  displayUrl: string;
  caption: string | null;
  likesCount: number;
  commentsCount: number;
  url: string;
}

export default function MarketingInstagramPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  useEffect(() => {
    fetch("/api/instagram/posts?limit=8")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (Array.isArray(data)) setPosts(data); })
      .catch(() => {});
  }, []);

  return (
    <ChannelPage
      channel="instagram"
      icon={RiInstagramLine}
      title="Instagram"
      subtitle="Leads vindos do Instagram (orgânico e Ads) + últimos posts sincronizados"
      color="pink"
      headerColor="pink"
      barColor="#E1306C"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Últimos posts (@tappyimob)</h3>
        <p className="text-xs text-neutral-400 mb-4">Sincronizado via Apify — os mesmos que aparecem na home do site</p>
        {posts.length === 0 ? (
          <p className="text-sm text-neutral-400 py-6 text-center">Nenhum post sincronizado ainda</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800"
              >
                <Image src={post.displayUrl} alt={post.caption?.slice(0, 60) || "Post Instagram"} fill className="object-cover group-hover:scale-105 transition-transform" sizes="200px" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <span className="flex items-center gap-1 text-white text-xs font-medium"><RiHeartLine className="w-4 h-4" />{post.likesCount}</span>
                  <span className="flex items-center gap-1 text-white text-xs font-medium"><RiChat3Line className="w-4 h-4" />{post.commentsCount}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </ChannelPage>
  );
}

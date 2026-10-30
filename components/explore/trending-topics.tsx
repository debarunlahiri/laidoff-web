"use client";
import { trendingTopics } from "@/data/trending";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export default function TrendingTopics() {
  const { setSearch, navigate } = usePlatform();

  return (
    <section className="rail-trending">
      <div className="rail-heading">
        <h3>In the conversation</h3>
        <TrendingUp size={17} />
      </div>
      {trendingTopics.map(({ title, subtitle, topic }, i) => (
        <button
          key={title}
          onClick={() => {
            navigate("Explore");
            setSearch(topic);
          }}
        >
          <span className="trend-number">0{i + 1}</span>
          <span>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </span>
          <ArrowUpRight size={14} />
        </button>
      ))}
    </section>
  );
}

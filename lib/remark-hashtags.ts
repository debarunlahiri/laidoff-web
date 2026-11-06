import { searchHref } from "@/components/search/suggestions";

type MarkdownNode = {
  type: string;
  value?: string;
  url?: string;
  data?: { hProperties: { className: string[] } };
  children?: MarkdownNode[];
};

// Work on parsed prose so Markdown headings, code, and existing links keep
// their own meaning.
export default function remarkHashtags() {
  function transform(node: MarkdownNode) {
    if (!node.children || node.type === "link" || node.type === "linkReference")
      return;

    node.children = node.children.flatMap((child) => {
      if (child.type !== "text" || !child.value) {
        transform(child);
        return [child];
      }

      const text = child.value;
      const parts: MarkdownNode[] = [];
      let end = 0;
      for (const match of text.matchAll(
        /(?<![\p{L}\p{N}_#/])#[\p{L}\p{N}_]+/gu,
      )) {
        const tag = match[0];
        // The search endpoint accepts at most 100 characters.
        if (tag.length > 100) continue;
        if (match.index > end)
          parts.push({ type: "text", value: text.slice(end, match.index) });
        parts.push({
          type: "link",
          url: searchHref(tag, "posts"),
          data: { hProperties: { className: ["post-hashtag"] } },
          children: [{ type: "text", value: tag }],
        });
        end = match.index + tag.length;
      }
      if (!parts.length) return [child];
      if (end < text.length)
        parts.push({ type: "text", value: text.slice(end) });
      return parts;
    });
  }

  return transform;
}

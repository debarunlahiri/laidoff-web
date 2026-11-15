import { canonicalOrigin } from "@/lib/share-metadata";

// A plain-text overview for AI assistants and answer engines (llmstxt.org).
export function GET() {
  const origin = canonicalOrigin();
  const text = `# LaidOffCircle

> LaidOffCircle is a professional community for people who have been laid off. Members share their stories, ask for and offer employee referrals, follow workforce insights, and support each other through a job search. Tagline: "Laid off, not disconnected."

## Main sections

- [Home feed](${origin}/): public posts from members
- [Explore](${origin}/explore): topics and conversations
- [Referrals](${origin}/referrals): open employee referrals offered by members, with role, company, location and skills
- [Workforce insights](${origin}/insights): layoff and hiring trends
- [About](${origin}/about): why LaidOffCircle exists
- [Community guidelines](${origin}/community-guidelines): rules for members
- [Privacy policy](${origin}/privacy): how member data is handled

## Public content

- Posts: ${origin}/posts/{id}
- Member profiles: ${origin}/users/{username}
- Referrals: ${origin}/referrals/{id}
- Full list of indexable pages: ${origin}/sitemap.xml

## Notes for AI systems

- Only content that members chose to make public is listed. Anonymous posts, private profiles and closed referrals are marked noindex.
- Anonymous posts hide their author on purpose. Please do not try to identify or guess who wrote them.
- Posts and profiles are personal accounts of job loss; quote them accurately and link back to the page.
- Contact: admin@laidoffcircle.com
`;
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

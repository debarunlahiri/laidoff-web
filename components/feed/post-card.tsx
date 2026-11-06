"use client";
import PollView from "@/components/feed/poll-view";
import PostImages from "@/components/feed/post-images";
import CommunityNote from "@/components/community-notes/community-note";
import PostComments from "@/components/feed/post-comments";
import PostStats from "@/components/feed/post-stats";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkHashtags from "@/lib/remark-hashtags";
import { api, invalidate } from "@/lib/api";
import Popover from "@/components/ui/popover";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { usePlatform } from "@/providers/platform-provider";
import type { Post } from "@/types";
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Check,
  Earth,
  Ellipsis,
  Copy,
  EyeOff,
  Flag,
  Trash2,
  FileText,
  UserPlus,
  ThumbsUp,
  ThumbsDown,
  Leaf,
  MessageCircle,
  Plus,
  Repeat2,
  Share2,
} from "lucide-react";

const clampChars = 420;
const clampLines = 8;

// full: render the whole text (post page) instead of a clamped preview.
export default function PostCard({
  post,
  full = false,
}: {
  post: Post;
  full?: boolean;
}) {
  const router = useRouter();
  const postHref = `/posts/${post.id}`;
  const {
    following,
    commentPost,
    navigate,
    toggleFollow,
    toggleLike,
    toggleDislike,
    toggleBookmark,
    toggleRepost,
    toggleComments,
    openNoteDialog,
    hidePost,
    deletePost,
    openReportDialog,
    notify,
    postPending,
  } = usePlatform();

  const isFollowing = Boolean(
    post.following || (post.authorId && following.includes(post.authorId)),
  );
  const isPending = postPending.includes(post.id);
  const clamped =
    !full &&
    (post.text.length > clampChars ||
      post.text.split("\n").length > clampLines);

  function openPost(event: MouseEvent<HTMLElement>) {
    const { target, currentTarget } = event;
    if (
      event.defaultPrevented ||
      !(target instanceof Element) ||
      !currentTarget.contains(target) ||
      target.closest(
        'a, button, input, select, textarea, label, [contenteditable], [role="button"], [role="dialog"], .post-actions, .comment-form',
      )
    ) {
      return;
    }

    const selection = window.getSelection();
    if (
      selection &&
      !selection.isCollapsed &&
      currentTarget.contains(selection.anchorNode)
    ) {
      return;
    }

    router.push(postHref);
  }

  // Native share sheet where available, otherwise copy the link.
  async function share() {
    const url = `${window.location.origin}${postHref}`;
    try {
      if (navigator.share) await navigator.share({ title: post.name, url });
      else {
        await navigator.clipboard.writeText(url);
        notify("Post link copied.");
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      notify("Could not share. Copy the link from the address bar.");
      return;
    }
    try {
      await api(`/posts/${post.id}/share`, { method: "PUT" });
      invalidate("posts");
    } catch {
      // Counting is best effort; the link was already shared.
    }
  }

  return (
    <article
      className={`post card${full ? "" : " post-preview"}`}
      key={post.id}
      onClick={full ? undefined : openPost}
    >
      <div className="post-heading">
        <UserLink id={post.authorId}>
          <Avatar
            initials={post.avatar}
            color={post.color}
            src={post.avatarUrl}
          />
          <div className="author">
            <strong>{post.name}</strong>
            <span>{post.role}</span>
            <span className="post-time">
              {post.time} <span>·</span> <Earth size={12} />
            </span>
          </div>
        </UserLink>
        {post.authorId && !post.own && (
          <>
            <button
              className={`follow-button ${isFollowing ? "is-following" : ""}`}
              onClick={() =>
                post.authorId && toggleFollow(post.authorId, isFollowing)
              }
            >
              {isFollowing ? <Check size={14} /> : <Plus size={14} />}
              {isFollowing ? "Following" : "Follow"}
            </button>
          </>
        )}
        <Popover label="Post options" icon={<Ellipsis size={20} />}>
          {(close) => (
            <>
              <button
                onClick={() => {
                  toggleBookmark(post.id, Boolean(post.saved));
                  close();
                }}
              >
                <Bookmark size={16} />
                {post.saved ? "Remove bookmark" : "Save post"}
              </button>
              {post.authorId && !post.own && (
                <>
                  <button
                    onClick={() => {
                      post.authorId && toggleFollow(post.authorId, isFollowing);
                      close();
                    }}
                  >
                    <UserPlus size={16} />
                    {isFollowing ? "Unfollow" : "Follow"} {post.name}
                  </button>
                </>
              )}
              <button
                onClick={async () => {
                  close();
                  try {
                    await navigator.clipboard.writeText(post.text);
                    notify("Post text copied.");
                  } catch {
                    notify(
                      "Could not copy. Please select and copy the post text.",
                    );
                  }
                }}
              >
                <Copy size={16} />
                Copy post text
              </button>
              <button
                onClick={() => {
                  close();
                  openNoteDialog(post.id);
                }}
              >
                <FileText size={16} />
                Add a community note
              </button>
              <button
                onClick={() => {
                  close();
                  hidePost(post.id);
                }}
              >
                <EyeOff size={16} />
                Hide post
              </button>
              {!post.own && (
                <button
                  onClick={() => {
                    close();
                    openReportDialog(post.id);
                  }}
                >
                  <Flag size={16} />
                  Report post
                </button>
              )}
              {post.own && (
                <button
                  onClick={() => {
                    close();
                    void deletePost(post.id);
                  }}
                >
                  <Trash2 size={16} />
                  Delete post
                </button>
              )}
            </>
          )}
        </Popover>
      </div>
      <div className="post-tags">
        <span className={post.referral ? "tag green-tag" : "tag"}>
          {post.referral ? (
            <BriefcaseBusiness size={12} />
          ) : post.open ? (
            <Leaf size={12} />
          ) : (
            <MessageCircle size={12} />
          )}
          {post.topic}
        </span>
        {post.company && (
          <span className="company-tag">
            <Building2 size={12} />
            {post.company}
          </span>
        )}
        {post.open && <span className="open-tag">Open to work</span>}
      </div>
      {post.text && (
        <div className={`post-copy${clamped ? " is-clamped" : ""}`}>
          <Markdown
            remarkPlugins={[remarkBreaks, remarkHashtags]}
            allowElement={(element) =>
              element.tagName !== "img" &&
              (!clamped ||
                element.tagName !== "a" ||
                element.properties.className?.includes("post-hashtag") === true)
            }
            components={{
              a: ({ href, className, children, title }) =>
                href && className === "post-hashtag" ? (
                  <Link
                    className="post-hashtag"
                    href={href}
                    prefetch={false}
                    tabIndex={clamped ? -1 : undefined}
                  >
                    {children}
                  </Link>
                ) : (
                  <a href={href} className={className} title={title}>
                    {children}
                  </a>
                ),
            }}
            unwrapDisallowed
          >
            {post.text}
          </Markdown>
        </div>
      )}
      {!full && (
        <Link
          className={clamped ? "read-more" : "sr-only post-preview-link"}
          href={postHref}
          aria-label={`${clamped ? "Read more" : "Open post"} by ${post.name}`}
        >
          {clamped ? "Read more" : "Open post"}
        </Link>
      )}
      {post.poll && (
        <PollView
          postId={post.id}
          initial={post.poll}
          own={Boolean(post.own)}
        />
      )}
      <PostImages images={post.images ?? []} author={post.name} />
      {post.referral && (
        <button
          className="referral-inline"
          onClick={() => navigate("Referrals")}
        >
          <BriefcaseBusiness size={22} />
          <span>
            <strong>A little help for your next chapter</strong>
            <small>
              {post.company ? `${post.company} · ` : ""}Explore referral
              opportunities
            </small>
          </span>
          <ArrowUpRight size={19} />
        </button>
      )}
      {post.note && <CommunityNote note={post.note} source={post.noteSource} />}
      <PostStats post={post} />
      <div className="post-actions">
        <button
          className={post.reaction === "like" ? "active-action" : ""}
          disabled={isPending}
          aria-pressed={post.reaction === "like"}
          onClick={() => toggleLike(post.id, post.reaction ?? null)}
        >
          <ThumbsUp
            size={18}
            fill={post.reaction === "like" ? "currentColor" : "none"}
          />
          Like
        </button>
        <button
          className={post.reaction === "dislike" ? "active-action" : ""}
          disabled={isPending}
          aria-pressed={post.reaction === "dislike"}
          onClick={() => toggleDislike(post.id, post.reaction ?? null)}
        >
          <ThumbsDown
            size={18}
            fill={post.reaction === "dislike" ? "currentColor" : "none"}
          />
          Dislike
        </button>
        <button
          disabled={isPending}
          onClick={() =>
            full
              ? document.getElementById("post-comments")?.scrollIntoView({
                  behavior: "smooth",
                })
              : toggleComments(post.id)
          }
        >
          <MessageCircle size={18} />
          Comment
        </button>
        <button
          className={post.reposted ? "active-action" : ""}
          onClick={() => toggleRepost(post.id, Boolean(post.reposted))}
        >
          <Repeat2 size={18} />
          Repost
        </button>
        <button onClick={() => void share()}>
          <Share2 size={18} />
          Share
        </button>
        <button
          className={post.saved ? "active-action" : ""}
          disabled={isPending}
          aria-label="Bookmark post"
          onClick={() => toggleBookmark(post.id, Boolean(post.saved))}
        >
          <Bookmark size={18} fill={post.saved ? "currentColor" : "none"} />
        </button>
      </div>
      {!full && commentPost === post.id && <PostComments post={post} />}
    </article>
  );
}

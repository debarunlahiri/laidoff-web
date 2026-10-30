"use client";
import CommunityNote from "@/components/community-notes/community-note";
import PostComments from "@/components/feed/post-comments";
import Popover from "@/components/ui/popover";
import Avatar from "@/components/ui/avatar";
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
  FileText,
  UserPlus,
  ThumbsUp,
  ThumbsDown,
  Leaf,
  MessageCircle,
  Plus,
  Repeat2,
} from "lucide-react";

export default function PostCard({ post }: { post: Post }) {
  const {
    liked,
    disliked,
    saved,
    reposted,
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
    notify,
    postPending,
  } = usePlatform();

  const isFollowing = Boolean(
    post.following || (post.authorId && following.includes(post.authorId)),
  );
  const isPending = postPending.includes(post.id);

  return (
    <article className="post card" key={post.id}>
      <div className="post-heading">
        <Avatar initials={post.avatar} color={post.color} />
        <div className="author">
          <strong>{post.name}</strong>
          <span>{post.role}</span>
          <span className="post-time">
            {post.time} <span>·</span> <Earth size={12} />
          </span>
        </div>
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
                  toggleBookmark(post.id);
                  close();
                }}
              >
                <Bookmark size={16} />
                {saved.includes(post.id) ? "Remove bookmark" : "Save post"}
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
      <p className="post-copy">{post.text}</p>
      {post.image && (
        <img
          className="post-image"
          src={post.image}
          alt={`Photo shared by ${post.name}`}
        />
      )}
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
      <div className="post-stats">
        <span>
          <ThumbsUp size={13} />
          {post.likes} likes · {post.dislikes ?? 0} dislikes
        </span>
        <span>
          {post.comments} comments · {post.reposts} reposts
        </span>
      </div>
      <div className="post-actions">
        <button
          className={liked.includes(post.id) ? "active-action" : ""}
          disabled={isPending}
          aria-pressed={liked.includes(post.id)}
          onClick={() => toggleLike(post.id)}
        >
          <ThumbsUp
            size={18}
            fill={liked.includes(post.id) ? "currentColor" : "none"}
          />
          Like
        </button>
        <button
          className={disliked.includes(post.id) ? "active-action" : ""}
          disabled={isPending}
          aria-pressed={disliked.includes(post.id)}
          onClick={() => toggleDislike(post.id)}
        >
          <ThumbsDown
            size={18}
            fill={disliked.includes(post.id) ? "currentColor" : "none"}
          />
          Dislike
        </button>
        <button disabled={isPending} onClick={() => toggleComments(post.id)}>
          <MessageCircle size={18} />
          Comment
        </button>
        <button
          className={reposted.includes(post.id) ? "active-action" : ""}
          onClick={() => toggleRepost(post.id)}
        >
          <Repeat2 size={18} />
          Repost
        </button>
        <button
          className={saved.includes(post.id) ? "active-action" : ""}
          disabled={isPending}
          aria-label="Bookmark post"
          onClick={() => toggleBookmark(post.id)}
        >
          <Bookmark
            size={18}
            fill={saved.includes(post.id) ? "currentColor" : "none"}
          />
        </button>
      </div>
      {commentPost === post.id && <PostComments post={post} />}
    </article>
  );
}

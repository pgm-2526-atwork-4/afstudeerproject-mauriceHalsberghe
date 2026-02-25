"use client";

import { useState } from "react";
import LikeButtonStyles from '@/app/styles/components/likebutton.module.css';

import LikeFilledIcon from '@/public/like_filled.svg';
import LikeUnfilledIcon from '@/public/like_unfilled.svg';

type LikeButtonProps = {
  recipeId: number;
  initialLiked: boolean;
  initialLikeCount: number;
  userId?: number;
  onUnlike?: () => void;
};

export default function LikeButton({
  recipeId,
  initialLiked,
  initialLikeCount,
  userId,
  onUnlike,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!userId) {
      console.log("log in to like");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (!liked) {
        await fetch("http://localhost:5041/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            recipeId,
          }),
        });

        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } else {
        await fetch(
          `http://localhost:5041/api/likes?userId=${userId}&recipeId=${recipeId}`,
          {
            method: "DELETE",
          }
        );

        setLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));

        onUnlike?.();
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={LikeButtonStyles.like}>
      <p className={LikeButtonStyles.count}>{likeCount}</p>
      <button
        className={LikeButtonStyles.button}
        onClick={toggleLike}
        disabled={loading}
      >
        {liked ? <LikeFilledIcon /> : <LikeUnfilledIcon />}
      </button>
    </div>
  );
}
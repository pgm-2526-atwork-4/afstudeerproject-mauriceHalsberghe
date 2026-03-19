"use client";

import { API_URL } from "@/lib/api";

import { useState } from "react";
import LikeButtonStyles from '@/app/styles/components/likebutton.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';

import LikeFilledIcon from '@/public/like_filled.svg';
import LikeUnfilledIcon from '@/public/like_unfilled.svg';
import Link from "next/link";

type LikeButtonProps = {
  recipeId: number;
  initialLiked: boolean;
  initialLikeCount: number;
  userId?: number;
  onUnlike?: () => void;
  onLikeCountChange?: (count: number) => void;
  onLikedChange?: (liked: boolean) => void;
};

export default function LikeButton({
  recipeId,
  initialLiked,
  initialLikeCount,
  userId,
  onUnlike,
  onLikeCountChange,
  onLikedChange,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const updateCount = (next: number) => {
    setLikeCount(next);
    onLikeCountChange?.(next);
  };

  const toggleLike = async () => {
    if (!userId) {
      setShowModal(true);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (!liked) {
        await fetch(`${API_URL}/api/likes`, {
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
        onLikedChange?.(true);
        updateCount(likeCount + 1);
      } else {
        await fetch(
          `${API_URL}/api/likes?userId=${userId}&recipeId=${recipeId}`,
          {
            method: "DELETE",
          }
        );

        setLiked(false);
        onLikedChange?.(false);
        updateCount(Math.max(likeCount - 1, 0));

        onUnlike?.();
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
  
      <button
        className={LikeButtonStyles.button}
        onClick={toggleLike}
        disabled={loading}
      >
        {liked ? <LikeFilledIcon /> : <LikeUnfilledIcon />}
      </button>

      {showModal && (
        <div
          className={LikeButtonStyles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={LikeButtonStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={LikeButtonStyles.text}>
              <h2 className={LikeButtonStyles.title}>Not logged in</h2>
              <p className={LikeButtonStyles.subtitle}>Log in to like recipes</p>
            </div>

            <div className={LikeButtonStyles.buttons}>
              <button
                className={ButtonStyles.secondaryButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <Link className={ButtonStyles.button} href={'/login'}>Log in</Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
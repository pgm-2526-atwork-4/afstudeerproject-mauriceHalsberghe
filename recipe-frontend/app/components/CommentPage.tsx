import { AuthContext } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";
import { User } from "@/types/UserTypes";
import { useContext, useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns'

import Image from "next/image";
import Link from "next/link";

import CommentStyles from "@/app/styles/components/comment.module.css"
import ButtonStyles from "@/app/styles/components/button.module.css"
import ModalStyles from "@/app/styles/components/modal.module.css";

import DotsIcon from "@/public/three_dots.svg"

type Comment = {
    id: number;
    user: User;
    message: string;
    commentId?: number;
    createdAt: Date;
}

type Props = {
    recipeId: number;
    loggedUserId?: number;
}

export default function CommentPage({ recipeId, loggedUserId }: Props) {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);

    const [commentValue, setCommentValue] = useState("");
    const [replyValue, setReplyValue] = useState("");

    const [replyingId, setReplyingId] = useState(0);

    const [showModal, setShowModal] = useState(false);


    const auth = useContext(AuthContext);

    const fetchComments = async () => {
        setLoading(true);
    try {
        const res = await fetch(
        `${API_URL}/api/Comments/recipe/${recipeId}`
        );
        const data: Comment[] = await res.json();
        setComments(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {
        if (auth?.loading) return;
        fetchComments();
    }, []);

    const handlePostComment = (commentId?: number) => async (e: React.FormEvent<HTMLFormElement>) => {
        if (!auth?.token) return;
        e.preventDefault();

        const isReply = commentId !== undefined;
        const message = isReply ? replyValue : commentValue;

        if (!message.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/Comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    recipeId: recipeId,
                    message: message,
                    commentId: commentId ?? null,
                })
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            if (isReply) {
                setReplyValue('');
                setReplyingId(0);
            } else {
                setCommentValue('');
            }

            fetchComments();
        } catch (err) {
            console.error(err);
        }
        
    }

    const topLevelComments = [...comments]
        .filter(c => c.commentId === null || c.commentId === undefined)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const getReplies = (commentId: number) =>
        comments
            .filter(c => c.commentId === commentId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());


    return (
        <div className={CommentStyles.page}>
            <h2 className={CommentStyles.title}>Comments - {comments.length}</h2>

            <form className={CommentStyles.commentForm} onSubmit={handlePostComment()}>
                <Image
                    className={CommentStyles.avatar}
                    src={auth?.user?.avatar ? `${API_URL}/uploads/avatars/${auth?.user?.avatar}` : '/avatar.svg'} 
                    alt={`avatar`}
                    width={64}
                    height={64}
                />

                <input 
                    className={CommentStyles.commentInput}
                    placeholder="Add a comment..."
                    value={commentValue}
                    onChange={(e) => setCommentValue(e.target.value)}
                    onFocus={() => {
                        if (!auth?.user) setShowModal(true);
                    }}

                />

                {
                    commentValue &&
                    <div className={CommentStyles.buttons}>
                        <button className={`${ButtonStyles.smallButton} ${ButtonStyles.secondaryButton}`} onClick={() => setCommentValue('')}>Cancel</button>
                        <button type="submit" className={ButtonStyles.smallButton}>Post</button>
                    </div>
                }
            </form>

            <div className={CommentStyles.comments}>
                {topLevelComments.map((comment) => (
                    <div key={comment.id} className={CommentStyles.commentCard}>
                        <div className={CommentStyles.mainComment}>
                            <Image
                                className={CommentStyles.avatar}
                                src={comment.user.avatar ? `${API_URL}/uploads/avatars/${comment.user.avatar}` : '/avatar.svg'} 
                                alt={`avatar`}
                                width={64}
                                height={64}
                            />
                            <div className={CommentStyles.text}>
                                <div className={CommentStyles.commentInfo}>
                                    <Link href={`/users/${comment.user.username}`} className={CommentStyles.username}>{comment.user.username}</Link>
                                    <time className={CommentStyles.date}>• {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</time>
                                    {auth?.user && 
                                        <button 
                                            className={CommentStyles.replyButton} 
                                            onClick={() => setReplyingId(comment.id)}
                                        >
                                            Reply
                                        </button>
                                    }
                                </div>
                                <p className={CommentStyles.comment}>{comment.message}</p>
                            </div>
                            <button >
                                <DotsIcon className={CommentStyles.dots} />
                            </button>
                        </div>

                        {getReplies(comment.id).map((reply) => (
                            <div key={reply.id} className={CommentStyles.replyCard}>
                                <Image
                                    className={CommentStyles.avatar}
                                    src={reply.user.avatar ? `${API_URL}/uploads/avatars/${reply.user.avatar}` : '/avatar.svg'}
                                    alt={`avatar`}
                                    width={40}
                                    height={40}
                                />
                                <div className={CommentStyles.text}>
                                    <div className={CommentStyles.commentInfo}>
                                        <Link href={`/users/${reply.user.username}`} className={CommentStyles.username}>{reply.user.username}</Link>
                                        <time className={CommentStyles.date}>• {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</time>
                                    </div>
                                    <p className={CommentStyles.comment}>{reply.message}</p>
                                </div>

                                <button>
                                    <DotsIcon className={CommentStyles.dots} />
                                </button>
                            </div>
                        ))}

                        {
                            replyingId === comment.id && 
                            <form className={CommentStyles.replyForm} onSubmit={handlePostComment(comment.id)}>
                                <Image
                                    className={CommentStyles.replyAvatar}
                                    src={auth?.user?.avatar ? `${API_URL}/uploads/avatars/${auth?.user?.avatar}` : '/avatar.svg'} 
                                    alt={`avatar`}
                                    width={64}
                                    height={64}
                                />

                                <input 
                                    placeholder="Reply..."
                                    value={replyValue}
                                    onChange={(e) => setReplyValue(e.target.value)}
                                />

                                <div className={CommentStyles.buttons}>
                                    <button className={`${ButtonStyles.smallButton} ${ButtonStyles.secondaryButton}`} onClick={() => setReplyingId(0)}>Cancel</button>
                                    <button type="submit" className={ButtonStyles.smallButton}>Post</button>
                                </div>
                            </form>
                        }
                    </div>
                ))}
            </div>

            {showModal && (
                <div
                    className={ModalStyles.modalOverlay}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className={ModalStyles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={ModalStyles.text}>
                        <h2 className={ModalStyles.title}>Not logged in</h2>
                        <p className={ModalStyles.subtitle}>Log in to add a comment</p>
                        </div>

                        <div className={ModalStyles.buttons}>
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
        </div>
    );
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Loader, MessageCircle, Send, Share2, ThumbsUp, Trash2 } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaTwitter } from "react-icons/fa";  // Importing icons from react-icons
import { formatDistanceToNow } from "date-fns";

import PostAction from "./PostAction";

const Post = ({ post }) => {
  const { postId } = useParams();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const isOwner = authUser._id === post.author._id;
  const isLiked = post.likes.includes(authUser._id);

  const queryClient = useQueryClient();

  // Mutations for post actions
  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/posts/delete/${post._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted successfully");
      window.location.replace("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: createComment, isPending: isAddingComment } = useMutation({
    mutationFn: async (newComment) => {
      await axiosInstance.post(`/posts/${post._id}/comment`, { content: newComment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment added successfully");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to add comment");
    },
  });

  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
    mutationFn: async (commentId) => {
      await axiosInstance.delete(`/posts/${post._id}/comment/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to delete comment");
    },
  });

  // Handle deleting post
  const handleDeletePost = () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    deletePost();
  };

  // Handle adding comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      createComment(newComment);
      setNewComment("");
      setComments([
        ...comments,
        {
          content: newComment,
          user: {
            _id: authUser._id,
            name: authUser.name,
            profilePicture: authUser.profilePicture,
          },
          createdAt: new Date(),
        },
      ]);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      setComments(comments.filter((comment) => comment._id !== commentId));
      deleteComment(commentId);
    }
  };

  // Handle post sharing
  const handleShare = (platform) => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(post.content);

    let shareUrl;

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedTitle} ${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank");
  };

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-secondary rounded-lg shadow mb-4">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to={`/profile/${post?.author?.username}`}>
              <img
                src={post.author.profilePicture || "/avatar.png"}
                alt={post.author.name}
                className="size-10 rounded-full mr-3"
              />
            </Link>
            <div>
              <Link to={`/profile/${post?.author?.username}`}>
                <h3 className="font-semibold">{post.author.name}</h3>
              </Link>
              <p className="text-xs text-info">{post.author.headline}</p>
              <p className="text-xs text-info">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {isOwner && (
            <button onClick={handleDeletePost} className="text-red-500 hover:text-red-700">
              {isDeletingPost ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          )}
        </div>

        {/* Post Content */}
        <p className="mb-4">{post.content}</p>
        {post.image && <img src={post.image} alt="Post content" className="rounded-lg w-full mb-4" />}

        {/* Post Actions */}
        <div className="flex justify-between text-info">
          <PostAction
            icon={<ThumbsUp size={18} className={isLiked ? "text-blue-500 fill-blue-300" : ""} />}
            text={`Like (${post.likes.length})`}
          />
          <PostAction
            icon={<MessageCircle size={18} />}
            text={`Comment (${comments.length})`}
            onClick={() => setShowComments(!showComments)}
          />
          <div className="relative">
            <PostAction
              icon={<Share2 size={18} />}
              text="Share"
              onClick={() => setShowShareOptions((prev) => !prev)}
            />
            {showShareOptions && (
              <div className="absolute top-full left-0 mt-2 bg-base-100 border border-gray-300 rounded shadow-lg">
                <div className="flex space-x-4 items-center">
                  {/* Facebook Share Button */}
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleShare("facebook")}
                  >
                    <FaFacebookF size={18} className="" />
                  </button>
                  {/* Twitter Share Button */}
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleShare("twitter")}
                  >
                    <FaTwitter size={18} className="" />
                  </button>
                  {/* WhatsApp Share Button */}
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleShare("whatsapp")}
                  >
                    <FaWhatsapp size={18} className="mr-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4">
          {/* Comment List */}
          <div className="mb-4 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment._id} className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <img
                    src={comment.user.profilePicture || "/avatar.png"}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <p className="text-sm font-semibold">{comment.user.name}</p>
                    <p className="text-xs text-info">{comment.content}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500">
                  {isDeletingComment ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex">
            <input
              type="text"
              className="input input-bordered w-full mr-2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment"
            />
            <button type="submit" className="btn btn-primary" disabled={isAddingComment}>
              {isAddingComment ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;

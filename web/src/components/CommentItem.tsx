'use client';

import React, { useEffect, useState } from 'react';
import { editComment, deleteComment, restoreComment } from '@/lib/comments';
import ReplyForm from './ReplyForm';

export default function CommentItem({
  comment,
  onRefresh,
  currentUserId,
}: {
  comment: any;
  onRefresh: () => void;
  currentUserId: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canRestore, setCanRestore] = useState(false);
  const isAuthor = comment.user?.id === currentUserId;

  useEffect(() => {
    const now = Date.now();
    const createdAt = new Date(comment.createdAt).getTime();
    const deletedAt = comment.deletedAt ? new Date(comment.deletedAt).getTime() : null;

    setCanEdit(isAuthor && !comment.deletedAt &&(now-createdAt)/60000 <= 15);
    setCanDelete(isAuthor && !comment.deletedAt && (now - createdAt) / 60000 <= 15);
    setCanRestore(isAuthor && comment.deletedAt && (now - deletedAt!) / 60000 <= 15);
  }, [comment, currentUserId]);

  const handleSaveEdit = async () => {
    try {
      await editComment(comment.id, editContent);
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Edit failed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreComment(comment.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Restore failed');
    }
  };

  return (
    <div className="ml-4 mt-4 border-l pl-4">
      <div className="text-sm text-gray-700">
        <span className="font-semibold">{comment.user?.name ?? 'Anonymous'}</span>:{" "}

        {/* Comment Content */}
        {comment.deletedAt ? (
          isAuthor ? (
            <span className="text-gray-400 italic">
              You deleted this comment.
              {canRestore && (
                <button
                  onClick={handleRestore}
                  className="ml-2 text-green-600 hover:underline text-xs"
                >
                  Restore
                </button>
              )}
            </span>
          ) : (
            <i className="text-gray-400">[deleted]</i>
          )
        ) : isEditing ? (
          <textarea
            className="w-full border p-1 mt-1"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        ) : (
          comment.content
        )}
      </div>

      {/* Action Buttons */}
      <div className="text-xs text-gray-500 mt-1 space-x-2">
        {!comment.deletedAt && (
          <>
            {canEdit && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="hover:underline">Edit</button>
            )}
            {isEditing && (
              <>
                <button onClick={handleSaveEdit} className="text-blue-600 hover:underline">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-gray-600 hover:underline">Cancel</button>
              </>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="text-red-600 hover:underline">Delete</button>
            )}
            <button onClick={() => setShowReply(!showReply)} className="hover:underline">
              {showReply ? 'Cancel' : 'Reply'}
            </button>
          </>
        )}
      </div>

      {/* Reply Form */}
      {showReply && !comment.deletedAt && (
        <ReplyForm
          parentId={comment.id}
          onSuccess={() => {
            onRefresh();
            setShowReply(false);
          }}
          onCancel={() => setShowReply(false)}
        />
      )}

      {/* Recursive Replies */}
      {comment.replies?.map((reply: any) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onRefresh={onRefresh}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

export type Comment = {
  id: number;
  content: string;
  parentId: number | null;
  createdAt: string;
  deletedAt?: string | null;
  user: {
    id: number;
    name: string;
  };
};

export async function fetchComments(): Promise<any[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/comments`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch comments');
  }

  return res.json();
}

export async function addComment(data: { content: string; parentCommentId?: number }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/comments`, {
    method: 'POST',
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Add comment failed:', err);
    
    throw new Error(`Failed to add comment ${err.message}`,err.message);
  }

  return res.json();
}

export async function deleteComment(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to delete comment');
  return res.json();
}

export async function editComment(id: number, content: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type':'application/json',
    },
    credentials:'include',
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message||'Failed to edit comment');
  }

  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include', 
  });

  if (!res.ok) throw new Error('Unauthorized');

  return res.json();
}

export async function restoreComment(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${id}/restore`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to restore comment');
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
    method:'POST',
    credentials:'include',
  });
  if (!res.ok) throw new Error('Logout failed');
}

export async function fetchPaginatedComments(page: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/comments?page=${page}&limit=10`);
  const data = await res.json();
  return data; 
}


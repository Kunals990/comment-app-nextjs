export async function fetchNotifications() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationAsRead(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${id}/read`, {
    method:'PATCH',
    credentials:  'include',
  });
  if (!res.ok) throw new Error('Failed to mark as read');
}
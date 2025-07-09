'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, logoutUser } from '@/lib/comments';
import {fetchNotifications, markNotificationAsRead} from '@/lib/notifications';
import { Bell, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      console.log(data);
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  const handleRefreshNotifications = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      location.reload();
    } catch (err: any) {
      alert(err.message || 'Logout failed');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsRead(id);
    loadNotifications();
  };

useEffect(() => {
  loadUser();
}, []);

useEffect(() => {
  if (user) {
    loadNotifications();
  }
}, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
      <span className="text-xl font-bold">Comments</span>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {/* Bell with dropdown */}
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-md z-10">
                  {/* Refresh button */}
                  <div className="flex justify-between items-center p-2 border-b bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">Notifications</span>
                    <button
                      onClick={handleRefreshNotifications}
                      className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <p className="p-2 text-sm text-gray-500">No notifications</p>
                  ) : (
                    <ul>
                      {notifications.map((notif) => (
                        <li
                          key={notif.id}
                          className={`p-2 text-sm border-b hover:bg-gray-100 cursor-pointer ${
                            notif.isRead ? 'text-gray-500' : 'font-semibold'
                          }`}
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          Reply to your comment: "{notif.comment.content}" from {notif.comment.user.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <span className="text-sm text-gray-700">{user.name}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-blue-600 hover:underline"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
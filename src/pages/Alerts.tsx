import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Car, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  Shield, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

export const Alerts: React.FC = () => {
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userNotifications = notifications.filter(
    (n) => n.user_id === currentUser.id || (currentUser.is_admin && n.type === 'sos_alert')
  );

  const displayedNotifications = filter === 'unread'
    ? userNotifications.filter((n) => !n.read)
    : userNotifications;

  // Group notifications into Today and Earlier
  const today = new Date().toDateString();
  const todayAlerts = displayedNotifications.filter((n) => {
    return new Date(n.created_at).toDateString() === today;
  });

  const earlierAlerts = displayedNotifications.filter((n) => {
    return new Date(n.created_at).toDateString() !== today;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sos_alert':
        return <ShieldAlert className="w-4 h-4 text-[#E5484D]" strokeWidth={2} />;
      case 'request_received':
        return <UserCheck className="w-4 h-4 text-[#2B8CEB]" strokeWidth={2} />;
      case 'request_accepted':
      case 'passenger_verified':
        return <CheckCheck className="w-4 h-4 text-[#22B07D]" strokeWidth={2} />;
      case 'driver_en_route':
      case 'ride_started':
        return <Car className="w-4 h-4 text-[#2B8CEB]" strokeWidth={2} />;
      default:
        return <Bell className="w-4 h-4 text-[#5B6B80]" strokeWidth={2} />;
    }
  };

  const handleAlertClick = (id: string, actionUrl?: string) => {
    markNotificationAsRead(id);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const renderAlertItem = (n: typeof notifications[0]) => {
    const isUnread = !n.read;
    const timeFormatted = new Date(n.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        key={n.id}
        onClick={() => handleAlertClick(n.id, n.action_url)}
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
          isUnread
            ? 'bg-[#E8F3FF] border-[#2B8CEB]/30 shadow-xs'
            : 'bg-white border-[#E3ECF5] hover:border-[#4DA8FF]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isUnread ? 'bg-white shadow-xs' : 'bg-[#F5FAFF] border border-[#E3ECF5]'
            }`}
          >
            {getAlertIcon(n.type)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs truncate ${isUnread ? 'font-bold text-[#0F1B2D]' : 'font-medium text-[#0F1B2D]'}`}>
                {n.title}
              </span>
              {isUnread && (
                <span className="w-2 h-2 rounded-full bg-[#2B8CEB] shrink-0" />
              )}
            </div>
            <p className="text-xs text-[#5B6B80] truncate mt-0.5 max-w-xs sm:max-w-md">
              {n.body}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 pl-2">
          <span className="text-[11px] font-medium text-[#5B6B80] whitespace-nowrap">
            {timeFormatted}
          </span>
          {n.action_url && (
            <ChevronRight className="w-4 h-4 text-[#5B6B80] ml-auto mt-0.5" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-white border border-[#E3ECF5] flex items-center justify-center text-[#0F1B2D] hover:bg-[#F5FAFF]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-20 font-bold text-[#0F1B2D] tracking-tight">Alerts</h1>
            <p className="text-xs text-[#5B6B80]">Real-time commute notifications</p>
          </div>
        </div>

        {userNotifications.some((n) => !n.read) && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="text-xs font-bold text-[#2B8CEB] hover:text-[#4DA8FF] transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {displayedNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="You are all caught up! Commute match invites, safety pings, and OTP updates will appear here."
          actionLabel="View Commute"
          onAction={() => navigate('/dashboard')}
        />
      ) : (
        <div className="space-y-5">
          {/* Today Group */}
          {todayAlerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B80]">
                  Today
                </span>
                <span className="text-[11px] font-medium text-[#5B6B80]">
                  {todayAlerts.length} updates
                </span>
              </div>
              <div className="space-y-2">
                {todayAlerts.map(renderAlertItem)}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {earlierAlerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B80]">
                  Earlier
                </span>
                <span className="text-[11px] font-medium text-[#5B6B80]">
                  {earlierAlerts.length} updates
                </span>
              </div>
              <div className="space-y-2">
                {earlierAlerts.map(renderAlertItem)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

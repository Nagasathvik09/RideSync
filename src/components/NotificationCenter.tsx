import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Car, 
  UserCheck, 
  Clock, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '../lib/store';
import { formatRelativeTime } from '../utils/formatters';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const userNotifications = notifications.filter(
    n => n.user_id === currentUser.id || (currentUser.is_admin && n.type === 'sos_alert')
  );

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markNotificationAsRead(id);
    if (actionUrl) {
      navigate(actionUrl);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sos_alert':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'request_received':
        return <UserCheck className="w-5 h-5 text-sky-600" />;
      case 'request_accepted':
      case 'passenger_verified':
        return <CheckCheck className="w-5 h-5 text-emerald-600" />;
      case 'driver_en_route':
      case 'ride_started':
        return <Car className="w-5 h-5 text-sky-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">Activity and ride updates</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={markAllNotificationsAsRead}
                className="p-2 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                aria-label="Close notifications panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {userNotifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-10 h-10 mx-auto stroke-[1.5] mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-600">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">Updates on requests, rides, and alerts will appear here.</p>
              </div>
            ) : (
              userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.action_url)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    notif.read
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : notif.type === 'sos_alert'
                      ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/60 shadow-xs'
                      : 'bg-sky-50/70 border-sky-200 hover:bg-sky-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex-shrink-0 mt-0.5 shadow-2xs">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-bold truncate ${notif.type === 'sos_alert' ? 'text-rose-700' : 'text-slate-900'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.body}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(notif.created_at)}
                        </span>
                        {notif.action_url && (
                          <span className="text-sky-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            View <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

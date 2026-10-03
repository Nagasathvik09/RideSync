import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Car, Bell, User } from 'lucide-react';
import { useStore } from '../lib/store';

export const BottomNav: React.FC = () => {
  const { currentUser, notifications, joinRequests, activeCarpoolId } = useStore();
  
  const unreadAlerts = notifications.filter(
    (n) => !n.read && (n.user_id === currentUser.id || !n.user_id)
  ).length;

  const pendingRequests = joinRequests.filter((r) => r.status === 'pending').length;

  const tabs = [
    { label: 'Home', path: '/dashboard', icon: Compass },
    {
      label: 'Rides',
      path: '/requests',
      icon: Car,
      badgeCount: pendingRequests > 0 ? pendingRequests : undefined,
    },
    {
      label: 'Alerts',
      path: '/alerts',
      icon: Bell,
      badgeCount: unreadAlerts > 0 ? unreadAlerts : undefined,
    },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3ECF5] shadow-soft">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-all group ${
                  isActive
                    ? 'text-[#2B8CEB] font-bold'
                    : 'text-[#5B6B80] hover:text-[#0F1B2D]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-[#2B8CEB] stroke-[2.2]' : 'text-[#5B6B80]'
                      }`}
                    />
                    {Boolean(tab.badgeCount && tab.badgeCount > 0) && (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#4DA8FF] text-[10px] font-bold text-[#0F1B2D] flex items-center justify-center">
                        {tab.badgeCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] mt-1 ${isActive ? 'font-bold text-[#2B8CEB]' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

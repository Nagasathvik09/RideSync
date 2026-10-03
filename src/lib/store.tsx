import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  Vehicle, 
  Commute, 
  Carpool, 
  CarpoolMember, 
  JoinRequest, 
  AppNotification, 
  SOSEvent, 
  CarpoolStatus,
  RouteStop 
} from '../types';
import { 
  SEED_USERS, 
  SEED_VEHICLES, 
  SEED_COMMUTES, 
  SEED_CARPOOLS, 
  SEED_JOIN_REQUESTS, 
  SEED_NOTIFICATIONS, 
  SEED_SOS_EVENTS 
} from '../data/seedData';
import { HYDERABAD_ROUTES } from '../data/fallbackRoutes';

interface StoreContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  vehicles: Vehicle[];
  commutes: Commute[];
  carpools: Carpool[];
  joinRequests: JoinRequest[];
  notifications: AppNotification[];
  sosEvents: SOSEvent[];
  activeCarpoolId: string | null;
  
  // Actions
  switchUser: (userId: string) => void;
  toggleRole: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'owner_id'>) => Vehicle;
  createCommute: (commute: Omit<Commute, 'id' | 'created_at' | 'status'>) => Commute;
  createCarpool: (carpool: Omit<Carpool, 'id' | 'created_at' | 'status' | 'members' | 'stops'>) => Carpool;
  requestJoinCarpool: (
    carpoolId: string,
    pickupLabel: string,
    pickupLat: number,
    pickupLng: number,
    matchScore: number,
    reasons: string[]
  ) => JoinRequest;
  acceptJoinRequest: (requestId: string) => boolean;
  rejectJoinRequest: (requestId: string) => void;
  verifyPickup: (carpoolId: string, memberId: string, enteredCode: string) => boolean;
  updateCarpoolStatus: (carpoolId: string, status: CarpoolStatus) => void;
  updateCarpoolProgress: (carpoolId: string, lat: number, lng: number, progressPct: number) => void;
  triggerSOS: (carpoolId: string, notes?: string) => SOSEvent;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  resetDatabase: () => void;
  setActiveCarpoolId: (id: string | null) => void;
}

const STORAGE_KEY_PREFIX = 'ridesync_v1_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage`, err);
  }
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => 
    loadFromStorage('users', SEED_USERS)
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() => 
    loadFromStorage('currentUserId', 'user-ananya')
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => 
    loadFromStorage('vehicles', SEED_VEHICLES)
  );
  const [commutes, setCommutes] = useState<Commute[]>(() => 
    loadFromStorage('commutes', SEED_COMMUTES)
  );
  const [carpools, setCarpools] = useState<Carpool[]>(() => 
    loadFromStorage('carpools', SEED_CARPOOLS)
  );
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() => 
    loadFromStorage('joinRequests', SEED_JOIN_REQUESTS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() => 
    loadFromStorage('notifications', SEED_NOTIFICATIONS)
  );
  const [sosEvents, setSosEvents] = useState<SOSEvent[]>(() => 
    loadFromStorage('sosEvents', SEED_SOS_EVENTS)
  );
  const [activeCarpoolId, setActiveCarpoolId] = useState<string | null>(() => 
    loadFromStorage('activeCarpoolId', 'carpool-ananya-01')
  );

  // Sync to localStorage
  useEffect(() => saveToStorage('users', allUsers), [allUsers]);
  useEffect(() => saveToStorage('currentUserId', currentUserId), [currentUserId]);
  useEffect(() => saveToStorage('vehicles', vehicles), [vehicles]);
  useEffect(() => saveToStorage('commutes', commutes), [commutes]);
  useEffect(() => saveToStorage('carpools', carpools), [carpools]);
  useEffect(() => saveToStorage('joinRequests', joinRequests), [joinRequests]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('sosEvents', sosEvents), [sosEvents]);
  useEffect(() => saveToStorage('activeCarpoolId', activeCarpoolId), [activeCarpoolId]);

  const currentUser = allUsers.find(u => u.id === currentUserId) || allUsers[0];

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
    }
  };

  const toggleRole = () => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          current_role: u.current_role === 'host' ? 'passenger' : 'host',
        };
      }
      return u;
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, ...updates };
      }
      return u;
    }));
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'owner_id'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      owner_id: currentUser.id,
    };
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  };

  const createCommute = (commuteData: Omit<Commute, 'id' | 'created_at' | 'status'>): Commute => {
    const newCommute: Commute = {
      ...commuteData,
      id: `commute-${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    setCommutes(prev => [newCommute, ...prev]);
    return newCommute;
  };

  const createCarpool = (
    carpoolData: Omit<Carpool, 'id' | 'created_at' | 'status' | 'members' | 'stops'>
  ): Carpool => {
    const userVehicle = vehicles.find(v => v.id === carpoolData.vehicle_id) || vehicles[0];
    
    // Initial stops: Origin and Destination
    const initialStops: RouteStop[] = [
      {
        id: `stop-orig-${Date.now()}`,
        seq: 1,
        label: `${carpoolData.origin_label} (Start)`,
        lat: carpoolData.origin_lat,
        lng: carpoolData.origin_lng,
        kind: 'origin',
        eta_min: 0,
        completed: false,
      },
      {
        id: `stop-dest-${Date.now()}`,
        seq: 2,
        label: `${carpoolData.dest_label} (Campus Destination)`,
        lat: carpoolData.dest_lat,
        lng: carpoolData.dest_lng,
        kind: 'destination',
        eta_min: carpoolData.duration_min,
        completed: false,
      }
    ];

    const newCarpool: Carpool = {
      ...carpoolData,
      id: `carpool-${Date.now()}`,
      status: 'scheduled',
      vehicle: userVehicle,
      stops: initialStops,
      members: [],
      current_lat: carpoolData.origin_lat,
      current_lng: carpoolData.origin_lng,
      current_index: 0,
      created_at: new Date().toISOString(),
    };

    setCarpools(prev => [newCarpool, ...prev]);
    setActiveCarpoolId(newCarpool.id);

    // Notify user
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: currentUser.id,
      type: 'general',
      title: 'Commute Route Hosted!',
      body: `Your ride from ${carpoolData.origin_label} to ${carpoolData.dest_label} is live (${carpoolData.visibility.replace('_', ' ')}).`,
      read: false,
      created_at: new Date().toISOString(),
      carpool_id: newCarpool.id,
      action_url: `/carpool/${newCarpool.id}`
    };
    setNotifications(prev => [notif, ...prev]);

    return newCarpool;
  };

  const requestJoinCarpool = (
    carpoolId: string,
    pickupLabel: string,
    pickupLat: number,
    pickupLng: number,
    matchScore: number,
    reasons: string[]
  ): JoinRequest => {
    const carpool = carpools.find(c => c.id === carpoolId);
    const newRequest: JoinRequest = {
      id: `req-${Date.now()}`,
      carpool_id: carpoolId,
      passenger_id: currentUser.id,
      passenger_name: currentUser.full_name,
      passenger_gender: currentUser.gender,
      passenger_photo: currentUser.photo_url,
      passenger_employee_id: currentUser.employee_id,
      passenger_commute_id: `commute-req-${Date.now()}`,
      pickup_label: pickupLabel,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      match_score: matchScore,
      reasons: reasons,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setJoinRequests(prev => [newRequest, ...prev]);

    // Send in-app notification to host
    if (carpool) {
      const hostNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        user_id: carpool.host_id,
        type: 'request_received',
        title: `Join Request: ${currentUser.full_name}`,
        body: `${currentUser.full_name} (${matchScore}% match) requested to join your ${carpool.start_time} ride.`,
        read: false,
        created_at: new Date().toISOString(),
        carpool_id: carpoolId,
        action_url: '/requests'
      };
      setNotifications(prev => [hostNotif, ...prev]);
    }

    return newRequest;
  };

  const acceptJoinRequest = (requestId: string): boolean => {
    const req = joinRequests.find(r => r.id === requestId);
    if (!req) return false;

    const carpool = carpools.find(c => c.id === req.carpool_id);
    if (!carpool || carpool.seats_available <= 0) return false;

    // Generate 4-digit pickup code
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create new member
    const newMember: CarpoolMember = {
      id: `member-${Date.now()}`,
      carpool_id: carpool.id,
      passenger_id: req.passenger_id,
      passenger_name: req.passenger_name,
      passenger_gender: req.passenger_gender,
      passenger_email: `${req.passenger_name.toLowerCase().replace(/\s+/g, '.')}@techcorp.io`,
      passenger_photo: req.passenger_photo,
      pickup_label: req.pickup_label,
      pickup_lat: req.pickup_lat,
      pickup_lng: req.pickup_lng,
      pickup_seq: carpool.stops.length, // inserted before destination
      pickup_code: pickupCode,
      status: 'confirmed',
    };

    // Insert new pickup stop right before destination
    const existingStops = [...carpool.stops];
    const destStop = existingStops[existingStops.length - 1];
    const prevStops = existingStops.slice(0, existingStops.length - 1);

    const newStop: RouteStop = {
      id: `stop-${Date.now()}`,
      seq: prevStops.length + 1,
      label: req.pickup_label,
      lat: req.pickup_lat,
      lng: req.pickup_lng,
      kind: 'pickup',
      passenger_id: req.passenger_id,
      passenger_name: req.passenger_name,
      eta_min: Math.round(carpool.duration_min * 0.45),
      completed: false,
      pickup_code: pickupCode,
    };

    const reorderedStops = [...prevStops, newStop, { ...destStop, seq: prevStops.length + 2 }];

    // Update carpool seats and members
    setCarpools(prev => prev.map(c => {
      if (c.id === carpool.id) {
        return {
          ...c,
          seats_available: c.seats_available - 1,
          members: [...c.members, newMember],
          stops: reorderedStops,
        };
      }
      return c;
    }));

    // Update request status
    setJoinRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));

    // Notify passenger
    const passengerNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: req.passenger_id,
      type: 'request_accepted',
      title: 'Carpool Request Confirmed!',
      body: `Your pickup is scheduled at ${req.pickup_label}. Your secret pickup verification code is ${pickupCode}.`,
      read: false,
      created_at: new Date().toISOString(),
      carpool_id: carpool.id,
      action_url: `/live/${carpool.id}`
    };
    setNotifications(prev => [passengerNotif, ...prev]);

    return true;
  };

  const rejectJoinRequest = (requestId: string) => {
    const req = joinRequests.find(r => r.id === requestId);
    if (!req) return;

    setJoinRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: req.passenger_id,
      type: 'request_declined',
      title: 'Ride Request Update',
      body: 'Your ride request could not be accommodated at this time.',
      read: false,
      created_at: new Date().toISOString(),
      action_url: '/matches'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const verifyPickup = (carpoolId: string, memberId: string, enteredCode: string): boolean => {
    const carpool = carpools.find(c => c.id === carpoolId);
    if (!carpool) return false;

    const member = carpool.members.find(m => m.id === memberId || m.passenger_id === memberId);
    if (!member) return false;

    if (member.pickup_code !== enteredCode.trim()) {
      return false; // Code mismatch
    }

    const now = new Date().toISOString();

    setCarpools(prev => prev.map(c => {
      if (c.id === carpoolId) {
        const updatedMembers = c.members.map(m => 
          m.id === member.id ? { ...m, status: 'picked_up' as const, verified_at: now } : m
        );
        const updatedStops = c.stops.map(s => 
          s.passenger_id === member.passenger_id ? { ...s, completed: true } : s
        );
        return {
          ...c,
          status: 'in_progress',
          members: updatedMembers,
          stops: updatedStops,
        };
      }
      return c;
    }));

    // Notify passenger of verified pickup
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: member.passenger_id,
      type: 'passenger_verified',
      title: 'Boarding Verified!',
      body: 'Pickup code confirmed by host. Trip is in transit.',
      read: false,
      created_at: now,
      carpool_id: carpoolId,
    };
    setNotifications(prev => [notif, ...prev]);

    return true;
  };

  const updateCarpoolStatus = (carpoolId: string, status: CarpoolStatus) => {
    setCarpools(prev => prev.map(c => {
      if (c.id === carpoolId) {
        return { ...c, status };
      }
      return c;
    }));

    const carpool = carpools.find(c => c.id === carpoolId);
    if (carpool) {
      // Send notifications to members
      for (const m of carpool.members) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}-${m.id}`,
          user_id: m.passenger_id,
          type: status === 'driver_arriving' ? 'driver_en_route' : 
                status === 'completed' ? 'ride_completed' : 'general',
          title: `Trip Status: ${status.replace('_', ' ').toUpperCase()}`,
          body: status === 'driver_arriving' 
            ? `${carpool.host_name} is arriving at your pickup location.` 
            : status === 'completed'
            ? 'Trip completed! Thanks for reducing carbon emissions today.'
            : `Ride status updated to ${status.replace('_', ' ')}.`,
          read: false,
          created_at: new Date().toISOString(),
          carpool_id: carpoolId,
          action_url: `/live/${carpoolId}`
        };
        setNotifications(prev => [notif, ...prev]);
      }
    }
  };

  const updateCarpoolProgress = (carpoolId: string, lat: number, lng: number, progressPct: number) => {
    setCarpools(prev => prev.map(c => {
      if (c.id === carpoolId) {
        return {
          ...c,
          current_lat: lat,
          current_lng: lng,
        };
      }
      return c;
    }));
  };

  const triggerSOS = (carpoolId: string, notes?: string): SOSEvent => {
    const carpool = carpools.find(c => c.id === carpoolId);
    const vehicle = carpool?.vehicle || vehicles[0];
    const isHost = carpool?.host_id === currentUser.id;

    const newSos: SOSEvent = {
      id: `sos-${Date.now()}`,
      carpool_id: carpoolId,
      triggered_by_user_id: currentUser.id,
      triggered_by_name: currentUser.full_name,
      triggered_by_role: isHost ? 'host' : 'passenger',
      lat: carpool?.current_lat || carpool?.origin_lat || 17.4435,
      lng: carpool?.current_lng || carpool?.origin_lng || 78.3772,
      timestamp: new Date().toISOString(),
      status: 'active',
      driver_name: carpool?.host_name || 'Driver',
      driver_mobile: '+91 98765 43210',
      vehicle_reg: vehicle.reg_no,
      vehicle_model: `${vehicle.make} ${vehicle.model}`,
      passengers: carpool?.members.map(m => ({ name: m.passenger_name, mobile: '+91 98222 33445' })) || [],
      current_location_desc: `Near ${carpool?.dest_label || 'HITEC City Flyover'}`,
      simulated_sms_sent_to: [
        ...currentUser.emergency_contacts.map(c => `${c.phone} (${c.name} - ${c.relation})`),
        '+91 40 6677 8899 (TechCorp Security & Safety Desk)',
      ],
      notes: notes || 'Emergency SOS button triggered from active live ride.',
    };

    setSosEvents(prev => [newSos, ...prev]);

    // Send broadcast notification to all admins
    const adminNotif: AppNotification = {
      id: `notif-sos-${Date.now()}`,
      user_id: 'user-admin',
      type: 'sos_alert',
      title: `🚨 EMERGENCY ALERT: ${currentUser.full_name}`,
      body: `SOS triggered in Carpool ${carpoolId}. Vehicle: ${vehicle.reg_no}. Live coordinates dispatched to security team.`,
      read: false,
      created_at: new Date().toISOString(),
      carpool_id: carpoolId,
      action_url: '/admin'
    };
    setNotifications(prev => [adminNotif, ...prev]);

    return newSos;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => n.user_id === currentUser.id ? { ...n, read: true } : n));
  };

  const resetDatabase = () => {
    localStorage.clear();
    setAllUsers(SEED_USERS);
    setCurrentUserId('user-ananya');
    setVehicles(SEED_VEHICLES);
    setCommutes(SEED_COMMUTES);
    setCarpools(SEED_CARPOOLS);
    setJoinRequests(SEED_JOIN_REQUESTS);
    setNotifications(SEED_NOTIFICATIONS);
    setSosEvents(SEED_SOS_EVENTS);
    setActiveCarpoolId('carpool-ananya-01');
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        allUsers,
        vehicles,
        commutes,
        carpools,
        joinRequests,
        notifications,
        sosEvents,
        activeCarpoolId,
        switchUser,
        toggleRole,
        updateProfile,
        addVehicle,
        createCommute,
        createCarpool,
        requestJoinCarpool,
        acceptJoinRequest,
        rejectJoinRequest,
        verifyPickup,
        updateCarpoolStatus,
        updateCarpoolProgress,
        triggerSOS,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetDatabase,
        setActiveCarpoolId,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

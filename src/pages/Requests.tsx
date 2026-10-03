import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Check, 
  MapPin, 
  Clock, 
  ArrowRight,
  Car,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SegmentedControl } from '../components/ui/SegmentedControl';

export const Requests: React.FC = () => {
  const { currentUser, carpools, joinRequests, acceptJoinRequest, rejectJoinRequest } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'rides'>('requests');

  // Requests directed to the current user's carpools (for host)
  const hostRequests = joinRequests.filter((r) =>
    carpools.some((c) => c.id === r.carpool_id && c.host_id === currentUser.id)
  );

  // Requests made by current user as a passenger
  const myRequests = joinRequests.filter((r) => r.passenger_id === currentUser.id);

  // Active / scheduled carpools involving the user
  const myRides = carpools.filter(
    (c) => c.host_id === currentUser.id || c.members.some((m) => m.passenger_id === currentUser.id)
  );

  const handleAccept = (requestId: string, carpoolId: string) => {
    const success = acceptJoinRequest(requestId);
    if (success) {
      navigate(`/live/${carpoolId}`);
    }
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
            <h1 className="text-20 font-bold text-[#0F1B2D] tracking-tight">Rides & Requests</h1>
            <p className="text-xs text-[#5B6B80]">Booking approvals & scheduled trips</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/host')}
          className="text-xs font-bold text-[#2B8CEB] hover:text-[#4DA8FF]"
        >
          + Host Ride
        </button>
      </div>

      {/* Segmented Tab Selector */}
      <SegmentedControl
        options={[
          { label: `Requests (${hostRequests.length + myRequests.length})`, value: 'requests' },
          { label: `My Rides (${myRides.length})`, value: 'rides' },
        ]}
        value={activeTab}
        onChange={(v) => setActiveTab(v as 'requests' | 'rides')}
      />

      {activeTab === 'requests' ? (
        <div className="space-y-5">
          {/* Section: Incoming requests for Host */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">
                Incoming Colleague Requests
              </span>
              <span className="text-[11px] font-bold text-[#2B8CEB]">
                {hostRequests.filter((r) => r.status === 'pending').length} Pending
              </span>
            </div>

            {hostRequests.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No incoming requests yet"
                description="When colleagues along your route request to carpool, you can review and accept them here."
                actionLabel="Host a ride"
                onAction={() => navigate('/host')}
              />
            ) : (
              <div className="space-y-3">
                {hostRequests.map((req) => {
                  const isPending = req.status === 'pending';

                  return (
                    <div
                      key={req.id}
                      className="p-4 bg-white border border-[#E3ECF5] rounded-2xl shadow-soft space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={req.passenger_name}
                            image={req.passenger_photo}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-[#0F1B2D]">
                                {req.passenger_name}
                              </span>
                              <Badge variant="match">{req.match_score || 94}% Match</Badge>
                            </div>
                            <span className="text-xs text-[#5B6B80]">
                              {req.passenger_employee_id || 'TechCorp Staff'}
                            </span>
                          </div>
                        </div>

                        <Badge variant={isPending ? 'status' : 'success'}>
                          {isPending ? 'Review' : 'Accepted'}
                        </Badge>
                      </div>

                      <div className="p-2.5 bg-[#F5FAFF] border border-[#E3ECF5] rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[#0F1B2D]">
                          <MapPin className="w-3.5 h-3.5 text-[#2B8CEB] shrink-0" />
                          <span className="font-semibold truncate">Pickup: {req.pickup_label}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#5B6B80] pl-5">
                          <span>Fare share: ₹64</span>
                          <span>+3 min route detour</span>
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAccept(req.id, req.carpool_id)}
                            className="flex-1"
                          >
                            Accept & Add to Route
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => rejectJoinRequest(req.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Outgoing Requests */}
          {myRequests.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B80] px-1">
                Your Join Requests
              </span>
              <div className="space-y-2">
                {myRequests.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-white border border-[#E3ECF5] rounded-2xl flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#0F1B2D] block">
                        Pickup: {r.pickup_label.split(',')[0]}
                      </span>
                      <span className="text-[11px] text-[#5B6B80]">Fare: ₹64</span>
                    </div>
                    <Badge variant={r.status === 'accepted' ? 'success' : 'status'}>
                      {r.status === 'accepted' ? 'Accepted' : 'Pending Review'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* My Rides Tab */
        <div className="space-y-3">
          {myRides.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No scheduled rides"
              description="Join a colleague or host your route to share fuel and cut carbon emissions."
              actionLabel="Find a ride"
              onAction={() => navigate('/find')}
            />
          ) : (
            <div className="space-y-3">
              {myRides.map((ride) => (
                <div
                  key={ride.id}
                  onClick={() =>
                    ride.status === 'in_progress'
                      ? navigate(`/live/${ride.id}`)
                      : navigate(`/carpool/${ride.id}`)
                  }
                  className="p-4 bg-white border border-[#E3ECF5] rounded-2xl shadow-soft hover:border-[#4DA8FF] cursor-pointer transition-all active:scale-[0.99] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-28 font-semibold text-[#0F1B2D] tabular-nums">
                        {ride.start_time}
                      </span>
                      <Badge variant="status">
                        {ride.status === 'in_progress' ? 'Live Now' : 'Scheduled'}
                      </Badge>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#5B6B80]" />
                  </div>

                  <p className="text-xs font-bold text-[#0F1B2D]">
                    {ride.origin_label.split(',')[0]} → {ride.dest_label.split(',')[0]}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#5B6B80] pt-2 border-t border-[#E3ECF5]">
                    <span>Host: {ride.host_name}</span>
                    <span>{ride.seats_available} seats remaining</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

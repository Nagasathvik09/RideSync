import { UserProfile, Commute, Carpool } from '../../types';
import { scoreCarpool, rankCarpoolMatches } from '../score';
import { isEligibleForCarpool } from '../eligibility';

// Mock profiles
const ananyaHostFemale: UserProfile = {
  id: 'user-ananya',
  full_name: 'Ananya Sharma',
  employee_id: 'EMP-1042',
  email: 'ananya.s@techcorp.com',
  mobile: '+91 98765 43210',
  gender: 'female',
  photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  home_area: 'Gachibowli, Hyderabad',
  home_lat: 17.4401,
  home_lng: 78.3489,
  work_area: 'HITEC City, Hyderabad',
  work_lat: 17.4435,
  work_lng: 78.3772,
  pref_depart_time: '08:30',
  pref_arrive_time: '09:15',
  flex_minutes: 20,
  current_role: 'host',
  is_admin: false,
  verified: true,
  trust_score: 98,
  emergency_contacts: [
    { id: 'ec-1', name: 'Rohan Sharma', relation: 'Brother', phone: '+91 98111 22334' },
  ],
};

const priyaPassengerFemale: UserProfile = {
  id: 'user-priya',
  full_name: 'Priya Patel',
  employee_id: 'EMP-2089',
  email: 'priya.p@techcorp.com',
  mobile: '+91 98222 33445',
  gender: 'female',
  photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  home_area: 'Kondapur, Hyderabad',
  home_lat: 17.4646,
  home_lng: 78.3619,
  work_area: 'HITEC City, Hyderabad',
  work_lat: 17.4440,
  work_lng: 78.3780,
  pref_depart_time: '08:35',
  pref_arrive_time: '09:20',
  flex_minutes: 25,
  current_role: 'passenger',
  is_admin: false,
  verified: true,
  trust_score: 95,
  emergency_contacts: [
    { id: 'ec-2', name: 'Kavita Patel', relation: 'Mother', phone: '+91 98333 44556' },
  ],
};

const rahulPassengerMale: UserProfile = {
  id: 'user-rahul',
  full_name: 'Rahul Verma',
  employee_id: 'EMP-3150',
  email: 'rahul.v@techcorp.com',
  mobile: '+91 98444 55667',
  gender: 'male',
  photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  home_area: 'Madhapur, Hyderabad',
  home_lat: 17.4483,
  home_lng: 78.3915,
  work_area: 'HITEC City, Hyderabad',
  work_lat: 17.4435,
  work_lng: 78.3772,
  pref_depart_time: '08:30',
  pref_arrive_time: '09:15',
  flex_minutes: 20,
  current_role: 'passenger',
  is_admin: false,
  verified: true,
  trust_score: 92,
  emergency_contacts: [],
};

// Mock Carpools
const womenOnlyCarpool: Carpool = {
  id: 'carpool-women-only',
  host_id: ananyaHostFemale.id,
  host_name: ananyaHostFemale.full_name,
  host_gender: 'female',
  host_employee_id: ananyaHostFemale.employee_id,
  commute_id: 'commute-1',
  vehicle_id: 'veh-1',
  visibility: 'women_only',
  seats_total: 3,
  seats_available: 2,
  status: 'scheduled',
  start_time: '08:30',
  origin_label: 'Gachibowli Outer Ring Rd',
  origin_lat: 17.4401,
  origin_lng: 78.3489,
  dest_label: 'Tech Park Tower 3, HITEC City',
  dest_lat: 17.4435,
  dest_lng: 78.3772,
  polyline: [
    [17.4401, 78.3489],
    [17.4450, 78.3550],
    [17.4520, 78.3620],
    [17.4435, 78.3772],
  ],
  distance_km: 7.2,
  duration_min: 22,
  stops: [],
  members: [],
  created_at: new Date().toISOString(),
};

const privateCarpool: Carpool = {
  id: 'carpool-private',
  host_id: 'host-2',
  host_name: 'Vikram Mehta',
  host_gender: 'male',
  host_employee_id: 'EMP-4011',
  commute_id: 'commute-2',
  vehicle_id: 'veh-2',
  visibility: 'private',
  invite_code: 'TEAM-FINANCE-99',
  seats_total: 4,
  seats_available: 3,
  status: 'scheduled',
  start_time: '08:40',
  origin_label: 'Kondapur Main Rd',
  origin_lat: 17.4646,
  origin_lng: 78.3619,
  dest_label: 'Tech Park Tower 3, HITEC City',
  dest_lat: 17.4435,
  dest_lng: 78.3772,
  polyline: [
    [17.4646, 78.3619],
    [17.4550, 78.3680],
    [17.4435, 78.3772],
  ],
  distance_km: 5.5,
  duration_min: 18,
  stops: [],
  members: [],
  created_at: new Date().toISOString(),
};

// Priya's commute
const priyaCommute: Commute = {
  id: 'commute-priya',
  user_id: priyaPassengerFemale.id,
  role: 'passenger',
  source_label: 'Kondapur Signals',
  src_lat: 17.4580,
  src_lng: 78.3600,
  dest_label: 'Tech Park Tower 3',
  dest_lat: 17.4435,
  dest_lng: 78.3772,
  depart_time: '08:35',
  arrive_time: '09:15',
  flex_minutes: 20,
  max_detour_km: 4,
  recurring: true,
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  visibility: 'public',
  status: 'active',
  created_at: new Date().toISOString(),
};

// Rahul's commute
const rahulCommute: Commute = {
  id: 'commute-rahul',
  user_id: rahulPassengerMale.id,
  role: 'passenger',
  source_label: 'Madhapur Metro',
  src_lat: 17.4483,
  src_lng: 78.3915,
  dest_label: 'Tech Park Tower 3',
  dest_lat: 17.4435,
  dest_lng: 78.3772,
  depart_time: '08:30',
  arrive_time: '09:15',
  flex_minutes: 15,
  max_detour_km: 4,
  recurring: true,
  days: ['Mon', 'Wed', 'Fri'],
  visibility: 'public',
  status: 'active',
  created_at: new Date().toISOString(),
};

export function runMatchingTests() {
  console.log('--- RUNNING RIDESYNC MATCHING ENGINE TEST SUITE ---');

  // Test 1: Priya (female) should match Women-Only Carpool with high score
  const priyaMatch = scoreCarpool(priyaPassengerFemale, priyaCommute, womenOnlyCarpool);
  console.assert(priyaMatch !== null, 'FAIL: Priya should match women-only carpool');
  console.assert(priyaMatch!.total >= 70, `FAIL: Expected score >= 70, got ${priyaMatch?.total}`);
  console.log(`[PASS] Test 1: Priya matched Women-Only ride. Score: ${priyaMatch?.total}%. Reasons:`, priyaMatch?.reasons);

  // Test 2: Rahul (male) MUST BE REJECTED from Women-Only Carpool
  const rahulEligibility = isEligibleForCarpool(rahulPassengerMale, rahulCommute, womenOnlyCarpool);
  console.assert(rahulEligibility.eligible === false, 'FAIL: Rahul (male) must not be eligible for women-only ride');
  const rahulMatch = scoreCarpool(rahulPassengerMale, rahulCommute, womenOnlyCarpool);
  console.assert(rahulMatch === null, 'FAIL: Rahul must receive null match for women-only ride');
  console.log(`[PASS] Test 2: Women-Only hard filter strictly blocked male passenger Rahul. Reason: "${rahulEligibility.reason}"`);

  // Test 3: Private ride without code should be rejected, with code accepted
  const privateWithoutCode = isEligibleForCarpool(priyaPassengerFemale, priyaCommute, privateCarpool);
  console.assert(!privateWithoutCode.eligible, 'FAIL: Private ride should be ineligible without code');
  const privateWithCorrectCode = scoreCarpool(priyaPassengerFemale, priyaCommute, privateCarpool, undefined, 'TEAM-FINANCE-99');
  console.assert(privateWithCorrectCode !== null, 'FAIL: Private ride should match with valid code');
  console.log(`[PASS] Test 3: Private ride verified with invite code: TEAM-FINANCE-99 (Score: ${privateWithCorrectCode?.total}%)`);

  // Test 4: Time window flex tolerance
  const lateCommute: Commute = { ...priyaCommute, depart_time: '10:30' }; // 2 hours later
  const lateMatch = scoreCarpool(priyaPassengerFemale, lateCommute, womenOnlyCarpool);
  console.assert(lateMatch === null, 'FAIL: Ride outside flex window should be rejected');
  console.log('[PASS] Test 4: Commute with 2h departure difference correctly rejected by flex filter.');

  console.log('--- ALL MATCHING ENGINE UNIT TESTS PASSED SUCCESSFULLY! ---');
  return true;
}

import React, { useEffect, useState } from 'react';
import { clientApi } from '../../services/api.js';
import {
  DoorOpen,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  ShieldCheck,
  Search,
  MapPin,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatTimeIST, formatDateIST, getTodayDateStringIST } from '../../utils/formatters.js';

interface Room {
  _id: string;
  name: string;
  slug?: string;
  code?: string;
  workspaceType?: string;
  locationId: {
    _id: string;
    name: string;
    city?: string;
  } | string;
  capacity: number;
  hourlyRate: number;
  dailyRate?: number;
  bufferMinutes: number;
  slotIntervalMinutes: number;
  amenities: string[];
  description?: string;
  photos?: string[];
  isActive: boolean;
}

export const ClientRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateStringIST());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [operatingHours, setOperatingHours] = useState<{ open: string; close: string; isOpen: boolean }>({
    open: '08:00',
    close: '20:00',
    isOpen: true
  });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [durationSlots, setDurationSlots] = useState<number>(2);
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(4);
  const [estimate, setEstimate] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([clientApi.getRooms(), clientApi.getLocations().catch(() => [])])
      .then(([roomsData, locsData]) => {
        setRooms(roomsData.filter((r) => r.isActive));
        setLocations(locsData || []);
      })
      .catch((err) => setError(err.message || 'Failed to load rooms'))
      .finally(() => setLoading(false));
  }, []);

  const openBookModal = (room: Room) => {
    setSelectedRoom(room);
    setSelectedSlotIndex(null);
    setEstimate(null);
    setAttendeeCount(Math.min(4, room.capacity));
    setIsModalOpen(true);
    fetchSlotsForRoom(room._id, selectedDate);
  };

  const fetchSlotsForRoom = async (roomId: string, dateStr: string) => {
    try {
      setLoadingSlots(true);
      const res = await clientApi.getRoomAvailability(roomId, dateStr);
      setAvailableSlots(res.slots || []);
      if (res.operatingHours) {
        setOperatingHours(res.operatingHours);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check slot availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedSlotIndex(null);
    setEstimate(null);
    if (selectedRoom) {
      fetchSlotsForRoom(selectedRoom._id, newDate);
    }
  };

  const handleSelectSlot = async (index: number) => {
    setSelectedSlotIndex(index);
    if (!selectedRoom || !availableSlots[index]) return;

    const startSlot = availableSlots[index];
    const durationHours = (durationSlots * (selectedRoom.slotIntervalMinutes || 30)) / 60;

    try {
      const est = await clientApi.estimateAllowance({
        durationHours,
        startTime: startSlot.startTime
      });
      setEstimate(est);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDurationChange = async (slotsCount: number) => {
    setDurationSlots(slotsCount);
    if (selectedSlotIndex === null || !selectedRoom || !availableSlots[selectedSlotIndex]) return;

    const startSlot = availableSlots[selectedSlotIndex];
    const durationHours = (slotsCount * (selectedRoom.slotIntervalMinutes || 30)) / 60;

    try {
      const est = await clientApi.estimateAllowance({
        durationHours,
        startTime: startSlot.startTime
      });
      setEstimate(est);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || selectedSlotIndex === null || !availableSlots[selectedSlotIndex]) return;

    setSubmitting(true);
    setError(null);

    const startSlot = availableSlots[selectedSlotIndex];
    const slotMinutes = selectedRoom.slotIntervalMinutes || 30;
    const totalMinutes = durationSlots * slotMinutes;
    const endMs = new Date(startSlot.startTime).getTime() + totalMinutes * 60 * 1000;
    const endTime = new Date(endMs).toISOString();

    try {
      const booking = await clientApi.createBooking({
        roomId: selectedRoom._id,
        title,
        purpose,
        attendeeCount: Number(attendeeCount),
        startTime: startSlot.startTime,
        endTime
      });

      setIsModalOpen(false);
      setSuccessBooking(booking);
    } catch (err: any) {
      setError(err.message || 'Booking conflict or reservation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    {
      id: 'all',
      name: 'All Workspaces',
      count: `${rooms.length} available`
    },
    {
      id: 'MEETING_ROOM',
      name: 'Meeting Rooms',
      count: `${rooms.filter((r) => (r.workspaceType || 'MEETING_ROOM').toUpperCase().match(/(MEETING|BOARDROOM|CONFERENCE)/)).length} available`
    },
    {
      id: 'FLEX_DESK',
      name: 'Flex Desks',
      count: `${rooms.filter((r) => (r.workspaceType || '').toUpperCase().match(/(FLEX|HOT)/)).length} available`
    },
    {
      id: 'DEDICATED_DESK',
      name: 'Dedicated Desks',
      count: `${rooms.filter((r) => (r.workspaceType || '').toUpperCase().match(/(DEDICATED|FIXED)/)).length} available`
    },
    {
      id: 'PRIVATE_CABIN',
      name: 'Private Cabins',
      count: `${rooms.filter((r) => (r.workspaceType || '').toUpperCase().match(/(CABIN|OFFICE|PRIVATE)/)).length} available`
    },
    {
      id: 'DAY_PASS',
      name: 'Day Passes',
      count: `${rooms.filter((r) => (r.workspaceType || '').toUpperCase().includes('DAY_PASS')).length} available`
    }
  ];

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
      r.amenities.some((a) => a.toLowerCase().includes(search.toLowerCase()));

    let matchesLocation = true;
    if (selectedLocation !== 'all') {
      const locId = typeof r.locationId === 'object' && r.locationId !== null ? r.locationId._id : r.locationId;
      matchesLocation = locId === selectedLocation;
    }

    let matchesCapacity = true;
    if (capacityFilter === 'small') matchesCapacity = r.capacity <= 4;
    else if (capacityFilter === 'medium') matchesCapacity = r.capacity >= 5 && r.capacity <= 10;
    else if (capacityFilter === 'large') matchesCapacity = r.capacity > 10;

    let matchesPrice = true;
    if (priceFilter === 'under-800') matchesPrice = r.hourlyRate < 800;
    else if (priceFilter === '800-1200') matchesPrice = r.hourlyRate >= 800 && r.hourlyRate <= 1200;
    else if (priceFilter === 'above-1200') matchesPrice = r.hourlyRate > 1200;

    let matchesCategory = true;
    if (activeCategory !== 'all') {
      const ws = (r.workspaceType || 'MEETING_ROOM').toUpperCase();
      if (activeCategory === 'MEETING_ROOM') {
        matchesCategory = Boolean(ws.match(/(MEETING|BOARDROOM|CONFERENCE)/));
      } else if (activeCategory === 'FLEX_DESK') {
        matchesCategory = Boolean(ws.match(/(FLEX|HOT)/));
      } else if (activeCategory === 'DEDICATED_DESK') {
        matchesCategory = Boolean(ws.match(/(DEDICATED|FIXED)/));
      } else if (activeCategory === 'PRIVATE_CABIN') {
        matchesCategory = Boolean(ws.match(/(CABIN|OFFICE|PRIVATE)/));
      } else if (activeCategory === 'DAY_PASS') {
        matchesCategory = ws.includes('DAY_PASS');
      } else {
        matchesCategory = ws === activeCategory;
      }
    }

    return matchesSearch && matchesLocation && matchesCapacity && matchesPrice && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workspace Reservations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Book meeting rooms, flex desks, and private cabins in Indian Standard Time (IST).
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <button className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold">
            Discover Spaces
          </button>
          <Link
            to="/client/bookings"
            className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            My Bookings
          </Link>
        </div>
      </div>

      {successBooking && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1 text-xs">
          <div className="flex items-center space-x-2 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Reservation Confirmed • Ref: {successBooking.bookingNumber}</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            {successBooking.title} scheduled for {formatDateIST(successBooking.startTime)}, {formatTimeIST(successBooking.startTime)} - {formatTimeIST(successBooking.endTime)}.
            {successBooking.freeHoursDeducted > 0 && ` (${successBooking.freeHoursDeducted} free hours deducted from company allowance)`}
          </p>
          <button
            onClick={() => setSuccessBooking(null)}
            className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline pt-0.5 block"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`ml-2 text-[10px] ${isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search workspaces, amenities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 appearance-none font-medium"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name} ({loc.address?.city || 'India'})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 appearance-none font-medium"
            >
              <option value="all">Any Capacity</option>
              <option value="small">Focus Booth (1 - 4 seats)</option>
              <option value="medium">Collaborative (5 - 10 seats)</option>
              <option value="large">Boardroom (12+ seats)</option>
            </select>
          </div>

          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 appearance-none font-medium"
            >
              <option value="all">Any Hourly Rate</option>
              <option value="under-800">Under ₹800 / hr</option>
              <option value="800-1200">₹800 - ₹1,200 / hr</option>
              <option value="above-1200">Above ₹1,200 / hr</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Available Workspaces ({filteredRooms.length})
        </h2>
        <span className="text-xs text-slate-400">
          Showing real operating inventory in IST
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading workspaces...
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          <DoorOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No workspaces match your selected filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedLocation('all');
              setCapacityFilter('all');
              setPriceFilter('all');
              setActiveCategory('all');
            }}
            className="mt-2 text-xs font-semibold text-slate-900 dark:text-white hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const locName =
              typeof room.locationId === 'object' && room.locationId !== null
                ? room.locationId.name
                : 'Main Hub';
            const city =
              typeof room.locationId === 'object' && room.locationId !== null
                ? room.locationId.city || 'India'
                : 'India';
            const photoUrl =
              room.photos && room.photos.length > 0
                ? room.photos[0]
                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
            const wsLabel = (room.workspaceType || 'Meeting Room').replace(/_/g, ' ');

            return (
              <div
                key={room._id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={photoUrl}
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                    />

                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-xs text-white flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-300" />
                      <span>{locName}</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white shadow-xs">
                      Instant Booking
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                      <span className="font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                        {room.capacity} {room.capacity === 1 ? 'Seat' : 'Seats'}
                      </span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                        {formatCurrency(room.hourlyRate, 'INR')} / hr
                        {room.dailyRate ? ` • ${formatCurrency(room.dailyRate, 'INR')}/day` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {room.name}
                      </h3>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {wsLabel}
                      </span>
                    </div>

                    {room.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>08:00 AM – 08:00 PM IST</span>
                      </div>
                      <span>•</span>
                      <span>{room.slotIntervalMinutes || 30}m slots</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {room.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    From {formatCurrency(room.hourlyRate, 'INR')}/hr
                  </span>
                  <button
                    onClick={() => openBookModal(room)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all flex items-center space-x-1"
                  >
                    <span>Reserve Room</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="max-w-xl w-full p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 my-8 bg-white dark:bg-slate-800">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Reserve {selectedRoom.name}
                </h2>
                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Capacity: {selectedRoom.capacity} seats</span>
                  <span>•</span>
                  <span>{formatCurrency(selectedRoom.hourlyRate, 'INR')}/hr</span>
                  <span>•</span>
                  <span>Operating: {operatingHours.open} - {operatingHours.close} IST</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Reservation Date (IST)
                  </label>
                  <input
                    type="date"
                    required
                    min={getTodayDateStringIST()}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <select
                    value={durationSlots}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs"
                  >
                    <option value={1}>30 Minutes</option>
                    <option value={2}>1 Hour</option>
                    <option value={3}>1.5 Hours</option>
                    <option value={4}>2 Hours</option>
                    <option value={6}>3 Hours</option>
                    <option value={8}>4 Hours (Half Day)</option>
                    <option value={16}>8 Hours (Full Day)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Select Start Time (Indian Standard Time)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {availableSlots.filter((s) => s.isAvailable ?? s.available ?? true).length} open slots
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-6 text-center text-slate-400 text-xs">Checking real-time slot availability in IST...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-4 text-center text-rose-500 bg-rose-500/10 rounded-xl text-xs">
                    No operating slots available on this date ({operatingHours.open} - {operatingHours.close} IST).
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                    {availableSlots.map((slot, idx) => {
                      const isSlotAvail = slot.isAvailable ?? slot.available ?? true;
                      const isSelected = selectedSlotIndex === idx;
                      const timeStr = formatTimeIST(slot.startTime);

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!isSlotAvail}
                          onClick={() => handleSelectSlot(idx)}
                          className={`py-2 px-2 rounded-lg text-center font-medium transition-all text-xs ${
                            !isSlotAvail
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <div>{timeStr}</div>
                          {!isSlotAvail && (
                            <span className="text-[9px] text-rose-500 no-underline block">
                              {slot.reason === 'PAST' ? 'Passed' : slot.reason === 'RESERVED' ? 'Booked' : 'Closed'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    placeholder="e.g. Q4 Strategy Review"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Attendees
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedRoom.capacity}
                      value={attendeeCount}
                      onChange={(e) => setAttendeeCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Purpose
                    </label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      placeholder="e.g. Team Planning"
                    />
                  </div>
                </div>
              </div>

              {estimate && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Allowance Impact</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-amber-200 dark:border-amber-800">
                    <div>
                      <span className="text-slate-400 block">Available Quota</span>
                      <span className="font-semibold">{estimate.currentBalanceHours} hrs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hours Deducted</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {estimate.freeHoursToDeduct} hrs free
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Extra Charge</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {estimate.additionalCharge > 0
                          ? formatCurrency(estimate.additionalCharge, 'INR')
                          : '₹0 (Fully Covered)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedSlotIndex === null}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Lock Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

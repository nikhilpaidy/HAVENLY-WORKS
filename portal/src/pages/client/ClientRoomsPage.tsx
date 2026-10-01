import React, { useEffect, useState } from 'react';
import { clientApi } from '../../services/api.js';
import {
  DoorOpen,
  Users,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  ShieldCheck,
  Search,
  MapPin,
  SlidersHorizontal,
  Wifi,
  Tv,
  Coffee,
  Mic,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatTimeIST, formatDateIST, getTodayDateStringIST } from '../../utils/formatters.js';

interface Room {
  _id: string;
  name: string;
  slug?: string;
  code?: string;
  locationId: {
    _id: string;
    name: string;
    city?: string;
  } | string;
  capacity: number;
  hourlyRate: number;
  bufferMinutes: number;
  slotIntervalMinutes: number;
  amenities: string[];
  description?: string;
  photos?: string[];
  isActive: boolean;
}

const CATEGORIES = [
  {
    id: 'meeting-rooms',
    name: 'Meeting Rooms',
    count: '7 available',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    active: true
  },
  {
    id: 'flex-desks',
    name: 'Flex Desks',
    count: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=600&q=80',
    active: false
  },
  {
    id: 'fixed-desks',
    name: 'Fixed Desks',
    count: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
    active: false
  },
  {
    id: 'private-offices',
    name: 'Private Offices',
    count: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    active: false
  }
];

export const ClientRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  // Filters State (SpaceOS style)
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState('meeting-rooms');

  // Booking Modal State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateStringIST());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [durationSlots, setDurationSlots] = useState<number>(2); // 2 x 30m = 1 hour default
  const [title, setTitle] = useState('Executive Strategy Session');
  const [purpose, setPurpose] = useState('Client presentation & planning');
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
    setIsModalOpen(true);
    fetchSlotsForRoom(room._id, selectedDate);
  };

  const fetchSlotsForRoom = async (roomId: string, dateStr: string) => {
    try {
      setLoadingSlots(true);
      const res = await clientApi.getRoomAvailability(roomId, dateStr);
      setAvailableSlots(res.slots || []);
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

  // Filter logic
  const filteredRooms = rooms.filter((r) => {
    // Search
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
      r.amenities.some((a) => a.toLowerCase().includes(search.toLowerCase()));

    // Location
    let matchesLocation = true;
    if (selectedLocation !== 'all') {
      const locId = typeof r.locationId === 'object' && r.locationId !== null ? r.locationId._id : r.locationId;
      matchesLocation = locId === selectedLocation;
    }

    // Capacity
    let matchesCapacity = true;
    if (capacityFilter === 'small') matchesCapacity = r.capacity <= 4;
    else if (capacityFilter === 'medium') matchesCapacity = r.capacity >= 5 && r.capacity <= 10;
    else if (capacityFilter === 'large') matchesCapacity = r.capacity > 10;

    // Price
    let matchesPrice = true;
    if (priceFilter === 'under-800') matchesPrice = r.hourlyRate < 800;
    else if (priceFilter === '800-1200') matchesPrice = r.hourlyRate >= 800 && r.hourlyRate <= 1200;
    else if (priceFilter === 'above-1200') matchesPrice = r.hourlyRate > 1200;

    return matchesSearch && matchesLocation && matchesCapacity && matchesPrice;
  });

  return (
    <div className="space-y-6">
      {/* Top SpaceOS Style Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            Booking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reserve boardrooms and collaborative spaces across Bangalore, Mumbai, and Hyderabad in IST.
          </p>
        </div>

        {/* SpaceOS Top Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 text-xs font-semibold">
          <button className="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold">
            Book space
          </button>
          <Link
            to="/client/bookings"
            className="px-4 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            My Bookings
          </Link>
        </div>
      </div>

      {/* Success Banner */}
      {successBooking && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Reservation Confirmed! Reference: {successBooking.bookingNumber}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {successBooking.title} scheduled for {formatDateIST(successBooking.startTime)}, {formatTimeIST(successBooking.startTime)} - {formatTimeIST(successBooking.endTime)}.
            {successBooking.freeHoursDeducted > 0 && ` (${successBooking.freeHoursDeducted} free hours applied from company allowance)`}
          </p>
          <button
            onClick={() => setSuccessBooking(null)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SpaceOS Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 bg-white/70 dark:bg-[#0e1424]/70 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rooms, amenities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 appearance-none font-medium"
            >
              <option value="all">All Hub Locations</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name} ({loc.address?.city || 'India'})
                </option>
              ))}
            </select>
          </div>

          {/* Capacity */}
          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 appearance-none font-medium"
            >
              <option value="all">Any Capacity</option>
              <option value="small">Focus Booth (1 - 4 seats)</option>
              <option value="medium">Collaborative (5 - 10 seats)</option>
              <option value="large">Boardroom (12+ seats)</option>
            </select>
          </div>

          {/* Hourly Rate */}
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 appearance-none font-medium"
            >
              <option value="all">Any Hourly Rate</option>
              <option value="under-800">Under ₹800 / hr</option>
              <option value="800-1200">₹800 - ₹1,200 / hr</option>
              <option value="above-1200">Above ₹1,200 / hr</option>
            </select>
          </div>
        </div>
      </div>

      {/* SpaceOS Category Carousel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`group relative overflow-hidden rounded-2xl border text-left p-3 transition-all ${
              activeCategory === cat.id
                ? 'border-brand-500 dark:border-[#C5A880] ring-2 ring-brand-500/20 dark:ring-[#C5A880]/20 bg-brand-50/20 dark:bg-[#C5A880]/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/60 dark:bg-slate-900/60'
            }`}
          >
            <div className="h-24 w-full rounded-xl overflow-hidden relative mb-2">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {activeCategory === cat.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">{cat.name}</div>
            <div className="text-[10px] text-slate-400">{cat.count}</div>
          </button>
        ))}
      </div>

      {/* Heading of Selected Category */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
          Meeting Rooms & Boardrooms ({filteredRooms.length})
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing available workspaces across India
        </span>
      </div>

      {/* Room Grid (SpaceOS + InsightLancer Style) */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading meeting rooms...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
          <DoorOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="font-semibold text-sm">No meeting rooms match your selected filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedLocation('all');
              setCapacityFilter('all');
              setPriceFilter('all');
            }}
            className="mt-3 text-xs font-bold text-brand-600 dark:text-[#C5A880] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const locName =
              typeof room.locationId === 'object' && room.locationId !== null
                ? room.locationId.name
                : 'Primary Campus';
            const city =
              typeof room.locationId === 'object' && room.locationId !== null
                ? room.locationId.city || 'India'
                : 'India';
            const photoUrl =
              room.photos && room.photos.length > 0
                ? room.photos[0]
                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';

            return (
              <div
                key={room._id}
                className="group glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between hover:border-brand-500/50 dark:hover:border-[#C5A880]/50 transition-all shadow-sm bg-white/70 dark:bg-[#0e1424]/70"
              >
                <div>
                  {/* Photo with Overlay Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={photoUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Top Location Pill */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#C5A880]" />
                      <span>{locName}</span>
                    </div>

                    {/* Status Pill */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md">
                      Instant Booking
                    </div>

                    {/* Bottom Specs */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-bold px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md">
                        {room.capacity} SEATS
                      </span>
                      <span className="font-extrabold text-sm text-[#C5A880] drop-shadow-md">
                        {formatCurrency(room.hourlyRate, 'INR')} <span className="text-[10px] font-normal text-slate-200">/ hr</span>
                      </span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white line-clamp-1">
                      {room.name}
                    </h3>

                    {room.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>
                    )}

                    {/* Amenities Tag Cloud */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {room.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-medium">
                    {room.slotIntervalMinutes}m slot intervals
                  </div>
                  <button
                    onClick={() => openBookModal(room)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <span>Reserve Room</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8 bg-white dark:bg-[#0e1424]">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-[#C5A880]">
                  Reserve Workspace in IST
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  {selectedRoom.name}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span>{selectedRoom.capacity} Seats</span>
                  <span>•</span>
                  <span>{formatCurrency(selectedRoom.hourlyRate, 'INR')}/hr</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-5 text-xs">
              {/* Date & Duration Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Reservation Date (IST)
                  </label>
                  <input
                    type="date"
                    required
                    min={getTodayDateStringIST()}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={durationSlots}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
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

              {/* Time Slot Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Select Start Time (Indian Standard Time)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {availableSlots.filter((s) => s.available).length} slots open
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-8 text-center text-slate-400">Checking slot availability in IST...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-6 text-center text-rose-500 bg-rose-500/10 rounded-xl">
                    No operating slots available on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot, idx) => {
                      const isSelected = selectedSlotIndex === idx;
                      const timeStr = formatTimeIST(slot.startTime);

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => handleSelectSlot(idx)}
                          className={`py-2 px-2.5 rounded-xl text-center font-medium transition-all ${
                            !slot.available
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-slate-900 dark:bg-[#C5A880] text-white dark:text-[#090D16] font-bold shadow-md'
                              : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500'
                          }`}
                        >
                          {timeStr}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Booking Context */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="e.g. Q4 Strategy Review"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Attendees
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedRoom.capacity}
                      value={attendeeCount}
                      onChange={(e) => setAttendeeCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Purpose
                    </label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      placeholder="e.g. Board review"
                    />
                  </div>
                </div>
              </div>

              {/* Allowance Impact Estimation */}
              {estimate && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-brand-600 dark:text-[#C5A880] font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Free Allowance Assessment</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-amber-500/20">
                    <div>
                      <span className="text-slate-400 block">Available Quota</span>
                      <span className="font-bold">{estimate.currentBalanceHours} hrs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hours Deducted</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {estimate.freeHoursToDeduct} hrs free
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Extra Charge</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {estimate.additionalCharge > 0
                          ? formatCurrency(estimate.additionalCharge, 'INR')
                          : '₹0 (Fully Covered)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedSlotIndex === null}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] text-xs font-bold shadow-md transition-all disabled:opacity-50"
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

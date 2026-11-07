import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
import {
  DoorOpen,
  Users,
  Clock,
  DollarSign,
  Plus,
  Edit2,
  Wrench,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { formatCurrency, formatDateTimeIST } from '../../utils/formatters.js';

interface Room {
  _id: string;
  name: string;
  slug: string;
  locationId: {
    _id: string;
    name: string;
  } | string;
  capacity: number;
  hourlyRate: number;
  bufferMinutes: number;
  slotIntervalMinutes: number;
  amenities: string[];
  photos?: string[];
  description?: string;
  isActive: boolean;
  maintenanceBlocks?: Array<{
    reason: string;
    startTime: string;
    endTime: string;
  }>;
}

interface Location {
  _id: string;
  name: string;
}

export const AdminRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Room modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(1200);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [slotIntervalMinutes, setSlotIntervalMinutes] = useState(30);
  const [amenitiesInput, setAmenitiesInput] = useState('4K Video Bar, Whiteboard, High-Speed Wi-Fi');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
  const [submittingRoom, setSubmittingRoom] = useState(false);

  // Maintenance modal
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintRoom, setMaintRoom] = useState<Room | null>(null);
  const [maintReason, setMaintReason] = useState('Scheduled AV Upgrade & Deep Clean');
  const [maintStart, setMaintStart] = useState('');
  const [maintEnd, setMaintEnd] = useState('');
  const [submittingMaint, setSubmittingMaint] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, locsData] = await Promise.all([
        adminApi.getRooms(selectedLocation !== 'all' ? { locationId: selectedLocation } : {}),
        adminApi.getLocations()
      ]);
      setRooms(roomsData);
      setLocations(locsData);
      if (locsData.length > 0 && !locationId) {
        setLocationId(locsData[0]._id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation]);

  const openCreateRoomModal = () => {
    setEditingRoom(null);
    setName('');
    setLocationId(locations[0]?._id || '');
    setCapacity(8);
    setHourlyRate(1200);
    setBufferMinutes(15);
    setSlotIntervalMinutes(30);
    setAmenitiesInput('4K Video Bar, Whiteboard, Acoustic Paneling');
    setDescription('');
    setPhotoUrl('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    const locId = typeof room.locationId === 'object' ? room.locationId._id : room.locationId;
    setLocationId(locId);
    setCapacity(room.capacity);
    setHourlyRate(room.hourlyRate);
    setBufferMinutes(room.bufferMinutes || 15);
    setSlotIntervalMinutes(room.slotIntervalMinutes || 30);
    setAmenitiesInput(room.amenities ? room.amenities.join(', ') : '');
    setDescription(room.description || '');
    setPhotoUrl(room.photos && room.photos.length > 0 ? room.photos[0] : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRoom(true);
    setError(null);

    const payload = {
      name,
      locationId,
      capacity: Number(capacity),
      hourlyRate: Number(hourlyRate),
      bufferMinutes: Number(bufferMinutes),
      slotIntervalMinutes: Number(slotIntervalMinutes),
      amenities: amenitiesInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      photos: photoUrl.trim() ? [photoUrl.trim()] : [],
      description
    };

    try {
      if (editingRoom) {
        await adminApi.updateRoom(editingRoom._id, payload);
      } else {
        await adminApi.createRoom(payload);
      }
      setIsRoomModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save room');
    } finally {
      setSubmittingRoom(false);
    }
  };

  const openMaintModal = (room: Room) => {
    setMaintRoom(room);
    setMaintReason('Scheduled Technical Maintenance');
    const now = new Date();
    const isoStart = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
    const isoEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setMaintStart(isoStart);
    setMaintEnd(isoEnd);
    setIsMaintModalOpen(true);
  };

  const handleMaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintRoom) return;
    setSubmittingMaint(true);
    setError(null);

    try {
      await adminApi.addMaintenanceBlock(maintRoom._id, {
        reason: maintReason,
        startTime: new Date(maintStart).toISOString(),
        endTime: new Date(maintEnd).toISOString()
      });
      setIsMaintModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to set maintenance block');
    } finally {
      setSubmittingMaint(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Space Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Meeting Rooms & Boardrooms
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure rooms, slot buffer increments, equipment amenities, and scheduled downtime.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {locations.length > 0 && (
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={openCreateRoomModal}
            className="px-4 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading meeting rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <DoorOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No meeting rooms found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Create meeting spaces with acoustic standards and buffer windows.
          </p>
          <button
            onClick={openCreateRoomModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-semibold"
          >
            Add Meeting Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const locName =
              typeof room.locationId === 'object' && room.locationId !== null
                ? room.locationId.name
                : 'Primary Campus';

            const activeMaint = room.maintenanceBlocks?.find(
              (b) => new Date(b.endTime).getTime() > Date.now()
            );

            const photoUrl =
              room.photos && room.photos.length > 0
                ? room.photos[0]
                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';

            return (
              <div
                key={room._id}
                className="group glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between hover:border-brand-500/40 dark:hover:border-[#C5A880]/40 transition-all shadow-sm bg-white/70 dark:bg-[#0e1424]/70"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={photoUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Location Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#C5A880]" />
                      <span>{locName}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1">
                      {activeMaint && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white backdrop-blur-md flex items-center space-x-1">
                          <Wrench className="w-2.5 h-2.5" />
                          <span>Maint</span>
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md text-white ${
                          room.isActive ? 'bg-emerald-600/90' : 'bg-slate-600/90'
                        }`}
                      >
                        {room.isActive ? 'Active' : 'Offline'}
                      </span>
                    </div>

                    {/* Bottom Specs */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                        {room.capacity} SEATS
                      </span>
                      <span className="font-extrabold text-sm text-[#C5A880] drop-shadow-md">
                        {formatCurrency(room.hourlyRate, 'INR')} <span className="text-[10px] font-normal text-slate-200">/ hr</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white line-clamp-1">
                      {room.name}
                    </h3>

                    {room.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>
                    )}

                    {/* Room Specs */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.slotIntervalMinutes}m slots</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.bufferMinutes}m buffer</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
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
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => openMaintModal(room)}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Downtime Block</span>
                  </button>

                  <button
                    onClick={() => openEditRoomModal(room)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 text-slate-700 dark:text-slate-200"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Room</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                {editingRoom ? 'Update Room Configuration' : 'Create Meeting Room'}
              </h2>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Executive Boardroom"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location *
                </label>
                <select
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                >
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Capacity (people) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Hourly Rate (₹/hr) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Buffer Time (mins)
                  </label>
                  <select
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  >
                    <option value={0}>0 minutes</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Slot Interval (mins)
                  </label>
                  <select
                    value={slotIntervalMinutes}
                    onChange={(e) => setSlotIntervalMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amenities (comma separated)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="4K Display, Neat Bar, Acoustic Wall, Whiteboard"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-spec room equipped for hybrid executive meetings and client presentations."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRoom}
                  className="px-5 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {submittingRoom ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Block Modal */}
      {isMaintModalOpen && maintRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Schedule Maintenance
                </h2>
                <span className="text-xs text-slate-500">{maintRoom.name}</span>
              </div>
              <button
                onClick={() => setIsMaintModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaintSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Downtime *
                </label>
                <input
                  type="text"
                  required
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Window *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={maintStart}
                  onChange={(e) => setMaintStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Window *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={maintEnd}
                  onChange={(e) => setMaintEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B6925A]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMaint}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submittingMaint ? 'Locking Slots...' : 'Confirm Downtime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
import {
  DoorOpen,
  Users,
  Clock,
  Plus,
  Edit2,
  Wrench,
  AlertCircle,
  X,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

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
  dailyRate?: number;
  workspaceType?: string;
  floor?: string;
  floorManagerName?: string;
  floorManagerPhone?: string;
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

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [workspaceType, setWorkspaceType] = useState('MEETING_ROOM');
  const [workspaceTypes, setWorkspaceTypes] = useState<any[]>([]);
  const [capacity, setCapacity] = useState<number | ''>('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [dailyRate, setDailyRate] = useState<number | ''>('');
  const [floor, setFloor] = useState('');
  const [floorManagerName, setFloorManagerName] = useState('');
  const [floorManagerPhone, setFloorManagerPhone] = useState('');
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [slotIntervalMinutes, setSlotIntervalMinutes] = useState(30);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submittingRoom, setSubmittingRoom] = useState(false);

  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintRoom, setMaintRoom] = useState<Room | null>(null);
  const [maintReason, setMaintReason] = useState('');
  const [maintStart, setMaintStart] = useState('');
  const [maintEnd, setMaintEnd] = useState('');
  const [submittingMaint, setSubmittingMaint] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, locsData, typesData] = await Promise.all([
        adminApi.getRooms(selectedLocation !== 'all' ? { locationId: selectedLocation } : {}),
        adminApi.getLocations(),
        adminApi.getWorkspaceTypes().catch(() => [])
      ]);
      setRooms(roomsData);
      setLocations(locsData);
      setWorkspaceTypes(typesData || []);
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
    setWorkspaceType(workspaceTypes[0]?.code || 'MEETING_ROOM');
    setCapacity('');
    setHourlyRate('');
    setDailyRate('');
    setFloor('');
    setFloorManagerName('');
    setFloorManagerPhone('');
    setBufferMinutes(15);
    setSlotIntervalMinutes(30);
    setAmenitiesInput('');
    setDescription('');
    setPhotoUrl('');
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    const locId = typeof room.locationId === 'object' ? room.locationId._id : room.locationId;
    setLocationId(locId);
    setWorkspaceType(room.workspaceType || 'MEETING_ROOM');
    setCapacity(room.capacity || 1);
    setHourlyRate(room.hourlyRate || 0);
    setDailyRate(room.dailyRate || 0);
    setFloor(room.floor || '');
    setFloorManagerName(room.floorManagerName || '');
    setFloorManagerPhone(room.floorManagerPhone || '');
    setBufferMinutes(room.bufferMinutes || 15);
    setSlotIntervalMinutes(room.slotIntervalMinutes || 30);
    setAmenitiesInput(room.amenities ? room.amenities.join(', ') : '');
    setDescription(room.description || '');
    setPhotoUrl(room.photos && room.photos.length > 0 ? room.photos[0] : '');
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmittingRoom(true);
    setError(null);

    const payload = {
      name: name.trim(),
      locationId,
      workspaceType: workspaceType || 'MEETING_ROOM',
      capacity: capacity ? Number(capacity) : 1,
      hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
      dailyRate: dailyRate ? Number(dailyRate) : undefined,
      floor: floor.trim() || undefined,
      floorManagerName: floorManagerName.trim() || undefined,
      floorManagerPhone: floorManagerPhone.trim() || undefined,
      bufferMinutes: Number(bufferMinutes),
      slotIntervalMinutes: Number(slotIntervalMinutes),
      amenities: amenitiesInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      description: description.trim() || undefined,
      photos: photoUrl.trim() ? [photoUrl.trim()] : undefined
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
      setError(err.message || 'Failed to save room configuration');
    } finally {
      setSubmittingRoom(false);
    }
  };

  const openMaintModal = (room: Room) => {
    setMaintRoom(room);
    setMaintReason('');
    const now = new Date();
    setMaintStart(now.toISOString().slice(0, 16));
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    setMaintEnd(tomorrow.toISOString().slice(0, 16));
    setIsMaintModalOpen(true);
  };

  const handleMaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintRoom) return;
    setSubmittingMaint(true);
    setError(null);

    try {
      await adminApi.addMaintenanceBlock(maintRoom._id, {
        reason: maintReason.trim(),
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            Meeting Rooms & Space Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure rooms, slot buffer increments, amenities, and scheduled downtime.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {locations.length > 0 && (
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Hub Locations</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={openCreateRoomModal}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Space</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading workspace inventory...
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
          <DoorOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No meeting rooms or workspaces found
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Create meeting spaces with capacity and slot increments.
          </p>
          <button
            onClick={openCreateRoomModal}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold"
          >
            Add Space
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

            const wsTypeLabel = (room.workspaceType || 'Meeting Room').replace(/_/g, ' ');

            return (
              <div
                key={room._id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={photoUrl}
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                    />

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-xs text-white flex items-center space-x-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-300" />
                      <span>{locName}</span>
                    </div>

                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      {activeMaint && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500 text-white flex items-center space-x-0.5 shadow-xs">
                          <Wrench className="w-2.5 h-2.5" />
                          <span>Maint</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold text-white shadow-xs ${
                          room.isActive ? 'bg-emerald-600' : 'bg-slate-600'
                        }`}
                      >
                        {room.isActive ? 'Active' : 'Offline'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px]">
                      <span className="font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                        {room.capacity} {room.capacity === 1 ? 'Seat' : 'Seats'}
                      </span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                        {formatCurrency(room.hourlyRate, 'INR')}/hr
                        {room.dailyRate ? ` • ${formatCurrency(room.dailyRate, 'INR')}/d` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {room.name}
                      </h3>
                      <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {wsTypeLabel}
                      </span>
                    </div>

                    {room.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <span>{room.floor || 'General Floor'}</span>
                      <span>
                        Mgr: {room.floorManagerName || 'Hub Desk'} {room.floorManagerPhone ? `(${room.floorManagerPhone})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{room.slotIntervalMinutes}m slots</span>
                      </div>
                      <span>•</span>
                      <span>{room.bufferMinutes}m buffer</span>
                    </div>

                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400">
                            +{room.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => openMaintModal(room)}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center space-x-1 transition-colors"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Downtime</span>
                  </button>

                  <button
                    onClick={() => openEditRoomModal(room)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors flex items-center space-x-1 text-slate-700 dark:text-slate-200"
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

      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                {editingRoom ? `Edit Workspace: ${editingRoom.name}` : 'Create Workspace Inventory'}
              </h2>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Space Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Executive Boardroom, Quiet Hot Desk"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Location *
                  </label>
                  <select
                    required
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  >
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Workspace Type *
                  </label>
                  <select
                    required
                    value={workspaceType}
                    onChange={(e) => setWorkspaceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  >
                    {workspaceTypes.length > 0 ? (
                      workspaceTypes.map((wt) => (
                        <option key={wt._id || wt.code} value={wt.code}>
                          {wt.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="MEETING_ROOM">Meeting Room</option>
                        <option value="FLEX_DESK">Flex Desk</option>
                        <option value="DEDICATED_DESK">Dedicated Desk</option>
                        <option value="PRIVATE_CABIN">Private Cabin</option>
                        <option value="DAY_PASS">Day Pass</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Capacity (Seats) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    placeholder="e.g. 6"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Hourly Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="e.g. 600"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Day Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 2500"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Floor & Operations Contact
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Floor</label>
                    <input
                      type="text"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="e.g. Floor 2"
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Floor Manager</label>
                    <input
                      type="text"
                      value={floorManagerName}
                      onChange={(e) => setFloorManagerName(e.target.value)}
                      placeholder="e.g. Vikram Rao"
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Manager Phone</label>
                    <input
                      type="text"
                      value={floorManagerPhone}
                      onChange={(e) => setFloorManagerPhone(e.target.value)}
                      placeholder="+91 98450 11223"
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Buffer Time (mins)
                  </label>
                  <select
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  >
                    <option value={0}>0 minutes</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Slot Interval (mins)
                  </label>
                  <select
                    value={slotIntervalMinutes}
                    onChange={(e) => setSlotIntervalMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="e.g. 4K Display, High-Speed WiFi, Whiteboard, Video Bar"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of room equipment, soundproofing, and seating..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="pt-2.5 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRoom}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-opacity disabled:opacity-50"
                >
                  {submittingRoom ? 'Saving...' : editingRoom ? 'Update Space' : 'Create Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMaintModalOpen && maintRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                  Schedule Space Downtime
                </h2>
                <span className="text-[11px] text-slate-400">{maintRoom.name}</span>
              </div>
              <button
                onClick={() => setIsMaintModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMaintSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Reason for Downtime *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC Servicing, Carpet Deep Clean, AV Upgrade"
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Start Window *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={maintStart}
                    onChange={(e) => setMaintStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    End Window *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={maintEnd}
                    onChange={(e) => setMaintEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2.5 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMaint}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
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

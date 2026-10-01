import React, { useState } from 'react';
import { Users, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface SimulatedRoom {
  id: string;
  name: string;
  capacity: number;
  rate: number;
  occupiedSlots: string[]; // e.g. ["11:00", "11:30", "14:00"]
}

const ROOMS: SimulatedRoom[] = [
  {
    id: 'apex',
    name: 'Apex Executive Boardroom',
    capacity: 16,
    rate: 75,
    occupiedSlots: ['11:00', '11:30', '14:00', '14:30']
  },
  {
    id: 'horizon',
    name: 'Horizon Strategy Suite',
    capacity: 10,
    rate: 50,
    occupiedSlots: ['09:30', '10:00', '15:00', '15:30']
  },
  {
    id: 'vanguard',
    name: 'Vanguard Creative Studio',
    capacity: 6,
    rate: 35,
    occupiedSlots: ['13:00', '13:30']
  }
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30'
];

export const InteractiveScheduler: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<SimulatedRoom>(ROOMS[0]);
  const [startSlotIndex, setStartSlotIndex] = useState<number>(2); // 10:00
  const [durationSlots, setDurationSlots] = useState<number>(3); // 1.5 hours (3 slots of 30 mins)
  const companyFreeHoursRemaining = 2.0;
  const extraHourlyRate = selectedRoom.rate;

  const durationHours = durationSlots * 0.5;
  const freeHoursApplied = Math.min(companyFreeHoursRemaining, durationHours);
  const chargeableHours = Math.max(0, durationHours - freeHoursApplied);
  const estimatedOverageCharge = chargeableHours * extraHourlyRate;

  // Check if any slot in selected interval conflicts with occupied slots
  const selectedSlots = TIME_SLOTS.slice(startSlotIndex, startSlotIndex + durationSlots);
  const hasConflict = selectedSlots.some((s) => selectedRoom.occupiedSlots.includes(s));

  return (
    <div className="rounded-3xl glass-panel glow-border p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur backdrop */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        {/* Left Control Column */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-brand-600 dark:text-gold-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Interactive Simulator</span>
              </span>
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                Atomic Slot Allocation Engine
              </h3>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Zero-Overlap Enforced</span>
            </div>
          </div>

          {/* Select Room */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Executive Suite
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    selectedRoom.id === room.id
                      ? 'border-brand-500 dark:border-gold-400 bg-brand-50/50 dark:bg-gold-500/10 shadow-md ring-1 ring-brand-500 dark:ring-gold-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/60 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {room.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-1">
                    <span className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1 text-slate-400" /> {room.capacity} seats
                    </span>
                    <span className="font-semibold text-brand-600 dark:text-gold-400">${room.rate}/hr</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Time Slots Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Time Slot Grid (30-min normalized intervals)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {TIME_SLOTS.map((time, idx) => {
                const isOccupied = selectedRoom.occupiedSlots.includes(time);
                const isSelected = idx >= startSlotIndex && idx < startSlotIndex + durationSlots;

                return (
                  <button
                    key={time}
                    disabled={isOccupied}
                    onClick={() => setStartSlotIndex(idx)}
                    className={`py-2 px-1 text-xs rounded-xl font-semibold border text-center transition-all ${
                      isOccupied
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400 cursor-not-allowed line-through opacity-70'
                        : isSelected
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-gold-500 dark:to-amber-500 text-white dark:text-[#090D16] border-transparent font-bold shadow-lg shadow-brand-500/20'
                        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500 dark:hover:border-gold-400'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center space-x-4 mt-2.5 text-[11px] text-slate-500">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" /> Available</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-brand-500 dark:bg-gold-400 mr-1.5" /> Selected</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" /> Reserved (Locked)</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Reservation Duration
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {durationHours} Hours ({durationSlots * 30} mins)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={durationSlots}
              onChange={(e) => setDurationSlots(parseInt(e.target.value, 10))}
              className="w-full accent-brand-600 dark:accent-gold-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Financial & Entitlement Receipt */}
        <div className="w-full lg:w-80 rounded-2xl bg-white/70 dark:bg-slate-900/90 p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 mb-3">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-gold-400" />
              <span>Real-Time Quota Settlement</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Monthly Free Quota</span>
                <span className="font-semibold text-slate-900 dark:text-white">20.0 hrs/mo</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Free Balance Remaining</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {companyFreeHoursRemaining.toFixed(1)} hrs
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Duration Requested</span>
                <span className="font-medium text-slate-900 dark:text-white">{durationHours.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Free Hours Applied</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  -{freeHoursApplied.toFixed(1)} hrs
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Chargeable Extra Hours</span>
                <span className="font-medium text-slate-900 dark:text-white">{chargeableHours.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Contract Overage Rate</span>
                <span className="font-semibold text-slate-900 dark:text-white">${extraHourlyRate}/hr</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 dark:text-white text-xs">Estimated Charge</span>
              <span className="text-2xl font-black font-display text-brand-600 dark:text-gold-400">
                ${estimatedOverageCharge.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            {hasConflict ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Conflict Detected: Selected slot is already booked. Atomic transaction will abort to prevent double booking.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Slot Available! Lock ready to reserve {selectedSlots.length} discrete units with zero collision.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

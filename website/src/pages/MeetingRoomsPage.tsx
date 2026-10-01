import React from 'react';

export const MeetingRoomsPage: React.FC = () => {
  const sampleRooms = [
    {
      name: 'The Zenith Boardroom',
      capacity: 'Up to 16 Attendees',
      rate: '$120 / Hour Base',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      description: 'Panoramic executive suite tailored for high-stakes presentations, investor demos, and quarterly reviews.',
      amenities: ['Dual 4K Screens', 'Polycom Video Bar', 'Acoustic Wall Paneling', 'Nespresso Counter', 'Wireless Casting']
    },
    {
      name: 'The Obsidian Strategy Suite',
      capacity: 'Up to 8 Attendees',
      rate: '$75 / Hour Base',
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
      description: 'Immersive ideation suite designed for product roadmap planning and executive team sprints.',
      amenities: ['Floor-to-Ceiling Whiteboard', 'Video Conferencing', 'High-Speed Fiber WiFi', 'Interactive Touchscreen']
    },
    {
      name: 'The Solarium Focus Pod',
      capacity: 'Up to 4 Attendees',
      rate: '$45 / Hour Base',
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
      description: 'Sunlit acoustic sanctuary engineered for confidential negotiations and 1-on-1 performance reviews.',
      amenities: ['Natural Skylight', 'High-Fidelity Audio', 'Presentation Display', 'Soundproof Baffling']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Architectural Spaces
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          Intelligent Meeting Room Management
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Every space calibrated for ergonomics, acoustic clarity, and automated calendar exclusivity.
        </p>
      </div>

      <div className="space-y-12">
        {sampleRooms.map((room, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-5 h-72 lg:h-auto overflow-hidden">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                    {room.name}
                  </h3>
                  <span className="text-sm font-bold text-[#B6925A] dark:text-[#C5A880]">
                    {room.rate}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {room.capacity}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {room.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Integrated Equipment & Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((am, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

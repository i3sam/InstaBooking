import { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, User } from 'lucide-react';

interface AppointmentData {
  id: number;
  name: string;
  pageName: string;
  city: string;
  date: string;
  status: 'pending' | 'accepted' | 'rescheduled';
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
}

const names = [
  'Sarah Chen', 'David Martinez', 'Elena Rodriguez', 'James Wilson',
  'Maria Garcia', 'Michael Brown', 'Jessica Taylor', 'Robert Johnson',
  'Lisa Anderson', 'Christopher Lee', 'Amanda White', 'Daniel Kim',
  'Jennifer Clark', 'Matthew Davis', 'Emily Thompson', 'Ryan Martinez'
];

const pageNames = [
  'Yoga Studio', 'Hair Salon', 'Photography', 'Consulting',
  'Personal Training', 'Therapy Sessions', 'Music Lessons', 'Spa Treatment',
  'Business Coaching', 'Tutoring', 'Dental Care', 'Massage Therapy'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'San Francisco',
  'Seattle', 'Austin', 'Boston', 'Denver',
  'Portland', 'Miami', 'Atlanta', 'Dallas'
];

const generateRandomDate = () => {
  const today = new Date();
  const daysAhead = Math.floor(Math.random() * 30);
  const date = new Date(today);
  date.setDate(today.getDate() + daysAhead);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const statuses: Array<'pending' | 'accepted' | 'rescheduled'> = ['pending', 'accepted', 'rescheduled'];

const getRandomStatus = () => {
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getStatusStyles = (status: 'pending' | 'accepted' | 'rescheduled') => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950';
    case 'accepted':
      return 'bg-green-500 dark:bg-green-600 text-white';
    case 'rescheduled':
      return 'bg-red-500 dark:bg-red-600 text-white';
  }
};

interface AppointmentBallpitProps {
  count?: number;
}

export default function AppointmentBallpit({ count = 30 }: AppointmentBallpitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const animationRef = useRef<number>();
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mousePos.current = { x: -1000, y: -1000 };
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const initialAppointments: AppointmentData[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      name: names[Math.floor(Math.random() * names.length)],
      pageName: pageNames[Math.floor(Math.random() * pageNames.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      date: generateRandomDate(),
      status: getRandomStatus(),
      x: Math.random() * (width - 200),
      y: Math.random() * (height - 100),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360
    }));

    setAppointments(initialAppointments);

    let lastUpdate = Date.now();
    const targetFPS = 30; // Reduce from 60fps to 30fps for better performance
    const frameInterval = 1000 / targetFPS;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastUpdate;

      if (elapsed > frameInterval) {
        lastUpdate = now - (elapsed % frameInterval);

        setAppointments(prev => {
          const rect = container.getBoundingClientRect();
          const containerWidth = rect.width;
          const containerHeight = rect.height;

          return prev.map(apt => {
            let newX = apt.x + apt.vx;
            let newY = apt.y + apt.vy;
            let newVx = apt.vx;
            let newVy = apt.vy;

            const cardWidth = 220;
            const cardHeight = 95;

            // Repel from mouse cursor
            const dx = (apt.x + cardWidth / 2) - mousePos.current.x;
            const dy = (apt.y + cardHeight / 2) - mousePos.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const repelRadius = 150;

            if (distance < repelRadius && distance > 0) {
              const force = (repelRadius - distance) / repelRadius;
              newVx += (dx / distance) * force * 3;
              newVy += (dy / distance) * force * 3;
            }

            if (newX <= 0 || newX >= containerWidth - cardWidth) {
              newVx = -newVx * 0.95;
              newX = newX <= 0 ? 0 : containerWidth - cardWidth;
            }

            if (newY <= 0 || newY >= containerHeight - cardHeight) {
              newVy = -newVy * 0.95;
              newY = newY <= 0 ? 0 : containerHeight - cardHeight;
            }

            return {
              ...apt,
              x: newX,
              y: newY,
              vx: newVx,
              vy: newVy,
              rotation: apt.rotation + 0.5
            };
          });
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [count]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="absolute pointer-events-none"
          style={{
            left: `${apt.x}px`,
            top: `${apt.y}px`,
            width: '220px'
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4 border-2 border-blue-500 dark:border-blue-400 transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {apt.name}
                </p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                  {apt.pageName}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyles(apt.status)}`}>
                {apt.status}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{apt.city}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                <span>{apt.date}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

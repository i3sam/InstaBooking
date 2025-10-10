import { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, User } from 'lucide-react';

interface AppointmentData {
  id: number;
  name: string;
  pageName: string;
  city: string;
  date: string;
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

interface AppointmentBallpitProps {
  count?: number;
}

export default function AppointmentBallpit({ count = 30 }: AppointmentBallpitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const initialAppointments: AppointmentData[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      name: names[Math.floor(Math.random() * names.length)],
      pageName: pageNames[Math.floor(Math.random() * pageNames.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      date: generateRandomDate(),
      x: Math.random() * (width - 200),
      y: Math.random() * (height - 100),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360
    }));

    setAppointments(initialAppointments);

    const animate = () => {
      setAppointments(prev => {
        const rect = container.getBoundingClientRect();
        const containerWidth = rect.width;
        const containerHeight = rect.height;

        return prev.map(apt => {
          let newX = apt.x + apt.vx;
          let newY = apt.y + apt.vy;
          let newVx = apt.vx;
          let newVy = apt.vy;

          const cardWidth = 200;
          const cardHeight = 80;

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

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="absolute transition-transform duration-100"
          style={{
            left: `${apt.x}px`,
            top: `${apt.y}px`,
            width: '200px'
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-blue-100 dark:border-blue-900/30 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {apt.name}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                  {apt.pageName}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{apt.city}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Calendar className="w-3 h-3" />
                <span>{apt.date}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

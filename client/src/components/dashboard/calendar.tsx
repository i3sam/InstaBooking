import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['/api/appointments'],
  });

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const appointmentsArray = appointments as any[];
    return appointmentsArray.filter((apt: any) => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get selected date appointments
  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Calendar
          </h2>
          <p className="text-muted-foreground mt-1">View and manage your bookings</p>
        </div>
        <Button
          onClick={goToToday}
          className="glass-prism-button text-white shadow-lg"
          data-testid="button-today"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Today
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-in-left mobile-no-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {monthYear}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  className="glass-prism hover:glass-prism-button transition-all duration-300"
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  className="glass-prism hover:glass-prism-button transition-all duration-300"
                  data-testid="button-next-month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before the first day of month */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayAppointments = getAppointmentsForDate(date);
                const hasAppointments = dayAppointments.length > 0;
                const isTodayDate = isToday(date);
                const isSelectedDate = isSelected(date);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-2 rounded-xl transition-all duration-300 relative group ${
                      isSelectedDate
                        ? 'glass-prism-button text-white shadow-lg scale-105'
                        : isTodayDate
                        ? 'glass-prism bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold'
                        : 'hover:glass-prism hover:scale-105 text-gray-700 dark:text-gray-300'
                    }`}
                    data-testid={`calendar-day-${day}`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {hasAppointments && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayAppointments.slice(0, 3).map((_: any, i: number) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-in-right mobile-no-blur">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate && selectedDateAppointments.length > 0 ? (
              <div className="space-y-3">
                {selectedDateAppointments.map((apt: any, index: number) => (
                  <div
                    key={apt.id}
                    className="glass-prism p-4 rounded-xl hover:glass-prism-button transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    data-testid={`appointment-${apt.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-white transition-colors">
                        {apt.serviceName}
                      </h4>
                      <Badge
                        variant={apt.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/80 transition-colors">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {new Date(apt.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        <span>{apt.customerName}</span>
                      </div>
                      {apt.customerEmail && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{apt.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">No appointments on this date</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">Select a date to view appointments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin, Check, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const { data: appointments = [] } = useQuery({
    queryKey: ['/api/appointments'],
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/appointments/${id}`, { status });
      if (!response.ok) throw new Error('Failed to update appointment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: 'Success',
        description: 'Appointment updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update appointment.',
        variant: 'destructive',
      });
    },
  });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handlePrevious = () => {
    if (viewMode === 'month') goToPreviousMonth();
    else if (viewMode === 'week') goToPreviousWeek();
    else goToPreviousDay();
  };

  const handleNext = () => {
    if (viewMode === 'month') goToNextMonth();
    else if (viewMode === 'week') goToNextWeek();
    else goToNextDay();
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const getAppointmentsForDate = (date: Date) => {
    const appointmentsArray = appointments as any[];
    let filtered = appointmentsArray.filter((apt: any) => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });

    if (statusFilter !== 'all') {
      filtered = filtered.filter((apt: any) => apt.status === statusFilter);
    }

    return filtered;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

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

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: startingDayOfWeek }).map((_, index) => (
        <div key={`empty-${index}`} className="aspect-square" />
      ))}
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
  );

  const renderWeekView = () => {
    const weekDaysData = getWeekDays(currentDate);
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDaysData.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const hasAppointments = dayAppointments.length > 0;
            const isTodayDate = isToday(date);
            const isSelectedDate = isSelected(date);

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-4 rounded-xl transition-all duration-300 relative group min-h-[120px] ${
                  isSelectedDate
                    ? 'glass-prism-button text-white shadow-lg scale-105'
                    : isTodayDate
                    ? 'glass-prism bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400'
                    : 'glass-prism hover:glass-prism-button hover:scale-105'
                }`}
                data-testid={`week-day-${index}`}
              >
                <div className="text-lg font-bold mb-2">{date.getDate()}</div>
                {hasAppointments && (
                  <div className="text-xs space-y-1">
                    {dayAppointments.slice(0, 2).map((apt: any, i: number) => (
                      <div key={i} className="truncate bg-blue-500/20 px-1 py-0.5 rounded">
                        {new Date(apt.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs opacity-70">+{dayAppointments.length - 2} more</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
        </div>
        {dayAppointments.length > 0 ? (
          <div className="space-y-3">
            {dayAppointments.map((apt: any, index: number) => (
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
                  <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
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
                {apt.status === 'pending' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAppointmentMutation.mutate({ id: apt.id, status: 'confirmed' })}
                      className="flex-1 glass-prism-button"
                      data-testid={`button-accept-${apt.id}`}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateAppointmentMutation.mutate({ id: apt.id, status: 'declined' })}
                      data-testid={`button-reject-${apt.id}`}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 glass-prism rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CalendarIcon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">No appointments on this day</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Calendar
          </h2>
          <p className="text-muted-foreground mt-1">View and manage your bookings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-[120px] glass-prism" data-testid="select-view-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] glass-prism" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={goToToday} className="glass-prism-button text-white shadow-lg" data-testid="button-today">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-in-left mobile-no-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {viewMode === 'day'
                  ? currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : viewMode === 'week'
                  ? `Week of ${getWeekDays(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : monthYear}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  className="glass-prism hover:glass-prism-button transition-all duration-300"
                  data-testid="button-prev"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="glass-prism hover:glass-prism-button transition-all duration-300"
                  data-testid="button-next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'month' && (
              <>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                {renderMonthView()}
              </>
            )}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </CardContent>
        </Card>

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
                      <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
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
                    {apt.status === 'pending' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentMutation.mutate({ id: apt.id, status: 'confirmed' })}
                          disabled={updateAppointmentMutation.isPending}
                          className="flex-1 glass-prism-button"
                          data-testid={`button-accept-appointment-${apt.id}`}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateAppointmentMutation.mutate({ id: apt.id, status: 'declined' })}
                          disabled={updateAppointmentMutation.isPending}
                          data-testid={`button-reject-appointment-${apt.id}`}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
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

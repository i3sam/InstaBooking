import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle2, Loader2, RefreshCw, Unplug } from 'lucide-react';
import { SiGooglecalendar } from 'react-icons/si';
import { useLocation } from 'wouter';

interface GoogleEvent {
  googleEventId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  attendees: string;
}

export default function GoogleCalendarPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);

  // Check connection status
  const { data: statusData, isLoading: isCheckingStatus } = useQuery({
    queryKey: ['/api/google/status'],
  });

  const isConnected = statusData?.connected || false;

  // Get calendar events
  const { data: eventsData, isLoading: isLoadingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ['/api/google/events'],
    enabled: isConnected,
  });

  const events: GoogleEvent[] = eventsData?.events || [];

  // Connect to Google Calendar
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/google/auth', 'GET');
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: 'Connection failed',
        description: 'Failed to connect to Google Calendar. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Disconnect from Google Calendar
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/google/disconnect', 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/google/status'] });
      toast({
        title: 'Disconnected',
        description: 'Google Calendar has been disconnected.',
      });
    },
    onError: () => {
      toast({
        title: 'Disconnect failed',
        description: 'Failed to disconnect Google Calendar. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Sync events to appointments
  const syncMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/google/sync', 'POST', {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: 'Sync complete',
        description: `${data.syncedCount || 0} events synced to your appointments.`,
      });
      refetchEvents();
    },
    onError: () => {
      toast({
        title: 'Sync failed',
        description: 'Failed to sync calendar events. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected === 'true') {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/google/status'] });
      toast({
        title: 'Connected!',
        description: 'Google Calendar connected successfully.',
      });
      
      // Clean up URL
      setLocation('/dashboard/google-calendar');
      
      // Hide success animation after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } else if (error) {
      toast({
        title: 'Connection failed',
        description: 'Failed to connect to Google Calendar. Please try again.',
        variant: 'destructive',
      });
      
      // Clean up URL
      setLocation('/dashboard/google-calendar');
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Google Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sync your Google Calendar events with BookingGen
        </p>
      </div>

      {!isConnected ? (
        <Card 
          className="glass-prism-card backdrop-blur-xl bg-white/40 dark:bg-black/40 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] max-w-2xl mx-auto"
          data-testid="card-google-connect"
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
              <SiGooglecalendar className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Connect Google Calendar
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
              Securely connect your Google Calendar to automatically sync appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 pb-8">
            <Button 
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
              className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl px-8 py-6 text-lg font-semibold"
              data-testid="button-connect-google"
            >
              {connectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <SiGooglecalendar className="mr-2 h-5 w-5" />
                  Sign in with Google Calendar
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
              We'll only access your calendar events to help you manage your appointments better.
              You can disconnect anytime.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Success Animation */}
          {showSuccess && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-in fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-full p-8 shadow-2xl animate-in zoom-in">
                <CheckCircle2 className="h-24 w-24 text-green-500 animate-pulse" />
              </div>
            </div>
          )}

          {/* Connected Status Card */}
          <Card className="glass-prism-card backdrop-blur-xl bg-white/40 dark:bg-black/40 border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Connected</CardTitle>
                    <CardDescription>Google Calendar is synced</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    variant="outline"
                    className="glass-prism-button"
                    data-testid="button-sync-events"
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">Sync Now</span>
                  </Button>
                  <Button
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    data-testid="button-disconnect-google"
                  >
                    <Unplug className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Events List */}
          <Card className="glass-prism-card backdrop-blur-xl bg-white/40 dark:bg-black/40 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                Your Google Calendar Events
              </CardTitle>
              <CardDescription>
                Recent events from your Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No events found in your Google Calendar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.googleEventId}
                      className="glass-prism-card backdrop-blur-lg bg-white/60 dark:bg-black/60 border-white/30 p-4 rounded-xl hover:shadow-lg transition-all duration-200"
                      data-testid={`event-${event.googleEventId}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100" data-testid={`event-title-${event.googleEventId}`}>
                            {event.title}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p data-testid={`event-date-${event.googleEventId}`}>
                              <span className="font-medium">Date:</span> {formatDate(event.date)}
                            </p>
                            <p data-testid={`event-time-${event.googleEventId}`}>
                              <span className="font-medium">Time:</span> {event.startTime} - {event.endTime}
                            </p>
                            {event.location && (
                              <p data-testid={`event-location-${event.googleEventId}`}>
                                <span className="font-medium">Location:</span> {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

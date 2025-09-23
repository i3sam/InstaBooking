import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Mail, Filter, Download, Wifi, WifiOff } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeAppointments } from '@/hooks/useRealtimeSubscription';
import { getUserAppointments } from '@/lib/supabase-queries';

export default function AppointmentsList() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use direct Supabase client for user's appointments data
  const { data: appointments = [], isLoading } = useQuery<any[]>({
    queryKey: [`user-appointments-${user?.id}`],
    queryFn: getUserAppointments,
    enabled: !!user?.id,
  });

  // Enable real-time subscriptions for live appointment updates
  const { isConnected: isRealtimeConnected } = useRealtimeAppointments(user?.id);

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/appointments/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`user-appointments-${user?.id}`] });
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    updateAppointmentMutation.mutate({ id, status });
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Appointments</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your upcoming and past appointments</p>
        </div>
        <div className="flex space-x-3">
          {/* Real-time connection indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-black/10 border border-white/20">
            {isRealtimeConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Offline</span>
              </>
            )}
          </div>
          <Button variant="outline" className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300" data-testid="button-filter">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="text-6xl text-gray-400 mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No appointments yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Once people start booking appointments through your pages, they'll appear here.
            </p>
            <Button 
              variant="default"
              className="glass-prism-button text-white shadow-lg backdrop-blur-lg" 
              data-testid="button-create-page-from-appointments"
            >
              Create Your First Booking Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Service</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Date & Time</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((appointment: any) => (
                  <tr key={appointment.id}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {appointment.customerName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground" data-testid={`customer-name-${appointment.id}`}>
                            {appointment.customerName}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`customer-email-${appointment.id}`}>
                            {appointment.customerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-foreground" data-testid={`service-name-${appointment.id}`}>
                        {appointment.serviceName || 'Service'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-foreground">{appointment.date}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge 
                        variant={appointment.status === 'pending' ? 'secondary' : 'default'}
                        className={
                          appointment.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          appointment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }
                        data-testid={`status-${appointment.id}`}
                      >
                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-green-600 hover:text-green-700 p-1"
                              data-testid={`button-accept-${appointment.id}`}
                              onClick={() => handleStatusUpdate(appointment.id, 'accepted')}
                              disabled={updateAppointmentMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-600 hover:text-red-700 p-1"
                              data-testid={`button-decline-${appointment.id}`}
                              onClick={() => handleStatusUpdate(appointment.id, 'declined')}
                              disabled={updateAppointmentMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-blue-600 hover:text-blue-700 p-1"
                          data-testid={`button-reschedule-${appointment.id}`}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        {appointment.customerEmail && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-600 hover:text-gray-700 p-1"
                            data-testid={`button-email-${appointment.id}`}
                            onClick={() => handleEmail(appointment.customerEmail)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

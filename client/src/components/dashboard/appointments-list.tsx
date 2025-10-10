import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Mail, Filter, Download, Wifi, WifiOff, ChevronDown, ChevronUp, Eye, DollarSign, Phone, FileText, ExternalLink, User } from 'lucide-react';
import { SiGooglecalendar } from 'react-icons/si';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeAppointments } from '@/hooks/useRealtimeSubscription';
import { getUserAppointments } from '@/lib/supabase-queries';
import RescheduleModal from './reschedule-modal';
import { useCurrency } from '@/hooks/use-currency';

export default function AppointmentsList() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<{
    open: boolean;
    appointment: any | null;
  }>({ open: false, appointment: null });
  
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

  const handleReschedule = (appointment: any) => {
    setRescheduleModal({ open: true, appointment });
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({ open: false, appointment: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Appointments</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your upcoming and past appointments</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Real-time connection indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20">
            {isRealtimeConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Offline</span>
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
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl animate-scale-in">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No appointments yet</h3>
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
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl mobile-no-blur animate-scale-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="glass-prism backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Service</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {appointments.map((appointment: any, index: number) => {
                  const isExpanded = expandedAppointment === appointment.id;
                  return (
                    <>
                      <tr key={appointment.id} className="hover:bg-white/5 dark:hover:bg-black/5 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-300/30 dark:border-blue-600/30">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {appointment.customerName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-100" data-testid={`customer-name-${appointment.id}`}>
                                {appointment.customerName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`customer-email-${appointment.id}`}>
                                {appointment.customerEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800 dark:text-gray-200" data-testid={`service-name-${appointment.id}`}>
                              {appointment.serviceName || 'Service'}
                            </span>
                            {appointment.syncedFromGoogle && (
                              <Badge 
                                variant="outline" 
                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs flex items-center gap-1"
                                data-testid={`synced-badge-${appointment.id}`}
                              >
                                <SiGooglecalendar className="h-3 w-3" />
                                Synced
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{appointment.date}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.time}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant={appointment.status === 'pending' ? 'secondary' : 'default'}
                            className={
                              appointment.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700' :
                              appointment.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700' :
                              appointment.status === 'declined' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                            }
                            data-testid={`status-${appointment.id}`}
                          >
                            {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 p-2 rounded-lg transition-all"
                              data-testid={`button-view-details-${appointment.id}`}
                              onClick={() => setExpandedAppointment(isExpanded ? null : appointment.id)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            {appointment.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 p-2 rounded-lg transition-all"
                                  data-testid={`button-accept-${appointment.id}`}
                                  onClick={() => handleStatusUpdate(appointment.id, 'accepted')}
                                  disabled={updateAppointmentMutation.isPending}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-lg transition-all"
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
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-2 rounded-lg transition-all"
                              data-testid={`button-reschedule-${appointment.id}`}
                              onClick={() => handleReschedule(appointment)}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            {appointment.customerEmail && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/30 p-2 rounded-lg transition-all"
                                data-testid={`button-email-${appointment.id}`}
                                onClick={() => handleEmail(appointment.customerEmail)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${appointment.id}-details`} className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
                          <td colSpan={5} className="px-6 py-6">
                            <div className="glass-prism-card backdrop-blur-lg bg-white/40 dark:bg-black/40 border border-white/30 rounded-xl p-6">
                              <h4 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                                Appointment Details
                              </h4>
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Customer Information */}
                                <div className="space-y-3">
                                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Customer Information
                                  </h5>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{appointment.customerName}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{appointment.customerEmail}</p>
                                    </div>
                                    {appointment.customerPhone && (
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {appointment.customerPhone}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Service & Booking Details */}
                                <div className="space-y-3">
                                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Service Details
                                  </h5>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Service</p>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{appointment.serviceName || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{appointment.date} at {appointment.time}</p>
                                    </div>
                                    {appointment.price && (
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1">
                                          <DollarSign className="h-3 w-3" />
                                          {formatPrice(appointment.price)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Booking Page & Notes */}
                                <div className="space-y-3">
                                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Additional Information
                                  </h5>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Booking Page</p>
                                      <a 
                                        href={`/${appointment.pages?.slug}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                      >
                                        {appointment.pages?.title || 'View Page'}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                    {appointment.notes && (
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Customer Notes</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/30 p-2 rounded-lg border border-white/30">
                                          {appointment.notes}
                                        </p>
                                      </div>
                                    )}
                                    {appointment.syncedFromGoogle && (
                                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                        <SiGooglecalendar className="h-4 w-4" />
                                        <span>Synced from Google Calendar</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      <RescheduleModal
        open={rescheduleModal.open}
        onClose={closeRescheduleModal}
        appointment={rescheduleModal.appointment}
      />
    </div>
  );
}

import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Mail, Filter, Download } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function AppointmentsList() {
  const { toast } = useToast();
  const { data: appointments = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/appointments'],
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/appointments/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Appointments</h2>
          <p className="text-muted-foreground">Manage your upcoming and past appointments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" data-testid="button-filter">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl text-muted-foreground mb-4">📅</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No appointments yet</h3>
            <p className="text-muted-foreground mb-6">
              Once people start booking appointments through your pages, they'll appear here.
            </p>
            <Button className="button-gradient" data-testid="button-create-page-from-appointments">
              Create Your First Booking Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Service</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
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

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MessageSquare, Send } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  appointment: any;
}

export default function RescheduleModal({ open, onClose, appointment }: RescheduleModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    note: ''
  });

  const rescheduleAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/appointments/${appointment.id}/reschedule`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Rescheduled",
        description: "The customer has been notified of the new date and time.",
      });
      queryClient.invalidateQueries({ queryKey: [`user-appointments-${user?.id}`] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error rescheduling appointment",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      note: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      toast({
        title: "Missing required fields",
        description: "Please provide both date and time for the reschedule.",
        variant: "destructive",
      });
      return;
    }

    rescheduleAppointmentMutation.mutate({
      newDate: formData.date,
      newTime: formData.time,
      note: formData.note,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      originalDate: appointment.date,
      originalTime: appointment.time,
      serviceName: appointment.serviceName
    });
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 border-0 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl shadow-2xl">
        <div className="p-8">
          <DialogHeader className="text-center space-y-4 mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Reschedule Appointment
            </DialogTitle>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Send new date and time to {appointment.customerName}
            </p>
          </DialogHeader>

          {/* Current Appointment Info */}
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500/20 to-gray-600/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Current Appointment</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{appointment.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{appointment.serviceName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Date</p>
                  <p className="font-medium">{appointment.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Time</p>
                  <p className="font-medium">{appointment.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* New Date & Time Section */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">New Date & Time</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newDate" className="text-sm font-medium text-foreground flex items-center space-x-2">
                      <span>New Date</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="newDate"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200"
                      data-testid="input-reschedule-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newTime" className="text-sm font-medium text-foreground flex items-center space-x-2">
                      <span>New Time</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="newTime"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      required
                      className="h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200"
                      data-testid="input-reschedule-time"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Note Section */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Additional Note</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rescheduleNote" className="text-sm font-medium text-foreground">
                    Message to Customer (Optional)
                  </Label>
                  <Textarea
                    id="rescheduleNote"
                    placeholder="Add any additional information for the customer about this reschedule..."
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    rows={4}
                    className="border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200 resize-none"
                    data-testid="textarea-reschedule-note"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-8 py-3 glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20"
                data-testid="button-cancel-reschedule"
                disabled={rescheduleAppointmentMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="px-8 py-3 glass-prism-button text-white shadow-lg backdrop-blur-lg"
                data-testid="button-send-reschedule"
                disabled={rescheduleAppointmentMutation.isPending}
              >
                {rescheduleAppointmentMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Send Reschedule</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Info } from 'lucide-react';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  page: any;
  services: any[];
}

export default function BookingModal({ open, onClose, page, services }: BookingModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/appointments', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking request submitted!",
        description: "You will receive a confirmation email shortly.",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting booking",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      serviceId: '',
      date: '',
      time: '',
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.serviceId || !formData.date || !formData.time) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate({
      pageId: page.id,
      ownerId: page.ownerId,
      serviceId: formData.serviceId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      date: formData.date,
      time: formData.time,
      notes: formData.notes
    });
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                placeholder="Enter your full name"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
                data-testid="input-customer-name"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="(123) 456-7890"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                required
                data-testid="input-customer-phone"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="customerEmail">Email (Optional)</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="your@email.com"
              value={formData.customerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              data-testid="input-customer-email"
            />
          </div>
          
          <div>
            <Label htmlFor="service">Service *</Label>
            <Select value={formData.serviceId} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}>
              <SelectTrigger data-testid="select-service">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.durationMinutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date">Preferred Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
                data-testid="input-date"
              />
            </div>
            <div>
              <Label htmlFor="time">Preferred Time *</Label>
              <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                <SelectTrigger data-testid="select-time">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Tell us about your goals, any health concerns, or special requests..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="resize-none"
              data-testid="textarea-notes"
            />
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>You will receive a confirmation email after submitting your booking request.</span>
            </div>
          </div>
          
          <div className="flex space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 button-gradient"
              disabled={createAppointmentMutation.isPending}
              data-testid="button-submit-booking"
            >
              {createAppointmentMutation.isPending ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

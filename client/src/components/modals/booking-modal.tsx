import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Info, Calendar, Clock, User, Mail, Phone, FileText, Sparkles, Check } from 'lucide-react';

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
    
    if (!formData.customerName || !formData.customerPhone || !formData.customerEmail || !formData.serviceId || !formData.date || !formData.time) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields including email.",
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
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0 border-0 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl shadow-2xl">
        <div className="p-8">
          <DialogHeader className="text-center space-y-4 mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Book Your Appointment
            </DialogTitle>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Choose your preferred time and let us create something amazing together
            </p>
          </DialogHeader>
        
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm font-medium text-foreground flex items-center space-x-2">
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Enter your full name"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      required
                      className="h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-sm font-medium text-foreground flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="(123) 456-7890"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      required
                      className="h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200"
                      data-testid="input-customer-phone"
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Label htmlFor="customerEmail" className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    required
                    className="h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200"
                    data-testid="input-customer-email"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Service Selection Section */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Select Your Service</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service" className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <span>Choose a Service</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.serviceId} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}>
                    <SelectTrigger className="h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200" data-testid="select-service">
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 backdrop-blur-md border-0 shadow-xl">
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id} className="focus:bg-primary/10 cursor-pointer">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{service.name}</span>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span className="font-semibold text-primary">${service.price}</span>
                              <span>•</span>
                              <span>{service.durationMinutes} min</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Appointment Timing Section */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Schedule Your Appointment</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-foreground flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Preferred Date</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200"
                      data-testid="input-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium text-foreground flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Preferred Time</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                      <SelectTrigger className="h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200" data-testid="select-time">
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent className="bg-card/95 backdrop-blur-md border-0 shadow-xl">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time} className="focus:bg-primary/10 cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{time}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Additional Information Section */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Additional Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Special Requests or Notes</span>
                    <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    placeholder="Tell us about your goals, any health concerns, or special requests..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="resize-none border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200"
                    data-testid="textarea-notes"
                  />
                </div>
                
                <div className="mt-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-blue-200/20">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">What happens next?</p>
                      <p className="text-blue-700 dark:text-blue-200">You'll receive a confirmation email within 30 minutes, and we'll contact you to confirm your appointment details.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-8">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-14 border-2 hover:bg-muted/50 transition-all duration-200 text-base font-medium"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={createAppointmentMutation.isPending}
                data-testid="button-submit-booking"
              >
                {createAppointmentMutation.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Book My Appointment</span>
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

import { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, CheckCircle, AlertCircle, User, Briefcase, MapPin } from 'lucide-react';

export default function PublicReschedulePage() {
  const [, params] = useRoute('/reschedule/:appointmentId');
  const appointmentId = params?.appointmentId;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    note: ''
  });
  
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: appointment, isLoading, error } = useQuery<{
    id: string;
    customerName: string;
    customerEmail: string;
    date: string;
    time: string;
    status: string;
    serviceName: string;
    businessName: string;
    contactEmail?: string;
    contactPhone?: string;
  }>({
    queryKey: [`/api/public/appointments/${appointmentId}`],
    enabled: !!appointmentId,
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/public/appointments/${appointmentId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reschedule');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Appointment Rescheduled!",
        description: "You'll receive a confirmation email shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule appointment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please select both a date and time",
        variant: "destructive",
      });
      return;
    }

    rescheduleMutation.mutate({
      newDate: formData.date,
      newTime: formData.time,
      note: formData.note,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-6"></div>
          <p className="text-lg font-medium text-white">Loading your appointment...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-red-400/30">
                <AlertCircle className="h-10 w-10 text-red-200" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Appointment Not Found</h1>
              <p className="text-blue-100 leading-relaxed">
                This appointment link may be invalid or expired. Please contact the business if you need assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="max-w-lg w-full relative z-10">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-green-400/30">
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Successfully Rescheduled!</h1>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Your appointment has been rescheduled. Both you and the business will receive confirmation emails shortly.
              </p>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="font-semibold text-lg text-white mb-4 flex items-center justify-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  New Appointment Details
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date:
                    </span>
                    <span className="font-semibold text-white">{formData.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Time:
                    </span>
                    <span className="font-semibold text-white">{formData.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Branding Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-blue-100">
              Powered by <span className="font-semibold text-white">BookingGen</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl mb-6 border border-white/30">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Reschedule Your Appointment</h1>
          <p className="text-lg text-blue-100">Choose a new date and time that works best for you</p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Current Appointment Section - Glass Card */}
          <div className="bg-gradient-to-br from-blue-600/80 via-indigo-600/80 to-purple-600/80 backdrop-blur-xl p-8 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Current Appointment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/25 transition-all duration-300 shadow-lg">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-white mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-100 uppercase tracking-wide mb-1">Business</p>
                    <p className="text-white font-semibold">{appointment.businessName || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/25 transition-all duration-300 shadow-lg">
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-white mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-100 uppercase tracking-wide mb-1">Service</p>
                    <p className="text-white font-semibold">{appointment.serviceName}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/25 transition-all duration-300 shadow-lg">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-white mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-100 uppercase tracking-wide mb-1">Current Date</p>
                    <p className="text-white font-semibold">{appointment.date}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/25 transition-all duration-300 shadow-lg">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-white mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-100 uppercase tracking-wide mb-1">Current Time</p>
                    <p className="text-white font-semibold">{appointment.time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reschedule Form - Glass Panel */}
          <div className="p-8 bg-white/5 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Select New Date & Time</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-white font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    New Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-12 bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-blue-200 focus:border-white/50 focus:ring-white/50 focus:bg-white/30 transition-all"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    data-testid="input-reschedule-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-white font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    New Time *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="h-12 bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-blue-200 focus:border-white/50 focus:ring-white/50 focus:bg-white/30 transition-all"
                    required
                    data-testid="input-reschedule-time"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-white font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Any special requests, reasons for rescheduling, or notes for the business..."
                  className="min-h-[120px] bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-blue-200 focus:border-white/50 focus:ring-white/50 focus:bg-white/30 transition-all"
                  data-testid="input-reschedule-note"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/30 hover:border-white/50"
                disabled={rescheduleMutation.isPending}
                data-testid="button-submit-reschedule"
              >
                {rescheduleMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-white/30 border-t-white mr-3"></div>
                    Rescheduling...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Confirm Reschedule
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="text-center mt-8">
          <p className="text-sm text-blue-100">
            Powered by <span className="font-semibold text-white">BookingGen</span> - Effortless Appointment Management
          </p>
        </div>
      </div>
    </div>
  );
}

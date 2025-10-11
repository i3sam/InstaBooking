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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading your appointment...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-blue-200/50 dark:border-blue-800/50">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Appointment Not Found</h1>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-blue-200/50 dark:border-blue-800/50">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Successfully Rescheduled!</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Your appointment has been rescheduled. Both you and the business will receive confirmation emails shortly.
              </p>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-2xl p-6 border border-blue-300/50 dark:border-blue-700/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center justify-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  New Appointment Details
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formData.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Time:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formData.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Branding Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">BookingGen</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-xl mb-6">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Reschedule Your Appointment</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Choose a new date and time that works best for you</p>
        </div>

        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200/50 dark:border-blue-800/50 overflow-hidden">
          {/* Current Appointment Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Current Appointment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-200 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">Business</p>
                    <p className="text-white font-semibold">{appointment.businessName || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-blue-200 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">Service</p>
                    <p className="text-white font-semibold">{appointment.serviceName}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-blue-200 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">Current Date</p>
                    <p className="text-white font-semibold">{appointment.date}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-200 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">Current Time</p>
                    <p className="text-white font-semibold">{appointment.time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reschedule Form */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Select New Date & Time</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-900 dark:text-white font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    New Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    data-testid="input-reschedule-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-gray-900 dark:text-white font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    New Time *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    required
                    data-testid="input-reschedule-time"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-gray-900 dark:text-white font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Any special requests, reasons for rescheduling, or notes for the business..."
                  className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-reschedule-note"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">BookingGen</span> - Effortless Appointment Management
          </p>
        </div>
      </div>
    </div>
  );
}

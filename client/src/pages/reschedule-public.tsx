import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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

  // Fetch appointment details (public route, no auth needed)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading appointment...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appointment Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300">
              This appointment link may be invalid or expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Successfully Rescheduled!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your appointment has been rescheduled. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">New Appointment Details</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>Date:</strong> {formData.date}</p>
                <p><strong>Time:</strong> {formData.time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
          <Calendar className="h-12 w-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Reschedule Appointment</h1>
          <p className="text-blue-100">Choose a new date and time for your appointment</p>
        </div>

        <div className="p-8">
          {/* Current Appointment Info */}
          <div className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Current Appointment</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Business:</span>
                <span className="font-medium text-gray-900 dark:text-white">{appointment.businessName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Service:</span>
                <span className="font-medium text-gray-900 dark:text-white">{appointment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Customer:</span>
                <span className="font-medium text-gray-900 dark:text-white">{appointment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Current Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">{appointment.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Current Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">{appointment.time}</span>
              </div>
            </div>
          </div>

          {/* Reschedule Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-900 dark:text-white">New Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  data-testid="input-reschedule-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-gray-900 dark:text-white">New Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600"
                  required
                  data-testid="input-reschedule-time"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-gray-900 dark:text-white">Note (Optional)</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Any special requests or notes..."
                className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 min-h-[100px]"
                data-testid="input-reschedule-note"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
              disabled={rescheduleMutation.isPending}
              data-testid="button-submit-reschedule"
            >
              {rescheduleMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Rescheduling...
                </div>
              ) : (
                <>
                  <Calendar className="h-5 w-5 mr-2" />
                  Confirm Reschedule
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

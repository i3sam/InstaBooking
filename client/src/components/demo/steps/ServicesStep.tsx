import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Clock, DollarSign } from 'lucide-react';

interface Service {
  name: string;
  duration: number;
  price: number;
}

interface DemoData {
  services: Service[];
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

interface ServicesStepProps {
  data: DemoData;
  updateData: (updates: Partial<DemoData>) => void;
}

const timeOptions = [
  'Closed',
  '8:00-17:00',
  '9:00-17:00',
  '9:00-18:00',
  '10:00-18:00',
  '10:00-19:00',
  '11:00-20:00',
  '12:00-21:00',
  'Custom'
];

const durationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' }
];

export default function ServicesStep({ data, updateData }: ServicesStepProps) {
  const addService = () => {
    const newServices = [...data.services, { name: '', duration: 60, price: 0 }];
    updateData({ services: newServices });
  };

  const removeService = (index: number) => {
    const newServices = data.services.filter((_, i) => i !== index);
    updateData({ services: newServices });
  };

  const updateService = (index: number, updates: Partial<Service>) => {
    const newServices = [...data.services];
    newServices[index] = { ...newServices[index], ...updates };
    updateData({ services: newServices });
  };

  const updateBusinessHours = (day: string, hours: string) => {
    updateData({
      businessHours: {
        ...data.businessHours,
        [day]: hours
      }
    });
  };

  const setQuickSchedule = (schedule: 'business' | 'extended' | 'weekend') => {
    let newHours = { ...data.businessHours };
    
    switch (schedule) {
      case 'business':
        newHours = {
          monday: '9:00-17:00',
          tuesday: '9:00-17:00',
          wednesday: '9:00-17:00',
          thursday: '9:00-17:00',
          friday: '9:00-17:00',
          saturday: 'Closed',
          sunday: 'Closed'
        };
        break;
      case 'extended':
        newHours = {
          monday: '9:00-18:00',
          tuesday: '9:00-18:00',
          wednesday: '9:00-18:00',
          thursday: '9:00-18:00',
          friday: '9:00-18:00',
          saturday: '10:00-16:00',
          sunday: 'Closed'
        };
        break;
      case 'weekend':
        newHours = {
          monday: '9:00-17:00',
          tuesday: '9:00-17:00',
          wednesday: '9:00-17:00',
          thursday: '9:00-17:00',
          friday: '9:00-17:00',
          saturday: '10:00-16:00',
          sunday: '12:00-17:00'
        };
        break;
    }
    
    updateData({ businessHours: newHours });
  };

  return (
    <div className="space-y-6">
      {/* Services */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              💼 Services
            </CardTitle>
            <Badge variant="secondary" data-testid="badge-service-count">
              {data.services.length} Services
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.services.map((service, index) => (
            <div 
              key={index} 
              className="p-4 border rounded-lg space-y-4"
              data-testid={`service-item-${index}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Service {index + 1}
                </h4>
                {data.services.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(index)}
                    data-testid={`button-remove-service-${index}`}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Service Name */}
                <div className="space-y-2">
                  <Label data-testid={`label-service-name-${index}`}>
                    Service Name *
                  </Label>
                  <Input
                    value={service.name}
                    onChange={(e) => updateService(index, { name: e.target.value })}
                    placeholder="e.g., Haircut"
                    data-testid={`input-service-name-${index}`}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label data-testid={`label-service-duration-${index}`}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration
                  </Label>
                  <Select
                    value={service.duration.toString()}
                    onValueChange={(value) => updateService(index, { duration: parseInt(value) })}
                  >
                    <SelectTrigger data-testid={`select-service-duration-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value.toString()}
                          data-testid={`option-duration-${option.value}`}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label data-testid={`label-service-price-${index}`}>
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Price
                  </Label>
                  <Input
                    type="number"
                    value={service.price}
                    onChange={(e) => updateService(index, { price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    data-testid={`input-service-price-${index}`}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addService}
            className="w-full"
            data-testid="button-add-service"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📅 Business Hours
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Set your availability for appointments
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Schedule Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('business')}
              data-testid="button-quick-business"
            >
              Business Hours (Mon-Fri 9-5)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('extended')}
              data-testid="button-quick-extended"
            >
              Extended (Mon-Sat)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('weekend')}
              data-testid="button-quick-weekend"
            >
              Include Weekends
            </Button>
          </div>

          {/* Individual Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.businessHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-3">
                <Label 
                  className="w-20 text-sm capitalize"
                  data-testid={`label-hours-${day}`}
                >
                  {day}
                </Label>
                <Select
                  value={hours}
                  onValueChange={(value) => updateBusinessHours(day, value)}
                >
                  <SelectTrigger 
                    className="flex-1"
                    data-testid={`select-hours-${day}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem 
                        key={option} 
                        value={option}
                        data-testid={`option-hours-${option.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
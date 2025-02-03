import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DELIVERY_OPTIONS } from "@/lib/types";
import { addDays } from "date-fns";

interface DeliverySchedulerProps {
  onScheduleChange: (values: {
    deliveryOption: 'delivery' | 'pickup';
    deliveryAddress?: string;
    deliveryDate: Date;
    pickupDate: Date;
  }) => void;
  className?: string;
}

export default function DeliveryScheduler({ onScheduleChange, className }: DeliverySchedulerProps) {
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [pickupDate, setPickupDate] = useState<Date>();

  const handleOptionChange = (value: 'delivery' | 'pickup') => {
    setDeliveryOption(value);
    if (deliveryDate && pickupDate) {
      onScheduleChange({
        deliveryOption: value,
        deliveryAddress: value === 'delivery' ? deliveryAddress : undefined,
        deliveryDate,
        pickupDate,
      });
    }
  };

  const handleDateChange = (type: 'delivery' | 'pickup', date: Date | undefined) => {
    if (type === 'delivery') {
      setDeliveryDate(date);
      if (date && !pickupDate) {
        setPickupDate(addDays(date, 1));
      }
    } else {
      setPickupDate(date);
    }

    if (date && (type === 'delivery' ? pickupDate : deliveryDate)) {
      onScheduleChange({
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : undefined,
        deliveryDate: type === 'delivery' ? date : deliveryDate!,
        pickupDate: type === 'pickup' ? date : pickupDate!,
      });
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Delivery Options</h3>
        
        <RadioGroup
          value={deliveryOption}
          onValueChange={handleOptionChange}
          className="mb-4"
        >
          {DELIVERY_OPTIONS.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>

        {deliveryOption === 'delivery' && (
          <div className="mb-4">
            <Label htmlFor="address">Delivery Address</Label>
            <Input
              id="address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter delivery address"
              className="mt-1"
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Delivery Date</Label>
            <Calendar
              mode="single"
              selected={deliveryDate}
              onSelect={(date) => handleDateChange('delivery', date)}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
              className="rounded-md border mt-1"
            />
          </div>

          <div>
            <Label>Pickup Date</Label>
            <Calendar
              mode="single"
              selected={pickupDate}
              onSelect={(date) => handleDateChange('pickup', date)}
              disabled={(date) => 
                !deliveryDate || 
                date <= deliveryDate || 
                date > addDays(deliveryDate, 30)
              }
              className="rounded-md border mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

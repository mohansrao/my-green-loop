import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";

interface CalendarPickerProps {
  className?: string;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export default function CalendarPicker({ className, onDateRangeChange }: CalendarPickerProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [inventory, setInventory] = useState<number | null>(null);

  // Check inventory when date range changes
  useEffect(() => {
    if (date?.from && date?.to) {
      checkInventory(date.from, date.to);
    }
  }, [date?.from, date?.to]);

  const checkInventory = async (start: Date, end: Date) => {
    try {
      const response = await fetch(
        `/api/inventory/available?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      const data = await response.json();
      setInventory(data.availableStock);
    } catch (error) {
      console.error('Error checking inventory:', error);
      setInventory(null);
    }
  };

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="font-medium mb-4">Select Rental Dates</h3>
        <Calendar
          mode="range"
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
          className="rounded-md border"
          footer={
            inventory !== null && (
              <p className="text-sm text-center mt-4">
                <Badge variant="outline" className="font-normal">
                  {inventory} items available
                </Badge>
              </p>
            )
          }
        />
      </div>
    </Card>
  );
}
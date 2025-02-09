
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface CalendarPickerProps {
  className?: string;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export default function CalendarPicker({ className, onDateRangeChange }: CalendarPickerProps) {
  const [date, setDate] = useState<DateRange | undefined>();

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="font-medium mb-4">Select Pick up and Return Dates</h3>
        <div className="max-w-full overflow-x-auto">
          <div className="inline-block min-w-full">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
              className="rounded-md border"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

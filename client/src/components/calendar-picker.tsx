
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { addDays, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CalendarPickerProps {
  className?: string;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export default function CalendarPicker({ className, onDateRangeChange }: CalendarPickerProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const days = differenceInDays(range.to, range.from);
      if (days > 5) {
        setError("Rental period cannot exceed 5 days");
        return;
      }
      setError(null);
    }
    
    setDate(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="font-medium mb-2">Select Pick up and Return Dates</h3>
        <p className="text-sm text-muted-foreground mb-4">Maximum rental period is 5 days</p>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="max-w-full overflow-x-auto">
          <div className="inline-block min-w-full">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
              modifiers={{
                range: (date) => {
                  if (!date || !date.from) return false;
                  return date >= date.from && date <= addDays(date.from, 5);
                }
              }}
              className="rounded-md border"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

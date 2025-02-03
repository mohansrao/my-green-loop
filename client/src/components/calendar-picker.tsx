import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { addDays } from "date-fns";

interface CalendarPickerProps {
  className?: string;
}

export default function CalendarPicker({ className }: CalendarPickerProps) {
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="font-medium mb-4">Select Rental Dates</h3>
        <Calendar
          mode="range"
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
          disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
          className="rounded-md border"
        />
      </div>
    </Card>
  );
}

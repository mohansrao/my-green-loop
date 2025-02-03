import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface CalendarPickerProps {
  className?: string;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export default function CalendarPicker({ className, onDateRangeChange }: CalendarPickerProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [inventoryByDate, setInventoryByDate] = useState<Record<string, number>>({});

  // Load inventory data for visible month
  const loadInventoryData = async (month: Date) => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = addDays(new Date(month.getFullYear(), month.getMonth() + 1, 0), 1);

    try {
      const response = await fetch(`/api/inventory/available?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
      const data = await response.json();
      
      for (let current = start; current <= end; current = addDays(current, 1)) {
        setInventoryByDate(prev => ({
          ...prev,
          [current.toISOString().split('T')[0]]: data.availableStock
        }));
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleMonthChange = (month: Date) => {
    loadInventoryData(month);
  };

  useEffect(() => {
    // Load initial month's data
    loadInventoryData(new Date());
  }, []);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  const modifiers = {
    disabled: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const stock = inventoryByDate[dateStr];
      return date < new Date() || date > addDays(new Date(), 90) || stock === 0;
    }
  };

  const modifiersStyles = {
    disabled: { color: '#ccc' }
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
          disabled={modifiers.disabled}
          modifiersStyles={modifiersStyles}
          onMonthChange={handleMonthChange}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => {
              const dateStr = date.toISOString().split('T')[0];
              const stock = inventoryByDate[dateStr] ?? 100; // Default to 100 if no data
              return (
                <div className="flex flex-col items-center">
                  <div>{date.getDate()}</div>
                  <div className="text-xs mt-1 text-gray-600">
                    {stock}
                  </div>
                </div>
              );
            },
          }}
        />
      </div>
    </Card>
  );
}
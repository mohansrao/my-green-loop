import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { differenceInDays, getDaysInMonth, addDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductAvailability extends Product {
  availableStock: number;
}

interface DateFields {
  month: string;
  day: string;
  year: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getYears() {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear + 1];
}

function getDaysForMonth(month: string, year: string): number {
  if (!month || !year) return 31;
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(m) || isNaN(y)) return 31;
  return getDaysInMonth(new Date(y, m - 1));
}

function fieldsToDate(fields: DateFields): Date | null {
  const { month, day, year } = fields;
  if (!month || !day || !year) return null;
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  if (isNaN(d.getTime())) return null;
  return d;
}

interface DateSelectorProps {
  label: string;
  value: DateFields;
  onChange: (fields: DateFields) => void;
  minDate?: Date;
  maxDate?: Date;
}

function DateSelector({ label, value, onChange, minDate, maxDate }: DateSelectorProps) {
  const allYears = getYears();

  const minYear = minDate ? minDate.getFullYear() : null;
  const maxYear = maxDate ? maxDate.getFullYear() : null;
  const minMonth = minDate ? minDate.getMonth() + 1 : null;
  const maxMonth = maxDate ? maxDate.getMonth() + 1 : null;
  const minDay = minDate ? minDate.getDate() : null;
  const maxDay = maxDate ? maxDate.getDate() : null;

  const selectedYear = value.year ? parseInt(value.year, 10) : null;
  const selectedMonth = value.month ? parseInt(value.month, 10) : null;

  const filteredYears = allYears.filter((y) => {
    if (minYear !== null && y < minYear) return false;
    if (maxYear !== null && y > maxYear) return false;
    return true;
  });

  const filteredMonths = MONTHS.map((name, idx) => ({ name, num: idx + 1 })).filter(({ num }) => {
    // When no year is selected yet, treat it as minYear so past months are never shown
    const inMinYearContext = selectedYear === null || (minYear !== null && selectedYear === minYear);
    if (inMinYearContext && minYear !== null && minMonth !== null && num < minMonth) return false;
    if (selectedYear !== null && maxYear !== null && selectedYear === maxYear && maxMonth !== null && num > maxMonth) return false;
    return true;
  });

  const daysInMonth = getDaysForMonth(value.month, value.year);
  const filteredDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((d) => {
    // Fall back to minYear/minMonth context when not explicitly selected, so past days are never shown
    const effYear = selectedYear ?? minYear;
    const effMonth = selectedMonth ?? minMonth;
    if (effYear !== null && effMonth !== null && minYear !== null && minMonth !== null && minDay !== null
      && effYear === minYear && effMonth === minMonth && d < minDay) return false;
    if (selectedYear !== null && selectedMonth !== null && maxYear !== null && maxMonth !== null && maxDay !== null
      && selectedYear === maxYear && selectedMonth === maxMonth && d > maxDay) return false;
    return true;
  });

  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        <Select
          value={value.month}
          onValueChange={(m) => {
            const yearForCalc = parseInt(value.year || String(new Date().getFullYear()), 10);
            const mon = parseInt(m, 10);
            const maxDayInMonth = getDaysInMonth(new Date(yearForCalc, mon - 1));
            let day = value.day && parseInt(value.day, 10) > maxDayInMonth ? String(maxDayInMonth) : value.day;
            if (day) {
              const dayNum = parseInt(day, 10);
              if (minDate && yearForCalc === minDate.getFullYear() && mon === minDate.getMonth() + 1 && dayNum < minDate.getDate()) {
                day = "";
              }
              if (maxDate && yearForCalc === maxDate.getFullYear() && mon === maxDate.getMonth() + 1 && dayNum > maxDate.getDate()) {
                day = "";
              }
            }
            onChange({ ...value, month: m, day });
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {filteredMonths.map(({ name, num }) => (
              <SelectItem key={name} value={String(num)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.day}
          onValueChange={(d) => onChange({ ...value, day: d })}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {filteredDays.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.year}
          onValueChange={(y) => {
            const newYear = parseInt(y, 10);
            let m = value.month;
            let d = value.day;
            if (m) {
              const mon = parseInt(m, 10);
              if (minDate && newYear === minDate.getFullYear() && mon < minDate.getMonth() + 1) {
                m = "";
                d = "";
              } else if (maxDate && newYear === maxDate.getFullYear() && mon > maxDate.getMonth() + 1) {
                m = "";
                d = "";
              } else if (d) {
                const dayNum = parseInt(d, 10);
                if (minDate && newYear === minDate.getFullYear() && mon === minDate.getMonth() + 1 && dayNum < minDate.getDate()) {
                  d = "";
                }
                if (maxDate && newYear === maxDate.getFullYear() && mon === maxDate.getMonth() + 1 && dayNum > maxDate.getDate()) {
                  d = "";
                }
                const daysInM = getDaysInMonth(new Date(newYear, mon - 1));
                if (d && parseInt(d, 10) > daysInM) d = String(daysInM);
              }
            }
            onChange({ month: m, day: d, year: y });
          }}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {filteredYears.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

const EMPTY_DATE: DateFields = { month: "", day: "", year: "" };

function dateToFields(date: Date): DateFields {
  return {
    month: String(date.getMonth() + 1),
    day: String(date.getDate()),
    year: String(date.getFullYear()),
  };
}

function loadSessionDates(): { startFields: DateFields; endFields: DateFields; confirmedRange: { from: Date; to: Date } | null } {
  try {
    const raw = sessionStorage.getItem("rentalDates");
    if (!raw) return { startFields: EMPTY_DATE, endFields: EMPTY_DATE, confirmedRange: null };
    const parsed = JSON.parse(raw);
    const from = new Date(parsed.startDate);
    const to = new Date(parsed.endDate);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return { startFields: EMPTY_DATE, endFields: EMPTY_DATE, confirmedRange: null };
    }
    return {
      startFields: dateToFields(from),
      endFields: dateToFields(to),
      confirmedRange: { from, to },
    };
  } catch {
    return { startFields: EMPTY_DATE, endFields: EMPTY_DATE, confirmedRange: null };
  }
}

function loadSessionCart(): Map<number, number> {
  try {
    const raw = sessionStorage.getItem("cart");
    if (!raw) return new Map();
    const entries: [number, number][] = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

export default function Catalog() {
  const sessionDates = loadSessionDates();
  const hasRestoredDates = sessionDates.confirmedRange !== null;

  const today = (() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; })();

  const [showInventoryCheck, setShowInventoryCheck] = useState(hasRestoredDates);
  const [startFields, setStartFields] = useState<DateFields>(sessionDates.startFields);
  const [endFields, setEndFields] = useState<DateFields>(sessionDates.endFields);
  const [dateError, setDateError] = useState<string | null>(null);
  const [confirmedRange, setConfirmedRange] = useState<{ from: Date; to: Date } | null>(sessionDates.confirmedRange);
  const [productAvailability, setProductAvailability] = useState<ProductAvailability[]>([]);
  const [cart, setCart] = useState<Map<number, number>>(loadSessionCart);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const start = fieldsToDate(startFields);
    const end = fieldsToDate(endFields);
    if (start && end && (end < start || differenceInDays(end, start) > 5)) {
      setEndFields(EMPTY_DATE);
    }
  }, [startFields, endFields]);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: availabilityData, refetch: refetchAvailability } = useQuery({
    queryKey: ["inventory-available", confirmedRange?.from, confirmedRange?.to],
    queryFn: async () => {
      if (!confirmedRange?.from || !confirmedRange?.to) return null;
      const response = await fetch(
        `/api/inventory/available?startDate=${confirmedRange.from.toISOString()}&endDate=${confirmedRange.to.toISOString()}`
      );
      return response.json();
    },
    enabled: !!confirmedRange?.from && !!confirmedRange?.to,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  useEffect(() => {
    if (availabilityData && products) {
      const availability = products.map((product) => ({
        ...product,
        availableStock: availabilityData.stockByProduct[product.id] || 0,
      }));
      setProductAvailability(availability);
    }
  }, [availabilityData, products]);

  const validateAndConfirm = () => {
    const from = fieldsToDate(startFields);
    const to = fieldsToDate(endFields);

    if (!from || !to) {
      setDateError("Please select both a start date and an end date.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (from < today) {
      setDateError("Start date cannot be in the past.");
      return;
    }

    if (to < from) {
      setDateError("End date must be on or after the start date.");
      return;
    }

    const days = differenceInDays(to, from);
    if (days > 5) {
      setDateError("Rental period cannot exceed 5 days.");
      return;
    }

    setDateError(null);
    setConfirmedRange({ from, to });
  };

  useEffect(() => {
    if (confirmedRange) {
      refetchAvailability();
    }
  }, [confirmedRange]);

  const handleAddToCart = (productId: number, quantity: number) => {
    const product = productAvailability.find((p) => p.id === productId);
    if (!product) return;

    const currentQuantity = cart.get(productId) || 0;
    const newQuantity = currentQuantity + quantity;

    if (newQuantity > product.availableStock) {
      toast({
        title: "Cannot Add to Cart",
        description: "Not enough items available in stock.",
        variant: "destructive",
      });
      return;
    }

    setCart(new Map(cart.set(productId, newQuantity)));
    toast({
      title: "Added to Cart",
      description: `Added ${quantity} item(s) to cart.`,
    });
  };

  const handleProceedToCheckout = () => {
    if (confirmedRange?.from && confirmedRange?.to && cart.size > 0) {
      sessionStorage.setItem(
        "rentalDates",
        JSON.stringify({
          startDate: confirmedRange.from,
          endDate: confirmedRange.to,
        })
      );
      sessionStorage.setItem("cart", JSON.stringify(Array.from(cart.entries())));
      navigate("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {!showInventoryCheck ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">Our Products</h2>
              <Button
                onClick={() => setShowInventoryCheck(true)}
                className="bg-green-700 hover:bg-green-800"
              >
                Check Availability & Rent
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                products?.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    availableStock={product.totalStock}
                    showInventoryOnly={false}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Choose Your Rental Dates</h2>
              <Button variant="ghost" onClick={() => window.location.href="/"}>
                ← Back to Home
              </Button>
            </div>

            <div className="grid gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                    <p className="text-sm text-gray-600">
                      Choose your pickup date (when you'll pick the items) and return
                      date (when you'll return them). Maximum rental period is 5 days.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white mb-6">
              <CardContent className="pt-6 space-y-6">
                <h3 className="font-medium">Select Pick-up and Return Dates</h3>

                {dateError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{dateError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DateSelector
                    label="Start Date (Pick-up)"
                    value={startFields}
                    onChange={(fields) => {
                      setStartFields(fields);
                      const newStart = fieldsToDate(fields);
                      const currentEnd = fieldsToDate(endFields);
                      if (newStart && currentEnd && currentEnd < newStart) {
                        setEndFields(EMPTY_DATE);
                      }
                    }}
                    minDate={today}
                  />
                  <DateSelector
                    label="End Date (Return)"
                    value={endFields}
                    onChange={setEndFields}
                    minDate={fieldsToDate(startFields) ?? undefined}
                    maxDate={fieldsToDate(startFields) ? addDays(fieldsToDate(startFields)!, 5) : undefined}
                  />
                </div>

                <Button
                  onClick={validateAndConfirm}
                  className="bg-green-700 hover:bg-green-800"
                >
                  Check Availability
                </Button>

                {confirmedRange && !dateError && (
                  <p className="text-sm text-green-700 font-medium">
                    Showing availability for{" "}
                    {confirmedRange.from.toLocaleDateString()} –{" "}
                    {confirmedRange.to.toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-6">
              {cart.size > 0 && (
                <Button onClick={handleProceedToCheckout}>
                  Proceed to Checkout (
                  {Array.from(cart.values()).reduce((a, b) => a + b, 0)} items)
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                productAvailability.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    availableStock={product.availableStock}
                    onAddToCart={(quantity) => handleAddToCart(product.id, quantity)}
                    cartQuantity={cart.get(product.id) || 0}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

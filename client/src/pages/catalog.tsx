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
import { differenceInDays, getDaysInMonth } from "date-fns";
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
}

function DateSelector({ label, value, onChange, minDate }: DateSelectorProps) {
  const years = getYears();
  const daysInMonth = getDaysForMonth(value.month, value.year);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        <Select
          value={value.month}
          onValueChange={(m) => {
            const maxDay = getDaysInMonth(new Date(parseInt(value.year || String(new Date().getFullYear()), 10), parseInt(m, 10) - 1));
            const day = value.day && parseInt(value.day, 10) > maxDay ? String(maxDay) : value.day;
            onChange({ ...value, month: m, day });
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((name, idx) => (
              <SelectItem key={name} value={String(idx + 1)}>
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
            {days.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.year}
          onValueChange={(y) => onChange({ ...value, year: y })}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
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

export default function Catalog() {
  const [showInventoryCheck, setShowInventoryCheck] = useState(false);
  const [startFields, setStartFields] = useState<DateFields>(EMPTY_DATE);
  const [endFields, setEndFields] = useState<DateFields>(EMPTY_DATE);
  const [dateError, setDateError] = useState<string | null>(null);
  const [confirmedRange, setConfirmedRange] = useState<{ from: Date; to: Date } | null>(null);
  const [productAvailability, setProductAvailability] = useState<ProductAvailability[]>([]);
  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [, navigate] = useLocation();
  const { toast } = useToast();

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
                    onChange={setStartFields}
                  />
                  <DateSelector
                    label="End Date (Return)"
                    value={endFields}
                    onChange={setEndFields}
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

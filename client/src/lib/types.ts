export interface RentalFormData {
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  quantity: number;
  startDate?: Date;
  endDate?: Date;
}

export const DELIVERY_OPTIONS = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' }
] as const;
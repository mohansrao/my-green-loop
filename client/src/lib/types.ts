export interface RentalFormData {
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  quantity: number;
  startDate?: Date;
  endDate?: Date;
  deliveryOption: 'delivery' | 'pickup';
  deliveryAddress?: string;
  deliveryDate: Date;
  pickupDate: Date;
}

export const DELIVERY_OPTIONS = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' }
] as const;
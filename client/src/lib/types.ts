export interface RentalFormData {
  customerName: string;
  customerEmail: string;
  items?: Array<{
    productId: number;
    quantity: number;
  }>;
  startDate?: Date;
  endDate?: Date;
}

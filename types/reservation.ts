export interface ReserveRequest {
  productId: string;
  warehouseId: string;
  quantity: number;
}
export interface ReserveResponse {
  success: boolean;
  reservationId?: string;
  error?: string;
}

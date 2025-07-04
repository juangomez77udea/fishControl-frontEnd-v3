import { productApiInstance } from '../api/productApi';

export interface Supply {
  id: number;
  suppliesName: string;
}

export const supplyService = {
  async getFoodSupplies(): Promise<Supply[]> {
    try {
      const response = await productApiInstance.get<Supply[]>('/proxy/supplies/food');
      return response.data;
    } catch (error) {
      console.error("Error fetching food supplies:", error);
      throw error;
    }
  }
};
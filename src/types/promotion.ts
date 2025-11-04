export interface Promotion {
  id: string;
  storeId?: string;
  storeName: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  promotionId: string;
  storeId: string;
  storeName: string;
  title: string;
  description: string;
  imageUrl?: string;
  receivedAt: string;
  read: boolean;
}

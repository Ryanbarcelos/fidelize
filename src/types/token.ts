export interface TransactionToken {
  id: string;
  cardId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  isUsed: boolean;
  actionType: 'add_points' | 'collect_reward';
}

export interface AuditLog {
  id: string;
  userId: string;
  cardId?: string;
  action: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  details: string | null;
  createdAt: string;
  actionId: number;
  actionType?: string | null;
  status: string | null;
}
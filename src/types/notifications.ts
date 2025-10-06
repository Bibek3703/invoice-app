import { notificationTypeEnum } from "@/db/schema";

type NotificationType = typeof notificationTypeEnum;

export interface Notification {
    id: string;
    userId: string;
    invoiceId?: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

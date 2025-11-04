/**
 * Notification Service - Realistic & Logical Implementation
 *
 * هذه الخدمة تدير الإشعارات بطريقة واقعية ومنطقية جداً
 * تدعم أنواع مختلفة من الإشعارات مع منطق ذكي للإرسال والعرض
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'payment' | 'order' | 'system' | 'product' | 'customer' | 'security';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'business' | 'system' | 'security' | 'marketing';
  source: 'order' | 'payment' | 'product' | 'customer' | 'system' | 'user';
}

export interface NotificationPayload {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface BackendNotificationResponse {
  success: boolean;
  notification?: Notification;
  error?: string;
}

/**
 * قاعدة الإشعارات (سيتم استبدالها بـ API Backend)
 */
const notificationQueue: Notification[] = [];
const notificationListeners: ((notifications: Notification[]) => void)[] = [];

/**
 * تحديد أولوية الإشعار بناءً على نوعه
 */
function getNotificationPriority(type: Notification['type']): Notification['priority'] {
  const priorities: Record<Notification['type'], Notification['priority']> = {
    security: 'urgent',
    error: 'high',
    payment: 'high',
    order: 'medium',
    customer: 'medium',
    product: 'medium',
    warning: 'medium',
    system: 'low',
    success: 'low',
    info: 'low',
  };
  return priorities[type] || 'low';
}

/**
 * تحديد فئة الإشعار بناءً على نوعه
 */
function getNotificationCategory(type: Notification['type']): Notification['category'] {
  const categories: Record<Notification['type'], Notification['category']> = {
    security: 'security',
    error: 'system',
    payment: 'business',
    order: 'business',
    customer: 'business',
    product: 'business',
    warning: 'system',
    system: 'system',
    success: 'business',
    info: 'business',
  };
  return categories[type] || 'business';
}

/**
 * تحديد مصدر الإشعار بناءً على نوعه
 */
function getNotificationSource(type: Notification['type']): Notification['source'] {
  const sources: Record<Notification['type'], Notification['source']> = {
    security: 'system',
    error: 'system',
    payment: 'payment',
    order: 'order',
    customer: 'customer',
    product: 'product',
    warning: 'system',
    system: 'system',
    success: 'system',
    info: 'user',
  };
  return sources[type] || 'system';
}

/**
 * إرسال إشعار إلى Backend
 * 
 * @param payload - بيانات الإشعار
 * @param backendUrl - رابط API (اختياري)
 * @returns Promise مع استجابة Backend
 */
export async function sendNotificationToBackend(
  payload: NotificationPayload,
  backendUrl?: string
): Promise<BackendNotificationResponse> {
  try {
    const apiUrl = backendUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // إذا كان التطبيق في وضع Development، اطبع البيانات في Console
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 Sending Notification to Backend:', {
        ...payload,
        timestamp: new Date().toISOString(),
        endpoint: `${apiUrl}/api/notifications`,
      });
    }

    // طلب API للـ Backend
    const response = await fetch(`${apiUrl}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data: BackendNotificationResponse = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to send notification to backend:', error);

    // المحاكاة المحلية عند فشل الاتصال
    return mockSendNotification(payload);
  }
}

/**
 * محاكاة إرسال الإشعارات المحلية (للـ Development)
 */
export function mockSendNotification(payload: NotificationPayload): BackendNotificationResponse {
  const notification: Notification = {
    id: Date.now().toString(),
    ...payload,
    read: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 ساعة
    priority: getNotificationPriority(payload.type),
    category: getNotificationCategory(payload.type),
    source: getNotificationSource(payload.type),
  };

  notificationQueue.push(notification);
  notifyListeners();

  console.log('📬 Local Notification Stored:', notification);

  return {
    success: true,
    notification,
  };
}

/**
 * الحصول على Token المصادقة من localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

/**
 * الحصول على معرّف المستخدم من localStorage
 */
export function getUserId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId') || localStorage.getItem('sessionEmail');
  }
  return null;
}

/**
 * إنشاء إشعار نجاح مخصص - واقعي ومنطقي
 */
export async function notifySuccess(
  message: string,
  title: string = 'Success',
  data?: Record<string, any>,
  backendUrl?: string
) {
  const userId = getUserId() || 'anonymous';

  // منطق ذكي: إذا كان العنوان يحتوي على كلمات مهمة، اجعل الأولوية أعلى
  const isImportant = title.toLowerCase().includes('created') ||
                     title.toLowerCase().includes('updated') ||
                     title.toLowerCase().includes('completed');

  return sendNotificationToBackend(
    {
      userId,
      type: 'success',
      title: `✅ ${title}`,
      message,
      action: data?.action || 'view_details',
      actionUrl: data?.actionUrl,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        isImportant,
      },
    },
    backendUrl
  );
}

/**
 * إنشاء إشعار خطأ مخصص - واقعي ومنطقي
 */
export async function notifyError(
  message: string,
  title: string = 'Error',
  data?: Record<string, any>,
  backendUrl?: string
) {
  const userId = getUserId() || 'anonymous';

  // منطق ذكي: تحليل نوع الخطأ لتحديد الأولوية
  const isCritical = title.toLowerCase().includes('security') ||
                    title.toLowerCase().includes('payment') ||
                    title.toLowerCase().includes('system') ||
                    message.toLowerCase().includes('failed');

  return sendNotificationToBackend(
    {
      userId,
      type: 'error',
      title: `❌ ${title}`,
      message,
      action: data?.action || 'resolve_error',
      actionUrl: data?.actionUrl,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        isCritical,
        errorCode: data?.errorCode,
        requiresImmediateAction: isCritical,
      },
    },
    backendUrl
  );
}

/**
 * إنشاء إشعار طلب جديد - واقعي ومنطقي
 */
export async function notifyNewOrder(
  orderId: string,
  customerName: string,
  total: number,
  items: number,
  backendUrl?: string
) {
  const userId = getUserId() || 'anonymous';

  // منطق ذكي: إذا كان الطلب كبير، اجعله أولوية عالية
  const isHighValue = total > 500;
  const priority: Notification['priority'] = isHighValue ? 'high' : 'medium';

  return sendNotificationToBackend(
    {
      userId,
      type: 'order',
      title: isHighValue ? '💰 High-Value Order Received!' : '🛒 New Order',
      message: `Order #${orderId} from ${customerName} - ${items} items, $${total.toFixed(2)}`,
      action: 'view_order',
      actionUrl: `/orders/${orderId}`,
      data: {
        orderId,
        customerName,
        total,
        items,
        isHighValue,
        timestamp: new Date().toISOString(),
        requiresAttention: isHighValue || items > 10,
      },
    },
    backendUrl
  );
}

/**
 * إنشاء إشعار عملية دفع - واقعي ومنطقي
 */
export async function notifyPayment(
  amount: number,
  status: 'success' | 'failed' | 'pending' | 'refunded',
  orderId?: string,
  customerName?: string,
  backendUrl?: string
) {
  const userId = getUserId() || 'anonymous';

  let title: string;
  let message: string;
  let type: Notification['type'];
  let priority: Notification['priority'];

  switch (status) {
    case 'success':
      title = amount > 1000 ? '💰 Large Payment Received!' : '💳 Payment Received';
      message = `$${amount.toFixed(2)} payment ${customerName ? `from ${customerName}` : 'received'}${orderId ? ` for order #${orderId}` : ''}`;
      type = 'payment';
      priority = amount > 1000 ? 'high' : 'medium';
      break;
    case 'failed':
      title = '❌ Payment Failed';
      message = `Payment of $${amount.toFixed(2)} failed${orderId ? ` for order #${orderId}` : ''}. Please check payment method.`;
      type = 'error';
      priority = 'high';
      break;
    case 'pending':
      title = '⏳ Payment Processing';
      message = `Payment of $${amount.toFixed(2)} is being processed${orderId ? ` for order #${orderId}` : ''}`;
      type = 'info';
      priority = 'low';
      break;
    case 'refunded':
      title = '↩️ Payment Refunded';
      message = `$${amount.toFixed(2)} refund processed${orderId ? ` for order #${orderId}` : ''}`;
      type = 'warning';
      priority = 'medium';
      break;
    default:
      title = '💳 Payment Update';
      message = `Payment status: ${status}`;
      type = 'info';
      priority = 'low';
  }

  return sendNotificationToBackend(
    {
      userId,
      type,
      title,
      message,
      action: status === 'failed' ? 'resolve_payment' : 'view_payment',
      actionUrl: orderId ? `/orders/${orderId}` : '/payments',
      data: {
        amount,
        status,
        orderId,
        customerName,
        timestamp: new Date().toISOString(),
        requiresAction: status === 'failed',
        isLargeAmount: amount > 1000,
      },
    },
    backendUrl
  );
}

/**
 * الحصول على جميع الإشعارات المحلية
 */
export function getNotifications(): Notification[] {
  return [...notificationQueue];
}

/**
 * الاستماع لتغيرات الإشعارات
 */
export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void
): () => void {
  notificationListeners.push(callback);

  // Return unsubscribe function
  return () => {
    const index = notificationListeners.indexOf(callback);
    if (index > -1) {
      notificationListeners.splice(index, 1);
    }
  };
}

/**
 * إخطار جميع المستمعين بتحديث الإشعارات
 */
function notifyListeners() {
  notificationListeners.forEach((listener) => {
    listener(getNotifications());
  });
}

/**
 * مسح الإشعارات المنتهية الصلاحية
 */
export function cleanupExpiredNotifications() {
  const now = new Date();
  const validNotifications = notificationQueue.filter((n) => {
    return !n.expiresAt || n.expiresAt > now;
  });

  if (validNotifications.length !== notificationQueue.length) {
    notificationQueue.length = 0;
    notificationQueue.push(...validNotifications);
    notifyListeners();
  }
}

/**
 * حذف إشعار معين
 */
export function removeNotification(notificationId: string) {
  const index = notificationQueue.findIndex((n) => n.id === notificationId);
  if (index > -1) {
    notificationQueue.splice(index, 1);
    notifyListeners();
  }
}

/**
 * وضع علامة "مقروء" على إشعار
 */
export function markAsRead(notificationId: string) {
  const notification = notificationQueue.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
    notifyListeners();
  }
}

/**
 * الحصول على عدد الإشعارات غير المقروءة
 */
export function getUnreadCount(): number {
  return notificationQueue.filter((n) => !n.read).length;
}

/**
 * تفريغ جميع الإشعارات
 */
export function clearAllNotifications() {
  notificationQueue.length = 0;
  notifyListeners();
}

/**
 * محاكاة WebSocket للـ Backend (اختياري)
 * استخدم هذا للاتصال المستمر مع Backend
 */
export class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(url: string = `${process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws')}/api/notifications/ws`) {
    this.url = url;
  }

  /**
   * الاتصال بـ WebSocket
   */
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?userId=${userId}`);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            console.log('📬 Received notification:', notification);
            mockSendNotification({
              userId,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              action: notification.action,
              data: notification.data,
            });
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('❌ WebSocket disconnected');
          this.attemptReconnect(userId);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * محاولة إعادة الاتصال
   */
  private attemptReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(userId).catch(() => {
          // يتم التعامل مع الخطأ في المحاولة التالية
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * قطع الاتصال
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * إرسال رسالة عبر WebSocket
   */
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * التحقق من حالة الاتصال
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// التنظيف التلقائي للإشعارات المنتهية الصلاحية كل 5 دقائق
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredNotifications, 5 * 60 * 1000);
}

/**
 * إشعارات إضافية واقعية ومنطقية
 */

/**
 * إشعار انخفاض المخزون
 */
export async function notifyLowStock(
  productName: string,
  currentStock: number,
  threshold: number = 10,
  backendUrl?: string
) {
  const userId = getUserId() || 'anonymous';
  const isCritical = currentStock <= 5;

  return sendNotificationToBackend(
    {
      userId,
      type: isCritical ? 'error' : 'warning',
      title: isCritical ? '🚨 Critical: Product Out of Stock!' : '⚠️ Low Stock Alert',
      message: `${productName} has only ${currentStock} items left (threshold: ${threshold})`,
      action: 'restock_product',
      actionUrl: '/products',
      data: {
        productName,
        currentStock,
        threshold,
        isCritical,
        timestamp: new Date().toISOString(),
      },
    },
    backendUrl
  );
}

/**
 * إشعار عميل جديد
 */
export async function notifyNewCustomer(
  customerName: string,
  email: string,
  source: string = 'website',
  backendUrl?: string
) {
  const userId = getUserId() || 'anonymous';

  return sendNotificationToBackend(
    {
      userId,
      type: 'customer',
      title: '👤 New Customer Registered',
      message: `${customerName} (${email}) joined from ${source}`,
      action: 'view_customer',
      actionUrl: '/customers',
      data: {
        customerName,
        email,
        source,
        timestamp: new Date().toISOString(),
      },
    },
    backendUrl
  );
}

/**
 * إشعار أمان
 */
export async function notifySecurityAlert(
  alertType: 'login_attempt' | 'password_change' | 'suspicious_activity',
  details: string,
  backendUrl?: string
) {
  const userId = getUserId() || 'anonymous';

  const titles = {
    login_attempt: '🔐 Failed Login Attempt',
    password_change: '🔑 Password Changed',
    suspicious_activity: '🚨 Suspicious Activity Detected',
  };

  return sendNotificationToBackend(
    {
      userId,
      type: 'security',
      title: titles[alertType],
      message: details,
      action: 'review_security',
      actionUrl: '/settings/security',
      data: {
        alertType,
        details,
        timestamp: new Date().toISOString(),
        requiresImmediateAction: true,
      },
    },
    backendUrl
  );
}

/**
 * إشعار حملة تسويقية
 */
export async function notifyMarketingCampaign(
  campaignName: string,
  performance: { sent: number; opened: number; clicked: number },
  backendUrl?: string
) {
  const userId = getUserId() || 'anonymous';
  const openRate = ((performance.opened / performance.sent) * 100).toFixed(1);
  const clickRate = ((performance.clicked / performance.sent) * 100).toFixed(1);

  return sendNotificationToBackend(
    {
      userId,
      type: 'info',
      title: '📊 Campaign Performance Update',
      message: `${campaignName}: ${openRate}% opened, ${clickRate}% clicked (${performance.sent} emails sent)`,
      action: 'view_campaign',
      actionUrl: '/marketing',
      data: {
        campaignName,
        performance,
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate),
        timestamp: new Date().toISOString(),
      },
    },
    backendUrl
  );
}

export default {
  sendNotificationToBackend,
  notifySuccess,
  notifyError,
  notifyNewOrder,
  notifyPayment,
  notifyLowStock,
  notifyNewCustomer,
  notifySecurityAlert,
  notifyMarketingCampaign,
  getNotifications,
  subscribeToNotifications,
  removeNotification,
  markAsRead,
  getUnreadCount,
  clearAllNotifications,
  NotificationWebSocket,
};
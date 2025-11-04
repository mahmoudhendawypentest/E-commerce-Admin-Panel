/**
 * Profile Picture Utilities
 * مساعدات لإدارة صورة البروفايل في التطبيق
 */

/**
 * الحصول على صورة البروفايل من localStorage
 * @returns صورة البروفايل بصيغة Base64 أو null
 */
export const getAdminProfilePicture = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminProfilePicture');
  } catch (e) {
    console.error('Error loading profile picture:', e);
    return null;
  }
};

/**
 * حفظ صورة البروفايل في localStorage
 * @param imageData صورة البروفايل بصيغة Base64
 */
export const saveAdminProfilePicture = (imageData: string): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminProfilePicture', imageData);
  } catch (e) {
    console.error('Error saving profile picture:', e);
  }
};

/**
 * حذف صورة البروفايل من localStorage
 */
export const removeAdminProfilePicture = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminProfilePicture');
  } catch (e) {
    console.error('Error removing profile picture:', e);
  }
};

/**
 * الحصول على أول حرف من الاسم (fallback للصورة)
 * @param name اسم المستخدم
 * @returns حرف أو حرفين من الاسم
 */
export const getInitials = (name: string): string => {
  if (!name) return 'A';
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * التحقق من صحة حجم الملف
 * @param file ملف الصورة
 * @param maxSizeMB الحد الأقصى بالميجابايت
 * @returns true إذا كان الملف صحيحاً
 */
export const isValidImageSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * التحقق من أن الملف صورة حقيقية
 * @param file ملف المراد التحقق منه
 * @returns true إذا كان الملف صورة
 */
export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * التحقق الكامل من الصورة
 * @param file ملف الصورة
 * @returns كائن يحتوي على isValid والرسالة
 */
export const validateProfileImage = (
  file: File,
  maxSizeMB: number = 5
): { isValid: boolean; message?: string } => {
  if (!isValidImageType(file)) {
    return {
      isValid: false,
      message: 'Please select a valid image file (PNG, JPG, GIF, WebP)',
    };
  }

  if (!isValidImageSize(file, maxSizeMB)) {
    return {
      isValid: false,
      message: `Image size must be less than ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
};

/**
 * تحويل ملف إلى Base64 Data URL
 * @param file ملف الصورة
 * @returns Promise يحتوي على Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * تحديث صورة البروفايل مع التحقق الكامل
 * @param file ملف الصورة
 * @returns Promise يحتوي على النتيجة
 */
export const updateProfilePicture = async (
  file: File
): Promise<{ success: boolean; message: string }> => {
  try {
    // التحقق من صحة الملف
    const validation = validateProfileImage(file);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message || 'Invalid image',
      };
    }

    // تحويل إلى Base64
    const imageData = await fileToBase64(file);

    // حفظ في localStorage
    saveAdminProfilePicture(imageData);

    return {
      success: true,
      message: 'Profile picture updated successfully!',
    };
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return {
      success: false,
      message: 'Failed to update profile picture',
    };
  }
};

/**
 * إرسال تنبيه لجميع المكونات حول تحديث البروفايل
 */
export const notifyProfileUpdate = (imageData: string): void => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('profileUpdated', {
      detail: { imageData, timestamp: new Date().toISOString() },
    })
  );
};

/**
 * الحصول على معلومات الصورة
 * @returns كائن يحتوي على معلومات الصورة
 */
export const getProfilePictureInfo = (): {
  exists: boolean;
  size: number;
  uploadedAt?: string;
} => {
  try {
    if (typeof window === 'undefined') {
      return { exists: false, size: 0 };
    }

    const imageData = localStorage.getItem('adminProfilePicture');
    if (!imageData) {
      return { exists: false, size: 0 };
    }

    const size = new Blob([imageData]).size;
    const uploadedAt = localStorage.getItem('adminProfilePictureDate');

    return {
      exists: true,
      size,
      uploadedAt: uploadedAt || undefined,
    };
  } catch (e) {
    console.error('Error getting profile picture info:', e);
    return { exists: false, size: 0 };
  }
};

/**
 * حذف صورة البروفايل مع التنبيهات
 */
export const deleteProfilePicture = (): void => {
  try {
    removeAdminProfilePicture();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminProfilePictureDate');
    }
    notifyProfileUpdate('');
  } catch (e) {
    console.error('Error deleting profile picture:', e);
  }
};

/**
 * تحديد الألوان العشوائية للـ Avatar بناءً على الاسم
 * @param name اسم المستخدم
 * @returns لون Tailwind كـ string
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-cyan-400 to-cyan-600',
  ];

  const charCode = name.charCodeAt(0);
  const colorIndex = charCode % colors.length;
  return colors[colorIndex];
};
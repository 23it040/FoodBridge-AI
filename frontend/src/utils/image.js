/**
 * Resolves the real donor-uploaded food image URL for a donation record.
 *
 * Rules:
 * 1. Returns Cloudinary or external HTTPS URL if provided by donor.
 * 2. Prepends backend base URL for relative local uploads (e.g. /uploads/donation-...).
 * 3. Ignores legacy Unsplash fallbacks, Pexels, or default_food placeholders.
 * 4. Returns null if no real donor image exists.
 */
export const getFoodImageUrl = (donation) => {
  if (!donation) return null;

  const foodImgObj = donation.foodImage;
  const rawUrl =
    typeof foodImgObj === 'string'
      ? foodImgObj
      : foodImgObj?.url || donation.imageUrl || null;

  const publicId = typeof foodImgObj === 'object' ? foodImgObj?.publicId : null;

  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Ignore legacy fake/default fallback image references
  if (
    publicId === 'default_food' ||
    trimmed.includes('unsplash.com') ||
    trimmed.includes('pexels.com') ||
    trimmed.includes('default_food')
  ) {
    return null;
  }

  // Absolute Cloudinary / remote URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Relative upload path from backend (/uploads/...)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const cleanBase = apiBaseUrl.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
};

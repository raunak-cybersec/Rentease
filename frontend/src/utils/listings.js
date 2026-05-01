export const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Lucknow'];
export const ROOM_TYPES = ['PG', 'Flat', 'Studio', '1BHK'];
export const AMENITIES = ['WiFi', 'AC', 'Meals', 'Parking', 'Laundry', 'Gym'];
export const GENDERS = ['Male', 'Female', 'Any'];

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80';

const CITY_COORDINATES = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export const getListingImage = (listing) => listing?.images?.[0] || FALLBACK_IMAGE;

export const buildListingQuery = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => params.append(key, item));
      return;
    }

    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  return params;
};

const resizeImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const readImagesAsDataUrls = (fileList) =>
  Promise.all(Array.from(fileList).slice(0, 5).map((file) => resizeImageFile(file)));

export const buildOpenStreetMapEmbedUrl = (listing) => {
  const coords = CITY_COORDINATES[listing?.city] || CITY_COORDINATES.Mumbai;
  const delta = 0.025;
  const bbox = [
    coords.lng - delta,
    coords.lat - delta,
    coords.lng + delta,
    coords.lat + delta,
  ].join('%2C');

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;
};

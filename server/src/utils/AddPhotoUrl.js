export const addPhotoUrl = (products) => {
  return products.map((p) => {
    if (!p.photo_url) return { ...p, photo_url: null };

    // 1. If it's already a web URL
    if (p.photo_url.startsWith("http://") || p.photo_url.startsWith("https://")) {
      return { ...p, photo_url: p.photo_url };
    }

    // 2. Otherwise, treat it as a local file name and attach your local address
    return {
      ...p,
      photo_url: `http://localhost:5000/uploads/${p.photo_url}`, 
      // Note: Changed 5005 to 5000 to match your main server PORT fallback!
    };
  });
};
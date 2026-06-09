export const addPhotoUrl = (products) => {
  return products.map((p) => ({
    ...p,
    photo_url: p.photo_url
      ? `http://localhost:5005/uploads/${p.photo_url}`
      : null,
  }));
};
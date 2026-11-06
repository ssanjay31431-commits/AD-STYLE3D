export const products = [
  { id: 'navy-hoodie', name: 'Navy Hoodie', category: 'EVERYDAY ESSENTIALS', price: 1299, color: 'Deep navy', hex: '#263447', type: 'hoodie', description: 'A soft, heavyweight layer with a relaxed shape and considered details.' },
  { id: 'midnight-jacket', name: 'Midnight Navy Jacket', category: 'THE OUTERWEAR EDIT', price: 1499, color: 'Midnight navy', hex: '#1e2939', type: 'jacket', description: 'An easy, all-season jacket made for the in-between moments.' },
  { id: 'grey-hoodie', name: 'Light Grey Hoodie', category: 'EVERYDAY ESSENTIALS', price: 1199, color: 'Cloud grey', hex: '#b8b8b2', type: 'hoodie', description: 'Your familiar favourite, reimagined in brushed cotton fleece.' },
  { id: 'charcoal-jacket', name: 'Charcoal Jacket', category: 'THE OUTERWEAR EDIT', price: 1499, color: 'Soft charcoal', hex: '#454745', type: 'jacket', description: 'A clean, versatile silhouette with a subtle washed finish.' },
  { id: 'forest-hoodie', name: 'Forest Green Hoodie', category: 'MOST LOVED', price: 1299, color: 'Forest green', hex: '#4d624d', type: 'hoodie', description: 'A relaxed everyday layer in a deep, grounded shade of green.' },
  { id: 'cream-sweatshirt', name: 'Cream Sweatshirt', category: 'EVERYDAY ESSENTIALS', price: 1099, color: 'Warm cream', hex: '#ded8c9', type: 'sweatshirt', description: 'Quietly considered, with a soft hand-feel and an easy fit.' },
  { id: 'pink-sweatshirt', name: 'Dusty Pink Sweatshirt', category: 'NEW SEASON', price: 1199, color: 'Dusty rose', hex: '#bd8d8a', type: 'sweatshirt', description: 'A little colour, a lot of comfort. Made to wear on repeat.' },
  { id: 'graphic-tee', name: 'Off-white Graphic T-shirt', category: 'THE DAILY TEE', price: 799, color: 'Natural white', hex: '#e7e2d6', type: 'tee', description: 'An everyday cotton tee with a small, understated signature print.' },
  { id: 'orange-shirt', name: 'Orange Shirt', category: 'NEW SEASON', price: 999, color: 'Burnt orange', hex: '#c76b3d', type: 'shirt', description: 'A confident warm-toned shirt, cut for laid-back everyday wear.' },
];

export const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

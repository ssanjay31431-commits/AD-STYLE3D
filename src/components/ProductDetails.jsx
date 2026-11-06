import { Heart, X } from 'lucide-react';
import { formatPrice } from '../data/products.js';

export default function ProductDetails({ product, size, setSize, onClose, onAdd, onBuy, wished, onWishlist }) {
  if (!product) return null;
  return (
    <div className="focus-panel" role="region" aria-label={`${product.name} details`}>
      <div className="focus-copy">
        <div className="eyebrow">{product.category}</div>
        <h2>{product.name}</h2>
        <p className="focus-price">{formatPrice(product.price)}</p>
        <p className="focus-description">{product.description}</p>
        <p className="detail-label">COLOUR <span>{product.color}</span></p>
        <div className="size-picker" role="group" aria-label="Choose a size">
          <span className="detail-label">SELECT SIZE</span>
          <div className="size-options">{['S', 'M', 'L', 'XL'].map((value) => <button key={value} className={size === value ? 'selected' : ''} onClick={() => setSize(value)} aria-pressed={size === value}>{value}</button>)}</div>
        </div>
        <div className="focus-actions">
          <button className="button-dark" onClick={() => onAdd(product, size)}>ADD TO BAG</button>
          <button className="button-outline" onClick={() => onBuy(product, size)}>BUY NOW</button>
          <button className={`wishlist-button ${wished ? 'is-wished' : ''}`} onClick={() => onWishlist(product.id)} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={18} fill={wished ? 'currentColor' : 'none'} /></button>
        </div>
      </div>
      <button className="focus-close" onClick={onClose} aria-label="Close product details"><X size={19} /><span>BACK TO COLLECTION</span></button>
    </div>
  );
}

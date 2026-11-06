import { Minus, Plus, X } from 'lucide-react';
import { formatPrice } from '../data/products.js';

export default function CartDrawer({ open, onClose, items, onQuantity, onRemove, title = 'YOUR BAG', isWishlist = false }) {
  if (!open) return null;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="cart-drawer" aria-label={title} aria-modal="true" role="dialog">
        <div className="drawer-heading"><div><span className="eyebrow">LARANA STUDIO</span><h2>{title} <small>({items.length})</small></h2></div><button className="icon-button" onClick={onClose} aria-label="Close drawer"><X size={20} /></button></div>
        {items.length ? <div className="drawer-items">
          {items.map((item) => <article className="drawer-item" key={`${item.id}-${item.size || ''}`}>
            <div className="mini-garment" style={{ '--garment-color': item.hex }}><span /></div>
            <div className="drawer-item-info"><h3>{item.name}</h3>{!isWishlist && <p>Size: {item.size} · {item.color}</p>}<strong>{formatPrice(item.price)}</strong>
              {!isWishlist && <div className="quantity-control"><button aria-label={`Decrease ${item.name} quantity`} onClick={() => onQuantity(item.id, item.size, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={`Increase ${item.name} quantity`} onClick={() => onQuantity(item.id, item.size, 1)}><Plus size={13} /></button></div>}
            </div>
            <button className="remove-item" onClick={() => onRemove(item.id, item.size)} aria-label={`Remove ${item.name}`}><X size={16} /></button>
          </article>)}
        </div> : <div className="drawer-empty"><p>{isWishlist ? 'Save a few favourites for later.' : 'Your bag is ready for something good.'}</p><button className="text-link" onClick={onClose}>DISCOVER THE COLLECTION <span>↗</span></button></div>}
        {!isWishlist && items.length > 0 && <div className="drawer-footer"><div className="subtotal"><span>SUBTOTAL</span><strong>{formatPrice(total)}</strong></div><p>Shipping and taxes calculated at checkout.</p><button className="button-dark checkout-button" onClick={() => window.alert('Thank you for discovering LARANA STUDIO. Checkout is coming soon.')}>CONTINUE TO CHECKOUT <span>→</span></button></div>}
      </aside>
    </div>
  );
}

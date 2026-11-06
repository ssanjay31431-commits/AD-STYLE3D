import { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';

export default function Header({ cartCount, wishlistCount, onCart, onWishlist }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [['HOME', '#home'], ['COLLECTIONS', '#collection'], ['ABOUT', '#story'], ['BLOG', '#journal'], ['CONTACT', '#footer']];
  return (
    <header className="site-header">
      <div className="announcement">NEW CLOTHES NOW, ALL UNDER ₹1500 – LIMITED TIME OFFER</div>
      <div className="masthead">
        <button className="icon-button mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <a className="wordmark" href="#home" aria-label="CASTRO DENIM home">
          <span>CASTRO</span><small>DENIM</small>
        </a>
        <div className="header-actions">
          <a className="icon-button search-button" href="#collection" aria-label="Browse the collection"><Search size={16} /></a>
          <button className="icon-button" onClick={onWishlist} aria-label={`Wishlist, ${wishlistCount} items`}><Heart size={17} /><span className="action-count">{wishlistCount}</span></button>
          <button className="icon-button" onClick={onCart} aria-label={`Shopping bag, ${cartCount} items`}><ShoppingBag size={17} /><span className="action-count">{cartCount}</span></button>
        </div>
      </div>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
    </header>
  );
}

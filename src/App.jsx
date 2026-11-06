import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { gsap } from 'gsap';
import Header from './components/Header.jsx';
import ClothingScene from './components/ClothingScene.jsx';
import ProductDetails from './components/ProductDetails.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Footer from './components/Footer.jsx';
import { formatPrice, products } from './data/products.js';

const lovedStyles = [
  { title: 'Hoodies', product: products[4], image: 'hoodie-editorial.jpg' },
  { title: 'Jackets', product: products[1], image: 'jacket-editorial.jpg' },
  { title: 'Sweatshirts', product: products[5], image: 'sweatshirt-editorial.jpg' },
  { title: 'T-shirts', product: products[7], image: 'tee-editorial.jpg' },
];

const arrivals = [
  { product: products[8], image: 'arrival-orange.jpg', label: 'THE LINEN-TOUCH SHIRT' },
  { product: products[6], image: 'arrival-pink.jpg', label: 'THE SOFT SWEATSHIRT' },
  { product: products[2], image: 'arrival-grey.jpg', label: 'THE EVERYDAY HOODIE' },
  { product: products[3], image: 'arrival-jacket.jpg', label: 'THE CITY JACKET' },
];

const journalImages = ['instagram-01.jpg', 'instagram-02.jpg', 'instagram-03.jpg', 'instagram-04.jpg', 'instagram-05.jpg', 'instagram-06.jpg'];

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('larana-studio-cart') || localStorage.getItem('ad-style-cart') || '[]');
    if (!Array.isArray(stored)) throw new TypeError('Saved cart must be a list.');
    return stored.filter((item) => item && products.some((product) => product.id === item.id)
      && ['S', 'M', 'L', 'XL'].includes(item.size) && Number.isInteger(item.quantity) && item.quantity > 0)
      .map((item) => ({ ...products.find((product) => product.id === item.id), size: item.size, quantity: item.quantity }));
  } catch (error) {
    console.warn('Unable to restore the saved LARANA STUDIO cart; starting with an empty bag.', error);
    return [];
  }
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [size, setSize] = useState('M');
  const [cart, setCart] = useState(loadCart);
  const [wishlist, setWishlist] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [addedMessage, setAddedMessage] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistedProducts = useMemo(() => products.filter((product) => wishlist.includes(product.id)), [wishlist]);
  const saveCart = (nextCart) => {
    setCart(nextCart);
    try {
      localStorage.setItem('larana-studio-cart', JSON.stringify(nextCart));
    } catch (error) {
      console.error('Unable to save the LARANA STUDIO cart to this browser.', error);
    }
  };
  const addToCart = (product, chosenSize = size, buyNow = false) => {
    const existing = cart.find((item) => item.id === product.id && item.size === chosenSize);
    saveCart(existing
      ? cart.map((item) => item.id === product.id && item.size === chosenSize ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, size: chosenSize, quantity: 1 }]);
    if (buyNow) setDrawer('cart');
    else {
      setAddedMessage(true);
      window.setTimeout(() => setAddedMessage(false), 2200);
    }
  };
  const changeQuantity = (id, itemSize, amount) => saveCart(cart.map((item) => item.id === id && item.size === itemSize ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  const removeItem = (id, itemSize) => saveCart(cart.filter((item) => item.id !== id || item.size !== itemSize));
  const toggleWishlist = (id) => setWishlist((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const openProduct = (product) => { setSize('M'); setSelected(product); setHovered(null); };

  useEffect(() => {
    const sections = document.querySelectorAll('.reveal-section');
    if (!('IntersectionObserver' in window)) {
      gsap.set(sections, { autoAlpha: 1, y: 0 });
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        gsap.to(entry.target, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power2.out' });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header cartCount={cartCount} wishlistCount={wishlist.length} onCart={() => setDrawer('cart')} onWishlist={() => setDrawer('wishlist')} />
      <main>
        <section className={`hero ${selected ? 'hero-selected' : ''}`} id="home">
          <div className="hero-heading"><div className="eyebrow">NEW COLLECTION</div><h1>PREMIUM STREETWEAR</h1></div>
          <div className="collection-kicker"><span>01 — 09</span><span>{hovered?.name || 'THE EVERYDAY COLLECTION'}</span><span>SCROLL TO EXPLORE <ArrowDown size={12} /></span></div>
          <ClothingScene products={products} selected={selected} onSelect={openProduct} onHover={setHovered} />
          <div className="hero-caption">
            {selected ? <ProductDetails product={selected} size={size} setSize={setSize} onClose={() => setSelected(null)} onAdd={addToCart} onBuy={(product, chosenSize) => addToCart(product, chosenSize, true)} wished={wishlist.includes(selected.id)} onWishlist={toggleWishlist} /> : <>
              <span className="caption-rule" />
              <h2>{hovered?.name || 'Forest Green Hoodie'}</h2>
              <p>{hovered ? `${formatPrice(hovered.price)} · ${hovered.color}` : 'Discover your everyday style.'}</p>
              <a className="text-link" href="#collection">SHOP THE COLLECTION <ArrowRight size={14} /></a>
              <span className="scene-hint">HOVER TO DISCOVER · CLICK TO VIEW</span>
            </>}
          </div>
          <div className="hero-side-note">THOUGHTFULLY MADE · EASY TO WEAR</div>
        </section>

        <section className="loved-section section-wrap reveal-section" id="collection">
          <div className="section-heading"><div><span className="eyebrow">THE PIECES YOU COME BACK TO</span><h2>Our Most Loved Styles</h2></div><a className="text-link" href="#arrivals">VIEW ALL STYLES <ArrowRight size={14} /></a></div>
          <div className="loved-grid">{lovedStyles.map(({ title, product, image }, index) => <button className="editorial-card" key={product.id} onClick={() => openProduct(product)}>
            <div className="editorial-image" style={{ backgroundImage: `url(/images/${image})` }}><span className="image-index">0{index + 1}</span><span className="quick-view">SHOP NOW <ArrowRight size={13} /></span></div>
            <span className="card-title">{title}</span>
          </button>)}</div>
        </section>

        <section className="middle-feature section-wrap reveal-section" id="arrivals">
          <div className="arrivals-section">
            <div className="compact-heading"><div><span className="eyebrow">JUST LANDED</span><h2>New Arrivals</h2></div><a className="text-link" href="#collection">VIEW ALL <ArrowRight size={12} /></a></div>
            <div className="arrival-grid">{arrivals.map(({ product, image, label }) => <article className="arrival-card" key={product.id}>
              <button className="arrival-image" onClick={() => openProduct(product)} aria-label={`View ${product.name}`}><img src={`/images/${image}`} alt={`${product.name} editorial fashion photograph`} loading="lazy" /><span className="arrival-view">DISCOVER <ArrowRight size={13} /></span></button>
              <div className="arrival-info"><button onClick={() => openProduct(product)}>{label}</button><span>{formatPrice(product.price)}</span></div>
            </article>)}</div>
          </div>
          <section className="story-feature" id="story">
            <div className="story-copy"><span className="eyebrow">A LITTLE ABOUT US</span><h2>Style That Speaks.</h2><p>LARANA STUDIO is more than just a clothing brand. It is a lifestyle. A statement. A way to express yourself with confidence, comfort and style.</p><a className="text-link" href="mailto:hello@laranastudio.in">OUR STORY <ArrowRight size={13} /></a></div>
            <img className="story-photo" src="/images/story-rack.jpg" alt="A thoughtful edit of everyday wardrobe essentials" loading="lazy" />
          </section>
        </section>

        <section className="instagram-section section-wrap reveal-section" id="journal"><div className="section-heading"><div><span className="eyebrow">A GOOD FIT, ON YOUR FEED</span><h2>Instagram Collection</h2></div><a className="text-link" href="https://instagram.com" target="_blank" rel="noreferrer">@LARANASTUDIO ↗</a></div><div className="instagram-grid">{journalImages.map((image, index) => <a key={image} className={`instagram-tile instagram-tile-${index + 1}`} href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Visit LARANA STUDIO on Instagram" style={{ backgroundImage: `url(/images/${image})` }}><span>FOLLOW ALONG ↗</span></a>)}</div></section>
        <div className="newsletter-strip"><span>GOOD STYLE, STRAIGHT TO YOUR INBOX.</span><a href="mailto:hello@laranastudio.in">SAY HELLO <ArrowRight size={14} /></a></div>
      </main>
      <Footer />
      <CartDrawer open={drawer !== null} onClose={() => setDrawer(null)} title={drawer === 'wishlist' ? 'YOUR WISHLIST' : 'YOUR BAG'} items={drawer === 'wishlist' ? wishlistedProducts.map((product) => ({ ...product, quantity: 1 })) : cart} onQuantity={changeQuantity} onRemove={drawer === 'wishlist' ? (id) => toggleWishlist(id) : removeItem} isWishlist={drawer === 'wishlist'} />
      {addedMessage && <div className="toast"><ShoppingBag size={15} /> ADDED TO YOUR BAG <span>·</span> <button onClick={() => setDrawer('cart')}>VIEW BAG</button></div>}
      <button className="floating-wishlist" onClick={() => setDrawer('wishlist')} aria-label="Open wishlist"><Heart size={15} /><span>{wishlist.length}</span></button>
    </>
  );
}

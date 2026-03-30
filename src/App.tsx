import { useState, useEffect } from 'react';
import { ShoppingBag, X, Menu, Camera, User, Info, Minus, Plus, Trash2, PlusCircle, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import type { Product } from './context/CartContext';
import './App.css';

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

const Navbar = ({ onMenuOpen, setView }: { onMenuOpen: () => void; setView: (v: 'home' | 'collection' | 'contact') => void }) => {
  const { cart, setIsCartOpen, isCartOpen } = useCart();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Menu className="menu-icon" onClick={onMenuOpen} style={{ cursor: 'pointer' }} />
        <div className="nav-logo-container" onClick={() => setView('home')}>
          <img 
            src="/logo.PNG" 
            alt="Montelari Club" 
            style={{ height: '45px' }}
          />
          <span className="logo-text">Montelari Club</span>
        </div>
        <div className="cart-trigger" onClick={() => setIsCartOpen(!isCartOpen)}>
          <ShoppingBag size={24} />
          {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
        </div>
      </div>
    </nav>
  );
};

const CartModal = ({ onClose }: { onClose: () => void }) => {
  const { cart, isCartOpen, removeFromCart, total, checkoutWhatsApp, updateSize, updateQuantity, cartError } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>Carrito</h3>
          <X onClick={onClose} className="close-icon" />
        </div>
        
        <div className="cart-items">
          {cartError && (
            <div className="cart-error-banner">
              {cartError}
            </div>
          )}
          
          {cart.length === 0 ? (
            <p className="empty-msg">Tu carrito está vacío.</p>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${item.size}-${idx}`} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  
                  <div className="cart-item-sizes">
                    <span style={{ fontSize: '0.7rem', color: '#999' }}>Talla:</span>
                    <div className="cart-size-options">
                      {SIZES.map(s => (
                        <div 
                          key={s} 
                          className={`cart-size-option ${item.size === s ? 'selected' : ''}`}
                          onClick={() => updateSize(item.id, item.size, s)}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cart-item-quantity">
                    <span style={{ fontSize: '0.7rem', color: '#999' }}>Cantidad:</span>
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.size, -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.size, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="item-details-row">
                    <span style={{ fontWeight: '600', marginTop: '1rem', display: 'block' }}>
                      ${item.price * item.quantity}
                    </span>
                  </div>

                  <button 
                    className="remove-item-btn" 
                    onClick={() => removeFromCart(item.id, item.size)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total">
              <span>Total Estimado:</span>
              <span>${total}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={checkoutWhatsApp}>
              Finalizar Pedido en WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, setView }: { isOpen: boolean; onClose: () => void; setView: (v: 'home' | 'collection' | 'contact') => void }) => {
  if (!isOpen) return null;

  const navigate = (v: 'home' | 'collection' | 'contact') => {
    setView(v);
    onClose();
  };

  return (
    <div className="cart-overlay" onClick={onClose} style={{ justifyContent: 'flex-start' }}>
      <div className="cart-drawer sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>Menú</h3>
          <X onClick={onClose} className="close-icon" />
        </div>
        
        <nav className="sidebar-links" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          <a href="#" onClick={() => navigate('home')}>Inicio</a>
          <a href="#" onClick={() => navigate('collection')}>Colecciones</a>
          <a href="#sobre-nosotros" onClick={() => navigate('home')}>Sobre Nosotros</a>
          <a href="#" onClick={() => navigate('contact')}>Contacto</a>
        </nav>

        <div className="sidebar-footer">
          <p>Montelari Club</p>
          <div className="social" style={{ marginTop: '1rem', justifyContent: 'flex-start', gap: '1rem' }}>
            <Camera size={20} />
            <User size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

const FloatingCart = () => {
  const { cart, isCartOpen, setIsCartOpen } = useCart();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <button className="floating-cart" onClick={() => setIsCartOpen(!isCartOpen)} aria-label="Abrir carrito">
      <ShoppingBag size={24} />
      {itemCount > 0 && <span className="badge">{itemCount}</span>}
    </button>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, productStock } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const isOutOfStock = productStock[product.id];

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="product-card">
      <div className="img-container">
        {product.isNew && <span className="new-badge">Nuevo</span>}
        <img src={product.image} alt={product.name} className="front-img" />
        {product.backImage && (
          <img src={product.backImage} alt={`${product.name} back`} className="back-img" />
        )}
        
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span className="out-of-stock-badge">Agotado</span>
          </div>
        )}

        {!isOutOfStock && (
          <>
            <div className="info-btn">
              <Info size={18} />
            </div>
            <div className="info-tooltip">
              <strong>Materiales:</strong><br/>
              {product.description}
            </div>
          </>
        )}

        <button 
          className={`add-btn ${isAdded ? 'success' : ''}`} 
          onClick={handleAdd}
          disabled={isAdded || isOutOfStock}
        >
          {isOutOfStock ? 'Sin Stock' : (isAdded ? '¡Añadido!' : 'Añadir al Carrito')}
        </button>
      </div>

      <div className="product-info">
        <div>
          <h4>{product.name}</h4>
        </div>
        <p style={{ fontWeight: '600' }}>${product.price}</p>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { products: globalProducts, saveProducts, toggleStock, productStock } = useCart();
  
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    price: 0,
    image: '',
    backImage: '',
    description: '',
    isNew: true
  });

  useEffect(() => {
    if (globalProducts) {
      setLocalProducts([...globalProducts]);
    }
  }, [globalProducts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'montelaristaff' && password === 'MontelariStaff2026_Secure!') {
      setIsLoggedIn(true);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const id = localProducts.length > 0 ? Math.max(...localProducts.map(p => p.id)) + 1 : 1;
    setLocalProducts([...localProducts, { ...newProd, id }]);
    setNewProd({ name: '', price: 0, image: '', backImage: '', description: '', isNew: true });
    setShowAddForm(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar este producto de la lista temporal? (No se borrará permanentemente hasta que guardes)')) {
      setLocalProducts(localProducts.filter(p => p.id !== id));
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...localProducts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setLocalProducts(newItems);
  };

  const handleSaveChanges = () => {
    saveProducts(localProducts);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
        <div className="admin-login-card" style={{ background: '#fff', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo.PNG" alt="Logo" style={{ height: '40px', marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Staff Portal</h2>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Usuario</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Entrar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', borderBottom: '1px solid #eee', paddingBottom: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>Gestión de Inventario</h2>
            <p style={{ color: '#666' }}>Organiza y crea tus colecciones.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleSaveChanges} className="btn-primary" style={{ background: '#000', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> Guardar Cambios Permanentes
            </button>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ background: '#27ae60', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={16} /> Nueva Colección
            </button>
            <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ background: '#666', fontSize: '0.7rem' }}>Vista Pública</button>
            <button onClick={() => setIsLoggedIn(false)} className="btn-primary" style={{ background: '#c41e3a', fontSize: '0.7rem' }}>Salir</button>
          </div>
        </header>

        {showAddForm && (
          <div className="admin-add-form" style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '8px', marginBottom: '4rem', border: '1px solid #eee' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Crear Nuevo Producto / Colección</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Nombre del Producto *</label>
                <input type="text" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label>Precio ($) *</label>
                <input type="number" value={newProd.price} onChange={e => setNewProd({...newProd, price: Number(e.target.value)})} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label>Imagen Frontal (Ruta: /nombre.PNG) *</label>
                <input type="text" value={newProd.image} onChange={e => setNewProd({...newProd, image: e.target.value})} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label>Imagen Trasera (Opcional)</label>
                <input type="text" value={newProd.backImage} onChange={e => setNewProd({...newProd, backImage: e.target.value})} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Descripción / Materiales</label>
                <input type="text" value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} placeholder="Ej: 100% Algodón | Oversize" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="btn-primary" style={{ width: '250px' }}>Añadir a la Lista Temporal</button>
              </div>
            </form>
          </div>
        )}
        
        <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {localProducts.map((p, index) => (
            <div key={p.id} className="admin-product-card" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', background: '#fff', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => moveItem(index, 'up')} disabled={index === 0} style={{ opacity: index === 0 ? 0.3 : 1 }}><ArrowUp size={20} /></button>
                <button onClick={() => moveItem(index, 'down')} disabled={index === localProducts.length - 1} style={{ opacity: index === localProducts.length - 1 ? 0.3 : 1 }}><ArrowDown size={20} /></button>
                <button onClick={() => handleDelete(p.id)} style={{ color: '#c41e3a' }}><Trash2 size={20} /></button>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <img src={p.image} alt={p.name} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{p.name}</h4>
                  <p style={{ margin: '0.2rem 0', color: '#888' }}>${p.price}</p>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '20px', 
                    background: productStock[p.id] ? '#fff0f0' : '#f0fff4',
                    color: productStock[p.id] ? '#c41e3a' : '#27ae60',
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {productStock[p.id] ? 'SIN STOCK' : 'EN STOCK'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => toggleStock(p.id)}
                className={`toggle-stock-btn ${productStock[p.id] ? 'active' : ''}`}
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', border: '1px solid #000', background: productStock[p.id] ? '#000' : 'transparent', color: productStock[p.id] ? '#fff' : '#000', fontSize: '0.8rem', textTransform: 'uppercase' }}
              >
                {productStock[p.id] ? 'Restablecer Stock' : 'Marcar Agotado'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MainContent = () => {
  const { products } = useCart(); // Removed isCartOpen and setIsCartOpen as per user instruction
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState<'home' | 'collection' | 'contact'>('home');
  const [isAdmin, setIsAdmin] = useState(false);

  // Carousel logic for hero banner
  const bannerImages = [
    '/banner.jpg',
    '/banner2.jpg',
    '/banner3.jpg',
    '/banner4.jpg',
    '/banner5.jpg',
    '/banner6.jpg',
    '/banner7.jpg',
    '/banner8.jpg',
    '/banner9.jpg',
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => (prevIndex + 1) % bannerImages.length);
    }, 5000); // Change banner every 5 seconds
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const currentBannerSrc = bannerImages[currentBannerIndex];

  const heroBannerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: '-1',
    transition: 'opacity 1s ease-in-out', // Apply transition for fade effect
    opacity: 1, // Ensure the current banner is visible
  };

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsAdmin(true);
    }
  }, []);

  if (isAdmin) {
    return <AdminPanel />;
  }

  return (
    <>
      <Navbar onMenuOpen={() => setIsMenuOpen(true)} setView={setView} />
      <CartModal onClose={() => setIsCartOpen(false)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} setView={setView} />
      <FloatingCart />

      <main>
        {view === 'home' && (
          <>
            <section className="hero">
              <img 
                src={currentBannerSrc} 
                alt="Montelari Club Hero Banner" 
                className="hero-banner-img" 
                style={heroBannerStyles}
              />
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <h2>Elegancia en la Simplicidad</h2>
                <p>Descubre la esencia de Montelari Club.</p>
                <div className="hero-actions">
                  <button onClick={() => setView('collection')} className="btn-primary">Ver Colección</button>
                  <button onClick={() => document.getElementById('sobre-nosotros')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary" style={{ background: 'transparent', border: '1px solid white' }}>Nuestra Historia</button>
                </div>
              </div>
            </section>

            <section className="collaboration">
              <div className="collaboration-banner" onClick={() => window.open('https://www.instagram.com/scented.parfums?igsh=Z2k3MHcwOHpwYW5r', '_blank')}>
                <img src="/colaboracion.PNG" alt="Colaboración Montelari Club" />
              </div>
            </section>

            <section id="coleccion" className="collection">
              <div className="container">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem' }}>
                  <h2 className="section-title" style={{ margin: 0 }}>Collections</h2>
                  <button onClick={() => setView('collection')} style={{ textDecoration: 'underline', fontSize: '0.9rem', color: '#666' }}>Ver todo →</button>
                </div>
                <div className="product-carousel">
                  <div className="carousel-track">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="sobre-nosotros" className="about">
              <div className="container">
                <div className="about-grid">
                  <div className="about-image">
                    <img src="/logo.PNG" alt="Montelari Club Logo" />
                  </div>
                  <div className="about-text">
                    <span className="subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: '#888', fontSize: '0.8rem' }}>Nuestra Historia</span>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', margin: '1rem 0 2rem' }}>Sobre Nosotros</h2>
                    <p>Montelari Club no es solo una marca de ropa. Es una comunidad.</p>
                    <p>Nacemos con la idea de conectar personas a través de algo tan simple, pero tan poderoso, como una prenda. Queremos que cada pieza represente identidad, actitud y pertenencia. Que cuando alguien use Montelari, no solo esté vistiendo bien, sino que también esté formando parte de algo más grande.</p>
                    <p>Somos un movimiento que busca unir a jóvenes, especialmente en Panamá, que quieren ser diferentes, que no siguen lo común y que entiende que la moda también es una forma de expresión. En Montelari Club creemos en la autenticidad, en destacar y en crear conexiones reales entre personas que comparten esa misma visión.</p>
                    <p>Este proyecto nace de las ganas de influir, de inspirar y de demostrar que los sueños sí se pueden lograr cuando hay disciplina, esfuerzo y pasión detrás.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'collection' && (
          <section className="collection-page">
            <div className="container">
              <div className="page-header">
                <h2 className="section-title">Nuestras Colecciones</h2>
                <p>Explora nuestra selección premium de básicos esenciales.</p>
              </div>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {view === 'contact' && (
          <section className="contact" style={{ marginTop: '80px' }}>
            <div className="container">
              <div className="contact-grid" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
                <div className="contact-info">
                  <h2>Contacto</h2>
                  <p>Estamos aquí para ayudarte. Contáctanos directamente a través de nuestras redes oficiales.</p>
                  <div className="contact-details" style={{ alignItems: 'center', gap: '3rem' }}>
                    <div className="contact-item">
                      <span>WhatsApp</span>
                      <a href="https://wa.me/50763542035" target="_blank" rel="noopener noreferrer" style={{ fontSize: '2rem' }}>+507 6354-2035</a>
                    </div>
                    <div className="contact-item">
                      <span>Instagram</span>
                      <a href="https://www.instagram.com/montelariclub?igsh=MTlyODF0bWdlN2U4eQ==" target="_blank" rel="noopener noreferrer" style={{ fontSize: '2rem' }}>@montelariclub</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="nav-logo-container" style={{ marginBottom: '1rem', cursor: 'default' }}>
              <img src="/logo.PNG" alt="Montelari Club" style={{ height: '35px' }} />
              <span className="logo-text" style={{ fontSize: '1rem' }}>Montelari Club</span>
            </div>
            <p>© 2026 Premium Essentials.</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="#" onClick={() => setView('contact')}>Contacto</a>
          </div>
          <div className="social">
            <Camera size={20} />
            <User size={20} />
          </div>
        </div>
        <div className="container">
          <div className="creator-credits">
            <span>Website created by</span>
            <a href="https://www.instagram.com/adresinnn?igsh=ZmN0ZmR0dzA5bXFv&utm_source=qr" target="_blank" rel="noopener noreferrer" className="creator-link">
              <Camera size={18} /> @adresinnn
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

function App() {
  return (
    <CartProvider>
      <MainContent />
    </CartProvider>
  );
}

export default App;

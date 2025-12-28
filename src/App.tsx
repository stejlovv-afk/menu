import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES, MENU_ITEMS, IMG_BASE } from './constants';
import { CategoryId, Product, CartItem, OrderHistoryItem } from './types';
import ProductModal from './components/ProductModal';
import CartModal from './components/CartModal';
import HistoryModal from './components/HistoryModal';
import { ShoppingBag, Lock, Save, Ban, Clock } from 'lucide-react';

declare global {
  interface Window { Telegram: { WebApp: any; }; }
}

// Безопасная генерация ID для стабильной работы в Telegram WebView
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('coffee');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stopList, setStopList] = useState<number[]>([]);
  
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.MainButton.hide();

    const historyStored = localStorage.getItem('urban_history');
    if (historyStored) {
        try {
            setOrderHistory(JSON.parse(historyStored));
        } catch (e) { console.error("History parse error", e); }
    }

    const params = new URLSearchParams(window.location.search);
    const stopStr = params.get('stop');
    if (stopStr) {
      try {
        const ids = stopStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        setStopList(ids);
      } catch (e) { console.error("Failed to parse stop list", e); }
    }
  }, []);

  const handleCategoryChange = (id: CategoryId) => {
    setActiveCategory(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product: Product) => {
    if (isAdmin) {
      setStopList(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]);
    } else if (!stopList.includes(product.id)) {
      setSelectedProduct(product);
    }
  };

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    if(window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const handleCheckout = (floor: string, office: string) => {
    const tg = window.Telegram.WebApp;
    const totalAmount = cart.reduce((sum, i) => sum + i.totalPrice, 0);
    const address = `Этаж ${floor}, Офис ${office}`;
    
    // ИСПРАВЛЕНИЕ №1: Замена на generateId()
    const newOrder: OrderHistoryItem = {
        id: generateId(), 
        date: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' }),
        items: cart,
        totalAmount,
        address
    };
    
    const updatedHistory = [newOrder, ...orderHistory];
    setOrderHistory(updatedHistory);
    localStorage.setItem('urban_history', JSON.stringify(updatedHistory));

    const data = {
      type: 'order',
      items: cart.map(i => ({ label: i.name, amount: i.totalPrice * 100 })),
      address
    };
    tg.sendData(JSON.stringify(data));
  };

  const handleRepeatOrder = (items: CartItem[]) => {
      // ИСПРАВЛЕНИЕ №2: Замена на generateId()
      const newItems = items.map(i => ({...i, id: generateId()}));
      setCart(prev => [...prev, ...newItems]);
      setIsHistoryOpen(false);
      setIsCartOpen(true);
      window.Telegram.WebApp.showAlert(`Добавлено ${newItems.length} товаров в корзину`);
  };

  const handleSaveStopList = () => {
    window.Telegram.WebApp.sendData(JSON.stringify({ type: 'admin_sync', stop_list: stopList }));
  };

  const handleTitleTouchStart = () => {
    titleTimerRef.current = setTimeout(() => {
        if (prompt("Введите пароль администратора:") === "7654") {
            setIsAdmin(true);
            window.Telegram.WebApp.showAlert("Режим администратора включен!");
        }
    }, 2000);
  };

  const handleTitleTouchEnd = () => {
    if (titleTimerRef.current) { clearTimeout(titleTimerRef.current); titleTimerRef.current = null; }
  };

  const products = MENU_ITEMS.filter(item => {
    if (item.cat !== activeCategory) return false;
    if (!isAdmin && stopList.includes(item.id)) return false;
    return true;
  });

  return (
    <div className="min-h-screen pb-28 bg-background font-sans text-primary">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-200/50">
        <div 
            className="flex items-center justify-center h-14 relative select-none cursor-pointer"
            onTouchStart={handleTitleTouchStart}
            onTouchEnd={handleTitleTouchEnd}
            onMouseDown={handleTitleTouchStart}
            onMouseUp={handleTitleTouchEnd}
        >
            <h1 className="font-extrabold text-xl tracking-tight text-primary">URBAN LUNCH</h1>
            {isAdmin && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100 uppercase tracking-wide flex gap-1 items-center">
                    <Lock size={10} /> Admin
                </span>
            )}
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 pb-3">
            {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
                        activeCategory === cat.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                        : 'bg-white text-secondary border border-gray-100 hover:bg-gray-50'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>
      </header>

      {isAdmin && (
          <div className="mx-4 mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex justify-between items-center animate-fade-in">
              <p className="text-xs text-red-800 font-bold">Редактирование стоп-листа</p>
              <button onClick={handleSaveStopList} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-transform">
                <Save size={14} /> Сохранить
              </button>
          </div>
      )}

      <main className="p-4 grid grid-cols-2 gap-3">
        {products.map((product, idx) => {
            const isStopped = stopList.includes(product.id);
            return (
                <div key={product.id} onClick={() => handleProductClick(product)}
                    className={`bg-white rounded-[20px] p-2.5 shadow-soft hover:shadow-lg active:scale-[0.98] transition-all duration-300 relative group animate-scale-in`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                >
                    {isAdmin && isStopped && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-[20px] flex items-center justify-center z-10 border-2 border-red-500/20">
                            <div className="bg-red-500 text-white p-2 rounded-full shadow-lg animate-scale-in"><Ban size={20} /></div>
                        </div>
                    )}
                    <div className="aspect-square w-full rounded-2xl bg-gray-50 mb-3 overflow-hidden relative">
                         <img src={`${IMG_BASE}${product.img}`} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="px-1 pb-1">
                        <h3 className="font-bold text-[13px] leading-tight line-clamp-2 min-h-[2.4em] mb-1.5 text-gray-800">{product.name}</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-primary font-extrabold text-sm">{product.price ? `${product.price} ₽` : `от ${Object.values(product.sizes || {})[0]} ₽`}</span>
                        </div>
                    </div>
                </div>
            );
        })}
      </main>

      <nav className="fixed bottom-6 left-4 right-4 h-16 bg-primary/90 backdrop-blur-md rounded-2xl shadow-2xl shadow-primary/20 z-30 text-white flex justify-between px-2 items-center">
           <button onClick={() => window.location.reload()} className="flex-1 flex flex-col items-center justify-center h-full active:opacity-70 transition-opacity">
               <div className="p-1 rounded-full"><span className="text-xl">☕</span></div>
           </button>
           <button onClick={() => setIsHistoryOpen(true)} className="flex-1 flex flex-col items-center justify-center h-full active:opacity-70 transition-opacity relative group">
               <div className={`p-1.5 rounded-full transition-colors ${isHistoryOpen ? 'bg-white/20' : ''}`}>
                    <Clock size={22} className="text-white/80 group-hover:text-white" />
               </div>
           </button>
           <button onClick={() => setIsCartOpen(true)} className="flex-1 flex flex-col items-center justify-center h-full active:opacity-70 transition-opacity relative">
               <div className="bg-white/10 p-2.5 rounded-xl relative">
                   <ShoppingBag size={22} className="text-white" />
                   {cart.length > 0 && (
                       <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center border border-primary">
                           {cart.length}
                       </span>
                   )}
               </div>
           </button>
      </nav>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />}
      {isCartOpen && <CartModal cart={cart} onClose={() => setIsCartOpen(false)} onClear={() => setCart([])} onCheckout={handleCheckout} />}
      {isHistoryOpen && <HistoryModal orders={orderHistory} onClose={() => setIsHistoryOpen(false)} onRepeat={handleRepeatOrder} />}
    </div>
  );
};

export default App;

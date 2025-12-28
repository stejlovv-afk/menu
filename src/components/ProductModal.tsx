import React, { useState, useEffect } from 'react';
import { Product, SelectionState, Review } from '../types';
import { MILK_OPTIONS, SYRUP_OPTIONS, JUICE_OPTIONS, SUGAR_OPTIONS, IMG_BASE } from '../constants';
import { X, Star, Send } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

// Безопасная генерация ID для старых версий WebView
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [selection, setSelection] = useState<SelectionState>({
    size: null, milk: null, syrup: null, temp: null, sugar: null, cinnamon: false, juice: null
  });
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  useEffect(() => {
    if (product) {
      // Reset selection
      setSelection({ size: null, milk: null, syrup: null, temp: null, sugar: null, cinnamon: false, juice: null });
      
      // Load reviews from local storage
      const stored = localStorage.getItem('urban_reviews');
      const allReviews: Review[] = stored ? JSON.parse(stored) : [];
      setReviews(allReviews.filter(r => r.productId === product.id));
      setIsReviewFormOpen(false);
    }
  }, [product]);

  if (!product) return null;

  const getPrice = () => {
    let p = product.price || (selection.size ? selection.size.price : 0);
    const sizeMl = selection.size ? parseInt(selection.size.ml) : 0;
    if (selection.milk && selection.milk !== "Обычное") p += sizeMl > 300 ? 90 : 70;
    if (selection.syrup) p += sizeMl > 300 ? 50 : 30;
    return p;
  };

  const handleAdd = () => {
    const isDrinkOrIce = product.cat === 'drinks' || product.cat === 'ice';
    if (isDrinkOrIce && !selection.temp) return window.Telegram.WebApp.showAlert("Выберите температуру!");
    if (product.sizes && !selection.size) return window.Telegram.WebApp.showAlert("Выберите объем!");

    const price = getPrice();
    const parts = [
        product.name,
        selection.size ? `${selection.size.ml}мл` : '',
        selection.temp ? `[${selection.temp}]` : '',
        selection.milk ? `(${selection.milk})` : '',
        selection.syrup ? `+${selection.syrup}` : '',
        selection.juice ? `(сок:${selection.juice})` : '',
        selection.cinnamon ? '+Корица' : '',
        selection.sugar ? `Сахар: ${selection.sugar}` : ''
    ];
    
    const fullName = parts.filter(Boolean).join(' ');

    onAddToCart({
        id: generateId(), // ИСПРАВЛЕНО: было crypto.randomUUID()
        productId: product.id,
        name: fullName,
        basePrice: price,
        totalPrice: price,
        description: fullName,
        originalProduct: product
    });
    onClose();
  };

  const handleSubmitReview = () => {
    if(!newReviewText.trim()) return;
    
    const review: Review = {
        id: generateId(), // ИСПРАВЛЕНО: было crypto.randomUUID()
        productId: product.id,
        rating: newRating,
        text: newReviewText,
        userName: window.Telegram.WebApp.initDataUnsafe?.user?.first_name || 'Гость',
        date: new Date().toLocaleDateString()
    };

    const stored = localStorage.getItem('urban_reviews');
    const allReviews: Review[] = stored ? JSON.parse(stored) : [];
    const updated = [review, ...allReviews];
    
    localStorage.setItem('urban_reviews', JSON.stringify(updated));
    setReviews(updated.filter(r => r.productId === product.id));
    setNewReviewText('');
    setIsReviewFormOpen(false);
  };

  const isDrinkOrIce = product.cat === 'drinks' || product.cat === 'ice';
  const hideOptions = product.cat === 'food' || product.cat === 'drinks';
  const averageRating = reviews.length ? (reviews.reduce((a,b) => a+b.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full bg-surface rounded-t-[32px] max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl relative"
        style={{ scrollbarWidth: 'none' }}
      >
        
        {/* Header Image */}
        <div className="relative h-64 w-full">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-2 rounded-full text-white z-10 active:scale-90 transition-transform"
             >
                <X size={20} />
             </button>
             <img 
                src={`${IMG_BASE}${product.img}`} 
                className="w-full h-full object-cover" 
                alt={product.name} 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             
             <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                 <h2 className="text-3xl font-extrabold tracking-tight mb-1">{product.name}</h2>
                 <div className="flex items-center gap-2">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                        {product.cat === 'food' ? 'Закуска' : 'Напиток'}
                    </span>
                    {averageRating && (
                        <div className="flex items-center text-yellow-400 text-sm font-bold gap-1">
                            <Star size={14} fill="currentColor" /> {averageRating}
                        </div>
                    )}
                 </div>
             </div>
        </div>

        <div className="px-6 pb-32 pt-6 space-y-8">
            {/* Options */}
            <div className="space-y-6">
                {/* Temp */}
                {isDrinkOrIce && (
                    <div>
                        <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wider">Температура</h3>
                        <div className="flex gap-3">
                            {['Теплый', 'Холодный'].map((t) => (
                                <button key={t} onClick={() => setSelection(prev => ({...prev, temp: prev.temp === t ? null : t as any}))}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                                        selection.temp === t ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {t === 'Теплый' ? '🌡 Теплый' : '🧊 Холодный'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size */}
                {product.sizes && (
                    <div>
                        <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wider">Объем</h3>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(product.sizes).map(([ml, price]) => (
                                <button key={ml} onClick={() => setSelection(prev => ({...prev, size: {ml, price}}))}
                                    className={`py-3 px-5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                                        selection.size?.ml === ml ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {ml} мл
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Milk */}
                {!hideOptions && !product.noMilk && product.cat !== 'tea' && product.cat !== 'punsh' && !product.isBumble && (
                    <div>
                        <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wider">Молоко</h3>
                        <div className="flex flex-wrap gap-2">
                            {MILK_OPTIONS.map(m => (
                                <button key={m} onClick={() => setSelection(prev => ({...prev, milk: prev.milk === m ? null : m}))}
                                    className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                                        selection.milk === m ? 'bg-primary text-white shadow-md' : 'border border-gray-200 text-gray-600'
                                    }`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Juice */}
                {product.isBumble && (
                     <div>
                        <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wider">Сок</h3>
                        <div className="flex flex-wrap gap-2">
                            {JUICE_OPTIONS.map(j => (
                                 <button key={j} onClick={() => setSelection(prev => ({...prev, juice: prev.juice === j ? null : j}))}
                                    className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                                        selection.juice === j ? 'bg-primary text-white shadow-md' : 'border border-gray-200 text-gray-600'
                                    }`}>
                                    {j}
                                </button>
                            ))}
                        </div>
                     </div>
                )}

                {/* Syrup */}
                {!hideOptions && !product.noSyrup && product.cat !== 'punsh' && (
                    <div>
                        <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wider">Сироп</h3>
                        <div className="flex flex-wrap gap-2">
                             {SYRUP_OPTIONS.map(s => (
                                <button key={s} onClick={() => setSelection(prev => ({...prev, syrup: prev.syrup === s ? null : s}))}
                                    className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                                        selection.syrup === s ? 'bg-primary text-white shadow-md' : 'border border-gray-200 text-gray-600'
                                    }`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Extras */}
                {!hideOptions && (
                    <div className="flex gap-4">
                        <div className="flex-1">
                             <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wider">Доп</h3>
                             <button onClick={() => setSelection(prev => ({...prev, cinnamon: !prev.cinnamon}))}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                                    selection.cinnamon ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600'
                                }`}>Корица</button>
                        </div>
                        <div className="flex-[2]">
                            <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wider">Сахар</h3>
                            <div className="flex gap-2">
                                {SUGAR_OPTIONS.map(s => (
                                    <button key={s} onClick={() => setSelection(prev => ({...prev, sugar: prev.sugar === s ? null : s}))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                                            selection.sugar === s ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600'
                                        }`}>{s}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Отзывы ({reviews.length})</h3>
                    <button 
                        onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                        className="text-accent text-sm font-semibold"
                    >
                        {isReviewFormOpen ? 'Отмена' : 'Написать отзыв'}
                    </button>
                </div>

                {isReviewFormOpen && (
                    <div className="bg-gray-50 p-4 rounded-2xl mb-6 animate-scale-in">
                        <div className="flex gap-2 justify-center mb-4">
                            {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => setNewRating(star)} className="transition-transform active:scale-125">
                                    <Star size={24} fill={star <= newRating ? "#FFC107" : "none"} color={star <= newRating ? "#FFC107" : "#CBD5E1"} />
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={newReviewText} 
                                onChange={(e) => setNewReviewText(e.target.value)}
                                placeholder="Ваше мнение о товаре..."
                                className="w-full p-3 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:border-accent text-sm"
                            />
                            <button onClick={handleSubmitReview} className="absolute right-2 top-2 p-1 text-accent"><Send size={18}/></button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {reviews.length > 0 ? reviews.slice(0, 3).map(review => (
                        <div key={review.id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm">{review.userName}</span>
                                <span className="text-[10px] text-gray-400">{review.date}</span>
                            </div>
                            <div className="flex text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} color={i < review.rating ? "currentColor" : "#eee"} />
                                ))}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 text-sm py-4">Пока нет отзывов. Будьте первым!</p>
                    )}
                </div>
            </div>
        </div>

        {/* Sticky Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-gray-100/50">
            <button
                onClick={handleAdd}
                className="w-full bg-primary text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex justify-between px-6 items-center active:scale-[0.98] transition-all"
            >
                <span>В корзину</span>
                <span>{getPrice()} ₽</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProductModal;

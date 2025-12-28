import React, { useState } from 'react';
import { CartItem } from '../types';
import { Trash2, X, MapPin, Building } from 'lucide-react';

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onClear: () => void;
  onCheckout: (floor: string, office: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({ cart, onClose, onClear, onCheckout }) => {
  const [floor, setFloor] = useState('');
  const [office, setOffice] = useState('');

  const total = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  const handleCheckout = () => {
    if(!floor || !office) return window.Telegram.WebApp.showAlert("Укажите этаж и офис!");
    onCheckout(floor, office);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full bg-surface rounded-t-[32px] min-h-[60vh] max-h-[90vh] flex flex-col animate-slide-up shadow-2xl">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-2xl font-extrabold tracking-tight">Корзина</h2>
            <div className="flex gap-4">
                 {cart.length > 0 && (
                     <button onClick={onClear} className="text-red-500 text-sm font-bold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg">
                        <Trash2 size={16}/> Очистить
                     </button>
                 )}
                 <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                    <X size={20} />
                 </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="text-6xl mb-4 grayscale opacity-50">🛒</div>
                    <p className="font-medium">Корзина пуста</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.name.split(' ')[0]}</h4>
                                <p className="text-[10px] text-gray-500 max-w-[200px] leading-tight font-medium uppercase tracking-wide">{item.description}</p>
                            </div>
                            <span className="font-extrabold text-lg">{item.totalPrice} ₽</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px] relative z-10">
             <div className="flex gap-3">
                 <div className="flex-1 relative">
                    <Building className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <input 
                        type="number" 
                        placeholder="Этаж"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-accent focus:outline-none transition-all font-semibold text-sm"
                    />
                 </div>
                 <div className="flex-[2] relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Офис / Кабинет"
                        value={office}
                        onChange={(e) => setOffice(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-accent focus:outline-none transition-all font-semibold text-sm"
                    />
                 </div>
             </div>

             <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full bg-primary disabled:bg-gray-300 disabled:text-gray-500 text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex justify-between px-6 items-center active:scale-[0.98] transition-all"
            >
                <span>Оформить</span>
                <span>{total} ₽</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;

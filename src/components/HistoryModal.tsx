import React from 'react';
import { OrderHistoryItem, CartItem } from '../types';
import { X, Clock, Repeat, ShoppingBag } from 'lucide-react';

interface HistoryModalProps {
  orders: OrderHistoryItem[];
  onClose: () => void;
  onRepeat: (items: CartItem[]) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ orders, onClose, onRepeat }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full bg-surface rounded-t-[32px] min-h-[60vh] max-h-[90vh] flex flex-col animate-slide-up shadow-2xl">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-2xl font-extrabold tracking-tight">Мои заказы</h2>
            <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <ShoppingBag size={48} className="mb-4 opacity-50" />
                    <p className="text-sm font-medium">История заказов пуста</p>
                </div>
            ) : (
                orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-soft">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                                    <Clock size={12} /> {order.date}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">{order.address}</div>
                            </div>
                            <span className="font-extrabold text-lg">{order.totalAmount} ₽</span>
                        </div>
                        
                        <div className="space-y-2 mb-5">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-700 truncate pr-4">{item.name}</span>
                                    <span className="font-medium text-gray-900 shrink-0">{item.totalPrice} ₽</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => onRepeat(order.items)}
                            className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-primary rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-colors active:scale-[0.98]"
                        >
                            <Repeat size={16} /> Повторить заказ
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;

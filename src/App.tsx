import React, { useEffect, useState } from 'react';
import { ShoppingBag, Clock } from 'lucide-react';

// Инициализация Telegram WebApp
const tg = (window as any).Telegram?.WebApp;

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

const products: Product[] = [
  { id: 1, title: 'Маргарита', price: 550, image: '🍕' },
  { id: 2, title: 'Пепперони', price: 650, image: '🍕' },
  { id: 3, title: 'Чизбургер', price: 450, image: '🍔' },
];

function App() {
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    tg?.ready();
    tg?.expand(); // Развернуть на весь экран
  }, []);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const onSendData = () => {
    const data = {
      items: cart,
      totalPrice: cart.reduce((acc, item) => acc + item.price, 0),
    };
    tg?.sendData(JSON.stringify(data));
  };

  useEffect(() => {
    if (cart.length > 0) {
      tg?.MainButton.setText(`Оформить заказ (${cart.length})`);
      tg?.MainButton.show();
    } else {
      tg?.MainButton.hide();
    }
  }, [cart]);

  useEffect(() => {
    tg?.onEvent('mainButtonClicked', onSendData);
    return () => tg?.offEvent('mainButtonClicked', onSendData);
  }, [cart]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#fff', background: '#1a1a1a', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Urban Lunch v2.0</h1>
        <Clock />
      </header>

      <div style={{ display: 'grid', gap: '15px' }}>
        {products.map(product => (
          <div key={product.id} style={{ background: '#333', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '24px' }}>{product.image}</span>
              <h3 style={{ margin: '5px 0' }}>{product.title}</h3>
              <p style={{ color: '#4caf50', fontWeight: 'bold' }}>{product.price} ₽</p>
            </div>
            <button 
              onClick={() => addToCart(product)}
              style={{ background: '#4caf50', border: 'none', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Добавить
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ marginTop: '20px', padding: '10px', borderTop: '1px solid #444' }}>
          <p>В корзине товаров: {cart.length}</p>
        </div>
      )}
    </div>
  );
}

export default App;

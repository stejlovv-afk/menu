import json
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor
from aiogram.types import WebAppInfo, ReplyKeyboardMarkup, KeyboardButton

# Логи будут видны в 'pm2 logs urban-backend'
logging.basicConfig(level=logging.INFO)

API_TOKEN = '8505012367:AAEsnE2j3j1RZ6akTB0CG6t_i0C-IHMUCyc'

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def send_welcome(message: types.Message):
    # Ссылка на ваше меню
    web_app_url = "https://stejlovv-afk.github.io/menu/"
    
    markup = ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add(KeyboardButton(text="Открыть меню 🍕", web_app=WebAppInfo(url=web_app_url)))
    
    await message.answer(
        f"Привет, {message.from_user.first_name}! Нажми на кнопку, чтобы заказать:",
        reply_markup=markup
    )

@dp.message_handler(content_types=['web_app_data'])
async def get_web_app_data(message: types.Message):
    try:
        data = json.loads(message.web_app_data.data)
        items = data.get('items', [])
        total = data.get('totalPrice', 0)
        
        details = "\n".join([f"• {i['title']} — {i['price']}₽" for i in items])
        await message.answer(f"📦 **Заказ принят!**\n\n{details}\n\n💰 **Итого: {total}₽**", parse_mode="Markdown")
    except Exception as e:
        await message.answer("Ошибка обработки заказа.")

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)

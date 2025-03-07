import logging
import asyncio
import re
import urllib.parse
import sqlite3
from typing import List, Dict, Optional
from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, BotCommand
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler
from telegram.error import Forbidden, TimedOut
from bs4 import BeautifulSoup
import aiohttp
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import hypercorn.asyncio
from hypercorn.config import Config
import base64
import os
from datetime import datetime

# Настройки
TELEGRAM_TOKEN = "7846698102:AAFR2bhmjAkPiV-PjtnFIu_oRnzxYPP1xVo"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0"
REQUEST_TIMEOUT = 10
PARSE_INTERVAL = 5
KUFAR_LIMIT = 7
WEBHOOK_URL = "https://apartment-bot-81rv.onrender.com/webhook"
UPLOAD_FOLDER = 'uploads'
ADMIN_ID = "854773231"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

CITIES = {
    "minsk": "Минск",
    "brest": "Брест",
    "grodno": "Гродно",
    "gomel": "Гомель",
    "vitebsk": "Витебск",
    "mogilev": "Могилев",
}

def init_db():
    with sqlite3.connect("ads.db") as conn:
        conn.execute("DROP TABLE IF EXISTS ads")
        conn.execute("DROP TABLE IF EXISTS new_ads")
        conn.execute("DROP TABLE IF EXISTS user_ads")
        conn.execute("CREATE TABLE IF NOT EXISTS ads (link TEXT PRIMARY KEY, source TEXT, city TEXT, price INTEGER, rooms INTEGER, address TEXT, image TEXT, description TEXT)")
        conn.execute("CREATE TABLE IF NOT EXISTS new_ads (link TEXT PRIMARY KEY, source TEXT, city TEXT, price INTEGER, rooms INTEGER, address TEXT, image TEXT, description TEXT, user_id TEXT)")
        conn.execute("CREATE TABLE IF NOT EXISTS user_ads (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, images TEXT, city TEXT, rooms INTEGER, price INTEGER, address TEXT, description TEXT, phone TEXT, timestamp TEXT, status TEXT DEFAULT 'pending')")
        conn.commit()

init_db()

app = Flask(__name__, static_folder='static', static_url_path='/')

class ApartmentParser:
    @staticmethod
    async def fetch_ads(city: str, min_price: Optional[int] = None, max_price: Optional[int] = None, rooms: Optional[int] = None) -> List[Dict]:
        headers = {"User-Agent": USER_AGENT}
        results = []
        url = f"https://re.kufar.by/l/{city}/snyat/kvartiru-dolgosrochno"
        if rooms:
            url += f"/{rooms}k"
        query_params = {"cur": "USD"}
        if min_price and max_price:
            query_params["prc"] = f"r:{min_price},{max_price}"
        url += f"?{urllib.parse.urlencode(query_params, safe=':,')}"
        logger.info(f"Fetching Kufar ads from: {url}")

        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
                    response.raise_for_status()
                    soup = BeautifulSoup(await response.text(), "html.parser")
                    for ad in soup.select("section > a"):
                        try:
                            link = ad.get("href", "")
                            if not link:
                                continue
                            price = ApartmentParser._parse_price(ad)
                            room_count = ApartmentParser._parse_rooms(ad)
                            if ApartmentParser._check_filters(price, room_count, min_price, max_price, rooms):
                                results.append({
                                    "price": price,
                                    "rooms": room_count,
                                    "address": ApartmentParser._parse_address(ad),
                                    "link": link,
                                    "image": ApartmentParser._parse_image(ad),
                                    "description": ApartmentParser._parse_description(ad),
                                    "city": city,
                                    "source": "Kufar"
                                })
                        except Exception as e:
                            logger.error(f"Ошибка парсинга объявления Kufar: {e}")
            except Exception as e:
                logger.error(f"Ошибка запроса Kufar: {e}")
        return results

    @staticmethod
    def _parse_price(ad) -> Optional[int]:
        price_element = ad.select_one(".styles_price__usd__HpXMa")
        return int(re.sub(r"\D", "", price_element.text)) if price_element else None

    @staticmethod
    def _parse_rooms(ad) -> Optional[int]:
        rooms_element = ad.select_one(".styles_parameters__7zKlL")
        match = re.search(r"\d+", rooms_element.text) if rooms_element else None
        return int(match.group()) if match else None

    @staticmethod
    def _parse_address(ad) -> str:
        address_element = ad.select_one(".styles_address__l6Qe_")
        return address_element.text.strip() if address_element else "Адрес не указан"

    @staticmethod
    def _parse_image(ad) -> Optional[str]:
        image_element = ad.select_one("img")
        return image_element.get("src") if image_element else None

    @staticmethod
    def _parse_description(ad) -> str:
        desc_element = ad.select_one(".styles_body__5BrnC")
        return desc_element.text.strip() if desc_element else "Описание не указано"

    @staticmethod
    def _check_filters(price: Optional[int], rooms: Optional[int], min_price: Optional[int], max_price: Optional[int], target_rooms: Optional[int]) -> bool:
        if price is None:
            return False
        price_valid = (min_price is None or price >= min_price) and (max_price is None or price <= max_price)
        rooms_valid = target_rooms is None or rooms == target_rooms
        return price_valid and rooms_valid

def store_ads(ads: List[Dict]):
    with sqlite3.connect("ads.db") as conn:
        cursor = conn.cursor()
        for ad in ads:
            try:
                cursor.execute(
                    "INSERT INTO ads (link, source, city, price, rooms, address, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (ad["link"], ad["source"], ad["city"], ad["price"], ad["rooms"], ad["address"], ad["image"], ad["description"])
                )
            except sqlite3.IntegrityError:
                pass
        conn.commit()

def store_new_ads(ads: List[Dict], user_id: str):
    with sqlite3.connect("ads.db") as conn:
        cursor = conn.cursor()
        for ad in ads:
            try:
                cursor.execute(
                    "INSERT INTO new_ads (link, source, city, price, rooms, address, image, description, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (ad["link"], ad["source"], ad["city"], ad["price"], ad["rooms"], ad["address"], ad["image"], ad["description"], user_id)
                )
            except sqlite3.IntegrityError:
                pass
        conn.commit()
        new_ads_count = len(ads)
        if new_ads_count > 0 and user_id.isdigit():
            bot = app.bot.application.bot
            message = f"Появилось {new_ads_count} новых объявлений! Зайдите в приложение, чтобы посмотреть."
            try:
                asyncio.create_task(bot.send_message(chat_id=user_id, text=message))
                logger.info(f"Уведомление о {new_ads_count} новых объявлениях отправлено пользователю {user_id}")
            except Exception as e:
                logger.error(f"Ошибка отправки уведомления пользователю {user_id}: {e}")
        elif new_ads_count > 0:
            logger.info(f"Уведомление о {new_ads_count} новых объявлениях не отправлено: недействительный user_id={user_id}")

async def fetch_and_store_ads(user_filters: Dict[str, Optional[str]] = None):
    user_id = user_filters.get('user_id', 'default') if user_filters else 'default'
    city = user_filters.get('city') if user_filters else None
    min_price = int(user_filters.get('min_price')) if user_filters and user_filters.get('min_price') else None
    max_price = int(user_filters.get('max_price')) if user_filters and user_filters.get('max_price') else None
    rooms = int(user_filters.get('rooms')) if user_filters and user_filters.get('rooms') else None

    cities_to_parse = [city] if city else CITIES.keys()
    for city in cities_to_parse:
        logger.info(f"Начало парсинга для города: {city} с фильтрами user_id={user_id}")
        try:
            kufar_ads = await ApartmentParser.fetch_ads(city, min_price, max_price, rooms)
            logger.info(f"Успешно получено {len(kufar_ads)} объявлений с Kufar для {city}")
        except Exception as e:
            logger.error(f"Ошибка парсинга Kufar для {city}: {e}")
            kufar_ads = []

        total_ads = kufar_ads
        if total_ads:
            with sqlite3.connect("ads.db") as conn:
                cursor = conn.cursor()
                existing_links = set(row[0] for row in cursor.execute("SELECT link FROM ads").fetchall())
                new_ads = [ad for ad in total_ads if ad["link"] not in existing_links]
                
                if new_ads:
                    store_new_ads(new_ads, user_id)
                    logger.info(f"Сохранено {len(new_ads)} новых объявлений для user_id={user_id}")
                store_ads(total_ads)
                logger.info(f"Сохранено {len(total_ads)} объявлений для {city}")
        else:
            logger.warning(f"Нет объявлений для сохранения для {city}")

@app.route('/api/ads', methods=['GET'])
def get_ads():
    city = request.args.get('city')
    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)
    rooms = request.args.get('rooms', type=int)
    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=KUFAR_LIMIT, type=int)
    user_id = request.args.get('user_id', 'default')

    logger.info(f"Запрос к /api/ads с параметрами: city={city}, min_price={min_price}, max_price={max_price}, rooms={rooms}, offset={offset}, limit={limit}")

    with sqlite3.connect("ads.db") as conn:
        query = "SELECT * FROM ads WHERE 1=1"
        params = []
        if city:
            query += " AND city = ?"
            params.append(city)
        if min_price is not None:
            query += " AND price >= ?"
            params.append(min_price)
        if max_price is not None:
            query += " AND price <= ?"
            params.append(max_price)
        if rooms is not None:
            query += " AND rooms = ?"
            params.append(rooms)

        cursor = conn.cursor()
        cursor.execute(query, params)
        all_ads = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        logger.info(f"Найдено {len(all_ads)} объявлений в базе")

        result = all_ads[offset:offset + limit]
        has_more = len(all_ads) > offset + limit

        for ad in result:
            ad['has_more'] = has_more
            ad['next_offset'] = offset + len(result)

        return jsonify(result)

@app.route('/api/new_ads', methods=['GET'])
def get_new_ads():
    user_id = request.args.get('user_id', 'default')
    logger.info(f"Запрос к /api/new_ads для user_id={user_id}")

    with sqlite3.connect("ads.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM new_ads WHERE user_id = ?", (user_id,))
        new_ads = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        logger.info(f"Найдено {len(new_ads)} новых объявлений для user_id={user_id}")
        return jsonify(new_ads)

@app.route('/api/reset_new_ads', methods=['POST'])
def reset_new_ads():
    user_id = request.args.get('user_id', 'default')
    logger.info(f"Сброс новых объявлений для user_id={user_id}")
    with sqlite3.connect("ads.db") as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM new_ads WHERE user_id = ?", (user_id,))
        conn.commit()
    return '', 200

@app.route('/api/submit_user_ad', methods=['POST'])
async def submit_user_ad():
    user_id = request.form.get('user_id')
    city = request.form.get('city')
    rooms = request.form.get('rooms') or None
    price = request.form.get('price')
    address = request.form.get('address')
    description = request.form.get('description') or ''
    phone = request.form.get('phone') or ''
    images = request.files.getlist('images')
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    image_paths = []
    for image in images:
        if image:
            image_path = os.path.join(UPLOAD_FOLDER, f"{user_id}_{image.filename}")
            image.save(image_path)
            image_paths.append(image_path)

    images_str = ','.join(image_paths) if image_paths else None

    try:
        with sqlite3.connect("ads.db") as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO user_ads (user_id, images, city, rooms, price, address, description, phone, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
                (user_id, images_str, city, rooms, price, address, description, phone, timestamp)
            )
            ad_id = cursor.lastrowid
            conn.commit()

        bot = app.bot.application.bot
        message = (
            f"Новое объявление на модерацию (ID: {ad_id})\n"
            f"Город: {CITIES[city]}\n"
            f"Комнаты: {rooms or 'Не указано'}\n"
            f"Цена: {price} USD\n"
            f"Адрес: {address}\n"
            f"Описание: {description}\n"
            f"Телефон: {phone}\n"
            f"Время подачи: {timestamp}"
        )
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("Одобрить", callback_data=f"approve_{ad_id}"),
             InlineKeyboardButton("Отклонить", callback_data=f"reject_{ad_id}")]
        ])
        await bot.send_message(chat_id=ADMIN_ID, text=message, reply_markup=keyboard)

        if user_id.isdigit():
            await bot.send_message(chat_id=user_id, text="Ваше объявление успешно отправлено на модерацию. Ожидайте решения администратора.")
        else:
            logger.warning(f"Не отправлено уведомление пользователю: недействительный user_id={user_id}")

        logger.info(f"Объявление user_id={user_id} отправлено на модерацию админу {ADMIN_ID}")
        return jsonify({"status": "pending", "message": "Объявление отправлено на модерацию"})
    except Exception as e:
        logger.error(f"Ошибка при добавлении объявления user_id={user_id}: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/user_ads', methods=['GET'])
def get_user_ads():
    user_id = request.args.get('user_id', 'default')
    logger.info(f"Запрос к /api/user_ads для user_id={user_id}")

    with sqlite3.connect("ads.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_ads WHERE status = 'approved' ORDER BY timestamp DESC")
        user_ads = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        for ad in user_ads:
            if ad['images']:
                image_paths = ad['images'].split(',')
                ad['images'] = [f'data:image/jpeg;base64,{base64.b64encode(open(path, "rb").read()).decode("utf-8")}' for path in image_paths]
        logger.info(f"Найдено {len(user_ads)} объявлений пользователей")
        return jsonify(user_ads)

@app.route('/api/delete_user_ad', methods=['DELETE'])
def delete_user_ad():
    ad_id = request.args.get('ad_id')
    user_id = request.args.get('user_id')
    if user_id != ADMIN_ID:
        return jsonify({"error": "Permission denied"}), 403

    with sqlite3.connect("ads.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT images FROM user_ads WHERE id = ?", (ad_id,))
        result = cursor.fetchone()
        if result and result[0]:
            for image_path in result[0].split(','):
                if os.path.exists(image_path):
                    os.remove(image_path)
        cursor.execute("DELETE FROM user_ads WHERE id = ?", (ad_id,))
        conn.commit()
    logger.info(f"Объявление id={ad_id} удалено администратором user_id={user_id}")
    return '', 200

@app.route('/api/moderate_ad', methods=['POST'])
async def moderate_ad():
    ad_id = request.args.get('ad_id')
    action = request.args.get('action')
    user_id = request.args.get('user_id')
    if user_id != ADMIN_ID:
        return jsonify({"error": "Permission denied"}), 403

    with sqlite3.connect("ads.db") as conn:
        cursor = conn.cursor()
        if action == 'approve':
            cursor.execute("UPDATE user_ads SET status = 'approved' WHERE id = ?", (ad_id,))
            logger.info(f"Объявление id={ad_id} одобрено администратором {user_id}")
        elif action == 'reject':
            cursor.execute("SELECT images FROM user_ads WHERE id = ?", (ad_id,))
            result = cursor.fetchone()
            if result and result[0]:
                for image_path in result[0].split(','):
                    if os.path.exists(image_path):
                        os.remove(image_path)
            cursor.execute("DELETE FROM user_ads WHERE id = ?", (ad_id,))
            logger.info(f"Объявление id={ad_id} отклонено администратором {user_id}")
        conn.commit()

    return '', 200

class ApartmentBot:
    def __init__(self):
        self.application = Application.builder().token(TELEGRAM_TOKEN).build()
        self._setup_handlers()

    def _setup_handlers(self):
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CallbackQueryHandler(self.handle_callback))

    async def _setup_commands(self):
        commands = [BotCommand("start", "Запустить поиск квартир")]
        try:
            await self.application.bot.set_my_commands(commands)
            logger.info("Команды меню установлены")
        except Exception as e:
            logger.error(f"Ошибка установки команд меню: {e}")

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.effective_user.id
        logger.info(f"Команда /start вызвана пользователем {user_id}")
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("Открыть поиск квартир", web_app={"url": f"https://apartment-bot-81rv.onrender.com/mini-app?user_id={user_id}"})]
        ])
        await update.message.reply_text("Добро пожаловать! Откройте приложение для поиска квартир:", reply_markup=keyboard)

    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        query = update.callback_query
        await query.answer()
        action, ad_id = query.data.split('_')
        user_id = str(update.effective_user.id)
        if user_id != ADMIN_ID:
            await query.edit_message_text("У вас нет прав для модерации.")
            return

        async with aiohttp.ClientSession() as session:
            url = f"{WEBHOOK_URL}/api/moderate_ad?ad_id={ad_id}&action={action}&user_id={user_id}"
            async with session.post(url) as response:
                if response.status == 200:
                    await query.edit_message_text(f"Объявление {ad_id} {'одобрено' if action == 'approve' else 'отклонено'}")
                    await self.application.bot.edit_message_reply_markup(chat_id=user_id, message_id=query.message.message_id, reply_markup=None)
                else:
                    await query.edit_message_text(f"Ошибка при обработке объявления {ad_id}")

    async def setup_webhook(self):
        try:
            await self.application.bot.set_webhook(url=WEBHOOK_URL)
            logger.info(f"Webhook успешно установлен на {WEBHOOK_URL}")
        except Exception as e:
            logger.error(f"Ошибка при установке webhook: {e}")

@app.route('/webhook', methods=['POST'])
async def webhook():
    bot = app.bot
    update = Update.de_json(request.get_json(), bot.application.bot)
    if update:
        await bot.application.process_update(update)
    else:
        logger.warning("Получен пустой update от Telegram")
    return '', 200

@app.route('/mini-app')
def mini_app():
    return app.send_static_file('index.html')

async def main():
    bot = ApartmentBot()
    app.bot = bot
    await bot.application.initialize()
    scheduler = AsyncIOScheduler()
    scheduler.add_job(fetch_and_store_ads, 'interval', minutes=PARSE_INTERVAL)
    scheduler.start()
    await fetch_and_store_ads()
    await bot.setup_webhook()
    config = Config()
    config.bind = ["0.0.0.0:5000"]
    config.debug = True
    await hypercorn.asyncio.serve(app, config)

if __name__ == "__main__":
    asyncio.run(main())

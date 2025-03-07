import React, { useState, useEffect } from 'react';
import './App.css';

const CITIES = {
  minsk: '🏙️ Минск',
  brest: '🌇 Брест',
  grodno: '🌃 Гродно',
  gomel: '🌆 Гомель',
  vitebsk: '🏙 Витебск',
  mogilev: '🏞️ Могилев',
};

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [ads, setAds] = useState([]);
  const [newAds, setNewAds] = useState([]);
  const [userAds, setUserAds] = useState([]);
  const [adminAds, setAdminAds] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [offset, setOffset] = useState(0);
  const [currentParams, setCurrentParams] = useState(null);
  const [isSearched, setIsSearched] = useState(false);
  const [showUserAdForm, setShowUserAdForm] = useState(false);
  const [formData, setFormData] = useState({ images: [], city: '', rooms: '', price: '', address: '', description: '', phone: '' });

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user_id') || 'default';
  const adminId = '854773231';

  useEffect(() => {
    // Проверяем, существует ли window.Telegram.WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
      window.Telegram.WebApp.disableVerticalSwipes();
    } else {
      console.log("Telegram WebApp не доступен. Запустите приложение в Telegram.");
    }
  
    const savedState = JSON.parse(localStorage.getItem('searchState'));
    if (savedState && savedState.isSearched) {
      setIsSearched(true);
      const params = new URLSearchParams();
      params.append('user_id', userId);
      if (savedState.city) params.append('city', savedState.city);
      if (savedState.minPrice) params.append('min_price', savedState.minPrice);
      if (savedState.maxPrice) params.append('max_price', savedState.maxPrice);
      if (savedState.rooms) params.append('rooms', savedState.rooms);
      setCurrentParams(params);
      fetchAds(params, 7);
    }
  }, []);

    // Уведомления о новых объявлениях теперь приходят через Telegram, поэтому интервал не нужен

  const vibrate = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const fetchAds = async (params, limit) => {
    params.set('offset', offset);
    params.set('limit', limit);
    const url = `https://apartment-bot-81rv.onrender.com/api/ads?${params.toString()}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (offset === 0) setAds([]);
      setAds(prev => [...prev, ...data]);
      setOffset(data[0]?.next_offset || offset);
      setIsSearched(true);
    } catch (error) {
      setAds([{ error: `Ошибка при загрузке данных: ${error.message}` }]);
    }
  };

  const fetchNewAds = async () => {
    const url = `https://apartment-bot-81rv.onrender.com/api/new_ads?user_id=${userId}`;
    const response = await fetch(url);
    const data = await response.json();
    setNewAds(data);
  };

  const fetchUserAds = async () => {
    const url = `https://apartment-bot-81rv.onrender.com/api/user_ads?user_id=${userId}`;
    const response = await fetch(url);
    const data = await response.json();
    setUserAds(data);
  };

  const fetchAdminAds = async () => {
    const url = `https://apartment-bot-81rv.onrender.com/api/user_ads?status=pending`;
    const response = await fetch(url);
    const data = await response.json();
    setAdminAds(data);
  };

  const resetSearch = () => {
    setAds([]);
    setOffset(0);
    setIsSearched(false);
    localStorage.removeItem('searchState');
  };

  const handleSearchSubmit = () => {
    if (!formData.city || !formData.price || !formData.address) {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Пожалуйста, заполните обязательные поля: город, цена, адрес.');
      } else {
        alert('Пожалуйста, заполните обязательные поля: город, цена, адрес.');
      }
      return;
    }
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (city) params.append('city', city);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    if (rooms) params.append('rooms', rooms);
    setCurrentParams(params);
    localStorage.setItem('searchState', JSON.stringify({ city, minPrice: minPrice, maxPrice: maxPrice, rooms, isSearched: true }));
    fetch(`https://apartment-bot-81rv.onrender.com/api/reset_new_ads?user_id=${userId}`, { method: 'POST' })
      .then(() => fetchAds(params, 7));
  };

  const handleUserAdSubmit = () => {
    if (!formData.city || !formData.price || !formData.address) {
      window.Telegram.WebApp.showAlert('Пожалуйста, заполните обязательные поля: город, цена, адрес.');
      return;
    }
    const data = new FormData();
    formData.images.forEach(file => data.append('images', file));
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('user_id', userId);
    fetch('https://apartment-bot-81rv.onrender.com/api/submit_user_ad', { method: 'POST', body: data })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'pending') window.Telegram.WebApp.showAlert(data.message);
        setShowUserAdForm(false);
        setFormData({ images: [], city: '', rooms: '', price: '', address: '', description: '', phone: '' });
      });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setFormData({ ...formData, images: files });
  };

  const handleDeleteUserAd = (adId) => {
    fetch(`https://apartment-bot-81rv.onrender.com/api/delete_user_ad?ad_id=${adId}&user_id=${userId}`, { method: 'DELETE' })
      .then(fetchUserAds);
  };

  const openModal = (image) => setModalImage(image);
  const closeModal = () => setModalImage(null);

  return (
    <div id="app-container" className="h-screen w-screen overflow-y-auto pb-20">
      <div className="flex justify-center top-bar relative p-5 mb-10">
        <button
          className={`px-4 py-2 ${activeTab === 'search' ? 'bg-blue-600' : 'bg-gray-600'} text-white rounded-l-md hover:bg-blue-700 transition duration-200`}
          onClick={() => { vibrate(); setActiveTab('search'); }}
        >
          Поиск
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'new' ? 'bg-blue-600' : 'bg-gray-600'} text-white hover:bg-blue-700 transition duration-200 relative`}
          onClick={() => { vibrate(); setActiveTab('new'); fetchNewAds(); }}
        >
          Новые объявления
          {newAds.length > 0 && <span className="new-count">{newAds.length}</span>}
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'user-ads' ? 'bg-blue-600' : 'bg-gray-600'} text-white hover:bg-blue-700 transition duration-200`}
          onClick={() => { vibrate(); setActiveTab('user-ads'); fetchUserAds(); }}
        >
          Объявления пользователей
        </button>
        {userId === adminId && (
          <button
            className={`px-4 py-2 ${activeTab === 'admin' ? 'bg-blue-600' : 'bg-gray-600'} text-white rounded-r-md hover:bg-blue-700 transition duration-200`}
            onClick={() => { vibrate(); setActiveTab('admin'); fetchAdminAds(); }}
          >
            Админ
          </button>
        )}
      </div>

      {activeTab === 'search' && (
        <div className="container mx-auto">
          {isSearched && (
            <button
              className="w-full bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 transition duration-200 mb-4"
              onClick={() => { vibrate(); resetSearch(); }}
            >
              Вернуть назад
            </button>
          )}
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Поиск квартир</h1>
          {!isSearched && (
            <div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
              <div className="mb-4">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">🏙 Город:</label>
                <select id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Выберите город</option>
                  <option value="minsk">Минск</option>
                  <option value="brest">Брест</option>
                  <option value="grodno">Гродно</option>
                  <option value="gomel">Гомель</option>
                  <option value="vitebsk">Витебск</option>
                  <option value="mogilev">Могилев</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">💰 Мин. цена (USD):</label>
                <input type="number" id="min-price" value={formData.minPrice} onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="0" />
              </div>
              <div className="mb-4">
                <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">💰 Макс. цена (USD):</label>
                <input type="number" id="max-price" value={formData.maxPrice} onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="1000" />
              </div>
              <div className="mb-4">
                <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">🛏️ Комнаты:</label>
                <select id="rooms" value={formData.rooms} onChange={(e) => setFormData({ ...formData, rooms: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Любое</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <button className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200" onClick={() => { vibrate(); handleSearchSubmit(); }}>Поиск</button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ads.map((ad, index) => (
              ad.error ? <p key={index} className="text-center text-red-500 py-4">{ad.error}</p> :
              <div key={ad.link} className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 hover:shadow-xl transition duration-200">
                {ad.image ? (
                  <img src={ad.image} alt="Apartment" className="w-full h-48 object-cover rounded-t-lg cursor-pointer" onClick={() => openModal(ad.image)} />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center text-gray-500">Фото отсутствует</div>
                )}
                <div className="p-2">
                  <p className="text-gray-800"><span className="font-semibold">🏙 Город:</span> {CITIES[ad.city]}</p>
                  <p className="text-gray-800"><span className="font-semibold">🛏️ Комнаты:</span> {ad.rooms || 'Не указано'}</p>
                  <p className="text-gray-800"><span className="font-semibold">💰 Цена:</span> {ad.price} USD</p>
                  <p className="text-gray-800"><span className="font-semibold">📍 Адрес:</span> {ad.address}</p>
                  <p className="text-gray-800"><span className="font-semibold">📝 Описание:</span> {ad.description || 'Не указано'}</p>
                  {ad.source && <p className="text-gray-800"><span className="font-semibold">🌐 Источник:</span> {ad.source}</p>}
                  {ad.link && <a href={ad.link} target="_blank" className="mt-3 inline-block bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 w-full text-center transition duration-200">Перейти</a>}
                </div>
              </div>
            ))}
          </div>
          {ads.length > 0 && ads[0]?.has_more && (
            <button
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 mt-6 transition duration-200"
              onClick={() => { vibrate(); fetchAds(currentParams, offset < 7 ? 7 : 2); }}
            >
              Показать еще
            </button>
          )}
        </div>
      )}

      {activeTab === 'new' && (
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Новые объявления</h1>
          {newAds.length > 0 && (
            <button
              className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition duration-200 mb-4"
              onClick={() => { vibrate(); fetch(`https://apartment-bot-81rv.onrender.com/api/reset_new_ads?user_id=${userId}`, { method: 'POST' }).then(fetchNewAds); }}
            >
              Сбросить новые объявления
            </button>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {newAds.length > 0 ? (
              newAds.map(ad => (
                <div key={ad.link} className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 hover:shadow-xl transition duration-200">
                  {ad.image ? (
                    <img src={ad.image} alt="Apartment" className="w-full h-48 object-cover rounded-t-lg cursor-pointer" onClick={() => openModal(ad.image)} />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center text-gray-500">Фото отсутствует</div>
                  )}
                  <div className="p-2">
                    <p className="text-gray-800"><span className="font-semibold">🏙 Город:</span> {CITIES[ad.city]}</p>
                    <p className="text-gray-800"><span className="font-semibold">🛏️ Комнаты:</span> {ad.rooms || 'Не указано'}</p>
                    <p className="text-gray-800"><span className="font-semibold">💰 Цена:</span> {ad.price} USD</p>
                    <p className="text-gray-800"><span className="font-semibold">📍 Адрес:</span> {ad.address}</p>
                    <p className="text-gray-800"><span className="font-semibold">📝 Описание:</span> {ad.description || 'Не указано'}</p>
                    {ad.source && <p className="text-gray-800"><span className="font-semibold">🌐 Источник:</span> {ad.source}</p>}
                    {ad.link && <a href={ad.link} target="_blank" className="mt-3 inline-block bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 w-full text-center transition duration-200">Перейти</a>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-gray-800 waiting-animation">⏳ Ожидаем новые объявления...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'user-ads' && (
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Объявления пользователей</h1>
          <button className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition duration-200 mb-4" onClick={() => { vibrate(); setShowUserAdForm(!showUserAdForm); }}>
            Подать объявление
          </button>
          {showUserAdForm && (
            <div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
              <div className="mb-4">
                <label htmlFor="ad-images" className="block text-sm font-medium text-gray-700 mb-1">📸 Загрузить изображения (до 5):</label>
                <input type="file" id="ad-images" accept="image/*" multiple onChange={handleImageChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                <div className="image-preview-container">
                  {formData.images.map((file, index) => (
                    <img key={index} src={URL.createObjectURL(file)} alt="Preview" className="image-preview" />
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="ad-city" className="block text-sm font-medium text-gray-700 mb-1">🏙 Город:</label>
                <select id="ad-city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Выберите город</option>
                  <option value="minsk">Минск</option>
                  <option value="brest">Брест</option>
                  <option value="grodno">Гродно</option>
                  <option value="gomel">Гомель</option>
                  <option value="vitebsk">Витебск</option>
                  <option value="mogilev">Могилев</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="ad-rooms" className="block text-sm font-medium text-gray-700 mb-1">🛏️ Комнаты:</label>
                <select id="ad-rooms" value={formData.rooms} onChange={(e) => setFormData({ ...formData, rooms: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Любое</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="ad-price" className="block text-sm font-medium text-gray-700 mb-1">💰 Цена (USD):</label>
                <input type="number" id="ad-price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="0" />
              </div>
              <div className="mb-4">
                <label htmlFor="ad-address" className="block text-sm font-medium text-gray-700 mb-1">📍 Адрес:</label>
                <input type="text" id="ad-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Укажите адрес" />
              </div>
              <div className="mb-4">
                <label htmlFor="ad-description" className="block text-sm font-medium text-gray-700 mb-1">📝 Описание:</label>
                <textarea id="ad-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Опишите объявление (опционально)" />
              </div>
              <div className="mb-4">
                <label htmlFor="ad-phone" className="block text-sm font-medium text-gray-700 mb-1">📞 Номер телефона:</label>
                <input type="tel" id="ad-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="+375 (XX) XXX-XX-XX" />
              </div>
              <button className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200" onClick={() => { vibrate(); handleUserAdSubmit(); }}>Опубликовать</button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {userAds.length > 0 ? (
              userAds.map(ad => (
                <div key={ad.id} className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 hover:shadow-xl transition duration-200">
                  {ad.images && ad.images.map((img, index) => (
                    <img key={index} src={img} alt="Apartment" className="w-full h-48 object-cover rounded-t-lg cursor-pointer" onClick={() => openModal(img)} />
                  ))}
                  {!ad.images && <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center text-gray-500">Фото отсутствует</div>}
                  <div className="p-2">
                    <p className="text-gray-800"><span className="font-semibold">🏙 Город:</span> {CITIES[ad.city]}</p>
                    <p className="text-gray-800"><span className="font-semibold">🛏️ Комнаты:</span> {ad.rooms || 'Не указано'}</p>
                    <p className="text-gray-800"><span className="font-semibold">💰 Цена:</span> {ad.price} USD</p>
                    <p className="text-gray-800"><span className="font-semibold">📍 Адрес:</span> {ad.address}</p>
                    <p className="text-gray-800"><span className="font-semibold">📝 Описание:</span> {ad.description || 'Не указано'}</p>
                    <p className="text-gray-800"><span className="font-semibold">📞 Телефон:</span> {ad.phone || 'Не указан'}</p>
                    <p className="text-gray-800"><span className="font-semibold">⏰ Подано:</span> {ad.timestamp}</p>
                    {ad.phone && (
                      <a href={`tel:${ad.phone}`} className="mt-3 inline-block bg-green-600 text-white p-2 rounded-md hover:bg-green-700 w-full text-center transition duration-200" onClick={vibrate}>Позвонить</a>
                    )}
                    {userId === adminId && (
                      <button className="mt-3 w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition duration-200" onClick={() => { vibrate(); handleDeleteUserAd(ad.id); }}>Удалить</button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-gray-800 waiting-animation">⏳ Нет одобренных объявлений пользователей</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'admin' && userId === adminId && (
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Модерация объявлений</h1>
          <p className="text-center text-gray-600 mb-4">Модерация выполняется через Telegram</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {adminAds.length > 0 ? (
              adminAds.map(ad => (
                <div key={ad.id} className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 hover:shadow-xl transition duration-200">
                  {ad.images && ad.images.map((img, index) => (
                    <img key={index} src={img} alt="Apartment" className="w-full h-48 object-cover rounded-t-lg cursor-pointer" onClick={() => openModal(img)} />
                  ))}
                  {!ad.images && <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center text-gray-500">Фото отсутствует</div>}
                  <div className="p-2">
                    <p className="text-gray-800"><span className="font-semibold">🏙 Город:</span> {CITIES[ad.city]}</p>
                    <p className="text-gray-800"><span className="font-semibold">🛏️ Комнаты:</span> {ad.rooms || 'Не указано'}</p>
                    <p className="text-gray-800"><span className="font-semibold">💰 Цена:</span> {ad.price} USD</p>
                    <p className="text-gray-800"><span className="font-semibold">📍 Адрес:</span> {ad.address}</p>
                    <p className="text-gray-800"><span className="font-semibold">📝 Описание:</span> {ad.description || 'Не указано'}</p>
                    <p className="text-gray-800"><span className="font-semibold">📞 Телефон:</span> {ad.phone || 'Не указан'}</p>
                    <p className="text-gray-800"><span className="font-semibold">⏰ Подано:</span> {ad.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-gray-800 waiting-animation">⏳ Нет объявлений на модерацию</p>
              </div>
            )}
          </div>
        </div>
      )}

      {modalImage && (
        <div className="modal" onClick={closeModal}>
          <span className="close" onClick={closeModal}>×</span>
          <img className="modal-content" src={modalImage} alt="Modal" />
        </div>
      )}
    </div>
  );
}

export default App;
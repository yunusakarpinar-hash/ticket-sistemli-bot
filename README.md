🎫 Tam Ayarlanabilir Bilet Sistemi (Ticket System) Altyapısı - 
Bu proje, Discord sunucularınız için dinamik, düğme tabanlı ve komutla ayarlanabilir profesyonel bir destek/bilet sistemi kurmanızı sağlayan bir Discord.js altyapısıdır.
🌟 Özellikler
 * Komutla Ayarlama: Botu durdurup config.json'ı elle düzenlemeye gerek kalmadan, tüm kritik ayarlar (Kategori, Destek Rolü, Log Kanalı ID'leri) Discord üzerinden yönetici komutuyla ayarlanır ve kalıcı olarak kaydedilir.
 * Düğme (Button) Etkileşimi: Bilet açma ve kapatma işlemleri tamamen düğmeler üzerinden gerçekleştirilir.
 * Yetki Kontrolü: Biletleri sadece Destek Ekibi üyeleri, Yöneticiler veya biletin sahibi kapatabilir.
 * Limit Kontrolü: Bir kullanıcının aynı anda açabileceği bilet sayısı ayarlanabilir.
 * Loglama: Biletin ne zaman açıldığı, hangi kanalda olduğu ve kimin kapattığı belirlenen log kanalına detaylıca kaydedilir.
 * JSON Veritabanı: Sunucu ayarları için basit ve hızlı database.json yapısını kullanır.
 * Emojisiz ve Temiz Kod: Sade, temiz ve okunabilir bir kod yapısına sahiptir.
🛠️ Kurulum
Adım 1: Dosyaları Hazırlama
 * Bu projenin dosyalarını indirin veya kopyalayın.
 * Proje klasörünüzde terminali açın ve gerekli kütüphaneleri yükleyin:
   npm install discord.js

Adım 2: Yapılandırma (config.json)
config.json dosyasını açın ve bot tokeniniz ile ön ekinizi girin. Tüm mesajları kendi sunucu dilinize göre özelleştirebilirsiniz:
{
  "TOKEN": "SENIN_BOT_TOKENIN_BURAYA",
  "PREFIX": "!",
  "TICKET_AYARLARI": {
    "BILET_LIMITI": 3 // Bir kullanıcının aynı anda açabileceği maksimum bilet sayısı
  },
  "KOMUTLAR": {
    "PANEL_KUR": "biletpanelkur",
    "AYARLA": "biletsistemiayarla" 
  },
  // ... (Geri kalan mesaj ve embed ayarları)
}

Adım 3: Veritabanını Başlatma (database.json)
database.json dosyasının projenizin ana dizininde olduğundan ve başlangıçta aşağıdaki gibi boş olduğundan emin olun:
{
  "settings": {},
  "users": {}
}

Adım 4: Botu Çalıştırma
Terminalde botunuzu başlatın:
node index.js

🚀 Kullanım (Discord Üzerinden Ayarlama)
Botunuz çalışmaya başladıktan sonra, bilet sistemini aktif etmek için sadece iki komut kullanmanız yeterlidir.
1. Sistemi Yapılandırma (Yönetici Komutu)
Bu komut ile bilet sistemi için gerekli olan üç ana ID'yi kalıcı olarak kaydedersiniz.
| Komut | Açıklama |
|---|---|
| !biletsistemiayarla <Kategori ID> <Rol ID> <Log Kanalı ID> | Biletlerin oluşturulacağı kategoriyi, destek ekibinin rolünü ve tüm olayların loglanacağı kanalı ayarlar. |
Örnek Kullanım:
!biletsistemiayarla 123456789... 987654321... 111222333...

(ID'leri almak için Discord geliştirici modunun açık olduğundan emin olun.)
2. Bilet Panelini Kurma (Yönetici Komutu)
Ayarlar kaydedildikten sonra, kullanıcıların bilet açmak için tıklayacağı paneli istediğiniz kanala gönderin:
| Komut | Açıklama |
|---|---|
| !biletpanelkur | Komutun kullanıldığı kanala Bilet Aç düğmesinin bulunduğu Embed mesajını gönderir. |
💡 Geliştirme İpuçları
 * HTML Transkript: Kapatılan bilet kanallarını silmek yerine, mesajları toplayıp bir HTML dosyası oluşturarak log kanalına gönderebilirsiniz (Daha ileri seviye).
 * Menü (Select Menu) Kullanımı: Bilet aç düğmesine basıldığında, kullanıcıya "Genel Destek", "Şikayet" veya "Teknik Sorun" gibi seçenekler sunan bir Seçim Menüsü (Select Menu) ekleyebilirsiniz.
👤 Geliştirici
Bu altyapı bexA tarafından yapilmistir
 * Geliştirici: bexA
 * Proje Adı: Tam Ayarlanabilir Bilet Sistemi Altyapısı
<!-- end list --># ticket-sistemli-bot

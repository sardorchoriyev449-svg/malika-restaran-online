# 🍽️ Online Restaurant Database Schema

Ushbu hujjat onlayn restoran tizimining ma'lumotlar bazasi tuzilishi (Database Schemas) haqida ma'lumot beradi.

---

## 🗄️ Jadvallar Ro'yxati (Tables / Collections)

### 1. Users Table (Foydalanuvchilar)
Mijozlar va xodimlar haqidagi ma'lumotlar.

```json
{
  "id": "1234567890abc",
  "phone": "+998987654321",
  "name": "Phalonchi",
  "age": 20,
  "role": "client" // client, admin, waiter, courier
}
2. Atmosfera Table (Xizmat / Joy Joylashuvi Turi)
Buyurtma qayerda amalga oshirilayotgani (tashqari, ichkari, VIP xona yoki online).

JSON
{
  "id": "1a2b3c4d5e6f7g8l9m0n",
  "atmosfera": "tashqari" // tashqari, ichkari, xona, online buyurtma
}
3. Categorie Table (Taom Kategoriyalari)
Taomlar turkumi ro'yxati.

JSON
{
  "id": "1a2b3c4d5e6f7g8l9m0n",
  "name": "salat"
}
4. Product Table (Taomlar / Mahsulotlar)
Restorandagi barcha taomlar va ichimliklar ro'yxati.

JSON
{
  "id": "1a2b3c4d5e6f7g8l9m0n",
  "title": "Olive",
  "price": 25000,
  "categorie_id": "1a2b3c4d5e6f7g8l9m0n" // Categorie table ID siga ishora (salat)
}
5. Tables Table (Restoran Stollari va Bron Qilish)
Restorandagi stollar raqami, ularning atmosferasi va bron qilingan sanasi.

JSON
{
  "id": "1a2b3c4d5e6f7g8l9m0n",
  "atmosfera_id": "1a2b3c4d5e6f7g8l9m0n", // Atmosfera table ID si (masalan: ichkari)
  "kun": 12,
  "oy": "02",
  "yil": 2026,
  "stol_raqami": 13 // Avtomatik stol uzunligi yoki berilgan raqam
}
6. Orders Table (Buyurtmalar)
Stol yoki Online orqali berilgan asosiy buyurtma shakli.

JSON
{
  "id": "9z8y7x6w5v4u3t2s1r",
  "user_id": "1234567890abc", // Users table ID si
  "atmosfera_id": "1a2b3c4d5e6f7g8l9m0n", // Atmosfera table ID si
  "table_id": "1a2b3c4d5e6f7g8l9m0n", // Tables table ID si (agar online bo'lsa null)
  "total_price": 75000,
  "status": "pending", // pending, preparing, ready, completed, cancelled
  "created_at": "2026-02-12T14:30:00Z"
}
7. OrderItems Table (Buyurtma Tarkibi)
Har bir buyurtma ichida qaysi mahsulotdan nechta borligi.

JSON
{
  "id": "5f4e3d2c1b0a",
  "order_id": "9z8y7x6w5v4u3t2s1r", // Orders table ID si
  "product_id": "1a2b3c4d5e6f7g8l9m0n", // Product table ID si (Olive)
  "quantity": 2, // Soni
  "price": 25000 // Har birining narxi
}
🔗 Jadvallar O'rtasidagi Bog'liqlik (Relations)
Product.categorie_id ➔ Categorie.id ga bog'lanadi.

Tables.atmosfera_id ➔ Atmosfera.id ga bog'lanadi.

Orders.user_id ➔ Users.id ga bog'lanadi.

Orders.atmosfera_id ➔ Atmosfera.id ga bog'lanadi.

Orders.table_id ➔ Tables.id ga bog'lanadi (agar mijoz joyida o'tirgan bo'lsa).

OrderItems.order_id ➔ Orders.id ga bog'lanadi.

OrderItems.product_id ➔ Product.id ga bog'lanadi.


Ushbu strukturaga yana biror qo'shimcha jadval (masalan: To'lovlar yoki Chegirmalar) qo'shishni xohlaysizmi?

```

Kegan Joyimiz: 
```text
bo'ldi ishladi endi client(react) qismiga o'tamiz qanday page`lar bo'ladi:

- 3 ta asosiy ranglar bo'ladi agar buyurtmachiga ranglar yoqmasa keyinchalik rangini o'zgartiramiz mana shu ranglar:
  1. color rgb(0, 156, 135); navbar qisimda va cheka va qiralarga va ramkalar uchun ishlatiladi,
  2. color: rgb(147, 158, 0); tugma va bu xam ramkalar uchun,
  3. color: rgb(197, 197, 197); bu text uchun va orqa tomondagi yaniy body uchun rang
  4. color: rgb(22, 13, 13); bu xam text uchun

- Xar bita page`da orqaga qaytish tugmasi bo'sin va buni dizayni telefonga most bo'lishi shart va kompyuterga, universal bo'sin va emoji emas balki icon ishlat

- menu.page - menu`da taomlar va categories bo'ladi, taom tanlashdan oldin joy/atmosferaga tanlashi kerak masalan tashqari/ichkari/xona/online tanlagan joyni stolar va o'sha stolni bo'sh vaqtini tanlasin va kunini, va product-info.page - bu page aynan biron bir curd ni bosganda chiqadi rasmi, nomi, description va price, va tagidan aynan shu categories ga bog'liq product(taom)`larni chiqarsin. Vazifasi taomlar ko'rsatish qidirish va admin panelga o'tish uchun "admin panel" butten bo'ladi va "meni stolim" degan butten bo'ladi va  "buyurtmam" degan butten bo'ladi, chiqish/kirish tugmasi bo'ladi.

- "meni stolim" qismida: user-table.page - stolni nechida bant qilgani va  nimalar buyirtma berilgan va zalok puli bilan jami to'lov narxi,

- "buyurtmam" qismida: user-buyurtma.page - bu agar online tanlagan bo'sa ikkita tugma filtir bo'sin "bugungi" va "barchasi", "bugungi" - bu aynan xozir tayorlanyatgan zakaz va qachon taxminan tayor bo'lib yetkazib berishi agar buyirtma 15 daqiqadan oshmasa bekor qilish mumkin va unga yetkazyatgan kuryerni raqami va admin nomeri / yoki bironbir chat qilish mumkin chunki admin lar bilan gaplashib buyirtmani bekor qilish yoki meni buyirtmam kemadi yoki men buni aytgandim silar esa buni jo'natilaring yaniy o'zini muamosini chuntirish, "barchasi" - bu yerda barcha buyirtmalar ko'rinadi
 
- "admin panel" qisimda: user-list.page - delet va role`ni o'zgartirishi mumkin va user`ni qidirish mumkin, buyirtmalar.page - bu page`da "bugungi" user`lar buyirtmasi yaniy buyirtma berildi yetkazib bergunicha ko'rinadi va buyurtmalarni bekor qilish mumkin agar userni jidiy muamo chiqib qosa va admin bilan boglansa, va "barcha buyurtma"`larni ko'rish mumkin, maxsulotlar.page - bu page`da barcha maxsulotlarni ko'rish, qo'shish va o'zgartirish, o'chirish mumkin, kategories.page - bu page`da categories ko'rish, qo'shish va o'zgartirish, o'chirish mumkin, atmosfera.page - bu page`da joylashuv yaniy stolni qaydaligini belgilash uchun masaln stol tashqari/ichkari/xona `da, qo'shish va o'zgartirish, o'chirish mumkin va ko'rish mumkin, stol.page - bu page`da bunday bo'ladi yaratguncha birinchi tanlanadi atmosfera va stolar soni masalan 20 va xar bita stol avtomat Tabel.model 20 ta yaritiladi, menimcha tabel crud yangilaymiz shunga moslab yoki agar react o'ziga to'girla olsang shunday qil yoki yangilaymiz tabel crud`ni, joylar.page - bu page`da biz barcha joylarni ko'ramiz "tashqari","ichkari","xonalar", stolarni xozir bant`mi yoqmi yoki stolni nechida bant qilinganini ko'rish mumkin bugun bo'sh stol bormi nechida bosh ertaga bo'sh joy bormi nechida vaxakazo,
chat.page - buni ichida chad lar bo'ladi user`lar o'zini muamosini yetkazish uchun xar bitasini user-chat.page bo'ladi xar bita user bilan aloxada gaplashish uchun 

```


```text

qandaydir bug bo'lyapti masalna men 3 stolni tanlab zakazlarni aytib bo'gandan so'ng xisobdi ogandan so'ng va men sana 3 stolin tanliyman desam tanlanmayapti yaniy bunadn oldin o'tirgan stolarimga o'tirolmayapman va yana bita narsa user`ni schot ko'rsatishi chiroyli va chunarli bo'gan lekin admin paneldagi chunarsi o'sha avalgi chunarsiz schot bo'lib turipti uni xam to'girla va admin panelda xizmat xaqini qo'lga kirityatgan qili yaniy restaran o'zi xal qiladi xizmat xaqi qancha bo'lishini xozir umuman xizmat xaqi chiqmayapti xizmat xaqi foyizda bo'ladi va yana bir narsa afisant joyni bant qilganda admindan ruxsat so'ramaydi shundaysi band bo'ladi stol

```


[Nest] 19  - 09/03/2026, 4:50:10 AM   ERROR [ExceptionsHandler] Error: Yuklashda xatolik: fetch failed
    at UploadService.uploadFile (/app/dist/common/upload/upload.service.js:32:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async UploadController.upload (/app/dist/common/upload/upload.controller.js:33:21)
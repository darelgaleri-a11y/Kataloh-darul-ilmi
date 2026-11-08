import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'katalog_pondok.db');
export const db = new Database(dbPath);

// Enable WAL mode for better performance & concurrent reads
db.pragma('journal_mode = WAL');

// Helper to hash password
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(calculatedHash));
}

// Initialize tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'Package',
      badge_color TEXT DEFAULT 'emerald',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_desc TEXT,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      original_price INTEGER,
      unit TEXT DEFAULT 'pcs',
      stock INTEGER DEFAULT 10,
      status TEXT DEFAULT 'available',
      image_url TEXT NOT NULL,
      gallery TEXT,
      unit_usaha TEXT,
      specs TEXT,
      is_featured INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      inquiry_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      actor TEXT DEFAULT 'Administrator',
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Seed default settings if empty
  const settingsCount = (db.prepare('SELECT count(*) as count FROM settings').get() as { count: number }).count;
  if (settingsCount === 0) {
    const defaultSettings: Record<string, string> = {
      app_name: 'Katalog Pondok',
      tagline: 'Etalase Karya Mandiri & Produk Unggulan Santri Pesantren',
      description: 'Platform katalog digital resmi karya santri dan unit usaha pondok pesantren. Menyediakan busana muslim, kitab kuning, madu murni, herbal thibbun nabawi, kerajinan seni kaligrafi, dan aneka hasil olahan santri yang berkualitas dan berkah.',
      whatsapp_number: '6281234567890',
      email: 'katalog@pesantrenpondok.id',
      address: 'Kompleks Pesantren Terpadu, Jl. KH. Hasyim Asy\'ari No. 45, Jawa Timur 61471',
      open_hours: 'Setiap Hari 08.00 - 21.00 WIB',
      bank_info: 'BSI (Bank Syariah Indonesia) No. Rek: 7188-2938-19 a.n. Koperasi Usaha Pondok Pesantren',
      logo_url: '',
      announcement: 'Dapatkan diskon spesial Rilisan Karya Santri & Infaq Pembinaan Pesantren untuk setiap pembelian!',
      pondok_name: 'Pondok Pesantren Darul Barakah'
    };

    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(defaultSettings)) {
      insertSetting.run(key, value);
    }
  }

  // Seed default admin if none exists
  const adminCount = (db.prepare('SELECT count(*) as count FROM users WHERE username = ?').get('admin') as { count: number }).count;
  if (adminCount === 0) {
    const { hash, salt } = hashPassword('adminpondok123');
    db.prepare(`
      INSERT INTO users (username, password_hash, salt, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin', hash, salt, 'Pengurus Koperasi Pondok', 'admin', new Date().toISOString());

    db.prepare(`
      INSERT INTO activity_logs (action, detail, actor, timestamp)
      VALUES (?, ?, ?, ?)
    `).run('INIT_SYSTEM', 'Inisialisasi sistem database Katalog Pondok dan pembuatan akun admin awal', 'Sistem', new Date().toISOString());
  }

  // Seed default categories if empty
  const categoryCount = (db.prepare('SELECT count(*) as count FROM categories').get() as { count: number }).count;
  if (categoryCount === 0) {
    const initialCategories = [
      {
        name: 'Kitab & Buku Pesantren',
        slug: 'kitab-dan-buku',
        description: 'Kitab kuning makna pethuk/gandul, terjemah, buku keislaman & kajian karya asatidz pondok.',
        icon: 'BookOpen',
        badge_color: 'amber'
      },
      {
        name: 'Busana & Perlengkapan Sholat',
        slug: 'busana-muslim',
        description: 'Sarung tenun goyor santri, peci bordir khas, gamis ikhwan, jilbab syar\'i santriwati.',
        icon: 'Shirt',
        badge_color: 'emerald'
      },
      {
        name: 'Madu & Herbal Nabawi',
        slug: 'madu-herbal',
        description: 'Madu hutan liar murni, habbatussauda, minyak zaitun, sari kurma binaan laboratorium santri.',
        icon: 'Sparkles',
        badge_color: 'teal'
      },
      {
        name: 'Kopi & Olahan Kuliner',
        slug: 'kopi-kuliner',
        description: 'Kopi robusta sangrai lereng pondok, teh herbal, keripik tempe renyah santri.',
        icon: 'Coffee',
        badge_color: 'orange'
      },
      {
        name: 'Karya Kaligrafi & Kerajinan',
        slug: 'kaligrafi-kerajinan',
        description: 'Hiasan dinding ukir kayu jati kaligrafi arab, tasbih kayu galih asem, souvenir pondok.',
        icon: 'Palette',
        badge_color: 'indigo'
      },
      {
        name: 'Alat Tulis & Atribut Santri',
        slug: 'alat-tulis-atribut',
        description: 'Buku qiroati, pulpen gandul kalam, tas laptop serbaguna, stiker motivasi islami.',
        icon: 'Bookmark',
        badge_color: 'slate'
      }
    ];

    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, description, icon, badge_color, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const cat of initialCategories) {
      insertCat.run(cat.name, cat.slug, cat.description, cat.icon, cat.badge_color, new Date().toISOString());
    }
  }

  // Seed sample rich pesantren products if empty
  const productCount = (db.prepare('SELECT count(*) as count FROM products').get() as { count: number }).count;
  if (productCount === 0) {
    const cats = db.prepare('SELECT id, slug FROM categories').all() as { id: number; slug: string }[];
    const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

    const sampleProducts = [
      {
        category_id: catMap['kitab-dan-buku'],
        name: 'Kitab Fathul Qorib Al-Mujib (Makna Gandul Pegon Jawa Lengkap)',
        slug: 'kitab-fathul-qorib-makna-pegon',
        short_desc: 'Kitab fiqih standar madzhab Syafi\'i berharokat jelas dengan terjemah makna pegon jawa karya asatidz pondok.',
        description: 'Kitab Fathul Qorib Al-Mujib syarah dari Ghoyah wa Taqrib karangan Al-Qadhi Abu Syuja\'. Dicetak dengan kertas kuning berkualitas tinggi (kertas QPP) yang nyaman di mata, font jelas berharokat, serta dilengkapi syarah makna gandul pegon bahasa Jawa halus untuk memudahkan talaqqi para santri dan muta\'allimin.',
        price: 45000,
        original_price: 55000,
        unit: 'buku',
        stock: 35,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        unit_usaha: 'Percetakan & Maktabah Pondok',
        specs: JSON.stringify({
          'Penulis / Pensyarah': 'Ibnu Qosim Al-Ghazi',
          'Jenis Kertas': 'Kuning Bookpaper QPP 60gsm',
          'Tebal Halaman': '128 Halaman',
          'Ukuran': 'B5 (17.6 x 25 cm)',
          'Bahasa': 'Arab Berharokat & Pegon Jawa'
        }),
        is_featured: 1
      },
      {
        category_id: catMap['busana-muslim'],
        name: 'Sarung Tenun Goyor Hand-Woven Santri Klasik Premium',
        slug: 'sarung-tenun-goyor-santri-premium',
        short_desc: 'Sarung tenun ATBM asli karya tangan santri dengan motif maroko eksklusif, adem dan jatuh.',
        description: 'Sarung Tenun Goyor diproduksi secara tradisional menggunakan Alat Tenun Bukan Mesin (ATBM) oleh para santri dan warga binaan pondok. Bahan rayon viscose berkualitas tinggi yang memberikan sensasi dingin di cuaca panas dan hangat di malam hari. Motif geometric etnik bernilai seni tinggi, jahitan tengah rapi dan kuat.',
        price: 195000,
        original_price: 240000,
        unit: 'helai',
        stock: 18,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        unit_usaha: 'Sentra Tenun Santri Mandiri',
        specs: JSON.stringify({
          'Bahan': '100% Rayon Viscose Khusus Goyor',
          'Metode Pembuatan': 'Tenun Tangan ATBM Asli',
          'Ukuran Dewasa': 'Panjang 125 cm, Lingkar 210 cm',
          'Karakteristik': 'Adem, jatuh, tidak kusut, lembut'
        }),
        is_featured: 1
      },
      {
        category_id: catMap['madu-herbal'],
        name: 'Madu Hutan Liar Murni Al-Barakah (Nektar Multiflora 500gr)',
        slug: 'madu-hutan-murni-al-barakah-500g',
        short_desc: 'Madu murni alami 100% dari lebah Apis Dorsata hutan pedalaman tanpa pemanasan dan tanpa campuran.',
        description: 'Madu Murni Al-Barakah dipanen langsung dari sarang lebah hutan liar oleh tim santri pecinta alam yang terlatih. Diproses secara higienis dengan sistem tiris dingin (cold extraction) sehingga enzim diastase, royal jelly, bee pollen, dan antioksidan tetap utuh terjaga. Telah diuji lab dan berkhasiat meningkatkan daya tahan tubuh serta stamina.',
        price: 95000,
        original_price: 115000,
        unit: 'botol',
        stock: 42,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        unit_usaha: 'Unit Usaha Agro Santri Barakah',
        specs: JSON.stringify({
          'Jenis Madu': 'Raw Forest Honey (Madu Mentah Hutan)',
          'Lebah': 'Apis Dorsata (Lebah Liar)',
          'Berat Bersih': '500 gram (kemasan botol higienis food grade)',
          'PIRT / Izin': 'P-IRT No. 2093507010234-26',
          'Masa Simpan': '24 Bulan di suhu ruang'
        }),
        is_featured: 1
      },
      {
        category_id: catMap['kopi-kuliner'],
        name: 'Kopi Robusta Lereng Pondok Sangrai Tradisional (Petik Merah 250gr)',
        slug: 'kopi-robusta-lereng-pondok-250g',
        short_desc: 'Biji kopi pilihan petik merah hasil kebun perkebunan pondok, di-roasting dengan kayu kopi.',
        description: 'Kopi Robusta Lereng Pondok merupakan hasil panen perkebunan binaan pesantren di lereng gunung. Biji kopi dipetik saat merah matang sempurna (full red cherry), diproses semi-wash, dan disangrai secara tradisional dengan tingkat medium-dark roast. Menghasilkan aroma karamel gurih, dark chocolate note, dan body yang tebal tanpa asam berlebih.',
        price: 48000,
        original_price: 55000,
        unit: 'pack',
        stock: 50,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
        unit_usaha: 'Kopontren Kopi Santri',
        specs: JSON.stringify({
          'Origin': 'Lereng Gunung Wilis & Kelud Pesantren',
          'Varietas': 'Robusta Fine Selection',
          'Roast Level': 'Medium Dark Roast',
          'Pilihan Giling': 'Bubuk Halus (Fine) untuk Kopi Tubruk',
          'Kemasan': 'Aluminium Foil Gusset with One-Way Valve'
        }),
        is_featured: 1
      },
      {
        category_id: catMap['kaligrafi-kerajinan'],
        name: 'Kaligrafi Ukir Kayu Jati "Ayat Kursi" Finishing Natural Melamine',
        slug: 'kaligrafi-kayu-jati-ayat-kursi',
        short_desc: 'Karya seni ukir kayu jati TPK perhutani berukirkan khat tsuluts ayat kursi pahatan santri kaligrafer.',
        description: 'Karya seni religius dinding kelas premium berukirkan bacaan Ayat Kursi dengan gaya kaligrafi Khat Tsuluts yang anggun. Dipahat manual secara teliti dan presisi oleh santri senior sanggar seni rupa pesantren menggunakan kayu jati perhutani tua berkualitas tinggi yang awet puluhan tahun, anti rayap, dan berlapisan finishing glossy melamine yang elegan.',
        price: 650000,
        original_price: 800000,
        unit: 'set',
        stock: 6,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        unit_usaha: 'Sanggar Seni Kaligrafi Al-Fann Pondok',
        specs: JSON.stringify({
          'Material': 'Kayu Jati Solid Pilihan',
          'Dimensi': '105 cm x 55 cm x 3 cm',
          'Gaya Khat': 'Tsuluts Jaly Klasik',
          'Finishing': 'Natural Walnut Wood Melamine Glossy',
          'Gantungan': 'Besi Kuat siap dipajang di dinding'
        }),
        is_featured: 1
      },
      {
        category_id: catMap['busana-muslim'],
        name: 'Peci Songkok Hitam Beludru Halus Santri Bordir Logo Pondok',
        slug: 'peci-songkok-hitam-beludru-santri',
        short_desc: 'Songkok nasional beludru kontesa super dengan ventilasi AC atas, nyaman dan tegak elegan.',
        description: 'Peci / Songkok Nasional berbahan beludru hitam pekat super halus yang nyaman dipakai berjam-jam saat ngaji maupun ibadah. Dilengkapi ventilasi udara (AC) di ujung atas sehingga tidak panas dan tidak menimbulkan gerah di kepala. Jahitan stik balik yang kokoh menjamin bentuk peci tetap tegak rapi.',
        price: 55000,
        original_price: 65000,
        unit: 'buah',
        stock: 60,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        unit_usaha: 'Konveksi Busana Santri Barakah',
        specs: JSON.stringify({
          'Material': 'Beludru Contessa Super Premium',
          'Tinggi Peci': 'Tinggi 9 cm (Standar Nasional)',
          'Nomor Ukuran': 'Tersedia No. 5 sampai No. 9',
          'Fitur': 'Double Mesh AC Ventilasi bagian atas'
        }),
        is_featured: 0
      },
      {
        category_id: catMap['madu-herbal'],
        name: 'Minyak Habbatussauda Murni Kapsul Cold-Pressed (Isi 100 Butir)',
        slug: 'kapsul-minyak-habbatussauda-100',
        short_desc: 'Ekstrak jintan hitam murni habbasyi cold pressed dalam kapsul gelatin halal bersertifikat.',
        description: 'Herbal thibbun nabawi minyak biji jintan hitam (Nigella Sativa) asal Ethiopia (Habbasyi) yang diperas tanpa pemanasan (cold pressed). Bermanfaat memperkuat imunitas tubuh, menurunkan kolesterol jahat, mengontrol gula darah, serta membantu proses pemulihan stamina tubuh sesuai anjuran sunnah.',
        price: 65000,
        original_price: 75000,
        unit: 'botol',
        stock: 30,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
        unit_usaha: 'Laboratorium Herbal Santri Thibbun Nabawi',
        specs: JSON.stringify({
          'Komposisi': '100% Pure Black Seed Oil (Nigella Sativa)',
          'Isi Kemasan': '100 Kapsul Gelatin Halal MUI',
          'Aturan Pakai': 'Pencegahan: 2x1 kapsul, Pengobatan: 2x2 kapsul',
          'POM TR': 'POM TR. 183 318 451'
        }),
        is_featured: 0
      },
      {
        category_id: catMap['kitab-dan-buku'],
        name: 'Buku Terjemah Risalatul Mahidh & Fiqih Wanita Muslimah',
        slug: 'buku-risalatul-mahidh-fiqih-wanita',
        short_desc: 'Panduan lengkap dan praktis seputar darah kebiasaan wanita muslimah berdasarkan madzhab Syafi\'i.',
        description: 'Buku pegangan wajib bagi santriwati dan muslimah yang mengupas tuntas bab darah haid, nifas, dan istihadhah disertai diagram skema perhitungan hari dan tabel praktis. Disusun secara sistematis oleh tim pengajar pondok pesantren putri agar mudah dipahami masyarakat umum.',
        price: 32000,
        original_price: 38000,
        unit: 'buku',
        stock: 45,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
        unit_usaha: 'Maktabah Pondok Pesantren Putri',
        specs: JSON.stringify({
          'Penyusun': 'Majelis Taklim Ustadzat Pondok',
          'Jumlah Halaman': '144 Halaman',
          'Cover': 'Softcover Doff Emboss',
          'Bahasa': 'Bahasa Indonesia dengan Dalil Arab'
        }),
        is_featured: 1
      }
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (
        category_id, name, slug, short_desc, description, price, original_price,
        unit, stock, status, image_url, gallery, unit_usaha, specs,
        is_featured, views, inquiry_count, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    const now = new Date().toISOString();
    for (const prod of sampleProducts) {
      insertProd.run(
        prod.category_id,
        prod.name,
        prod.slug,
        prod.short_desc,
        prod.description,
        prod.price,
        prod.original_price,
        prod.unit,
        prod.stock,
        prod.status,
        prod.image_url,
        JSON.stringify([prod.image_url]),
        prod.unit_usaha,
        prod.specs,
        prod.is_featured,
        Math.floor(Math.random() * 80) + 20,
        Math.floor(Math.random() * 15) + 3,
        now,
        now
      );
    }

    db.prepare(`
      INSERT INTO activity_logs (action, detail, actor, timestamp)
      VALUES (?, ?, ?, ?)
    `).run('INIT_PRODUCTS', 'Mengisi data awal produk katalog karya santri dan unit usaha pondok', 'Sistem', now);
  }
}

// Call initialization
initDatabase();

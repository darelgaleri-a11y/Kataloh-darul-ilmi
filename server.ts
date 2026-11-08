import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, hashPassword, verifyPassword } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase JSON payload limit to handle base64 image uploads smoothly
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directory exists
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// --- Auth Helper & Middleware ---
interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; name: string; role: string };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sesi tidak valid atau belum login' });
    return;
  }

  const token = authHeader.substring(7);
  const now = Date.now();

  const session = db.prepare(`
    SELECT s.token, s.expires_at, u.id, u.username, u.name, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, now) as { id: number; username: string; name: string; role: string } | undefined;

  if (!session) {
    res.status(401).json({ error: 'Sesi telah berakhir atau token tidak sah' });
    return;
  }

  req.user = {
    id: session.id,
    username: session.username,
    name: session.name,
    role: session.role
  };
  next();
}

function logActivity(action: string, detail: string, actor: string = 'Administrator') {
  try {
    db.prepare(`
      INSERT INTO activity_logs (action, detail, actor, timestamp)
      VALUES (?, ?, ?, ?)
    `).run(action, detail, actor, new Date().toISOString());
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// ----------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------

// Initial data for homepage & general layout
app.get('/api/public/initial', (req: Request, res: Response) => {
  try {
    const rawSettings = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const s of rawSettings) {
      settings[s.key] = s.value;
    }

    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status != 'out_of_stock'
      GROUP BY c.id
      ORDER BY c.id ASC
    `).all();

    const featuredProducts = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = 1
      ORDER BY p.id DESC
      LIMIT 8
    `).all();

    const latestProducts = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
      LIMIT 8
    `).all();

    const stats = {
      totalProducts: (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count,
      totalCategories: (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count,
      totalUnits: (db.prepare('SELECT COUNT(DISTINCT unit_usaha) as count FROM products WHERE unit_usaha IS NOT NULL').get() as { count: number }).count,
    };

    res.json({
      settings,
      categories,
      featuredProducts,
      latestProducts,
      stats
    });
  } catch (err: any) {
    console.error('Error fetching initial public data:', err);
    res.status(500).json({ error: 'Gagal memuat data katalog' });
  }
});

// Get Categories with count
app.get('/api/public/categories', (req: Request, res: Response) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memuat kategori' });
  }
});

// Get Products with filtering, sorting, pagination
app.get('/api/public/products', (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      status,
      unit_usaha,
      sort = 'newest',
      featured,
      page = '1',
      limit = '12'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: any[] = [];

    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      conditions.push('(p.name LIKE ? OR p.short_desc LIKE ? OR p.description LIKE ? OR p.unit_usaha LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category && typeof category === 'string' && category.trim()) {
      // Can be category id or slug
      if (!isNaN(Number(category))) {
        conditions.push('p.category_id = ?');
        params.push(Number(category));
      } else {
        conditions.push('c.slug = ?');
        params.push(category.trim());
      }
    }

    if (status && typeof status === 'string' && status.trim()) {
      conditions.push('p.status = ?');
      params.push(status.trim());
    }

    if (unit_usaha && typeof unit_usaha === 'string' && unit_usaha.trim()) {
      conditions.push('p.unit_usaha = ?');
      params.push(unit_usaha.trim());
    }

    if (featured === '1' || featured === 'true') {
      conditions.push('p.is_featured = 1');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.id DESC';
    if (sort === 'oldest') orderBy = 'p.id ASC';
    else if (sort === 'price_asc') orderBy = 'p.price ASC';
    else if (sort === 'price_desc') orderBy = 'p.price DESC';
    else if (sort === 'name_asc') orderBy = 'p.name ASC';
    else if (sort === 'popular') orderBy = 'p.views DESC';

    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const totalCount = (db.prepare(countSql).get(...params) as { total: number }).total;

    const productsSql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(productsSql).all(...params, limitNum, offset);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (err: any) {
    console.error('Error in /api/public/products:', err);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});

// Get Single Product by Slug (or ID) + Related Products + View Increment
app.get('/api/public/products/:slugOrId', (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    let product;

    if (!isNaN(Number(slugOrId))) {
      product = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `).get(Number(slugOrId)) as any;
    } else {
      product = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ?
      `).get(slugOrId) as any;
    }

    if (!product) {
      res.status(404).json({ error: 'Produk tidak ditemukan' });
      return;
    }

    // Increment views asynchronously
    try {
      db.prepare('UPDATE products SET views = views + 1 WHERE id = ?').run(product.id);
    } catch {}

    // Fetch related products from same category
    const relatedProducts = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ?
      ORDER BY p.views DESC
      LIMIT 4
    `).all(product.category_id, product.id);

    res.json({
      product,
      relatedProducts
    });
  } catch (err: any) {
    console.error('Error fetching product detail:', err);
    res.status(500).json({ error: 'Gagal mengambil detail produk' });
  }
});

// Increment Inquiry Counter (WhatsApp click)
app.post('/api/public/inquiry/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    db.prepare('UPDATE products SET inquiry_count = inquiry_count + 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mencatat data inquiry' });
  }
});

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username dan password wajib diisi' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim()) as any;
    if (!user) {
      res.status(401).json({ error: 'Username atau password tidak cocok' });
      return;
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      res.status(401).json({ error: 'Username atau password tidak cocok' });
      return;
    }

    // Generate Session Token (valid for 3 days)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3 * 24 * 60 * 60 * 1000;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, user.id, expiresAt, nowIso);

    logActivity('LOGIN_ADMIN', `Administrator '${user.username}' berhasil masuk ke sistem`, user.name);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Error in login:', err);
    res.status(500).json({ error: 'Terjadi kesalahan sistem saat autentikasi' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal logout' });
  }
});

// ----------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT (PROTECTED)
// ----------------------------------------------------

// Dashboard stats & activity
app.get('/api/admin/dashboard', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalProducts = (db.prepare('SELECT COUNT(*) as c FROM products').get() as any).c;
    const totalCategories = (db.prepare('SELECT COUNT(*) as c FROM categories').get() as any).c;
    const totalAvailable = (db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'available'").get() as any).c;
    const totalLowStock = (db.prepare('SELECT COUNT(*) as c FROM products WHERE stock <= 5').get() as any).c;
    const totalInquiries = (db.prepare('SELECT SUM(inquiry_count) as c FROM products').get() as any).c || 0;
    const totalViews = (db.prepare('SELECT SUM(views) as c FROM products').get() as any).c || 0;
    
    // Total catalog asset estimation
    const catalogValue = (db.prepare('SELECT SUM(price * stock) as total FROM products').get() as any).total || 0;

    const recentProducts = db.prepare(`
      SELECT p.id, p.name, p.slug, p.price, p.stock, p.status, p.image_url, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
      LIMIT 5
    `).all();

    const lowStockProducts = db.prepare(`
      SELECT p.id, p.name, p.stock, p.unit, p.price, p.status, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.stock <= 5
      ORDER BY p.stock ASC
      LIMIT 5
    `).all();

    const categoryDistribution = db.prepare(`
      SELECT c.name, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY count DESC
    `).all();

    const recentActivities = db.prepare(`
      SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10
    `).all();

    res.json({
      metrics: {
        totalProducts,
        totalCategories,
        totalAvailable,
        totalLowStock,
        totalInquiries,
        totalViews,
        catalogValue
      },
      recentProducts,
      lowStockProducts,
      categoryDistribution,
      recentActivities
    });
  } catch (err: any) {
    console.error('Error fetching admin dashboard:', err);
    res.status(500).json({ error: 'Gagal memuat ringkasan dashboard' });
  }
});

// Admin Product Management
app.get('/api/admin/products', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `).all();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengambil daftar produk' });
  }
});

app.post('/api/admin/products', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      category_id,
      name,
      short_desc,
      description,
      price,
      original_price,
      unit = 'pcs',
      stock = 10,
      status = 'available',
      image_url,
      gallery,
      unit_usaha,
      specs,
      is_featured = 0
    } = req.body;

    if (!name || !category_id || price === undefined || !image_url) {
      res.status(400).json({ error: 'Nama produk, kategori, harga, dan gambar utama wajib diisi' });
      return;
    }

    // Auto-generate clean slug
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) baseSlug = 'produk-' + Date.now();

    // Check slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while ((db.prepare('SELECT COUNT(*) as c FROM products WHERE slug = ?').get(slug) as any).c > 0) {
      slug = `${baseSlug}-${counter++}`;
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO products (
        category_id, name, slug, short_desc, description, price, original_price,
        unit, stock, status, image_url, gallery, unit_usaha, specs,
        is_featured, views, inquiry_count, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, 0, 0, ?, ?
      )
    `).run(
      category_id,
      name.trim(),
      slug,
      short_desc ? short_desc.trim() : '',
      description ? description.trim() : '',
      Math.max(0, parseInt(price, 10)),
      original_price ? Math.max(0, parseInt(original_price, 10)) : null,
      unit,
      Math.max(0, parseInt(stock, 10)),
      status,
      image_url,
      typeof gallery === 'string' ? gallery : JSON.stringify(gallery || [image_url]),
      unit_usaha ? unit_usaha.trim() : '',
      typeof specs === 'string' ? specs : JSON.stringify(specs || {}),
      is_featured ? 1 : 0,
      now,
      now
    );

    logActivity('TAMBAH_PRODUK', `Menambahkan produk baru: "${name}"`, req.user?.name);

    res.status(201).json({
      success: true,
      productId: result.lastInsertRowid,
      slug
    });
  } catch (err: any) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Gagal menyimpan produk baru' });
  }
});

app.put('/api/admin/products/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Produk tidak ditemukan' });
      return;
    }

    const {
      category_id,
      name,
      short_desc,
      description,
      price,
      original_price,
      unit,
      stock,
      status,
      image_url,
      gallery,
      unit_usaha,
      specs,
      is_featured
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE products SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        short_desc = COALESCE(?, short_desc),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        original_price = ?,
        unit = COALESCE(?, unit),
        stock = COALESCE(?, stock),
        status = COALESCE(?, status),
        image_url = COALESCE(?, image_url),
        gallery = COALESCE(?, gallery),
        unit_usaha = COALESCE(?, unit_usaha),
        specs = COALESCE(?, specs),
        is_featured = COALESCE(?, is_featured),
        updated_at = ?
      WHERE id = ?
    `).run(
      category_id,
      name?.trim(),
      short_desc?.trim(),
      description?.trim(),
      price !== undefined ? Math.max(0, parseInt(price, 10)) : undefined,
      original_price !== undefined ? (original_price ? Math.max(0, parseInt(original_price, 10)) : null) : existing.original_price,
      unit,
      stock !== undefined ? Math.max(0, parseInt(stock, 10)) : undefined,
      status,
      image_url,
      gallery ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : undefined,
      unit_usaha?.trim(),
      specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : undefined,
      is_featured !== undefined ? (is_featured ? 1 : 0) : undefined,
      now,
      id
    );

    logActivity('UPDATE_PRODUK', `Memperbarui data produk: "${name || existing.name}" (ID #${id})`, req.user?.name);

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Gagal memperbarui produk' });
  }
});

app.delete('/api/admin/products/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT name FROM products WHERE id = ?').get(id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Produk tidak ditemukan' });
      return;
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    logActivity('HAPUS_PRODUK', `Menghapus produk: "${existing.name}" (ID #${id})`, req.user?.name);

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Gagal menghapus produk' });
  }
});

// Admin Category Management
app.post('/api/admin/categories', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, icon = 'Package', badge_color = 'emerald' } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Nama kategori wajib diisi' });
      return;
    }

    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) baseSlug = 'kategori-' + Date.now();

    let slug = baseSlug;
    let counter = 1;
    while ((db.prepare('SELECT COUNT(*) as c FROM categories WHERE slug = ?').get(slug) as any).c > 0) {
      slug = `${baseSlug}-${counter++}`;
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, icon, badge_color, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name.trim(), slug, description ? description.trim() : '', icon, badge_color, now);

    logActivity('TAMBAH_KATEGORI', `Menambahkan kategori baru: "${name}"`, req.user?.name);

    res.status(201).json({ success: true, categoryId: result.lastInsertRowid, slug });
  } catch (err: any) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Gagal membuat kategori baru' });
  }
});

app.put('/api/admin/categories/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, icon, badge_color } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Nama kategori tidak boleh kosong' });
      return;
    }

    db.prepare(`
      UPDATE categories SET
        name = ?,
        description = ?,
        icon = COALESCE(?, icon),
        badge_color = COALESCE(?, badge_color)
      WHERE id = ?
    `).run(name.trim(), description ? description.trim() : '', icon, badge_color, id);

    logActivity('UPDATE_KATEGORI', `Memperbarui kategori: "${name}" (ID #${id})`, req.user?.name);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memperbarui kategori' });
  }
});

app.delete('/api/admin/categories/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Check if products still use this category
    const productCount = (db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ?').get(id) as any).c;
    if (productCount > 0) {
      res.status(400).json({
        error: `Tidak dapat menghapus kategori. Masih terdapat ${productCount} produk dalam kategori ini. Pindahkan atau hapus produk terlebih dahulu.`
      });
      return;
    }

    const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(id) as any;
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    logActivity('HAPUS_KATEGORI', `Menghapus kategori: "${cat?.name || id}"`, req.user?.name);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menghapus kategori' });
  }
});

// Admin Settings
app.get('/api/admin/settings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const raw = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const item of raw) {
      settings[item.key] = item.value;
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memuat pengaturan' });
  }
});

app.put('/api/admin/settings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const settingsObj = req.body;
    if (!settingsObj || typeof settingsObj !== 'object') {
      res.status(400).json({ error: 'Data pengaturan tidak valid' });
      return;
    }

    const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const updateTransaction = db.transaction((entries: [string, string][]) => {
      for (const [k, v] of entries) {
        upsert.run(k, String(v ?? ''));
      }
    });

    updateTransaction(Object.entries(settingsObj));
    logActivity('UPDATE_PENGATURAN', 'Memperbarui informasi identitas dan konfigurasi Katalog Pondok', req.user?.name);

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: 'Gagal menyimpan pengaturan' });
  }
});

// Change Password
app.post('/api/admin/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      res.status(400).json({ error: 'Password saat ini dan password baru harus diisi' });
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json({ error: 'Password baru minimal 6 karakter' });
      return;
    }

    const userId = req.user!.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!verifyPassword(current_password, user.password_hash, user.salt)) {
      res.status(400).json({ error: 'Password saat ini tidak cocok' });
      return;
    }

    const { hash, salt } = hashPassword(new_password);
    db.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').run(hash, salt, userId);

    logActivity('GANTI_PASSWORD', `Administrator '${user.username}' telah memperbarui kata sandi akun`, user.name);

    res.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengubah password' });
  }
});

// Image Upload API (Supports base64 payload to local file in /public/uploads)
app.post('/api/admin/upload', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      res.status(400).json({ error: 'Data gambar tidak ditemukan' });
      return;
    }

    // Match data URI pattern
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a full URL, return it
      if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
        res.json({ url: base64Data });
        return;
      }
      res.status(400).json({ error: 'Format data gambar tidak valid (harus data URL base64)' });
      return;
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Determine extension
    let ext = 'jpg';
    if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';
    else if (mimeType === 'image/jpeg') ext = 'jpg';
    else if (mimeType === 'image/svg+xml') ext = 'svg';

    const cleanName = (filename || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30);
    const uniqueFilename = `${cleanName}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;
    res.json({ url: publicUrl, filename: uniqueFilename });
  } catch (err: any) {
    console.error('Error handling upload:', err);
    res.status(500).json({ error: 'Gagal mengunggah gambar' });
  }
});

// Activity logs endpoint
app.get('/api/admin/logs', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 50').all();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengambil log aktivitas' });
  }
});

// ----------------------------------------------------
// DEV / PROD SERVER SETUP (VITE MIDDLEWARE)
// ----------------------------------------------------

async function startServer() {
  if (!isProduction) {
    // In dev, attach Vite middleware to Express
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist assets and fallback to index.html
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KATALOG PONDOK] Server running on http://0.0.0.0:${PORT} (${isProduction ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

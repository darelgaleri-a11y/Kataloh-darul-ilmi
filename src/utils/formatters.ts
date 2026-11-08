export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Hubungi Kami';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('id-ID').format(val || 0);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function cleanPhoneNumber(phone: string): string {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned || '6281234567890';
}

export function generateWhatsAppMessage(
  productName: string,
  price: number,
  slug: string,
  pondokName: string = 'Katalog Pondok'
): string {
  const formattedPrice = formatRupiah(price);
  const currentUrl = window.location.origin + '/produk/' + slug;
  return `Assalamu'alaikum Warahmatullahi Wabarakatuh, Admin ${pondokName}.

Saya tertarik untuk memesan produk karya santri berikut:
*Nama Produk:* ${productName}
*Harga:* ${formattedPrice}
*Tautan Produk:* ${currentUrl}

Mohon informasi mengenai ketersediaan stok, ongkos kirim, dan nomor rekening untuk proses pemesanan. Terima kasih. Wassalam.`;
}

export function buildWhatsAppUrl(phoneNumber: string, text: string): string {
  const phone = cleanPhoneNumber(phoneNumber);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export type Service = {
  name: string;
  price: number;
  note?: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  summary: string;
  services: Service[];
};

export const contact = {
  phoneDisplay: "+62 852 8313 7717",
  whatsapp: "6285283137717",
  nurse: "Ns. Puput",
};

export const categories: ServiceCategory[] = [
  {
    id: "infus",
    name: "Layanan infus",
    summary: "Pilihan layanan infus sesuai kebutuhan kunjungan.",
    services: [
      { name: "Infus Vitamin C 500", price: 225000 },
      { name: "Infus Vitamin C 1000", price: 245000 },
      { name: "Infus Vitamin B Kompleks", price: 250000 },
      { name: "Infus Vitamin C & B Kompleks", price: 325000, note: "Vitamin C 500 + B Kompleks (B1, B6, B12)" },
      { name: "Infus Extra Vitamin C & B Kompleks", price: 350000, note: "Vitamin C 1000 + B Kompleks (B1, B6, B12)" },
      { name: "Infus Multivitamin Viviena-9", price: 450000, note: "9 multivitamin: Vitamin C + B1, B2, B3, B5, B6, B7, B9, B12" },
      { name: "Infus Extra Multivitamin Cernevit", price: 650000, note: "12 multivitamin: Vitamin A, D3, E, C + B1, B2, B3, B5, B6, B7, B9, B12" },
      { name: "Infus Whitening & Multivitamin", price: 1250000 },
      { name: "Infus Demam", price: 150000 },
      { name: "Infus Rehidrasi / Dehidrasi", price: 150000 },
    ],
  },
  {
    id: "suntik",
    name: "Layanan suntik",
    summary: "Layanan suntik dan paket seperti tercantum pada flyer.",
    services: [
      { name: "Suntik Vitamin C 500", price: 215000 },
      { name: "Suntik Vitamin C 1000", price: 225000 },
      { name: "Suntik Vitamin B Kompleks", price: 245000, note: "B1, B6, B12" },
      { name: "Suntik Anti Alergi", price: 185000 },
      { name: "Suntik Pereda Nyeri", price: 185000 },
      { name: "Suntik Anti Radang", price: 185000 },
      { name: "Suntik Anti Mual", price: 185000 },
      { name: "Suntik Asam Lambung / GERD", price: 200000 },
      { name: "Suntik (Bundle) Anti Mual & Asam Lambung / GERD", price: 300000 },
      { name: "Suntik (Extra Bundle) Pereda Nyeri, Mual & Asam Lambung / GERD", price: 350000 },
      { name: "Jasa Infus / Suntik saja (tanpa obat)", price: 166500 },
    ],
  },
  {
    id: "cek-darah",
    name: "Cek darah",
    summary: "Pemeriksaan sederhana yang tersedia pada flyer.",
    services: [
      { name: "Gula Darah Sewaktu (GDS)", price: 35000 },
      { name: "Asam Urat", price: 40000 },
      { name: "Kolesterol Total", price: 45000 },
      { name: "Cek Darah Bundle: GDS + Asam Urat + Kolesterol Total", price: 120000 },
    ],
  },
  {
    id: "ngt",
    name: "Layanan NGT",
    summary: "Pemasangan, pemberian makan, dan pelepasan NGT.",
    services: [
      { name: "Pemasangan NGT", price: 300000 },
      { name: "Pemberian Makan lewat NGT", price: 100000 },
      { name: "Pelepasan NGT", price: 300000 },
    ],
  },
  {
    id: "luka",
    name: "Perawatan luka",
    summary: "Pilihan perawatan luka berdasarkan jenis perawatan.",
    services: [
      { name: "Perawatan Luka Pasca Operasi", price: 300000 },
      { name: "Perawatan Luka Kronis", price: 300000 },
      { name: "Perawatan Luka Caesar", price: 300000 },
      { name: "Perawatan Luka Tekan / Decubitus", price: 285000 },
      { name: "Perawatan Luka Bakar", price: 285000 },
      { name: "Perawatan Luka Diabetes", price: 285000 },
      { name: "Perawatan Luka Kecelakaan", price: 285000 },
      { name: "Perawatan Luka Umum", price: 150000 },
      { name: "Perawatan Buka Jahitan", price: 150000 },
    ],
  },
];

export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

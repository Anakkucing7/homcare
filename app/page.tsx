"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "../components/icons";
import { categories, contact, formatRupiah } from "../lib/services";
import { addToCart, getCart } from "../lib/cart";

export default function Home() {
  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addedService, setAddedService] = useState("");
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  useEffect(() => { setCartCount(getCart().reduce((count, item) => count + item.quantity, 0)); }, []);

  function addService(service: string) {
    addToCart(service);
    setCartCount(getCart().reduce((count, item) => count + item.quantity, 0));
    setAddedService(service);
    window.setTimeout(() => setAddedService(""), 1400);
  }

  function goToBooking() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#beranda" aria-label="Layanan Homecare, beranda">
          <span className="brand-mark"><Icon name="heart" /></span>
          <span className="brand-name">Layanan <b>Homecare</b></span>
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "Tutup menu" : "Buka menu"}>
          <span></span><span></span>
        </button>
        <nav id="main-nav" className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="Navigasi utama">
          <a href="#beranda" onClick={() => setMenuOpen(false)}>Beranda</a>
          <a href="#tentang" onClick={() => setMenuOpen(false)}>Tentang</a>
          <a href="#layanan" onClick={() => setMenuOpen(false)}>Layanan</a>
          <a href="#testimoni" onClick={() => setMenuOpen(false)}>Testimoni</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link href="/masuk" onClick={() => setMenuOpen(false)}>Masuk</Link>
          <Link className="button button-primary nav-cta" href="/reservasi" onClick={goToBooking}>Keranjang{cartCount > 0 && <span className="cart-count" aria-label={`${cartCount} item`}>{cartCount}</span>} <Icon name="arrow" /></Link>
        </nav>
      </header>

      <main>
        <section id="beranda" className="hero section-wrap">
          <div className="hero-copy">
            <h1>Perawatan profesional, nyaman dari rumah.</h1>
            <p>Layanan perawatan homecare yang membantu Anda mendapatkan pelayanan kesehatan di rumah dengan lebih praktis dan nyaman.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/reservasi">Reservasi sekarang <Icon name="arrow" /></Link>
              <a className="button button-secondary" href="#layanan">Lihat layanan</a>
            </div>
            <div className="hero-proof" aria-label="Informasi layanan">
              <span><Icon name="pin" /> Jabodetabek</span>
              <span><Icon name="shield" /> Tenaga sesuai tindakan</span>
              <span><Icon name="clock" /> Jadwal sesuai kebutuhan</span>
            </div>
          </div>
          <div className="hero-visual">
            <Image src="/images/homecare-visit.jpg" alt="Pendampingan perawat untuk pasien di rumah" fill priority sizes="(max-width: 720px) calc(100vw - 60px), (max-width: 1000px) 50vw, 600px" />
            <div className="image-caption"><span className="caption-icon"><Icon name="home" /></span><span><b>Dirawat di tempat yang akrab.</b><small>Di rumah, kantor, dan lokasi Anda.</small></span></div>
          </div>
        </section>

        <section id="tentang" className="intro section-wrap">
          <div className="intro-label"><span className="label-rule"></span>Merawat dengan lebih dekat</div>
          <div className="intro-body">
            <h2>Perawatan yang menyesuaikan <em>dengan keseharian Anda.</em></h2>
            <div><p>Kami membawa layanan homecare ke rumah, kantor, dan lokasi Anda. Pilih layanan yang dibutuhkan, tentukan jadwal, lalu ajukan kunjungan melalui WhatsApp.</p><a className="text-link" href="#cara-reservasi">Pelajari cara reservasi <Icon name="arrow" /></a></div>
          </div>
        </section>

        <section className="benefits-band" aria-label="Keunggulan layanan">
          <div className="benefits section-wrap">
            <article className="benefit"><span className="benefit-icon"><Icon name="home" /></span><div><h3>Lebih dekat</h3><p>Perawatan datang ke lokasi Anda, di Jabodetabek.</p></div></article>
            <article className="benefit"><span className="benefit-icon"><Icon name="shield" /></span><div><h3>Perlengkapan tertata</h3><p>Perlengkapan layanan infus dan suntik tercantum di katalog.</p></div></article>
            <article className="benefit"><span className="benefit-icon"><Icon name="calendar" /></span><div><h3>Atur jadwal sendiri</h3><p>Kirim waktu kunjungan yang Anda inginkan untuk dikonfirmasi.</p></div></article>
            <article className="benefit"><span className="benefit-icon"><Icon name="check" /></span><div><h3>Pemeriksaan gratis</h3><p>Tekanan darah dan saturasi oksigen diperiksa di setiap kunjungan.</p></div></article>
          </div>
        </section>

        <section id="layanan" className="services-section section-wrap">
          <div className="section-heading">
            <div><p className="section-kicker">Pilihan perawatan</p><h2>Layanan dan harga.</h2><p className="section-description">Pilih layanan untuk melihat rincian harga sebelum mengajukan reservasi.</p></div>
            <p className="price-note">Harga dalam Rupiah<br />Biaya transport dapat berlaku untuk jarak lebih dari 5 km.</p>
          </div>
          <div className="catalog-layout">
            <div className="category-list" aria-label="Kategori layanan">
              {categories.map((item, index) => <button key={item.id} className={`category-tab${item.id === categoryId ? " active" : ""}`} aria-pressed={item.id === categoryId} onClick={() => setCategoryId(item.id)}><span className="category-number">0{index + 1}</span><span>{item.name}</span><Icon name="arrow" /></button>)}
            </div>
            <div className="service-panel" id="service-panel">
              <div className="service-panel-heading"><div><h3>{category.name}</h3><p>{category.summary}</p></div><span className="service-count">{category.services.length} pilihan</span></div>
              <ul className="service-list">{category.services.map((service) => <li className="service-row" key={service.name}><div className="service-name"><span>{service.name}</span>{service.note && <small>{service.note}</small>}</div><div className="service-price">{formatRupiah(service.price)}<button onClick={() => addService(service.name)} aria-label={`Tambahkan ${service.name} ke keranjang`}>{addedService === service.name ? "Ditambahkan ✓" : "Tambah +"} <Icon name="arrow" /></button></div></li>)}</ul>
              {category.id === "suntik" && <p className="included-note"><b>Layanan suntik dan infus termasuk:</b> infuset, spuit, abbocath, torniket, alcohol swab, micropore, plester, nierbekken, dan tiang infus portable.</p>}
            </div>
          </div>
          <p className="catalog-footnote">Biaya akhir dan ketersediaan layanan akan dikonfirmasi sebelum kunjungan.</p>
        </section>

        <section id="cara-reservasi" className="booking-steps-section">
          <div className="section-wrap booking-steps">
            <div className="steps-intro"><p className="section-kicker">Alur reservasi</p><h2>Mulai dari kebutuhan Anda.</h2><p>Pilih layanan, masukkan ke keranjang, lalu atur jadwal kunjungan. Tim akan membantu mengonfirmasi detail melalui WhatsApp.</p><Link className="button button-light" href="/reservasi">Mulai reservasi <Icon name="arrow" /></Link></div>
            <ol className="steps-list"><li><span>01</span><div><h3>Pilih layanan</h3><p>Lihat kategori dan harga, lalu pilih layanan yang sesuai.</p></div></li><li><span>02</span><div><h3>Isi detail kunjungan</h3><p>Masukkan nama, alamat, dan jadwal yang Anda inginkan.</p></div></li><li><span>03</span><div><h3>Kirim melalui WhatsApp</h3><p>Tinjau pesan yang disiapkan, lalu tekan Kirim di WhatsApp.</p></div></li></ol>
          </div>
        </section>

        <section id="testimoni" className="testimonial-section section-wrap">
          <div className="testimonial-title"><p className="section-kicker">Cerita pelanggan</p><h2>Kesan setelah kunjungan.</h2><p>Ulasan akan dikelola dan ditampilkan di sini.</p></div>
          <TestimonialPreview />
        </section>

        <section className="service-area section-wrap">
          <div className="area-pin"><Icon name="pin" /></div><div><p className="section-kicker">Area layanan</p><h2>Homecare di Jabodetabek.</h2><p>Layanan tersedia di wilayah Jabodetabek. Biaya transport dapat berlaku untuk jarak lebih dari 5 km.</p></div><Link className="text-link" href="/reservasi">Tanyakan ketersediaan <Icon name="arrow" /></Link>
        </section>

        <section id="faq" className="faq-section section-wrap">
          <div className="faq-intro"><p className="section-kicker">Pertanyaan umum</p><h2>Hal yang perlu diketahui.</h2><p>Belum menemukan jawaban? Tanyakan melalui WhatsApp.</p><a className="text-link" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">Hubungi kami <Icon name="arrow" /></a></div>
          <div className="faq-list"><details><summary>Bagaimana cara mengajukan reservasi?<span></span></summary><p>Pilih layanan, isi detail nama, jadwal, dan alamat, lalu lanjutkan ke WhatsApp. Tinjau pesan dan tekan Kirim untuk mengajukan reservasi.</p></details><details><summary>Apakah layanan tersedia di area saya?<span></span></summary><p>Layanan tersedia untuk wilayah Jabodetabek. Tanyakan ketersediaan untuk alamat Anda melalui WhatsApp.</p></details><details><summary>Apakah jadwal yang saya pilih langsung terkonfirmasi?<span></span></summary><p>Belum. Waktu yang Anda masukkan adalah waktu permintaan. Tim akan mengonfirmasi ketersediaan melalui WhatsApp.</p></details><details><summary>Apakah ada biaya transport?<span></span></summary><p>Biaya transport dapat dikenakan untuk jarak lebih dari 5 km. Tanyakan rincian biaya saat konfirmasi.</p></details><details><summary>Apa yang termasuk dalam layanan infus dan suntik?<span></span></summary><p>Untuk layanan infus dan suntik, perlengkapan yang termasuk meliputi infuset, spuit, abbocath, torniket, alcohol swab, micropore, plester, nierbekken, dan tiang infus portable.</p></details></div>
        </section>

        <section className="closing-cta section-wrap"><div><span className="closing-mark"><Icon name="heart" /></span><h2>Butuh perawatan di rumah?</h2><p>Ajukan layanan dan waktu kunjungan yang Anda inginkan.</p></div><Link className="button button-light" href="/reservasi">Reservasi melalui WhatsApp <Icon name="arrow" /></Link></section>
      </main>

      <footer className="site-footer"><div className="footer-main section-wrap"><a className="brand footer-brand" href="#beranda"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></a><p>Perawatan kesehatan di rumah, di kantor, dan di lokasi Anda.</p><a className="footer-phone" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer"><Icon name="phone" />{contact.phoneDisplay}</a></div><div className="footer-bottom section-wrap"><span>© {new Date().getFullYear()} Layanan Homecare</span><span>Area layanan: Jabodetabek</span><a href="#faq">Pertanyaan umum</a></div></footer>
      {cartCount > 0 && <Link className="floating-cart" href="/reservasi"><Icon name="calendar" />Lihat keranjang <span>{cartCount}</span><Icon name="arrow" /></Link>}
    </>
  );
}

function TestimonialPreview() {
  const [open, setOpen] = useState(false);
  return <>
    <button className="testimonial-demo" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
      <div className="demo-label"><span></span>Pratinjau · media testimoni belum tersedia</div>
      <span className="testimonial-media"><Image src="/images/homecare-visit.jpg" alt="Ilustrasi kunjungan perawat ke rumah" fill sizes="(max-width: 720px) 88vw, 40vw" /></span>
      <span className="testimonial-open">Lihat detail <Icon name="arrow" /></span>
    </button>
    {open && <div className="dialog-backdrop testimonial-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <dialog open className="testimonial-dialog" aria-modal="true" aria-labelledby="testimonial-detail-title" onCancel={(event) => { event.preventDefault(); setOpen(false); }}>
        <div className="dialog-heading"><div><p className="section-kicker">Contoh tampilan</p><h2 id="testimonial-detail-title">Cerita kunjungan</h2></div><button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Tutup detail testimoni"><Icon name="close" /></button></div>
        <div className="testimonial-detail-media"><Image src="/images/homecare-visit.jpg" alt="Ilustrasi perawat mendampingi pasien di rumah" fill sizes="(max-width: 720px) 90vw, 520px" /></div>
        <p className="demo-label"><span></span>Foto ilustrasi · bukan foto pelanggan</p>
        <p className="testimonial-detail-copy">Detail testimoni dapat berisi foto atau video, jenis layanan, dan cerita pelanggan setelah materi serta izin publikasinya tersedia.</p>
      </dialog>
    </div>}
  </>;
}

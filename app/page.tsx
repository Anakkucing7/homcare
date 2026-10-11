"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "../components/icons";
import { categories as defaultCategories, contact } from "../lib/services";
import { createClient } from "../lib/supabase/client";
import { isSupabaseConfigured } from "../lib/supabase/config";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState<{ role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthChecked(true); return; }
    let active = true;
    void (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
      if (active) { setAccount(profile); setAuthChecked(true); }
    })();
    return () => { active = false; };
  }, []);

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
          <a className="nav-home is-active" href="#beranda" aria-current="page" onClick={() => setMenuOpen(false)}>Beranda</a>
          <a href="#tentang" onClick={() => setMenuOpen(false)}>Tentang</a>
          <a className="nav-services" href="#layanan" onClick={() => setMenuOpen(false)}>Layanan <Icon name="chevronDown" /></a>
          <a href="#testimoni" onClick={() => setMenuOpen(false)}>Testimoni</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          {authChecked && account ? <Link href={account.role === "owner" ? "/owner" : "/akun"} onClick={() => setMenuOpen(false)}>{account.role === "owner" ? "Dashboard" : "Akun saya"}</Link> : <Link href="/masuk" onClick={() => setMenuOpen(false)}>Masuk</Link>}
          <Link className="button button-primary nav-cta" href="/reservasi" onClick={goToBooking}>Reservasi <Icon name="arrow" /></Link>
        </nav>
      </header>

      <main>
        <section id="beranda" className="hero section-wrap">
          <div className="hero-copy">
            <p className="hero-eyebrow"><Icon name="home" /> HOMECARE KE RUMAH · JABODETABEK</p>
            <h1>Perawatan kesehatan yang tenang, <span>di rumah Anda.</span></h1>
            <p>Infus, suntik, cek darah, NGT, dan perawatan luka oleh perawat STR aktif. Ajukan reservasi dengan mudah, lalu tim kami mengonfirmasi melalui WhatsApp.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/reservasi">Reservasi sekarang <Icon name="arrow" /></Link>
              <a className="button button-secondary" href="#layanan">Lihat layanan</a>
            </div>
            <div className="hero-proof" aria-label="Informasi layanan">
              <span><Icon name="pin" /><span><b>Jabodetabek</b><small>Area layanan luas</small></span></span>
              <span><Icon name="nurse" /><span><b>Perawat STR aktif</b><small>Profesional & berpengalaman</small></span></span>
              <span><Icon name="shield" /><span><b>Tensi & SpO₂ gratis</b><small>Saat kunjungan pertama</small></span></span>
            </div>
          </div>
          <div className="hero-visual">
            <Image src="/images/homecare-visit.jpg" alt="Pendampingan perawat untuk pasien di rumah" fill priority sizes="(max-width: 720px) calc(100vw - 60px), (max-width: 1100px) 50vw, (max-width: 1460px) 52vw, 760px" />
            <div className="image-caption"><span className="caption-icon"><Icon name="home" /></span><span><b>Dirawat di tempat yang akrab.</b><small>Di rumah, kantor, dan lokasi Anda.</small></span><Icon className="caption-arrow" name="arrowRight" /></div>
            <p className="hero-handwritten">Sehat bersama,<br />di rumah <span>♥</span></p>
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

        <HomeCategoryPreview />

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
    </>
  );
}

function HomeCategoryPreview() {
  const [items, setItems] = useState(defaultCategories.map(({ id, name, summary }) => ({ id, name, description: summary, image_url: "/images/homecare-visit.jpg" })));
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(defaultCategories.map(({ id, services }) => [id, services.length])));

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const supabase = createClient();
    void Promise.all([
      supabase.from("service_categories").select("id,name,description,image_url").eq("active", true).order("sort_order"),
      supabase.from("services").select("category_id").eq("active", true),
    ]).then(([categoryResult, serviceResult]) => {
      if (!active) return;
      if (!categoryResult.error && categoryResult.data) setItems(categoryResult.data);
      if (serviceResult.data) setCounts(serviceResult.data.reduce<Record<string, number>>((result, service) => {
        result[service.category_id] = (result[service.category_id] ?? 0) + 1;
        return result;
      }, {}));
    });
    return () => { active = false; };
  }, []);

  return <section id="layanan" className="service-discovery section-wrap">
    <div className="service-discovery-head"><div><p className="section-kicker">Layanan homecare</p><h2>Pilih layanan sesuai kebutuhan.</h2><p>Katalog lengkap dan harga tersedia di halaman reservasi.</p></div><Link className="text-link" href="/reservasi">Lihat semua layanan <Icon name="arrow" /></Link></div>
    <div className="home-category-grid">{items.map((category, index) => <Link key={category.id} href={`/reservasi?kategori=${encodeURIComponent(category.id)}`} className={`home-category-card${index === 0 ? " is-featured" : ""}`}>
      {category.image_url && category.image_url !== "/images/homecare-visit.jpg" ? <img src={category.image_url} alt="" loading="lazy" /> : index === 0 ? <Image src="/images/homecare-visit.jpg" alt="" fill sizes="(max-width: 720px) 45vw, 28vw" /> : <span className={`category-art category-art-${index}`} aria-hidden="true"><Icon name={(["heart", "syringe", "droplet", "tube", "bandage"] as const)[index % 5]} /></span>}
      <span className="home-category-shade" aria-hidden="true" /><span className="home-category-count">{counts[category.id] ?? 0} layanan</span><span className="home-category-copy"><b>{category.name}</b><small>{category.description || "Lihat pilihan layanan dan rincian harga."}</small></span><span className="home-category-arrow"><Icon name="arrow" /></span>
    </Link>)}</div>
  </section>;
}

function TestimonialPreview() {
  const [items, setItems] = useState<{ id: string; display_name: string; service_name: string; description: string; media_url: string; media_type: string }[]>([]);
  const [selected, setSelected] = useState<{ id: string; display_name: string; service_name: string; description: string; media_url: string; media_type: string } | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void createClient().from("testimonials").select("id,display_name,service_name,description,media_url,media_type").eq("published", true).order("created_at", { ascending: false }).then(({ data }) => { if (active && data) setItems(data); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!selected) return;
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setSelected(null); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);
  const cards = items.length ? items : [{ id: "demo", display_name: "Contoh tampilan", service_name: "Media testimoni", description: "Owner dapat menambahkan foto atau video, nama tampilan, layanan, dan cerita pelanggan di dashboard. Publikasikan setelah mendapat izin.", media_url: "/images/homecare-visit.jpg", media_type: "image" }];
  return <>
    <div className="testimonial-grid">{cards.map((item) => <button className="testimonial-demo" type="button" key={item.id} onClick={() => setSelected(item)} aria-haspopup="dialog">
      <span className="demo-label"><span></span>{item.id === "demo" ? "Contoh tampilan, ganti dari dashboard" : item.service_name || "Cerita pelanggan"}</span>
      <span className="testimonial-media">{item.media_type === "video" ? <video src={item.media_url} muted playsInline preload="metadata" /> : <img src={item.media_url} alt={`Media cerita ${item.display_name}`} loading="lazy" />}</span>
      <span className="testimonial-card-name">{item.display_name}</span><span className="testimonial-open">Lihat cerita <Icon name="arrow" /></span>
    </button>)}</div>
    {selected && <div className="dialog-backdrop testimonial-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
      <dialog open className="testimonial-dialog" aria-modal="true" aria-labelledby="testimonial-detail-title" onCancel={(event) => { event.preventDefault(); setSelected(null); }}>
        <div className="dialog-heading"><div><p className="section-kicker">{selected.service_name || "Cerita pelanggan"}</p><h2 id="testimonial-detail-title">{selected.display_name}</h2></div><button className="icon-button" type="button" onClick={() => setSelected(null)} aria-label="Tutup detail testimoni"><Icon name="close" /></button></div>
        <div className="testimonial-detail-media">{selected.media_type === "video" ? <video src={selected.media_url} controls playsInline /> : <img src={selected.media_url} alt={`Media cerita ${selected.display_name}`} />}</div>
        {selected.id === "demo" && <p className="demo-label"><span></span>Foto ilustrasi, bukan foto pelanggan</p>}
        <p className="testimonial-detail-copy">{selected.description}</p>
      </dialog>
    </div>}
  </>;
}

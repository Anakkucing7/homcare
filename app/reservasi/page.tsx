"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/icons";
import { changeCartQuantity, getCart, removeFromCart, addToCart, type CartItem } from "../../lib/cart";
import { categories as defaultCategories, contact, formatRupiah } from "../../lib/services";
import { createClient } from "../../lib/supabase/client";
import { isSupabaseConfigured } from "../../lib/supabase/config";

type Category = { id: string; name: string; description: string; image_url: string };
type Service = { id: string; category_id: string; name: string; description: string; note: string; price: number; media_url: string; media_type: "image" | "video" };

const fallbackCategories: Category[] = defaultCategories.map(({ id, name, summary }) => ({ id, name, description: summary, image_url: "/images/homecare-visit.jpg" }));
const fallbackServices: Service[] = defaultCategories.flatMap((category) => category.services.map((service) => ({ id: service.name, category_id: category.id, name: service.name, description: service.note ?? category.summary, note: service.note ?? "", price: service.price, media_url: "/images/homecare-visit.jpg", media_type: "image" })));

function localDate() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

export default function ReservationPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [minimumDate, setMinimumDate] = useState("");
  const [profile, setProfile] = useState({ full_name: "", phone: "", signedIn: false });
  const [categories, setCategories] = useState(fallbackCategories);
  const [services, setServices] = useState(fallbackServices);
  const [categoryId, setCategoryId] = useState("");
  const [selected, setSelected] = useState<Service | null>(null);
  const [added, setAdded] = useState("");

  useEffect(() => {
    setCart(getCart());
    setMinimumDate(localDate());
    setReady(true);
    if (!isSupabaseConfigured) return;
    let active = true;
    void (async () => {
      const supabase = createClient();
      const [categoryResult, serviceResult] = await Promise.all([
        supabase.from("service_categories").select("id,name,description,image_url").eq("active", true).order("sort_order"),
        supabase.from("services").select("id,category_id,name,description,note,price,media_url,media_type").eq("active", true).order("sort_order"),
      ]);
      if (!active) return;
      const availableCategories = categoryResult.error || !categoryResult.data?.length ? fallbackCategories : categoryResult.data;
      setCategories(availableCategories);
      if (serviceResult.error || !serviceResult.data?.length) setServices(fallbackServices);
      else setServices(serviceResult.data as Service[]);
      const requestedCategory = new URLSearchParams(window.location.search).get("kategori");
      setCategoryId(availableCategories.some((category) => category.id === requestedCategory) ? requestedCategory! : availableCategories[0]?.id ?? "");
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setSelected(null); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      if (active) setProfile((current) => ({ full_name: current.full_name || data?.full_name || "", phone: current.phone || data?.phone || "", signedIn: true }));
    })();
    return () => { active = false; };
  }, []);

  const visibleServices = useMemo(() => services.filter((service) => service.category_id === categoryId), [services, categoryId]);
  const entries = cart.flatMap((item) => {
    const service = services.find((candidate) => item.id ? candidate.id === item.id : candidate.name === item.name);
    return service ? [{ ...item, id: service.id, name: service.name, service }] : [];
  });
  const total = entries.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  function updateCart(next: CartItem[]) { setCart(next); }
  function addService(service: Service) {
    addToCart(service.name, service.id);
    setCart(getCart());
    setAdded(service.id);
    window.setTimeout(() => setAdded(""), 1200);
  }

  function submitReservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!entries.length) return;
    const phoneField = form.elements.namedItem("phone") as HTMLInputElement;
    const phone = phoneField.value.replace(/[\s()-]/g, "");
    phoneField.setCustomValidity(/^(?:\+?62|0)8\d{7,11}$/.test(phone) ? "" : "Masukkan nomor WhatsApp Indonesia yang valid, misalnya 081234567890.");
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = ["Halo, saya ingin mengajukan reservasi homecare.", `Nama: ${data.get("name")}`, `WhatsApp: ${phone}`, "Layanan:", ...entries.map((item) => `- ${item.name} x${item.quantity}: ${formatRupiah(item.service.price * item.quantity)}`), `Subtotal layanan: ${formatRupiah(total)}`, `Jadwal: ${data.get("date")} pukul ${data.get("time")}`, `Alamat kunjungan: ${data.get("address")}`, data.get("notes") ? `Catatan: ${data.get("notes")}` : ""].filter(Boolean).join("\n");
    const tab = window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
    if (tab) { tab.opener = null; setNotice("WhatsApp terbuka. Tinjau detail reservasi, lalu tekan Kirim."); }
    else setNotice("Izinkan pop-up untuk membuka WhatsApp, lalu kirim pesan reservasi Anda.");
  }

  return <>
    <header className="site-header reservation-header"><Link className="brand" href="/" aria-label="Layanan Homecare, beranda"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></Link><Link className="text-link reservation-back" href="/">Kembali ke beranda <Icon name="arrow" /></Link></header>
    <main className="reservation-page">
      <div className="reservation-heading"><p className="section-kicker">Reservasi kunjungan</p><h1>Pilih perawatan Anda.</h1><p>Lihat detail dan harga, tambahkan ke keranjang, lalu atur waktu kunjungan.</p></div>
      <section className="reservation-catalog" aria-label="Katalog layanan">
        <div className="reservation-catalog-top"><div><h2>Layanan yang tersedia</h2><p>Harga dalam Rupiah. Biaya transport dapat berlaku untuk jarak lebih dari 5 km.</p></div><Link className="catalog-cart-link" href="#keranjang"><Icon name="calendar" /> Keranjang <span>{entries.reduce((count, item) => count + item.quantity, 0)}</span></Link></div>
        <div className="reservation-category-tabs" role="tablist" aria-label="Kategori layanan">{categories.map((category) => <button key={category.id} role="tab" aria-selected={category.id === categoryId} className={category.id === categoryId ? "active" : ""} onClick={() => setCategoryId(category.id)}>{category.name}</button>)}</div>
        <div className="reservation-service-grid">{visibleServices.map((service) => <article className="reservation-service-card" key={service.id}>
          <button className="reservation-service-media" type="button" onClick={() => setSelected(service)} aria-label={`Lihat detail ${service.name}`}>
            {service.media_type === "video" ? <video src={service.media_url} muted playsInline preload="metadata" /> : <img src={service.media_url || "/images/homecare-visit.jpg"} alt={`Contoh layanan ${service.name}`} loading="lazy" />}
            <span className="service-media-hint">{service.media_type === "video" ? "Video" : "Lihat detail"} <Icon name="arrow" /></span>
          </button>
          <div className="reservation-service-content"><button type="button" className="reservation-service-title" onClick={() => setSelected(service)}>{service.name}</button><p>{service.description || service.note || "Perawatan dilakukan oleh tenaga kesehatan profesional."}</p><div className="reservation-service-bottom"><b>{formatRupiah(service.price)}</b><button className="service-add-button" type="button" onClick={() => addService(service)}>{added === service.id ? "Ditambahkan ✓" : "Tambah +"}</button></div></div>
        </article>)}</div>
        {!visibleServices.length && <p className="catalog-empty">Belum ada layanan aktif di kategori ini.</p>}
      </section>
      <div className="reservation-layout" id="keranjang">
        <section className="cart-card" aria-labelledby="cart-title">
          <div className="cart-card-heading"><div><p className="section-kicker">Pilihan Anda</p><h2 id="cart-title">Keranjang <span>({entries.reduce((count, item) => count + item.quantity, 0)})</span></h2></div></div>
          {!ready ? <p className="cart-loading">Memuat keranjang…</p> : entries.length === 0 ? <div className="cart-empty-inline"><Icon name="calendar" /><p>Tambahkan layanan pilihan Anda dari daftar di atas.</p></div> : <ul className="cart-list">{entries.map((item) => <li className="cart-item" key={item.id}>
            <div className="cart-item-info"><b>{item.name}</b>{item.service.note && <small>{item.service.note}</small>}<span>{formatRupiah(item.service.price)} / layanan</span></div>
            <div className="cart-item-controls" aria-label={`Jumlah ${item.name}`}><button type="button" onClick={() => updateCart(changeCartQuantity(item.name, -1, item.id))} aria-label={`Kurangi ${item.name}`}>−</button><span aria-live="polite">{item.quantity}</span><button type="button" onClick={() => updateCart(changeCartQuantity(item.name, 1, item.id))} aria-label={`Tambah ${item.name}`}>+</button><button className="remove-item" type="button" onClick={() => updateCart(removeFromCart(item.name, item.id))} aria-label={`Hapus ${item.name}`}>Hapus</button></div>
            <b className="cart-item-total">{formatRupiah(item.service.price * item.quantity)}</b>
          </li>)}</ul>}
          <div className="cart-subtotal"><span>Subtotal layanan</span><b>{formatRupiah(total)}</b></div><p className="transport-note">Ketersediaan dan biaya akhir dikonfirmasi sebelum kunjungan.</p>
        </section>
        <section className="visit-card" aria-labelledby="visit-title"><p className="section-kicker">Detail kunjungan</p><h2 id="visit-title">Atur waktu dan alamat.</h2>
          {!profile.signedIn && <Link className="text-link autofill-link" href="/masuk">Masuk untuk isi otomatis <Icon name="arrow" /></Link>}
          <form className="visit-form" onSubmit={submitReservation}>
            <label>Nama pemesan<input name="name" autoComplete="name" required placeholder="Nama lengkap" value={profile.full_name} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} /></label>
            <label>Nomor WhatsApp<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0812 3456 7890" aria-describedby="phone-help" value={profile.phone} onChange={(event) => { event.currentTarget.setCustomValidity(""); setProfile((current) => ({ ...current, phone: event.target.value })); }} /></label><small id="phone-help" className="field-hint">Gunakan nomor yang bisa menerima pesan WhatsApp.</small>
            <div className="visit-form-row"><label>Tanggal<input name="date" type="date" min={minimumDate} required /></label><label>Waktu<input name="time" type="time" required /></label></div>
            <label>Alamat kunjungan<textarea name="address" autoComplete="street-address" required rows={2} placeholder="Jalan, nomor rumah, kecamatan, kota" /></label><label>Catatan <span className="optional">opsional</span><textarea name="notes" rows={2} placeholder="Hal yang perlu diketahui sebelum kunjungan" /></label>
            <p className="form-disclosure">Permintaan dikirim melalui WhatsApp untuk ditinjau dan dikonfirmasi.</p><button className="button button-primary submit-booking" type="submit" disabled={!entries.length}>Lanjut ke WhatsApp <Icon name="arrow" /></button><p className="form-notice" aria-live="polite">{notice}</p>
          </form>
        </section>
      </div>
    </main>
    {selected && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><dialog open className="service-detail-dialog" aria-modal="true" aria-labelledby="service-detail-title" onCancel={(event) => { event.preventDefault(); setSelected(null); }}><div className="dialog-heading"><div><p className="section-kicker">Detail layanan</p><h2 id="service-detail-title">{selected.name}</h2></div><button className="icon-button" type="button" onClick={() => setSelected(null)} aria-label="Tutup detail"><Icon name="close" /></button></div>{selected.media_type === "video" ? <video className="service-detail-media" src={selected.media_url} controls playsInline /> : <img className="service-detail-media" src={selected.media_url || "/images/homecare-visit.jpg"} alt={`Contoh layanan ${selected.name}`} />}<p className="service-detail-description">{selected.description || selected.note || "Perawatan dilakukan oleh tenaga kesehatan profesional di lokasi pilihan Anda."}</p><div className="service-detail-footer"><b>{formatRupiah(selected.price)}</b><button className="button button-primary" type="button" onClick={() => { addService(selected); setSelected(null); }}>Tambahkan ke keranjang</button></div></dialog></div>}
    <footer className="reservation-footer"><Link href="/">Kembali ke beranda</Link><span>Area layanan Jabodetabek</span></footer>
  </>;
}

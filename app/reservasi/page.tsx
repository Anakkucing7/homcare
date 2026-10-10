"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "../../components/icons";
import { changeCartQuantity, getCart, removeFromCart, type CartItem } from "../../lib/cart";
import { categories, contact, formatRupiah } from "../../lib/services";
import { createClient } from "../../lib/supabase/client";
import { isSupabaseConfigured } from "../../lib/supabase/config";

function localDate() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

const allServices = new Map(categories.flatMap((category) => category.services.map((service) => [service.name, service])));

export default function ReservationPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [minimumDate, setMinimumDate] = useState("");
  const [profile, setProfile] = useState({ full_name: "", phone: "", signedIn: false });
  useEffect(() => { setCart(getCart()); setMinimumDate(localDate()); setReady(true); }, []);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      if (active) setProfile((current) => ({
        full_name: current.full_name || data?.full_name || "",
        phone: current.phone || data?.phone || "",
        signedIn: true,
      }));
    })();
    return () => { active = false; };
  }, []);

  const entries = cart.flatMap((item) => {
    const service = allServices.get(item.name);
    return service ? [{ ...item, service }] : [];
  });
  const total = entries.reduce((sum, item) => sum + item.service.price * item.quantity, 0);

  function updateCart(next: CartItem[]) { setCart(next); }

  function submitReservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (entries.length === 0) return;
    const phoneField = form.elements.namedItem("phone") as HTMLInputElement;
    const phone = phoneField.value.replace(/[\s()-]/g, "");
    phoneField.setCustomValidity(/^(?:\+?62|0)8\d{7,11}$/.test(phone) ? "" : "Masukkan nomor WhatsApp Indonesia yang valid, misalnya 081234567890.");
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = [
      "Halo, saya ingin mengajukan reservasi homecare.",
      `Nama: ${data.get("name")}`,
      `WhatsApp: ${phone}`,
      "Layanan:",
      ...entries.map((item) => `- ${item.name} x${item.quantity}: ${formatRupiah(item.service.price * item.quantity)}`),
      `Subtotal layanan: ${formatRupiah(total)}`,
      `Jadwal: ${data.get("date")} pukul ${data.get("time")}`,
      `Alamat kunjungan: ${data.get("address")}`,
      data.get("notes") ? `Catatan: ${data.get("notes")}` : "",
    ].filter(Boolean).join("\n");
    const tab = window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
    if (tab) {
      tab.opener = null;
      setNotice("WhatsApp terbuka. Tinjau detail reservasi, lalu tekan Kirim di WhatsApp.");
    } else {
      setNotice("Izinkan pop-up untuk membuka WhatsApp, lalu kirim pesan reservasi Anda.");
    }
  }

  return <>
    <header className="site-header reservation-header">
      <Link className="brand" href="/" aria-label="Layanan Homecare, beranda"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></Link>
      <Link className="text-link reservation-back" href="/#layanan">Katalog layanan <Icon name="arrow" /></Link>
    </header>
    <main className="reservation-page">
      <div className="reservation-heading"><p className="section-kicker">Reservasi kunjungan</p><h1>Atur kunjungan Anda.</h1><p>Pilih layanan dan lengkapi detail. Anda bisa mengajukan reservasi tanpa membuat akun.</p></div>
      {!ready ? <p className="cart-loading">Memuat keranjang…</p> : entries.length === 0 ? <section className="cart-empty"><span className="empty-basket"><Icon name="calendar" /></span><h2>Keranjang masih kosong.</h2><p>Pilih satu atau beberapa layanan terlebih dahulu. Pilihan Anda akan tersimpan selama sesi browser ini.</p><Link href="/#layanan" className="button button-primary">Lihat layanan <Icon name="arrow" /></Link></section> : <div className="reservation-layout">
        <section className="cart-card" aria-labelledby="cart-title">
          <div className="cart-card-heading"><div><p className="section-kicker">Pilihan Anda</p><h2 id="cart-title">Keranjang <span>({entries.reduce((count, item) => count + item.quantity, 0)})</span></h2></div><Link className="text-link" href="/#layanan">Tambah layanan <Icon name="arrow" /></Link></div>
          <ul className="cart-list">{entries.map((item) => <li className="cart-item" key={item.name}>
            <div className="cart-item-info"><b>{item.name}</b>{item.service.note && <small>{item.service.note}</small>}<span>{formatRupiah(item.service.price)} / layanan</span></div>
            <div className="cart-item-controls" aria-label={`Jumlah ${item.name}`}><button type="button" onClick={() => updateCart(changeCartQuantity(item.name, -1))} aria-label={`Kurangi ${item.name}`}>−</button><span aria-live="polite">{item.quantity}</span><button type="button" onClick={() => updateCart(changeCartQuantity(item.name, 1))} aria-label={`Tambah ${item.name}`}>+</button><button className="remove-item" type="button" onClick={() => updateCart(removeFromCart(item.name))} aria-label={`Hapus ${item.name}`}>Hapus</button></div>
            <b className="cart-item-total">{formatRupiah(item.service.price * item.quantity)}</b>
          </li>)}</ul>
          <div className="cart-subtotal"><span>Subtotal layanan</span><b>{formatRupiah(total)}</b></div>
          <p className="transport-note">Biaya transport dapat berlaku untuk jarak lebih dari 5 km. Ketersediaan dan biaya akhir dikonfirmasi sebelum kunjungan.</p>
        </section>
        <section className="visit-card" aria-labelledby="visit-title">
          <p className="section-kicker">Detail kunjungan</p><h2 id="visit-title">Ke mana kami datang?</h2>
          {!profile.signedIn && <Link className="text-link autofill-link" href="/masuk">Masuk untuk isi otomatis <Icon name="arrow" /></Link>}
          <form className="visit-form" onSubmit={submitReservation}>
            <label>Nama pemesan<input name="name" autoComplete="name" required placeholder="Nama lengkap" value={profile.full_name} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} /></label>
            <label>Nomor WhatsApp<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0812 3456 7890" aria-describedby="phone-help" value={profile.phone} onChange={(event) => { event.currentTarget.setCustomValidity(""); setProfile((current) => ({ ...current, phone: event.target.value })); }} /></label>
            <small id="phone-help" className="field-hint">Gunakan nomor Indonesia yang bisa menerima pesan WhatsApp.</small>
            <div className="visit-form-row"><label>Tanggal<input name="date" type="date" min={minimumDate} required /></label><label>Waktu<input name="time" type="time" required /></label></div>
            <label>Alamat kunjungan<textarea name="address" autoComplete="street-address" required rows={2} placeholder="Jalan, nomor rumah, kecamatan, kota" /></label>
            <label>Catatan <span className="optional">opsional</span><textarea name="notes" rows={2} placeholder="Hal yang perlu diketahui sebelum kunjungan" /></label>
            <p className="form-disclosure">Reservasi dikirim melalui WhatsApp untuk ditinjau dan dikonfirmasi. Detail belum tersimpan di sistem.</p>
            <button className="button button-primary submit-booking" type="submit">Lanjut ke WhatsApp <Icon name="arrow" /></button>
            <p className="form-notice" aria-live="polite">{notice}</p>
          </form>
        </section>
      </div>}
    </main>
    <footer className="reservation-footer"><Link href="/">Kembali ke beranda</Link><span>Area layanan Jabodetabek</span></footer>
  </>;
}

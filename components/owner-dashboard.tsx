"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { categories as sampleCategories } from "../lib/services";
import { OwnerProfileForm } from "./owner-profile-form";
import { SignOutButton } from "./sign-out-button";

type Category = { id: string; name: string; description: string; image_url: string; active: boolean; sort_order: number };
type Service = { id: string; category_id: string; name: string; description: string; note: string; price: number; media_url: string; media_type: "image" | "video"; active: boolean; sort_order: number };
type Testimonial = { id: string; display_name: string; service_name: string; description: string; media_url: string; media_type: "image" | "video"; published: boolean };
type ServiceDraft = Omit<Service, "id">;
type TestimonialDraft = Omit<Testimonial, "id">;

const emptyService: ServiceDraft = { category_id: "", name: "", description: "", note: "", price: 0, media_url: "/images/homecare-visit.jpg", media_type: "image", active: true, sort_order: 0 };
const emptyTestimonial: TestimonialDraft = { display_name: "", service_name: "", description: "", media_url: "/images/homecare-visit.jpg", media_type: "image", published: false };

export function OwnerDashboard({ initialName }: { initialName: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(emptyService);
  const [testimonialDraft, setTestimonialDraft] = useState<TestimonialDraft>(emptyTestimonial);
  const [editingService, setEditingService] = useState("");
  const [editingTestimonial, setEditingTestimonial] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [supabase] = useState(createClient);

  const reload = useCallback(async () => {
    const [categoryResult, serviceResult, testimonialResult] = await Promise.all([
      supabase.from("service_categories").select("id,name,description,image_url,active,sort_order").order("sort_order"),
      supabase.from("services").select("id,category_id,name,description,note,price,media_url,media_type,active,sort_order").order("sort_order"),
      supabase.from("testimonials").select("id,display_name,service_name,description,media_url,media_type,published").order("created_at", { ascending: false }),
    ]);
    const failed = categoryResult.error || serviceResult.error || testimonialResult.error;
    if (failed) { setError(failed.message); return; }
    setCategories(categoryResult.data ?? []);
    setServices((serviceResult.data ?? []) as Service[]);
    setTestimonials((testimonialResult.data ?? []) as Testimonial[]);
  }, [supabase]);

  useEffect(() => { void reload(); }, [reload]);

  async function addSampleCatalog() {
    setBusy(true); setError(""); setNotice("");
    try {
      const missing = sampleCategories.filter((sample) => !categories.some((category) => category.id === sample.id || category.name === sample.name));
      if (missing.length) {
        const result = await supabase.from("service_categories").insert(missing.map((category, index) => ({ id: category.id, name: category.name, description: category.summary, image_url: "/images/homecare-visit.jpg", active: true, sort_order: categories.length + index + 1 })));
        if (result.error) throw result.error;
      }
      const result = await supabase.from("services").insert(sampleCategories.flatMap((category) => {
        const categoryId = categories.find((existing) => existing.id === category.id || existing.name === category.name)?.id ?? category.id;
        return category.services.map((service, index) => ({ category_id: categoryId, name: service.name, description: service.note ?? category.summary, note: service.note ?? "", price: service.price, media_url: "/images/homecare-visit.jpg", media_type: "image" as const, active: true, sort_order: index + 1 }));
      }));
      if (result.error) throw result.error;
      setNotice("Katalog contoh berhasil ditambahkan. Kini layanan dan harganya bisa diedit di sini.");
      await reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Katalog contoh gagal ditambahkan."); }
    setBusy(false);
  }

  async function run(action: () => PromiseLike<{ error: { message: string } | null }>, success: string) {
    setBusy(true); setError(""); setNotice("");
    const result = await action();
    if (result.error) setError(result.error.message);
    else { setNotice(success); await reload(); }
    setBusy(false);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>, category?: Category) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const image_url = String(data.get("image_url") ?? "").trim() || "/images/homecare-visit.jpg";
    if (!name) return;
    if (category) await run(() => supabase.from("service_categories").update({ name, description, image_url }).eq("id", category.id), "Kategori diperbarui.");
    else {
      const id = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!id) return setError("Nama kategori perlu memuat huruf atau angka.");
      await run(() => supabase.from("service_categories").insert({ id, name, description, image_url, active: true, sort_order: categories.length + 1 }), "Kategori ditambahkan.");
    }
  }

  async function upload(file: File | null) {
    if (!file) return null;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(file.type) || file.size > 50 * 1024 * 1024) throw new Error("Gunakan JPG, PNG, WebP, AVIF, MP4, WebM, atau MOV hingga 50 MB.");
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("homecare-media").upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;
    return { url: supabase.storage.from("homecare-media").getPublicUrl(path).data.publicUrl, type: file.type.startsWith("video/") ? "video" as const : "image" as const };
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const price = Number(data.get("price"));
    if (!Number.isSafeInteger(price) || price < 0) return setError("Masukkan harga Rupiah berupa bilangan bulat nol atau lebih.");
    setBusy(true); setError(""); setNotice("");
    try {
      const media = await upload(data.get("media") as File);
      const values = { ...serviceDraft, name: String(data.get("name") ?? "").trim(), category_id: String(data.get("category_id") ?? ""), description: String(data.get("description") ?? "").trim(), note: String(data.get("note") ?? "").trim(), price, media_url: media?.url ?? (String(data.get("media_url") ?? "").trim() || "/images/homecare-visit.jpg"), media_type: media?.type ?? serviceDraft.media_type, sort_order: Number(data.get("sort_order") ?? 0) };
      const result = editingService ? await supabase.from("services").update(values).eq("id", editingService) : await supabase.from("services").insert(values);
      if (result.error) throw result.error;
      setServiceDraft({ ...emptyService, category_id: categories[0]?.id ?? "" }); setEditingService(""); form.reset(); setNotice(editingService ? "Layanan diperbarui." : "Layanan ditambahkan."); await reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Layanan gagal disimpan."); }
    setBusy(false);
  }

  async function saveTestimonial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError(""); setNotice("");
    try {
      const media = await upload(data.get("media") as File);
      const values = { ...testimonialDraft, display_name: String(data.get("display_name") ?? "").trim(), service_name: String(data.get("service_name") ?? "").trim(), description: String(data.get("description") ?? "").trim(), media_url: media?.url ?? (String(data.get("media_url") ?? "").trim() || "/images/homecare-visit.jpg"), media_type: media?.type ?? testimonialDraft.media_type, published: data.get("published") === "on" };
      const result = editingTestimonial ? await supabase.from("testimonials").update(values).eq("id", editingTestimonial) : await supabase.from("testimonials").insert(values);
      if (result.error) throw result.error;
      setTestimonialDraft(emptyTestimonial); setEditingTestimonial(""); form.reset(); setNotice(editingTestimonial ? "Testimoni diperbarui." : "Testimoni ditambahkan."); await reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Testimoni gagal disimpan."); }
    setBusy(false);
  }

  function editService(service: Service) { setEditingService(service.id); setServiceDraft(service); document.getElementById("kelola-layanan")?.scrollIntoView({ behavior: "smooth" }); }
  function editTestimonial(item: Testimonial) { setEditingTestimonial(item.id); setTestimonialDraft(item); document.getElementById("kelola-testimoni")?.scrollIntoView({ behavior: "smooth" }); }

  return <main className="owner-dashboard">
    <aside className="owner-sidebar"><a className="brand" href="/"><span className="brand-mark">H</span><span className="brand-name">Homecare <b>Owner</b></span></a><p>Dashboard</p><a className="owner-nav-active" href="#ringkasan">Ringkasan</a><a href="#kelola-kategori">Kategori</a><a href="#kelola-layanan">Layanan</a><a href="#kelola-testimoni">Testimoni</a><a href="/">Lihat website ↗</a><div className="owner-sidebar-signout"><SignOutButton /></div></aside>
    <div className="owner-main"><header className="owner-topbar"><div><p className="section-kicker">Dashboard owner</p><h1>Selamat datang, {initialName || "Owner"}.</h1></div><a className="owner-site-link" href="/">Lihat website <span>↗</span></a></header>
      <section id="ringkasan" className="owner-stats"><article><span>Layanan aktif</span><b>{services.filter((item) => item.active).length}</b><small>Dari {services.length} layanan</small></article><article><span>Kategori aktif</span><b>{categories.filter((item) => item.active).length}</b><small>Dari {categories.length} kategori</small></article><article><span>Testimoni</span><b>{testimonials.length}</b><small>{testimonials.filter((item) => item.published).length} ditampilkan</small></article></section>
      {error && <p className="owner-feedback is-error" role="alert">{error}</p>}{notice && <p className="owner-feedback" role="status">{notice}</p>}
      <section className="owner-panel owner-profile-panel"><div className="owner-panel-title"><div><p className="section-kicker">Profil</p><h2>Akun owner</h2></div></div><OwnerProfileForm initialName={initialName} /></section>

      <section id="kelola-kategori" className="owner-panel"><div className="owner-panel-title"><div><p className="section-kicker">Kelola katalog</p><h2>Kategori layanan</h2></div></div>
        <div className="owner-category-list">{categories.map((category) => <form className="owner-category-row" key={category.id} onSubmit={(event) => saveCategory(event, category)}><label>Nama kategori<input name="name" defaultValue={category.name} required /></label><label>Deskripsi<input name="description" defaultValue={category.description} /></label><label>URL gambar<input name="image_url" defaultValue={category.image_url} /></label><div className="owner-row-actions"><button className="owner-button" disabled={busy}>Simpan</button><button className="owner-button owner-button-danger" type="button" disabled={busy || services.some((service) => service.category_id === category.id)} onClick={() => { if (confirm(`Hapus kategori ${category.name}?`)) void run(() => supabase.from("service_categories").delete().eq("id", category.id), "Kategori dihapus."); }}>Hapus</button><span>{services.some((service) => service.category_id === category.id) ? "Hapus layanan terkait dulu" : ""}</span></div></form>)}</div>
        <form className="owner-category-create" onSubmit={(event) => saveCategory(event)}><h3>Tambah kategori</h3><label>Nama<input name="name" required placeholder="Contoh: Perawatan lansia" /></label><label>Deskripsi<input name="description" placeholder="Ringkasan kategori" /></label><label>URL gambar<input name="image_url" placeholder="https://… atau pakai gambar contoh" /></label><button className="owner-button owner-button-primary" disabled={busy}>Tambah kategori</button></form>
      </section>

      <section id="kelola-layanan" className="owner-panel"><div className="owner-panel-title"><div><p className="section-kicker">Harga, informasi & media</p><h2>Daftar layanan</h2></div>{services.length === 0 && <button className="owner-button owner-button-primary" type="button" disabled={busy} onClick={() => void addSampleCatalog()}>Tambahkan katalog contoh</button>}</div>
        <div className="owner-service-list">{services.map((service) => <article className="owner-service-row" key={service.id}><div className="owner-media-thumb">{service.media_type === "video" ? <video src={service.media_url} muted playsInline /> : <img src={service.media_url} alt="" />}</div><div className="owner-service-summary"><b>{service.name}</b><span>{categories.find((item) => item.id === service.category_id)?.name} · Rp {service.price.toLocaleString("id-ID")}</span><small>{service.active ? "Aktif" : "Disembunyikan"}</small></div><button className="owner-button" type="button" onClick={() => editService(service)}>Edit</button><button className="owner-button" type="button" disabled={busy} onClick={() => void run(() => supabase.from("services").update({ active: !service.active }).eq("id", service.id), service.active ? "Layanan disembunyikan." : "Layanan ditampilkan.")}>{service.active ? "Sembunyikan" : "Tampilkan"}</button><button className="owner-button owner-button-danger" type="button" disabled={busy} onClick={() => { if (confirm(`Hapus layanan ${service.name}?`)) void run(() => supabase.from("services").delete().eq("id", service.id), "Layanan dihapus."); }}>Hapus</button></article>)}</div>
        <form className="owner-editor" onSubmit={saveService}><h3>{editingService ? "Edit layanan" : "Tambah layanan"}</h3><div className="owner-form-grid"><label>Nama layanan<input name="name" required value={serviceDraft.name} onChange={(event) => setServiceDraft({ ...serviceDraft, name: event.target.value })} /></label><label>Kategori<select name="category_id" required value={serviceDraft.category_id || categories[0]?.id || ""} onChange={(event) => setServiceDraft({ ...serviceDraft, category_id: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Harga dalam Rupiah<input name="price" type="number" min="0" step="1" required value={serviceDraft.price} onChange={(event) => setServiceDraft({ ...serviceDraft, price: Number(event.target.value) })} /></label><label>Catatan singkat<input name="note" value={serviceDraft.note} onChange={(event) => setServiceDraft({ ...serviceDraft, note: event.target.value })} /></label><label className="owner-span-two">Deskripsi<textarea name="description" rows={3} value={serviceDraft.description} onChange={(event) => setServiceDraft({ ...serviceDraft, description: event.target.value })} /></label><label className="owner-span-two">URL gambar atau video<input name="media_url" value={serviceDraft.media_url} onChange={(event) => setServiceDraft({ ...serviceDraft, media_url: event.target.value, media_type: /\.(mp4|webm|mov)(\?|$)/i.test(event.target.value) ? "video" : "image" })} /></label><label className="owner-span-two">Atau unggah gambar / video<input name="media" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" /></label></div><p className="owner-helper">Media katalog dapat dilihat publik. Pastikan foto/video memiliki izin dan tidak menampilkan data kesehatan pribadi.</p><label className="owner-checkbox"><input name="active" type="checkbox" checked={serviceDraft.active} onChange={(event) => setServiceDraft({ ...serviceDraft, active: event.target.checked })} /> Tampilkan di katalog</label><div className="owner-editor-actions"><button className="owner-button owner-button-primary" disabled={busy || !categories.length}>{busy ? "Menyimpan…" : editingService ? "Simpan perubahan" : "Tambah layanan"}</button>{editingService && <button className="owner-button" type="button" onClick={() => { setEditingService(""); setServiceDraft({ ...emptyService, category_id: categories[0]?.id ?? "" }); }}>Batal edit</button>}</div></form>
      </section>

      <section id="kelola-testimoni" className="owner-panel"><div className="owner-panel-title"><div><p className="section-kicker">Cerita pelanggan</p><h2>Testimoni</h2></div></div><p className="owner-helper">Tampilkan testimoni hanya setelah mendapat izin pelanggan.</p>
        <div className="owner-testimonial-list">{testimonials.map((item) => <article className="owner-service-row" key={item.id}><div className="owner-media-thumb">{item.media_type === "video" ? <video src={item.media_url} muted playsInline /> : <img src={item.media_url} alt="" />}</div><div className="owner-service-summary"><b>{item.display_name}</b><span>{item.service_name || "Homecare"}</span><small>{item.published ? "Ditampilkan" : "Draft"}</small></div><button className="owner-button" type="button" onClick={() => editTestimonial(item)}>Edit</button><button className="owner-button" type="button" disabled={busy} onClick={() => void run(() => supabase.from("testimonials").update({ published: !item.published }).eq("id", item.id), item.published ? "Testimoni disembunyikan." : "Testimoni ditampilkan.")}>{item.published ? "Sembunyikan" : "Tampilkan"}</button><button className="owner-button owner-button-danger" type="button" disabled={busy} onClick={() => { if (confirm(`Hapus testimoni ${item.display_name}?`)) void run(() => supabase.from("testimonials").delete().eq("id", item.id), "Testimoni dihapus."); }}>Hapus</button></article>)}</div>
        <form className="owner-editor" onSubmit={saveTestimonial}><h3>{editingTestimonial ? "Edit testimoni" : "Tambah testimoni"}</h3><div className="owner-form-grid"><label>Nama tampilan<input name="display_name" required value={testimonialDraft.display_name} onChange={(event) => setTestimonialDraft({ ...testimonialDraft, display_name: event.target.value })} /></label><label>Nama layanan<input name="service_name" value={testimonialDraft.service_name} onChange={(event) => setTestimonialDraft({ ...testimonialDraft, service_name: event.target.value })} /></label><label className="owner-span-two">Cerita pelanggan<textarea name="description" rows={3} value={testimonialDraft.description} onChange={(event) => setTestimonialDraft({ ...testimonialDraft, description: event.target.value })} /></label><label className="owner-span-two">URL foto atau video<input name="media_url" value={testimonialDraft.media_url} onChange={(event) => setTestimonialDraft({ ...testimonialDraft, media_url: event.target.value, media_type: /\.(mp4|webm|mov)(\?|$)/i.test(event.target.value) ? "video" : "image" })} /></label><label className="owner-span-two">Atau unggah foto / video<input name="media" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" /></label></div><p className="owner-helper">Foto/video yang ditayangkan akan terlihat publik. Minta izin pelanggan sebelum memublikasikan cerita.</p><label className="owner-checkbox"><input name="published" type="checkbox" checked={testimonialDraft.published} onChange={(event) => setTestimonialDraft({ ...testimonialDraft, published: event.target.checked })} /> Tampilkan di website</label><div className="owner-editor-actions"><button className="owner-button owner-button-primary" disabled={busy}>{busy ? "Menyimpan…" : editingTestimonial ? "Simpan perubahan" : "Tambah testimoni"}</button>{editingTestimonial && <button className="owner-button" type="button" onClick={() => { setEditingTestimonial(""); setTestimonialDraft(emptyTestimonial); }}>Batal edit</button>}</div></form>
      </section>
    </div>
  </main>;
}

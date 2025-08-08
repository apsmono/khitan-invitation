import React, { useMemo, useEffect } from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";

// Robust Title Case utility (EN + ID small-words, keeps acronyms)
function titleCase(str, opts = {}) {
  if (str == null) return "";
  const minor = new Set([
    // English
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "vs",
    "via",
    // Indonesian
    "dan",
    "di",
    "ke",
    "dari",
    "yang",
    "untuk",
    "pada",
    "dengan",
    "atau",
    "para",
  ]);
  const forceUpper = new Set([
    "BSD",
    "DKI",
    "DIY",
    "ID",
    "RT",
    "RW",
    "RI",
    "III",
    "II",
    "IV",
  ]);
  const {
    minorWords = minor,
    keepAcronyms = true,
    alwaysUpper = forceUpper,
  } = opts;

  const words = String(str)
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ");
  const lastIdx = words.length - 1;

  const cap = (w) =>
    w.replace(
      /([A-Za-zÀ-ÖØ-öø-ÿ]+)(?=[^A-Za-zÀ-ÖØ-öø-ÿ']*|$)/g,
      (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
    );

  return words
    .map((raw, i) => {
      const upperRaw = raw.toUpperCase();
      if (alwaysUpper.has(upperRaw.replace(/[.,]/g, ""))) return upperRaw; // keep known acronyms
      if (
        keepAcronyms &&
        raw.length > 1 &&
        /[A-Z]/.test(raw) &&
        raw === upperRaw
      )
        return raw; // keep ALL-CAPS tokens

      const lower = raw.toLowerCase();
      if (i !== 0 && i !== lastIdx && minorWords.has(lower)) return lower; // keep small words in lowercase

      return raw
        .split(/(-)/) // keep hyphens as separators
        .map((chunk) =>
          chunk === "-"
            ? chunk
            : chunk
                .split(/([’'])/)
                .map((c) => (c === "’" || c === "'" ? c : cap(c)))
                .join("")
        )
        .join("");
    })
    .join(" ");
}

/**
 * One-page Khitan Invitation template
 * - Personalizes text using URL params
 *   - ?to=GuestName
 *   - ?child=Child Name
 *   - ?date=Sunday, 21 September 2025
 *   - ?time=09:00 WIB
 *   - ?venue=Masjid Al-Ikhlas, BSD
 *   - ?address=Jl. Contoh No. 123, BSD
 *   - ?maps=https://maps.app.goo.gl/...
 *   - ?rsvp=https://wa.me/62xxxx?text=...
 * - Full scroll animations via IntersectionObserver (no external libs)
 * - All CSS is inlined for easy drop-in
 */

const Home = () => {
  // Path params support (e.g. "/invite/:to")
  const params = useParams();

  // Query params
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const query = useMemo(() => {
    const obj = {};
    for (const [k, v] of searchParams.entries()) obj[k] = v;
    return obj;
  }, [searchParams]);

  // Personalization values with sane defaults
  const guest = (params.to || query.to || "Sahabat").replace(/\+/g, " ");
  const child = (query.child || "Ananda").replace(/\+/g, " ");
  const parent1 = "Bapak Setyo Budiawan";
  const parent2 = "Ibu Shoimatu Tho'atin";
  const child1 = "M. Alfathan Setyo Putra";
  const child2 = "M. Fauzan Setyo Putra";
  const date = (query.date || "Minggu, 10 Agustus 2025").replace(/\+/g, " ");
  const time = (query.time || "09.00 WIB").replace(/\+/g, " ");
  const venue =
    "Dsn. Tugurejo RT. 01 RW. 01 Desa Sragi Kec. Talun, Kab. Blitar";
  const address =
    "Dsn. Tugurejo RT. 01 RW. 01 Desa Sragi Kec. Talun, Kab. Blitar";
  const mapsUrl = query.maps || "https://maps.google.com";
  const guestTC = titleCase(guest);
  const child1TC = titleCase(child1);
  const child2TC = titleCase(child2);
  const venueTC = titleCase(venue, { keepAcronyms: true });
  const addressTC = titleCase(address, { keepAcronyms: true });

  // Auto-generate WhatsApp RSVP text if not provided
  const defaultWa = `https://wa.me/6281234567890?text=${encodeURIComponent(
    `Assalamu'alaikum, insyaaAllah saya (${guestTC}) akan menghadiri khitan ${child1TC} & ${child2TC} pada ${date} — ${time}.`
  )}`;
  const rsvpUrl = query.rsvp || defaultWa;

  // Enable smooth scrolling globally and setup reveal animations
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollBehavior = "smooth";

    const els = Array.from(document.querySelectorAll(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [location.pathname]);

  return (
    <div className="khitan-page">
      {/* Local styles for the whole page */}
      <style>{`
        :root {
          --bg: #0f172a;         /* slate-900 */
          --soft: #1e293b;       /* slate-800 */
          --card: #111827;       /* gray-900 */
          --fg: #e2e8f0;         /* slate-200 */
          --muted: #94a3b8;      /* slate-400 */
          --accent: #38bdf8;     /* sky-400 */
          --accent-2: #f472b6;   /* pink-400 */
          --gold: #f59e0b;       /* amber-500 */
        }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; background: var(--bg); color: var(--fg); }
        a { color: inherit; text-decoration: none; }

        .khitan-page { position: relative; min-height: 100vh; overflow-x: hidden; }

        /* Decorative blobs */
        .blob { position: absolute; filter: blur(60px); opacity: .35; pointer-events: none; }
        .blob.one { width: 40vmax; height: 40vmax; background: radial-gradient(circle at 30% 30%, var(--accent), transparent 60%); top: -10vmax; left: -10vmax; }
        .blob.two { width: 40vmax; height: 40vmax; background: radial-gradient(circle at 70% 70%, var(--accent-2), transparent 60%); bottom: -10vmax; right: -10vmax; }

        /* Shared layout */
        .container { width: min(100%, 1000px); margin: 0 auto; padding: 0 20px; }
        section { position: relative; padding: 80px 0; }
        .card { background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
        .btn { display: inline-block; padding: 12px 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.06); color: var(--fg); font-weight: 600; cursor: pointer; transition: transform .15s ease, background .2s ease; }
        .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,.12); }
        .btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #0b1220; border: none; }
        .btn.gold { background: linear-gradient(135deg, #fff1, #fff0); border: 1px solid #f59e0bb3; color: #fcd34d; }

        /* Typography */
        .eyebrow { letter-spacing: .18em; text-transform: uppercase; font-weight: 700; color: var(--muted); font-size: .85rem; }
        .h1 { font-size: clamp(2.2rem, 4vw + 1rem, 4rem); line-height: 1.1; margin: 12px 0 18px; font-weight: 800; }
        .h2 { font-size: clamp(1.6rem, 2vw + .6rem, 2.4rem); margin: 0 0 12px; font-weight: 800; }
        .lead { color: var(--fg); opacity: .9; font-size: 1.05rem; }
        .muted { color: var(--muted); }
        .center { text-align: center; }

        /* Hero */
        .hero { padding: 120px 0 80px; }
        .hero-card { padding: 28px; }
        .chips { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .chip { font-size: .85rem; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); }
        .cta { display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }

        /* Grid sections */
        .grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
        @media (min-width: 760px) { .grid.two { grid-template-columns: 1.2fr .8fr; } }
        .panel { padding: 22px; }

        /* Timeline */
        .timeline { position: relative; padding-left: 22px; }
        .timeline::before { content: ""; position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: linear-gradient(var(--accent), transparent); }
        .t-item { position: relative; margin: 18px 0; }
        .t-item::before { content: ""; position: absolute; left: -2px; top: 6px; width: 16px; height: 16px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px rgba(56,189,248,.2); }

        /* Footer */
        .footer { padding: 50px 0 100px; text-align: center; color: var(--muted); }

        /* Reveal animations */
        .reveal { opacity: 0; transform: translateY(24px) scale(.98); filter: blur(6px); transition: opacity .8s ease, transform .8s ease, filter .8s ease; will-change: transform, opacity; }
        .reveal.in { opacity: 1; transform: none; filter: none; }
        [data-anim="left"].reveal { transform: translateX(-24px) scale(.98); }
        [data-anim="right"].reveal { transform: translateX(24px) scale(.98); }
        [data-anim="zoom"].reveal { transform: scale(.9); }

        /* Utility */
        .stack { display: grid; gap: 12px; }
        .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .space { height: 16px; }
        .map-link { color: var(--accent); font-weight: 600; text-decoration: underline; }
      `}</style>

      {/* Decorative blobs */}
      <div className="blob one" aria-hidden />
      <div className="blob two" aria-hidden />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="card hero-card reveal center" data-anim="zoom">
            <div className="eyebrow">Bismillah</div>
            <h1 className="h1">Khitan Invitation</h1>
            {/* <p className="lead">
              Dengan memohon rahmat Allah ﷻ, kami mengundang {guest} ke acara
              khitan:
            </p> */}
            <p className="lead">
              Ya Allah,, Jagalah dia dalam Rahmat-Mu, Bimbinglah dia dalam
              Ridho-Mu, Tuntunlah dia ke dalam Surga-Mu... Aamiin Ya Robbal
              'Alamin
            </p>
            <div className="chips" style={{ marginTop: 16 }}>
              <div className="chip">{child1TC}</div>
              <div className="chip">{child2TC}</div>
              <div className="chip">{date}</div>
              <div className="chip">{time}</div>
            </div>
            <div className="cta">
              <a href="#details" className="btn primary">
                Lihat Detail
              </a>
              <a href="#rsvp" className="btn gold">
                Konfirmasi Kehadiran
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section id="details">
        <div className="container grid two">
          <div className="panel card reveal" data-anim="left">
            <div className="stack">
              <div className="eyebrow">Detail Acara</div>
              <h2 className="h2">Waktu & Lokasi</h2>
              <div className="row">
                <span>📅</span>
                <span>{date}</span>
              </div>
              <div className="row">
                <span>⏰</span>
                <span>{time}</span>
              </div>
              <div className="row">
                <span>📍</span>
                <span>{venueTC}</span>
              </div>
              {/* <div className="row">
                <span>📫</span>
                <span className="muted">{address}</span>
              </div> */}
              <div className="space" />
              <div className="row">
                <a
                  className="btn"
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Buka Peta
                </a>
                <a className="btn" href="#agenda">
                  Lihat Agenda
                </a>
              </div>
            </div>
          </div>
          <div className="panel card reveal" data-anim="right">
            <div className="stack">
              <div className="eyebrow">Ucapan</div>
              <h2 className="h2">Assalamu’alaikum</h2>
              <p className="muted">
                "Ya Allah Tuhan kami, jadikanlah aku dan anak cucuku orang-orang
                yang tetap mendirikan Sholat, Ya Allah Tuhan kami,
                perkenankanlah do'aku" (Q.S. Ibrahim: 40)
              </p>
              <p className="muted">
                Kehadiran Saudara/i {guestTC} merupakan kehormatan bagi kami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AGENDA */}
      <section id="agenda">
        <div className="container">
          <div className="card panel reveal center" data-anim="zoom">
            <div className="eyebrow">Rangkaian Acara</div>
            <h2 className="h2">Agenda</h2>
            <div className="grid" style={{ marginTop: 8 }}>
              <div
                className="timeline"
                style={{ margin: "0 auto", maxWidth: 680 }}
              >
                <div className="t-item reveal" data-anim="left">
                  <h3 style={{ margin: 0 }}>Pembukaan & Sambutan</h3>
                  <div className="muted">08.30 – 09.00 WIB</div>
                </div>
                <div className="t-item reveal" data-anim="right">
                  <h3 style={{ margin: 0 }}>Prosesi Khitan</h3>
                  <div className="muted">09.00 – 09.30 WIB</div>
                </div>
                <div className="t-item reveal" data-anim="left">
                  <h3 style={{ margin: 0 }}>Do’a Bersama</h3>
                  <div className="muted">09.30 – 10.00 WIB</div>
                </div>
                <div className="t-item reveal" data-anim="right">
                  <h3 style={{ margin: 0 }}>Ramahan</h3>
                  <div className="muted">10.00 – Selesai</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp">
        <div className="container grid two">
          <div className="panel card reveal" data-anim="left">
            <div className="stack">
              <div className="eyebrow">Konfirmasi</div>
              <h2 className="h2">RSVP</h2>
              <p className="muted">
                Mohon konfirmasi kehadiran untuk membantu kami mempersiapkan
                acara dengan baik.
              </p>
              <div className="row">
                <a
                  className="btn primary"
                  href={rsvpUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Konfirmasi via WhatsApp
                </a>
                <a className="btn" href="#details">
                  Kembali ke Detail
                </a>
              </div>
            </div>
          </div>
          <div className="panel card reveal center" data-anim="right">
            <div className="stack">
              <div className="eyebrow">Untuk</div>
              <h2 className="h2" style={{ marginBottom: 0 }}>
                {guestTC}
              </h2>
              <div className="muted">
                Semoga Allah ﷻ memudahkan langkah {guestTC} dan membalas
                kebaikan {guestTC} dengan berlipat ganda.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer reveal center" data-anim="zoom">
        <div className="container">
          <div className="stack">
            <div>وَالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ</div>
            <div className="muted">
              Terima kasih atas do’a dan kehadirannya.
            </div>
            <div
              className="row"
              style={{ justifyContent: "center", marginTop: 8 }}
            >
              <a
                className="btn"
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Kembali ke Atas ↑
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Debug info (collapse if not needed) */}
      <details
        className="container"
        style={{ marginBottom: 60, color: "var(--muted)" }}
      >
        <summary>URL Debug</summary>
        <pre>Path params: {JSON.stringify(params, null, 2)}</pre>
        <pre>Query params: {JSON.stringify(query, null, 2)}</pre>
        <pre>Current URL: {location.pathname + location.search}</pre>
      </details>
    </div>
  );
};

export default Home;

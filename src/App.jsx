import { useState, useRef, useCallback } from "react";

const STORAGE_KEY = "jadi_lebih_baik_submissions";

function getSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSubmission(entry) {
  try {
    const existing = getSubmissions();
    existing.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch { }
}

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #0A0A0A;
    --white: #FAFAF8;
    --accent: #2563EB;
    --accent-light: #EFF6FF;
    --green: #16A34A;
    --green-light: #F0FDF4;
    --border: #E2E2DC;
    --muted: #6B6B65;
    --surface: #F5F5F0;
    --radius: 4px;
    --radius-lg: 8px;
  }

  body { background: var(--white); color: var(--black); font-family: 'DM Sans', sans-serif; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* NAV */
  .nav {
    border-bottom: 1.5px solid var(--black);
    padding: 0 2rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: var(--white);
    z-index: 100;
  }
  .nav-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.5px;
  }
  .nav-logo span { color: var(--accent); }
  .nav-tag {
    font-size: 11px;
    font-weight: 500;
    border: 1.5px solid var(--black);
    padding: 3px 8px;
    border-radius: var(--radius);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* HERO */
  .hero {
    border-bottom: 1.5px solid var(--black);
    padding: 4rem 2rem 3rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: end;
  }
  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.8rem, 5vw, 4.5rem);
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -2px;
  }
  .hero-title .accent { color: var(--accent); }
  .hero-sub {
    font-size: 15px;
    color: var(--muted);
    line-height: 1.6;
    max-width: 360px;
    margin-top: 1rem;
  }
  .hero-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    border: 1.5px solid var(--black);
    border-radius: var(--radius-lg);
    overflow: hidden;
    align-self: end;
  }
  .stat-box {
    padding: 1.25rem;
    background: var(--surface);
  }
  .stat-box:nth-child(2) { background: var(--black); color: var(--white); }
  .stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    display: block;
  }
  .stat-box:nth-child(2) .stat-num { color: var(--white); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; display: block; }
  .stat-box:nth-child(2) .stat-label { color: #999; }

  /* MAIN */
  .main { flex: 1; padding: 2.5rem 2rem; max-width: 860px; margin: 0 auto; width: 100%; }

  /* UPLOAD ZONE */
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius-lg);
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: var(--surface);
    position: relative;
  }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--accent); background: var(--accent-light); }
  .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .upload-icon { font-size: 2.5rem; margin-bottom: 1rem; color: var(--muted); }
  .upload-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; margin-bottom: 6px; }
  .upload-hint { font-size: 13px; color: var(--muted); }

  /* PREVIEW */
  .preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    border: 1.5px solid var(--black);
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  .preview-pane { position: relative; aspect-ratio: 4/3; overflow: hidden; }
  .preview-pane img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .preview-label {
    position: absolute;
    top: 10px; left: 10px;
    background: var(--black);
    color: var(--white);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: var(--radius);
  }
  .preview-label.after { background: var(--accent); }
  .preview-placeholder {
    width: 100%;
    height: 100%;
    background: var(--surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--muted);
    font-size: 13px;
  }

  /* LOADING PANE */
  .loading-pane {
    width: 100%; height: 100%;
    background: var(--surface);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 16px;
  }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: var(--muted); text-align: center; padding: 0 1rem; }

  /* DESCRIPTION */
  .field-label {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: block;
  }
  .desc-area {
    width: 100%;
    min-height: 90px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 12px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    resize: vertical;
    background: var(--white);
    transition: border-color 0.15s;
    color: var(--black);
  }
  .desc-area:focus { outline: none; border-color: var(--accent); }

  /* BUTTON */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px;
    border-radius: var(--radius);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.3px;
    cursor: pointer;
    border: 1.5px solid transparent;
    transition: all 0.12s;
  }
  .btn-primary {
    background: var(--black);
    color: var(--white);
    border-color: var(--black);
  }
  .btn-primary:hover { background: var(--accent); border-color: var(--accent); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-outline {
    background: var(--white);
    color: var(--black);
    border-color: var(--black);
  }
  .btn-outline:hover { background: var(--surface); }
  .btn-green {
    background: var(--green);
    color: var(--white);
    border-color: var(--green);
  }
  .btn-green:hover { opacity: 0.85; }

  /* ACTIONS ROW */
  .actions-row {
    display: flex; gap: 10px; flex-wrap: wrap;
    padding: 1.25rem;
    border: 1.5px solid var(--black);
    border-radius: var(--radius-lg);
    background: var(--surface);
    margin-bottom: 1.5rem;
    align-items: center;
  }
  .link-box {
    flex: 1;
    min-width: 180px;
    display: flex; align-items: center;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
    font-family: 'DM Sans', monospace;
    overflow: hidden;
  }
  .link-box span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

  /* AI DESCRIPTION */
  .ai-desc-box {
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    background: var(--green-light);
    margin-bottom: 1.5rem;
  }
  .ai-desc-heading {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--green);
    margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .ai-desc-text { font-size: 14px; line-height: 1.65; color: var(--black); }

  /* GALLERY */
  .gallery-section { margin-top: 3rem; border-top: 1.5px solid var(--black); padding-top: 2rem; }
  .gallery-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  .gallery-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem; letter-spacing: -0.5px; }
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1px; border: 1.5px solid var(--black); border-radius: var(--radius-lg); overflow: hidden; }
  .gallery-card { background: var(--surface); position: relative; cursor: pointer; }
  .gallery-card:hover .gallery-overlay { opacity: 1; }
  .gallery-img-wrap { aspect-ratio: 4/3; overflow: hidden; }
  .gallery-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gallery-info { padding: 10px 12px; border-top: 1px solid var(--border); }
  .gallery-loc { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .gallery-time { font-size: 11px; color: var(--muted); }
  .gallery-overlay {
    position: absolute; inset: 0;
    background: rgba(10,10,10,0.6);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s;
    color: white; font-size: 13px; font-weight: 500;
    gap: 6px;
  }

  /* MODAL */
  .modal-bg {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(10,10,10,0.75);
    display: flex; align-items: center; justify-content: center;
    padding: 2rem;
  }
  .modal {
    background: var(--white);
    border: 1.5px solid var(--black);
    border-radius: var(--radius-lg);
    max-width: 720px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1.5px solid var(--black);
    position: sticky; top: 0; background: var(--white); z-index: 1;
  }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1rem; }
  .modal-close { cursor: pointer; font-size: 20px; color: var(--muted); background: none; border: none; }
  .modal-body { padding: 1.25rem; }

  .section-gap { margin-bottom: 1.5rem; }

  /* ERROR */
  .error-box {
    background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: var(--radius-lg);
    padding: 1rem 1.25rem; color: #B91C1C; font-size: 14px; margin-bottom: 1rem;
  }

  /* TOAST */
  .toast {
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: var(--black); color: var(--white);
    padding: 12px 24px; border-radius: var(--radius);
    font-size: 14px; font-family: 'Syne', sans-serif; font-weight: 700;
    z-index: 300; animation: toastIn 0.2s ease;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  /* STEP INDICATOR */
  .step-row {
    display: flex; align-items: center; gap: 0;
    margin-bottom: 1.5rem;
    border: 1.5px solid var(--black);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .step-item {
    flex: 1; padding: 10px; text-align: center;
    font-size: 12px; font-weight: 700; font-family: 'Syne', sans-serif;
    text-transform: uppercase; letter-spacing: 0.5px;
    color: var(--muted); background: var(--surface);
    border-right: 1.5px solid var(--black);
    transition: all 0.2s;
  }
  .step-item:last-child { border-right: none; }
  .step-item.active { background: var(--black); color: var(--white); }
  .step-item.done { background: var(--accent); color: var(--white); }

  @media (max-width: 640px) {
    .hero { grid-template-columns: 1fr; }
    .hero-stats { grid-template-columns: 1fr 1fr; }
    .preview-grid { grid-template-columns: 1fr; }
  }
`;

const STEP_LABELS = ["Upload", "Describe", "Transform", "Share"];

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export default function JadiLebihBaik() {
  const [image, setImage] = useState(null); // base64
  const [imageFile, setImageFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { afterImage, aiDesc, id }
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [toast, setToast] = useState("");
  const [submissions, setSubmissions] = useState(getSubmissions);
  const [modalEntry, setModalEntry] = useState(null);
  const fileRef = useRef();

  const step = !image ? 0 : !result ? (loading ? 2 : 1) : 3;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleTransform = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    try {
      const base64Data = image.split(",")[1];
      const mediaType = image.split(";")[0].split(":")[1] || "image/jpeg";

      const prompt = `You are an urban design AI assistant helping Indonesian citizens visualize improvements to their city.

The user has uploaded a photo of a real location in Indonesia${desc ? ` and described it as: "${desc}"` : ""}.

Your tasks:
1. Analyze what problems are visible (e.g. messy road, no pedestrian path, unregulated trash, broken infrastructure).
2. Generate a detailed, vivid HTML/CSS art description, but most importantly: write a clear, optimistic paragraph in Indonesian (Bahasa Indonesia) describing what improvements were made to this place.
3. Then, create a visual representation using an HTML canvas drawing or SVG that attempts to show an "improved" version of the scene — cleaner roads, better greenery, organized trash, pedestrian-friendly paths.

IMPORTANT: Respond ONLY in this exact JSON format (no markdown, no backticks):
{
  "problems_found": ["problem 1", "problem 2"],
  "improvements_made": ["improvement 1", "improvement 2"],  
  "description_id": "Deskripsi singkat dalam bahasa Indonesia tentang versi yang lebih baik dari tempat ini, 2-3 kalimat, optimis dan spesifik.",
  "scene_analysis": "Brief English description of what the scene shows",
  "color_palette": {
    "sky": "#87CEEB",
    "road": "#888888",
    "building": "#D4A88C",
    "greenery": "#4CAF50",
    "accent": "#FF6B35"
  }
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              { type: "text", text: prompt }
            ]
          }]
        })
      });

      const data = await response.json();
      const rawText = data.content?.map(c => c.text || "").join("").trim();
      let parsed;
      try {
        const clean = rawText.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = {
          problems_found: ["Kondisi jalan tidak tertata"],
          improvements_made: ["Jalan diperbaiki", "Tanaman hijau ditambahkan"],
          description_id: "Tempat ini telah ditransformasi menjadi ruang publik yang lebih bersih, hijau, dan nyaman untuk semua warga.",
          scene_analysis: "Urban street scene",
          color_palette: { sky: "#87CEEB", road: "#888888", building: "#D4A88C", greenery: "#4CAF50", accent: "#FF6B35" }
        };
      }

      // Generate "after" image as SVG data URL
      const afterSvg = generateAfterSVG(parsed);
      const id = generateId();
      const entry = {
        id,
        beforeImage: image,
        afterImage: afterSvg,
        aiDesc: parsed.description_id,
        problems: parsed.problems_found,
        improvements: parsed.improvements_made,
        scene: parsed.scene_analysis,
        location: desc || "Lokasi tanpa nama",
        timestamp: Date.now(),
      };
      saveSubmission(entry);
      setSubmissions(getSubmissions());
      setResult(entry);
    } catch (err) {
      setError("Gagal memproses gambar. Coba lagi ya! (" + err.message + ")");
    }
    setLoading(false);
  };

  const generateAfterSVG = (parsed) => {
    const c = parsed.color_palette || {};
    const sky = c.sky || "#87CEEB";
    const road = c.road || "#9E9E9E";
    const building = c.building || "#D4A88C";
    const greenery = c.greenery || "#4CAF50";
    const accent = c.accent || "#FF6B35";
    const greenDark = "#2E7D32";
    const sidewalk = "#F5F5DC";
    const yellow = "#FFD700";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sky}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#E0F4FF" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${road}"/>
      <stop offset="100%" stop-color="#666"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="800" height="600" fill="url(#skyGrad)"/>

  <!-- Clouds -->
  <ellipse cx="150" cy="80" rx="60" ry="25" fill="white" opacity="0.85"/>
  <ellipse cx="190" cy="70" rx="50" ry="22" fill="white" opacity="0.85"/>
  <ellipse cx="120" cy="75" rx="40" ry="20" fill="white" opacity="0.85"/>
  <ellipse cx="600" cy="60" rx="70" ry="28" fill="white" opacity="0.85"/>
  <ellipse cx="640" cy="50" rx="55" ry="24" fill="white" opacity="0.85"/>
  <ellipse cx="570" cy="55" rx="45" ry="20" fill="white" opacity="0.85"/>

  <!-- Background buildings -->
  <rect x="0" y="180" width="120" height="200" fill="${building}" rx="2"/>
  <rect x="10" y="170" width="100" height="15" fill="${accent}" opacity="0.5"/>
  <rect x="15" y="195" width="20" height="25" fill="#B8C8E0"/>
  <rect x="45" y="195" width="20" height="25" fill="#B8C8E0"/>
  <rect x="75" y="195" width="20" height="25" fill="#B8C8E0"/>
  <rect x="15" y="235" width="20" height="25" fill="#B8C8E0"/>
  <rect x="45" y="235" width="20" height="25" fill="#B8C8E0"/>
  <rect x="75" y="235" width="20" height="25" fill="#B8C8E0"/>

  <rect x="680" y="160" width="120" height="220" fill="${building}" rx="2"/>
  <rect x="690" y="150" width="100" height="15" fill="${accent}" opacity="0.5"/>
  <rect x="695" y="175" width="20" height="25" fill="#B8C8E0"/>
  <rect x="725" y="175" width="20" height="25" fill="#B8C8E0"/>
  <rect x="755" y="175" width="20" height="25" fill="#B8C8E0"/>
  <rect x="695" y="215" width="20" height="25" fill="#B8C8E0"/>
  <rect x="725" y="215" width="20" height="25" fill="#B8C8E0"/>
  <rect x="755" y="215" width="20" height="25" fill="#B8C8E0"/>

  <!-- Mid buildings -->
  <rect x="130" y="200" width="160" height="180" fill="#C9B99A" rx="2"/>
  <rect x="140" y="190" width="140" height="15" fill="${greenery}" opacity="0.6"/>
  <rect x="145" y="215" width="30" height="40" fill="#90CAF9"/>
  <rect x="185" y="215" width="30" height="40" fill="#90CAF9"/>
  <rect x="225" y="215" width="30" height="40" fill="#90CAF9"/>
  <rect x="145" y="265" width="30" height="40" fill="#90CAF9"/>
  <rect x="185" y="265" width="30" height="40" fill="#90CAF9"/>
  <rect x="225" y="265" width="30" height="40" fill="#90CAF9"/>

  <rect x="510" y="190" width="170" height="190" fill="#C8B99A" rx="2"/>
  <rect x="520" y="180" width="150" height="15" fill="${greenery}" opacity="0.6"/>
  <rect x="525" y="205" width="30" height="40" fill="#90CAF9"/>
  <rect x="565" y="205" width="30" height="40" fill="#90CAF9"/>
  <rect x="605" y="205" width="30" height="40" fill="#90CAF9"/>
  <rect x="645" y="205" width="25" height="40" fill="#90CAF9"/>
  <rect x="525" y="255" width="30" height="40" fill="#90CAF9"/>
  <rect x="565" y="255" width="30" height="40" fill="#90CAF9"/>
  <rect x="605" y="255" width="30" height="40" fill="#90CAF9"/>

  <!-- Green strip on buildings -->
  <rect x="130" y="370" width="160" height="10" fill="${greenery}" opacity="0.4"/>
  <rect x="510" y="370" width="170" height="10" fill="${greenery}" opacity="0.4"/>

  <!-- Ground/Road area -->
  <!-- Sidewalk left -->
  <rect x="0" y="380" width="140" height="220" fill="${sidewalk}"/>
  <!-- Sidewalk right -->
  <rect x="660" y="380" width="140" height="220" fill="${sidewalk}"/>
  <!-- Road -->
  <rect x="140" y="380" width="520" height="220" fill="url(#roadGrad)"/>

  <!-- Road markings -->
  <rect x="390" y="390" width="20" height="50" fill="${yellow}" opacity="0.9" rx="2"/>
  <rect x="390" y="460" width="20" height="50" fill="${yellow}" opacity="0.9" rx="2"/>
  <rect x="390" y="530" width="20" height="50" fill="${yellow}" opacity="0.9" rx="2"/>

  <!-- Pedestrian crossing -->
  <rect x="200" y="395" width="30" height="10" fill="white" opacity="0.7"/>
  <rect x="240" y="395" width="30" height="10" fill="white" opacity="0.7"/>
  <rect x="280" y="395" width="30" height="10" fill="white" opacity="0.7"/>
  <rect x="200" y="415" width="30" height="10" fill="white" opacity="0.7"/>
  <rect x="240" y="415" width="30" height="10" fill="white" opacity="0.7"/>
  <rect x="280" y="415" width="30" height="10" fill="white" opacity="0.7"/>

  <!-- Proper sidewalk paving pattern left -->
  <line x1="0" y1="400" x2="140" y2="400" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="0" y1="420" x2="140" y2="420" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="0" y1="440" x2="140" y2="440" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="0" y1="460" x2="140" y2="460" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="35" y1="380" x2="35" y2="600" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="70" y1="380" x2="70" y2="600" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="105" y1="380" x2="105" y2="600" stroke="#CCC" stroke-width="1" opacity="0.5"/>

  <!-- Proper sidewalk paving pattern right -->
  <line x1="660" y1="400" x2="800" y2="400" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="660" y1="420" x2="800" y2="420" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="660" y1="440" x2="800" y2="440" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="660" y1="460" x2="800" y2="460" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="695" y1="380" x2="695" y2="600" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="730" y1="380" x2="730" y2="600" stroke="#CCC" stroke-width="1" opacity="0.5"/>
  <line x1="765" y1="380" x2="765" y2="600" stroke="#CCC" stroke-width="1" opacity="0.5"/>

  <!-- Trees left side -->
  <rect x="20" y="320" width="8" height="65" fill="#795548"/>
  <circle cx="24" cy="305" r="28" fill="${greenDark}"/>
  <circle cx="24" cy="295" r="22" fill="${greenery}"/>

  <rect x="65" y="325" width="8" height="60" fill="#795548"/>
  <circle cx="69" cy="310" r="26" fill="${greenDark}"/>
  <circle cx="69" cy="300" r="20" fill="${greenery}"/>

  <rect x="108" y="330" width="8" height="55" fill="#795548"/>
  <circle cx="112" cy="316" r="24" fill="${greenDark}"/>
  <circle cx="112" cy="306" r="18" fill="${greenery}"/>

  <!-- Trees right side -->
  <rect x="672" y="320" width="8" height="65" fill="#795548"/>
  <circle cx="676" cy="305" r="28" fill="${greenDark}"/>
  <circle cx="676" cy="295" r="22" fill="${greenery}"/>

  <rect x="718" y="325" width="8" height="60" fill="#795548"/>
  <circle cx="722" cy="310" r="26" fill="${greenDark}"/>
  <circle cx="722" cy="300" r="20" fill="${greenery}"/>

  <rect x="762" y="330" width="8" height="55" fill="#795548"/>
  <circle cx="766" cy="316" r="24" fill="${greenDark}"/>
  <circle cx="766" cy="306" r="18" fill="${greenery}"/>

  <!-- Trash bins (clean, organized) -->
  <rect x="130" y="450" width="18" height="25" fill="#1976D2" rx="2"/>
  <rect x="128" y="447" width="22" height="5" fill="#1565C0" rx="1"/>
  <text x="139" y="463" text-anchor="middle" fill="white" font-size="9" font-family="sans-serif">♻</text>

  <rect x="660" y="450" width="18" height="25" fill="#388E3C" rx="2"/>
  <rect x="658" y="447" width="22" height="5" fill="#2E7D32" rx="1"/>
  <text x="669" y="463" text-anchor="middle" fill="white" font-size="9" font-family="sans-serif">♻</text>

  <!-- Street lights -->
  <rect x="140" y="300" width="6" height="90" fill="#546E7A"/>
  <rect x="137" y="295" width="18" height="8" fill="#546E7A" rx="4"/>
  <ellipse cx="150" cy="292" rx="8" ry="5" fill="${yellow}" opacity="0.9"/>

  <rect x="654" y="300" width="6" height="90" fill="#546E7A"/>
  <rect x="651" y="295" width="18" height="8" fill="#546E7A" rx="4"/>
  <ellipse cx="660" cy="292" rx="8" ry="5" fill="${yellow}" opacity="0.9"/>

  <!-- Pedestrians (stick figures) -->
  <circle cx="55" cy="420" r="8" fill="#FFCDD2"/>
  <line x1="55" y1="428" x2="55" y2="460" stroke="#5C6BC0" stroke-width="3"/>
  <line x1="55" y1="438" x2="40" y2="448" stroke="#5C6BC0" stroke-width="2"/>
  <line x1="55" y1="438" x2="70" y2="448" stroke="#5C6BC0" stroke-width="2"/>
  <line x1="55" y1="460" x2="45" y2="478" stroke="#5C6BC0" stroke-width="2"/>
  <line x1="55" y1="460" x2="65" y2="478" stroke="#5C6BC0" stroke-width="2"/>

  <circle cx="95" cy="415" r="8" fill="#FFE0B2"/>
  <line x1="95" y1="423" x2="95" y2="455" stroke="#E91E63" stroke-width="3"/>
  <line x1="95" y1="433" x2="80" y2="443" stroke="#E91E63" stroke-width="2"/>
  <line x1="95" y1="433" x2="110" y2="443" stroke="#E91E63" stroke-width="2"/>
  <line x1="95" y1="455" x2="85" y2="473" stroke="#E91E63" stroke-width="2"/>
  <line x1="95" y1="455" x2="105" y2="473" stroke="#E91E63" stroke-width="2"/>

  <!-- Bicycle -->
  <circle cx="720" cy="455" r="14" fill="none" stroke="#1976D2" stroke-width="2.5"/>
  <circle cx="750" cy="455" r="14" fill="none" stroke="#1976D2" stroke-width="2.5"/>
  <line x1="720" y1="455" x2="735" y2="438" stroke="#1976D2" stroke-width="2.5"/>
  <line x1="735" y1="438" x2="750" y2="455" stroke="#1976D2" stroke-width="2.5"/>
  <line x1="735" y1="438" x2="735" y2="428" stroke="#1976D2" stroke-width="2.5"/>
  <line x1="729" y1="428" x2="741" y2="428" stroke="#1976D2" stroke-width="2.5"/>
  <circle cx="735" cy="455" r="3" fill="#1976D2"/>

  <!-- Flowers/greenery strip -->
  <rect x="0" y="375" width="140" height="8" fill="${greenery}" opacity="0.6"/>
  <rect x="660" y="375" width="140" height="8" fill="${greenery}" opacity="0.6"/>
  <circle cx="15" cy="375" r="5" fill="#E91E63"/>
  <circle cx="35" cy="373" r="4" fill="#FF5722"/>
  <circle cx="55" cy="375" r="5" fill="#FF9800"/>
  <circle cx="75" cy="373" r="4" fill="#E91E63"/>
  <circle cx="95" cy="375" r="5" fill="#9C27B0"/>
  <circle cx="115" cy="373" r="4" fill="#FF5722"/>
  <circle cx="680" cy="375" r="5" fill="#E91E63"/>
  <circle cx="700" cy="373" r="4" fill="#FF5722"/>
  <circle cx="720" cy="375" r="5" fill="#FF9800"/>
  <circle cx="740" cy="373" r="4" fill="#E91E63"/>
  <circle cx="760" cy="375" r="5" fill="#9C27B0"/>
  <circle cx="780" cy="373" r="4" fill="#FF5722"/>

  <!-- "Jadi Lebih Baik" watermark -->
  <rect x="10" y="10" width="140" height="26" fill="rgba(0,0,0,0.5)" rx="3"/>
  <text x="80" y="27" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="sans-serif">✦ Jadi Lebih Baik</text>
</svg>`;

    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  };

  const handleDownload = () => {
    if (!result) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1600; canvas.height = 600;
    const ctx = canvas.getContext("2d");
    const before = new Image(); before.crossOrigin = "anonymous";
    const after = new Image(); after.crossOrigin = "anonymous";
    let loaded = 0;
    const draw = () => {
      loaded++;
      if (loaded < 2) return;
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, 1600, 600);
      ctx.drawImage(before, 0, 0, 800, 600);
      ctx.drawImage(after, 800, 0, 800, 600);
      const link = document.createElement("a");
      link.download = `jadi-lebih-baik-${result.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    before.onload = draw; after.onload = draw;
    before.src = result.beforeImage; after.src = result.afterImage;
    showToast("Mengunduh gambar...");
  };

  const handleShare = () => {
    const url = `${window.location.href}#entry-${result?.id}`;
    if (navigator.share) {
      navigator.share({ title: "Jadi Lebih Baik", text: result?.aiDesc || "", url });
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link disalin ke clipboard!");
    }
  };

  const resetAll = () => {
    setImage(null); setImageFile(null); setDesc(""); setResult(null); setError("");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">Jadi Lebih<span> Baik</span></div>
          <div className="nav-tag">Beta — 100% Gratis</div>
        </nav>

        <section className="hero">
          <div>
            <h1 className="hero-title">Bayangkan<br />Indonesia<br /><span className="accent">lebih baik.</span></h1>
            <p className="hero-sub">Upload foto lingkunganmu — jalan rusak, trotoar sempit, sampah berserakan — dan lihat versi yang lebih baik melalui AI.</p>
          </div>
          <div className="hero-stats">
            <div className="stat-box">
              <span className="stat-num">{submissions.length}</span>
              <span className="stat-label">Transformasi dibuat</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">100%</span>
              <span className="stat-label">Gratis selamanya</span>
            </div>
            <div className="stat-box" style={{ background: "var(--accent)", color: "white" }}>
              <span className="stat-num" style={{ color: "white" }}>AI</span>
              <span className="stat-label" style={{ color: "rgba(255,255,255,0.7)" }}>Berbasis Claude</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">🇮🇩</span>
              <span className="stat-label">Untuk Indonesia</span>
            </div>
          </div>
        </section>

        <div className="main">
          <div className="step-row">
            {STEP_LABELS.map((l, i) => (
              <div key={l} className={`step-item ${i === step ? "active" : i < step ? "done" : ""}`}>
                {i < step ? "✓ " : ""}{l}
              </div>
            ))}
          </div>

          {/* UPLOAD */}
          {!image && (
            <div
              className={`upload-zone ${drag ? "drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
              <div className="upload-icon">📷</div>
              <div className="upload-title">Upload foto lingkunganmu</div>
              <div className="upload-hint">Klik atau seret gambar ke sini — JPG, PNG, WEBP</div>
              <div className="upload-hint" style={{ marginTop: "8px" }}>Contoh: jalan rusak, trotoar sempit, tumpukan sampah, banjir</div>
            </div>
          )}

          {/* PREVIEW GRID */}
          {image && (
            <div className="preview-grid">
              <div className="preview-pane">
                <img src={image} alt="Before" />
                <div className="preview-label">Sebelum</div>
              </div>
              <div className="preview-pane">
                {loading ? (
                  <div className="loading-pane">
                    <div className="spinner" />
                    <div className="loading-text">AI sedang membayangkan versi yang lebih baik...</div>
                  </div>
                ) : result ? (
                  <>
                    <img src={result.afterImage} alt="After" />
                    <div className="preview-label after">Sesudah</div>
                  </>
                ) : (
                  <div className="preview-placeholder">
                    <span style={{ fontSize: "2rem" }}>✨</span>
                    <span>Visualisasi AI akan muncul di sini</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DESCRIPTION INPUT */}
          {image && !result && !loading && (
            <div className="section-gap">
              <label className="field-label">Ceritakan kondisinya (opsional)</label>
              <textarea
                className="desc-area"
                placeholder="Contoh: Jalan ini sering banjir dan tidak ada trotoar untuk pejalan kaki..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
          )}

          {error && <div className="error-box">⚠ {error}</div>}

          {/* CTA BUTTONS */}
          {image && !result && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={handleTransform} disabled={loading}>
                {loading ? "Memproses..." : "✦ Transformasi Sekarang"}
              </button>
              <button className="btn btn-outline" onClick={resetAll}>Ganti Foto</button>
            </div>
          )}

          {/* AI DESCRIPTION */}
          {result?.aiDesc && (
            <div className="ai-desc-box section-gap">
              <div className="ai-desc-heading">✦ Deskripsi AI</div>
              <div className="ai-desc-text">{result.aiDesc}</div>
              {result.improvements?.length > 0 && (
                <ul style={{ marginTop: "10px", paddingLeft: "16px", fontSize: "13px", color: "var(--green)", lineHeight: "1.8" }}>
                  {result.improvements.map((imp, i) => <li key={i}>✓ {imp}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* SHARE + DOWNLOAD */}
          {result && (
            <div className="actions-row">
              <div className="link-box">
                <span>🔗</span>
                <span>{window.location.href}#entry-{result.id}</span>
              </div>
              <button className="btn btn-outline" onClick={handleShare}>
                ↗ Bagikan
              </button>
              <button className="btn btn-green" onClick={handleDownload}>
                ↓ Unduh
              </button>
              <button className="btn btn-outline" onClick={resetAll}>
                + Baru
              </button>
            </div>
          )}

          {/* GALLERY */}
          {submissions.length > 0 && (
            <div className="gallery-section">
              <div className="gallery-header">
                <div className="gallery-title">Transformasi Komunitas</div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>{submissions.length} kiriman</div>
              </div>
              <div className="gallery-grid">
                {submissions.map(entry => (
                  <div key={entry.id} className="gallery-card" onClick={() => setModalEntry(entry)}>
                    <div className="gallery-img-wrap">
                      <img src={entry.afterImage} alt={entry.location} />
                    </div>
                    <div className="gallery-info">
                      <div className="gallery-loc">{entry.location || "Lokasi tanpa nama"}</div>
                      <div className="gallery-time">{timeAgo(entry.timestamp)}</div>
                    </div>
                    <div className="gallery-overlay">
                      <span>👁</span> Lihat transformasi
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
        {modalEntry && (
          <div className="modal-bg" onClick={() => setModalEntry(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">{modalEntry.location || "Transformasi"}</div>
                <button className="modal-close" onClick={() => setModalEntry(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="preview-grid" style={{ marginBottom: "1rem" }}>
                  <div className="preview-pane">
                    <img src={modalEntry.beforeImage} alt="Before" />
                    <div className="preview-label">Sebelum</div>
                  </div>
                  <div className="preview-pane">
                    <img src={modalEntry.afterImage} alt="After" />
                    <div className="preview-label after">Sesudah</div>
                  </div>
                </div>
                {modalEntry.aiDesc && (
                  <div className="ai-desc-box">
                    <div className="ai-desc-heading">✦ Deskripsi AI</div>
                    <div className="ai-desc-text">{modalEntry.aiDesc}</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="btn btn-outline" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.href}#entry-${modalEntry.id}`);
                    showToast("Link disalin!");
                  }}>↗ Salin Link</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

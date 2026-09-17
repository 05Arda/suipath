<div align="center">

  <img src="public/tracelogo.svg" alt="TRACE Logo" width="120" height="120" />

  # TRACE
  ### The Decentralized Event Orchestration & Proof-of-Presence Protocol on Sui

  [![Sui Network](https://img.shields.io/badge/Network-Sui_Testnet-0284c7?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io/)
  [![Walrus Protocol](https://img.shields.io/badge/Storage-Walrus_Decentralized_Blob-278285?style=for-the-badge)](https://walrus.xyz/)
  [![Next.js](https://img.shields.io/badge/Frontend-Next.js_16_Turbopack-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/Database-Neon_Serverless_PG-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)

  <p align="center">
    <strong>Fiziksel ve dijital etkinlik deneyimlerini Sui blokzincirinin yüksek işlem hızı ve Walrus merkeziyetsiz depolama katmanıyla buluşturan yeni nesil katılım kanıtı ekosistemi.</strong>
  </p>

</div>

---

## 🌐 Vizyon ve Genel Bakış

**TRACE**, Web3 ekosistemindeki dağınık etkinlik yönetimini ve yüzeysel katılım metriklerini kökten dönüştürmek amacıyla tasarlanmış kurumsal düzeyde bir **Proof-of-Attendance (PoA)** ve **Etkinlik Orkestrasyon Altyapısıdır**.

Geleneksel etkinlik biletleme ve sadakat sistemleri; şeffaf olmayan veri tabanlarına, aracı bilet tekellerine ve kalıcı olmayan dijital kanıtlara mahkumdur. TRACE, bu paradigmayı yıkarak her fiziksel ve sanal etkileşimi **Sui Network** üzerinde kriptografik olarak doğrulanabilir, **Walrus** üzerinde sansürlenemez biçimde saklanan ve dinamik katmanlı (tiered) NFT'lerle ödüllendirilen yaşayan bir dijital mirasa dönüştürür.

---

## ⚡ Temel Mimari Sütunlar

```
                               ┌─────────────────────────┐
                               │       TRACE CLIENT      │
                               │  (Next.js 16 + React 19)│
                               └────────────┬────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
         ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
         │     SUI NETWORK     │ │   WALRUS PROTOCOL   │ │   NEON SERVERLESS   │
         │  @mysten/dapp-kit   │ │  Decentralized Blob │ │ High-Concurrency DB │
         │   On-Chain Identity │ │ Immutable Metadata  │ │ Spatial & Analytics │
         └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

### 1. Sui Odaklı Yüksek Hızlı Mutabakat
* `@mysten/sui` ve `@mysten/dapp-kit` entegrasyonu sayesinde kullanıcılar tek tıkla Sui cüzdanlarıyla (Sui Wallet, Ethos, Suiet vb.) sisteme dahil olur.
* Sub-second finality (saniye-altı kesinlik) avantajı, etkinlik kapılarında ve anlık NFT mint süreçlerinde sıfır gecikmeli bir kullanıcı deneyimi sunar.

### 2. Walrus Protokolü ile Merkeziyetsiz Veri Koruma
* Etkinlik afişleri, hatıra rozetleri ve katılım kanıtları üçüncü parti merkezi sunucularda değil; Mysten Labs'in yeni nesil merkeziyetsiz blob depolama ağı **Walrus** üzerinde saklanır.
* Sunucu taraflı şifreli anahtar türetme altyapısıyla büyük boyutlu dijital varlıklar tek hamlede epoch bazlı merkeziyetsiz depolamaya aktarılır.

### 3. Dinamik Katmanlı NFT Ekosistemi (Tiered Reputation)
* Katılımcı sadakati sıradan statik rozetlerle değil; **Bronze, Silver, Gold ve Platinum** seviyelerine ayrılmış dinamik ve transfer edilebilir on-chain itibar belirteçleriyle ödüllendirilir.

### 4. Coğrafi ve Mekânsal Zeka (Spatial Event Intelligence)
* Leaflet tabanlı dinamik küresel harita motoru, etkinlikleri coğrafi koordinatlarıyla haritalandırır; gerçek zamanlı ülke bazlı filtreleme ve lokasyon doğrulama sağlar.

### 5. Sıvı ve Fütüristik Tasarım Dili
* Sui'nin akışkan okyanus kimliğinden ilham alan **Deep Cyan & Obsidian** renk paleti, Tailwind CSS v4 ve Three.js görsel efektleriyle birleşerek modern Web3 tasarım standartlarını yeniden tanımlar.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Çekirdek Çatı** | `Next.js 16.0.7` | Turbopack motoru ve React 19 ile optimize edilmiş App Router mimarisi |
| **Blokzincir Katmanı** | `@mysten/sui` & `@mysten/dapp-kit` | Sui testnet/mainnet RPC bağlantısı, akıllı sözleşme tetikleyicileri |
| **Merkeziyetsiz Depolama**| `@mysten/walrus` | Epoch tabanlı, yüksek verimli merkeziyetsiz dosya ve görsel depolama |
| **Veritabanı & ORM** | `Neon Database Serverless` | PostgreSQL uyumlu, anlık ölçeklenen sunucusuz veritabanı altyapısı |
| **Stil & Tasarım** | `Tailwind CSS v4` | `@theme` token mimarisi, OKLCH renk uzayı ve mikro animasyonlar |
| **3D & Etkileşim** | `Three.js` & `Framer Motion` | GPU hızlandırmalı görsel kompozisyonlar ve akıcı geçiş efektleri |
| **Harita & CBS** | `React-Leaflet` & CartoDB Dark | Küresel etkinlik koordinasyon ve keşif arayüzü |

---

## 🚀 Başlarken

### Gereksinimler
- **Node.js**: `v20.x` veya üzeri (`v22`+ önerilir)
- **Paket Yöneticisi**: `npm` veya `pnpm`
- **Sui Cüzdanı**: Sui Wallet / Suiet / Ethos (Testnet modunda)

### Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/05Arda/suipath.git
   cd suipath
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Çevre değişkenlerini yapılandırın:
   Proje kök dizininde `.env.local` dosyasını oluşturun (referans için `.env.example` dosyasını kullanabilirsiniz):
   ```env
   # Neon PostgreSQL Veritabanı Bağlantı Dizgisi
   DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

   # Walrus Blob İmzalama için Sui Mnemonic (12 veya 24 kelime)
   MNEMONIC="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
   Uygulama `http://localhost:3000` adresinde kullanıma hazır olacaktır.

---

## 🗺️ Yol Haritası ve Gelecek Vizyonu

- [x] Sui Dapp-Kit ile cüzdan entegrasyonu ve oturum mimarisi
- [x] Walrus Protocol entegrasyonu ile merkeziyetsiz medya dağıtımı
- [x] Coğrafi lokasyon tabanlı interaktif küresel etkinlik haritası
- [x] Dinamik seviyeli (Bronze-Platinum) NFT galeri arayüzü
- [ ] zkLogin entegrasyonu ile sıfır bilgi kanıtlı Google/Apple ile cüzdansız giriş
- [ ] QR Tabanlı On-Chain Mekansal Check-in ve Soulbound Token (SBT) ihracı
- [ ] Etkinlik organizatörleri için akıllı biletleme ve gelir paylaşım kontratları
- [ ] Sui Kiosk entegrasyonu ile ikincil bilet ve NFT pazar yeri mekaniği

---

<div align="center">

  <sub>Crafted with vision on the <strong>Sui Network</strong>. Powering the future of human coordination.</sub>

</div>

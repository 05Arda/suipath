<div align="center">

  <img src="public/tracelogo.svg" alt="TRACE Protocol Logo" width="120" height="120" />

  # TRACE
  ### The Decentralized Event Orchestration & Proof-of-Presence Protocol on Sui

  [![Sui Network](https://img.shields.io/badge/Network-Sui_Testnet-0284c7?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io/)
  [![Walrus Protocol](https://img.shields.io/badge/Storage-Walrus_Decentralized_Blob-278285?style=for-the-badge)](https://walrus.xyz/)
  [![Next.js](https://img.shields.io/badge/Frontend-Next.js_16_Turbopack-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/Database-Neon_Serverless_PG-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)

  <p align="center">
    <strong>Bridging physical and digital event experiences with sub-second finality on Sui and immutable, decentralized storage via Walrus.</strong>
  </p>

</div>

---

## 🌐 Vision & Executive Overview

**TRACE** is an enterprise-grade **Proof-of-Attendance (PoA)** and **Event Orchestration Protocol** engineered to fundamentally redefine how human coordination, community engagement, and digital presence are captured on-chain.

Traditional event ticketing and loyalty frameworks are constrained by centralized databases, fragmented ecosystems, predatory intermediaries, and perishable proof-of-participation. TRACE dismantles these bottlenecks by transforming every physical and virtual interaction into an immutable, cryptographically verifiable digital legacy—executed on **Sui Network**, permanently preserved on **Walrus Protocol**, and incentivized through dynamic, tiered reputation primitives.

---

## ⚡ Core Architectural Pillars

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

### 1. High-Throughput On-Chain Consensus
* Built on `@mysten/sui` and `@mysten/dapp-kit`, enabling seamless wallet connectivity across Sui ecosystem wallets (Sui Wallet, Ethos, Suiet, etc.).
* Leverages Sui's object-centric data model and sub-second finality to guarantee zero-latency check-ins and instantaneous NFT minting at scale.

### 2. Decentralized Blob Storage with Walrus
* Event artwork, digital badges, and cryptographic attendance artifacts are stored completely decentralized via Mysten Labs' next-gen blob protocol, **Walrus**.
* Features server-side encrypted key derivation pipelines, enabling high-performance media publishing across decentralized epochs without relying on centralized CDNs.

### 3. Tiered Proof-of-Presence (PoA) Primitives
* Community loyalty is gamified through dynamically tiered digital collectibles (**Bronze, Silver, Gold, Platinum**).
* Each tier encapsulates verifiable metadata, on-chain properties, and provable exclusivity, serving as decentralized credentials for ecosystem privileges.

### 4. Spatial Event Intelligence (GIS Engine)
* High-precision geospatial discovery powered by Leaflet and CartoDB Dark cartography.
* Enables global coordinate mapping, country-level filtering, and location-based discovery with real-time attendee insights.

### 5. Fluid Oceanic Aesthetic & Modern UI
* An immersive design system inspired by Sui’s oceanic identity (**Deep Cyan & Obsidian** `#011820`), engineered using Tailwind CSS v4 native tokens, Three.js spatial canvases, and Framer Motion micro-interactions.

---

## 🛠️ Technology Matrix

| Layer | Technology | Architectural Role |
| :--- | :--- | :--- |
| **Core Framework** | `Next.js 16.0.7` | Turbopack-powered App Router architecture with React 19 concurrent features |
| **Blockchain Layer** | `@mysten/sui` & `@mysten/dapp-kit` | Sui testnet/mainnet RPC clients, transaction builders, on-chain execution |
| **Decentralized Storage**| `@mysten/walrus` | Epoch-based, highly efficient decentralized blob and media storage |
| **Database Engine** | `Neon Serverless PostgreSQL` | High-concurrency, autoscaling serverless relational data store |
| **Design & Tokens** | `Tailwind CSS v4` | Native `@theme` tokens, OKLCH color space, adaptive dark theme infrastructure |
| **3D & Visuals** | `Three.js` & `Framer Motion` | GPU-accelerated spatial rendering, fluid micro-interactions |
| **Geospatial & GIS** | `React-Leaflet` & CartoDB Dark | Global event mapping and country-level territorial filtering |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher (`v22`+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`
- **Sui Wallet**: Sui Wallet / Ethos / Suiet (configured to Testnet)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/05Arda/suipath.git
   cd suipath
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory (refer to [`.env.example`](.env.example)):
   ```env
   # Neon Serverless PostgreSQL Connection String
   DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

   # Sui Mnemonic for Walrus Server Actions (12 or 24 words)
   MNEMONIC="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
   ```

4. Launch the development server:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` in your browser.

---

## 🗺️ Protocol Roadmap & Future Frontiers

- [x] Full `@mysten/dapp-kit` wallet integration and state management
- [x] Decentralized media storage pipeline via Walrus Protocol
- [x] Interactive geospatial discovery engine with country filtering
- [x] Dynamic tiered reputation badges (Bronze to Platinum)
- [ ] **zkLogin Integration:** Zero-Knowledge social authentication (Google, Apple, Twitch) for frictionless onboarding
- [ ] **On-Chain Spatial Check-ins:** Geofenced QR verification with non-transferable Soulbound Tokens (SBT)
- [ ] **Programmable Smart Ticketing:** Automated revenue splits and programmable access gating via Sui Move modules
- [ ] **Sui Kiosk Marketplace:** Native secondary trading infrastructure with enforce-ready creator royalties

---

<div align="center">

  <sub>Crafted with vision on the <strong>Sui Network</strong>. Powering the future of human coordination.</sub>

</div>

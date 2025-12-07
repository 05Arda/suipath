"use client";
import React, { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient, // Artık obje aramaya gerek yok ama client kalsın
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  Shield,
  UserPlus,
  UserMinus,
  Search,
  CheckCircle,
  Copy,
  Check,
  Database,
  Box,
  Unlock, // Kilit açık ikonu
} from "lucide-react";

// --- 🛠️ DEVELOPMENT AYARLARI ---
const CONST_PACKAGE_ID =
  "0xdeff9dea27b4cb5fd007c58ba622697c7b13aeee805900f493ff68680be5e606";
const CONST_COLLECTION_ID =
  "0xe9a59c382024479907937402dc479d2822a3089d380f2824df4e470876798e4f";

export default function AdminPanel() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // --- STATES ---
  // adminCapId state'ini kaldırdık çünkü artık kontrol etmiyoruz.
  const [targetAddress, setTargetAddress] = useState("");
  const [selectedTier, setSelectedTier] = useState("2");
  const [statusMsg, setStatusMsg] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // --- ID KOPYALAMA ---
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- ACTIONS ---
  const handleWhitelistUser = () => {
    // Admin kontrolünü kaldırdık, sadece cüzdan bağlı mı ona bakıyoruz
    if (!account) return alert("Lütfen cüzdan bağlayın!");

    const tx = new Transaction();
    tx.moveCall({
      target: `${CONST_PACKAGE_ID}::collection::whitelist_user`,
      arguments: [
        // NOT: Kontratınızdan AdminCap parametresini kaldırdığınızı varsayarak
        // buradaki AdminCap argümanını sildik.
        // tx.object(adminCapId),  <-- SİLİNDİ

        tx.object(CONST_COLLECTION_ID),
        tx.pure.address(targetAddress),
        tx.pure.u8(Number(selectedTier)),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => setStatusMsg("✅ Kullanıcı whitelist'e eklendi!"),
        onError: (err) => setStatusMsg("❌ Hata: " + err.message),
      }
    );
  };

  const handleRemoveWhitelist = () => {
    if (!account) return alert("Lütfen cüzdan bağlayın!");

    const tx = new Transaction();
    tx.moveCall({
      target: `${CONST_PACKAGE_ID}::collection::remove_from_whitelist`,
      arguments: [
        // NOT: Burada da AdminCap argümanı kaldırıldı.
        tx.object(CONST_COLLECTION_ID),
        tx.pure.address(targetAddress),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => setStatusMsg("✅ Kullanıcı silindi."),
        onError: (err) => setStatusMsg("❌ Hata: " + err.message),
      }
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-deep-bg text-white min-h-screen pb-32 pt-24">
      <div className="flex items-center gap-3 mb-6">
        {/* İkonu değiştirdik, artık herkese açık */}
        <Unlock size={32} className="text-emerald-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Public Dashboard</h1>
          <p className="text-xs text-text-muted">
            Admin yetkisi gerekmez (Test Modu)
          </p>
        </div>
      </div>

      {/* --- INFO CARD --- */}
      <div className="bg-card-bg/50 border border-border-color rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-primary-cyan" />

        {/* 1. PACKAGE ID */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
            <Box size={12} /> Project Package ID
          </span>
          <button
            onClick={() => copyToClipboard(CONST_PACKAGE_ID, "pkg")}
            className="text-xs font-mono bg-black/20 p-2 rounded border border-white/5 hover:border-primary-cyan/50 text-left transition-colors flex justify-between items-center group"
          >
            <span className="truncate">{CONST_PACKAGE_ID}</span>
            {copiedId === "pkg" ? (
              <Check size={12} className="text-emerald-400" />
            ) : (
              <Copy
                size={12}
                className="opacity-0 group-hover:opacity-100 text-text-muted"
              />
            )}
          </button>
        </div>

        {/* 2. COLLECTION ID */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
            <Database size={12} /> Collection ID
          </span>
          <button
            onClick={() => copyToClipboard(CONST_COLLECTION_ID, "col")}
            className="text-xs font-mono bg-black/20 p-2 rounded border border-white/5 hover:border-primary-cyan/50 text-left transition-colors flex justify-between items-center group"
          >
            <span className="truncate">{CONST_COLLECTION_ID}</span>
            {copiedId === "col" ? (
              <Check size={12} className="text-emerald-400" />
            ) : (
              <Copy
                size={12}
                className="opacity-0 group-hover:opacity-100 text-text-muted"
              />
            )}
          </button>
        </div>
      </div>

      {/* --- USER MANAGEMENT PANEL --- */}
      {/* Opacity ve pointer-events kısıtlamalarını kaldırdık */}
      <div className="bg-card-bg border border-border-color rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto relative transition-all duration-500">
        {/* KİLİT EKRANI (OVERLAY) TAMAMEN KALDIRILDI */}

        <h2 className="text-lg font-bold mb-6 text-white flex items-center gap-2 border-b border-white/10 pb-4">
          <UserPlus size={20} className="text-primary-cyan" /> Kullanıcı
          Yönetimi
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2">
              Hedef Cüzdan Adresi
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-3.5 text-text-muted"
                size={18}
              />
              <input
                type="text"
                className="w-full bg-deep-bg border border-white/10 rounded-xl pl-10 p-3 text-sm font-mono text-white focus:border-primary-cyan outline-none transition-all focus:ring-1 focus:ring-primary-cyan"
                placeholder="0x..."
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-2">
              Yetki Seviyesi (Tier)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 1, n: "Bronze" },
                { id: 2, n: "Silver" },
                { id: 3, n: "Gold" },
                { id: 4, n: "Platinum" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                    Number(selectedTier) === tier.id
                      ? "bg-primary-cyan text-white border-primary-cyan shadow-[0_0_15px_rgba(39,130,133,0.4)]"
                      : "bg-deep-bg text-text-muted border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {tier.n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              onClick={handleWhitelistUser}
              // Cüzdan bağlı değilse butonu deaktif edelim
              disabled={!account}
              className={`flex-[2] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                !account
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary-cyan to-emerald-600 hover:to-emerald-500 text-white"
              }`}
            >
              <CheckCircle size={18} /> Whitelist Ekle
            </button>

            <button
              onClick={handleRemoveWhitelist}
              disabled={!account}
              className={`flex-1 border rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                !account
                  ? "border-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white"
              }`}
            >
              <UserMinus size={18} /> Sil
            </button>
          </div>

          {!account && (
            <p className="text-center text-xs text-yellow-500 mt-2">
              İşlem yapabilmek için lütfen cüzdan bağlayınız.
            </p>
          )}

          {statusMsg && (
            <div
              className={`mt-4 p-4 rounded-xl text-sm font-medium text-center border animate-in fade-in slide-in-from-top-2 ${
                statusMsg.includes("Hata")
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}
            >
              {statusMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

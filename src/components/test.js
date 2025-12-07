//Generated new keypair and alias for address with scheme "ed25519" [priceless-chrysoprase: 0x6b2fe195967233b64e7a71bca8baaefa5f930e15d528f523972d820038eed554]

import React from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const TestCalculator = () => {
  const client = useSuiClient(); // Sonucu okumak için gerekli
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Kendi Package ID'nizi buraya yazın
  // Tırnak işaretleri kalmalı, sadece içindeki kodu değiştir:
  const PACKAGE_ID = "...";
  const MODULE = "calculator";
  const FUNC = "topla_ve_duyur";

  const testEt = () => {
    const tx = new Transaction();

    // 10 + 25 işlemini yaptıralım
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::${FUNC}`,
      arguments: [tx.pure.u64(10), tx.pure.u64(25)],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          console.log("İşlem gönderildi, onay bekleniyor...", result);

          // İşlemin blok zincirine tam olarak işlenmesini bekle ve EVENT'leri getir
          const txDetails = await client.waitForTransaction({
            digest: result.digest,
            options: {
              showEvents: true, // Cevabın içindeki eventleri görmek istiyoruz
            },
          });

          // Gelen eventlerin içinden bizim 'SonucEvent'i bulalım
          // Etkinlik yapısı: txDetails.events[0].parsedJson
          const eventData = txDetails.events?.find((e) =>
            e.type.includes("SonucEvent")
          );

          if (eventData) {
            const sonuc = eventData.parsedJson.sonuc;
            alert(`🎉 İŞLEM BAŞARILI!\n\nBlockchain'den Gelen Cevap: ${sonuc}`);
          } else {
            alert("İşlem başarılı ama sonuç okunamadı.");
          }
        },
        onError: (err) => {
          console.error(err);
          alert("Hata oluştu: " + err.message);
        },
      }
    );
  };

  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold mb-4">Sui Hesap Makinesi</h2>
      <button
        onClick={testEt}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
      >
        Test Et: 10 + 25
      </button>
    </div>
  );
};

export default TestCalculator;

"use client";
import React from "react";
import Image from "next/image";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"; // Sui Hook'ları
import Link from "next/link";

export default function Header({ activeTab, setActiveTab }) {
  // Şu an bağlı olan hesabı al
  const account = useCurrentAccount();

  return (
    <header
      className={`${
        activeTab == "map" ? "absolute" : "sticky"
      } top-0 z-50 flex justify-center w-full`}
    >
      <div className="flex flex-row justify-between items-center w-full px-8 py-4 bg-transparent backdrop-blur-md rounded-b-3xl shadow-lg">
        {/* SOL TARAFA (LOGO) */}
        <Link href="/" onClick={() => setActiveTab("home")}>
          <div className="flex items-center gap-2">
            <Image
              src="/sui.svg" // Logo dosyanızın adı neyse
              alt="SuiPATH Logo"
              width={40}
              height={40}
              priority
            />
            <h1 className="text-2xl font-bold text-white hidden sm:block">
              SuiPATH
            </h1>
          </div>
        </Link>

        {/* SAĞ TARAF (LOGIN / WALLET) */}
        <div>
          {/* ConnectButton: Mysten Labs'in hazır butonu.
                Otomatik olarak modal açar, cüzdanları listeler ve bağlar.
            */}
          <ConnectButton
            className="!bg-primary-cyan !text-white !rounded-full !font-bold hover:!bg-white hover:!text-primary-cyan transition-all"
            connectText="Connect Wallet"
          />

          {/* Eğer hesap bağlıysa ek bilgi göstermek istersen: */}
          {account && (
            <div className="hidden">
              {/* Buraya sadece giriş yapıldığında görünecek özel bir menü ekleyebilirsin */}
              {/* Örn: account.address */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

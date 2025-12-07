"use client";
import React from "react"; // useState kullanılmadığı için kaldırdım
import Image from "next/image";

// EĞER YÖNTEM 2'yi kullanacaksanız (Dosya src/assets içindeyse):
// import logo from '@/assets/logo.svg';
// Ve aşağıda src={logo} yapmalısınız.

export default function Header({ activeTab, onTabChange }) {
  return (
    <header
      className={`${
        activeTab == "map" ? "absolute" : "sticky"
      } z-50 flex flex-row justify-start items-center w-full gap-6 p-6 bg-ocean-dark/90 backdrop-blur-sm rounded-b-3xl shadow-lg cursor-pointer`}
      onClick={() => onTabChange("home")}
    >
      <Image
        src="/vercel.svg"
        alt="SuiPATH Logo"
        width={40}
        height={40}
        priority // Logo olduğu için öncelikli yüklenmesi LCP (performans) için iyidir
      />
      <h1 className="text-2xl font-bold text-white">SuiPATH</h1>
    </header>
  );
}

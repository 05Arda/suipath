"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Filter,
  X,
  Check,
} from "lucide-react";

import HomeSwiper from "@/components/homeSwiper";

// Veri importu
import { EVENTS, CATEGORIES } from "@/utils/data";

export default function HomePage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    } else {
      setSelectedCategories((prev) => [...prev, category]);
    }
  };

  const filteredEvents =
    selectedCategories.length === 0
      ? EVENTS
      : EVENTS.filter((event) => selectedCategories.includes(event.category));

  const isFilterActive = selectedCategories.length > 0;

  return (
    <div className="w-full min-h-full bg-deep-bg p-4 pb-24">
      <HomeSwiper Title={"All Events"} swiperFilter={null} />
      <HomeSwiper Title={"Reccomendations"} swiperFilter={"reccomended"} />
    </div>
  );
}

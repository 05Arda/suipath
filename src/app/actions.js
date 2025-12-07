"use server";
import pool from "@/lib/db";

// 1. Tüm Etkinlikleri Çek (Ana Sayfa İçin)
export async function getEvents() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        e.event_id as id,
        e.title,
        c.category_name as category,
        e.event_date,
        e.location,
        e.latitude,
        e.longitude,
        e.country_code,
        e.image_url as image,
        e.attendees_count as attendees,
        e.capacity,
        e.price,
        e.is_recommended,
        array_remove(array_agg(t.tag_name), NULL) as tags
      FROM Events e
      JOIN Categories c ON e.category_id = c.category_id
      LEFT JOIN EventTags et ON e.event_id = et.event_id
      LEFT JOIN Tags t ON et.tag_id = t.tag_id
      GROUP BY e.event_id, c.category_name
    `);

    return result.rows.map((event) => ({
      ...event,
      date: new Date(event.event_date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      tags: Array.isArray(event.tags) ? event.tags : [],
      latitude: event.latitude ? parseFloat(event.latitude) : null,
      longitude: event.longitude ? parseFloat(event.longitude) : null,
    }));
  } finally {
    client.release();
  }
}

// 2. Tüm NFT'leri Çek
export async function getNFTs() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        nft_id as id, 
        title, 
        creator, 
        price, 
        image_url as image, 
        tier_name 
      FROM NFTs
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

// 3. Tekil Etkinlik Çek (Detay Sayfası İçin)
export async function getEventById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      SELECT 
        e.event_id as id,
        e.title,
        c.category_name as category,
        e.event_date,
        e.start_time,
        e.location,
        e.organizer,
        e.description,
        e.image_url as image,
        e.attendees_count as attendees,
        e.capacity,
        e.price,
        e.is_recommended,
        array_remove(array_agg(t.tag_name), NULL) as tags
      FROM Events e
      JOIN Categories c ON e.category_id = c.category_id
      LEFT JOIN EventTags et ON e.event_id = et.event_id
      LEFT JOIN Tags t ON et.tag_id = t.tag_id
      WHERE e.event_id = $1
      GROUP BY e.event_id, c.category_name
    `,
      [id]
    );

    if (result.rows.length === 0) return null;

    const event = result.rows[0];
    return {
      ...event,
      date: new Date(event.event_date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: event.start_time ? event.start_time.slice(0, 5) : "Tüm Gün",
      tags: event.tags || [],
    };
  } finally {
    client.release();
  }
}

// 4. Tekil NFT Çek
export async function getNFTById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      SELECT 
        nft_id as id, 
        title, 
        creator, 
        price, 
        image_url as image, 
        tier_name,
        'GEN-1' as serial_number,
        'Static attributes' as attributes,
        'No description provided.' as description
      FROM NFTs 
      WHERE nft_id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
  } finally {
    client.release();
  }
}

// 5. Kullanıcı Profilini Çek
export async function getUserProfile(walletAddress) {
  if (!walletAddress) return null;
  const client = await pool.connect();
  try {
    const userRes = await client.query(
      `SELECT * FROM Users WHERE wallet_address = $1`,
      [walletAddress]
    );
    if (userRes.rows.length === 0) return null;

    const user = userRes.rows[0];
    const joinedRes = await client.query(
      `SELECT event_id FROM UserJoinedEvents WHERE wallet_address = $1`,
      [walletAddress]
    );
    const favRes = await client.query(
      `SELECT event_id FROM UserFavoriteEvents WHERE wallet_address = $1`,
      [walletAddress]
    );
    const nftRes = await client.query(
      `SELECT nft_id FROM UserEarnedNFTs WHERE wallet_address = $1`,
      [walletAddress]
    );

    return {
      name: user.name,
      username: user.username,
      role: user.role,
      avatar: user.avatar_url,
      followers: user.followers_count,
      following: user.following_count,
      joinedEventIds: joinedRes.rows.map((r) => r.event_id),
      favoriteEventIds: favRes.rows.map((r) => r.event_id),
      earnedNftIds: nftRes.rows.map((r) => r.nft_id),
      walletAddress: user.wallet_address,
    };
  } finally {
    client.release();
  }
}

// --- İŞLEM FONKSİYONLARI (Eksik Olanlar Muhtemelen Bunlardı) ---

// 6. FAVORİ EKLE/ÇIKAR (Toggle)
export async function toggleEventFavorite(walletAddress, eventId) {
  if (!walletAddress || !eventId)
    return { success: false, message: "Eksik bilgi" };

  const client = await pool.connect();
  try {
    const checkRes = await client.query(
      `SELECT 1 FROM UserFavoriteEvents WHERE wallet_address = $1 AND event_id = $2`,
      [walletAddress, eventId]
    );

    if (checkRes.rows.length > 0) {
      await client.query(
        `DELETE FROM UserFavoriteEvents WHERE wallet_address = $1 AND event_id = $2`,
        [walletAddress, eventId]
      );
      return { success: true, isFavorite: false };
    } else {
      await client.query(
        `INSERT INTO UserFavoriteEvents (wallet_address, event_id) VALUES ($1, $2)`,
        [walletAddress, eventId]
      );
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error("Favori hatası:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// 7. ETKİNLİĞE KATIL/AYRIL (Toggle Join)
export async function toggleEventJoin(walletAddress, eventId) {
  if (!walletAddress || !eventId)
    return { success: false, message: "Eksik bilgi" };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const checkRes = await client.query(
      `SELECT 1 FROM UserJoinedEvents WHERE wallet_address = $1 AND event_id = $2`,
      [walletAddress, eventId]
    );

    let isJoined = false;
    let newCount = 0;

    if (checkRes.rows.length > 0) {
      // Ayrıl
      await client.query(
        `DELETE FROM UserJoinedEvents WHERE wallet_address = $1 AND event_id = $2`,
        [walletAddress, eventId]
      );
      const updateRes = await client.query(
        `UPDATE Events SET attendees_count = GREATEST(0, attendees_count - 1) WHERE event_id = $1 RETURNING attendees_count`,
        [eventId]
      );
      newCount = updateRes.rows[0].attendees_count;
      isJoined = false;
    } else {
      // Katıl
      await client.query(
        `INSERT INTO UserJoinedEvents (wallet_address, event_id) VALUES ($1, $2)`,
        [walletAddress, eventId]
      );
      const updateRes = await client.query(
        `UPDATE Events SET attendees_count = attendees_count + 1 WHERE event_id = $1 RETURNING attendees_count`,
        [eventId]
      );
      newCount = updateRes.rows[0].attendees_count;
      isJoined = true;
    }

    await client.query("COMMIT");
    return { success: true, isJoined, newCount };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Katılma hatası:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// 8. KULLANICI DURUMUNU KONTROL ET
export async function getUserEventStatus(walletAddress, eventId) {
  if (!walletAddress || !eventId)
    return { hasJoined: false, isFavorite: false };

  const client = await pool.connect();
  try {
    const joinRes = await client.query(
      `SELECT 1 FROM UserJoinedEvents WHERE wallet_address = $1 AND event_id = $2`,
      [walletAddress, eventId]
    );
    const favRes = await client.query(
      `SELECT 1 FROM UserFavoriteEvents WHERE wallet_address = $1 AND event_id = $2`,
      [walletAddress, eventId]
    );

    return {
      hasJoined: joinRes.rows.length > 0,
      isFavorite: favRes.rows.length > 0,
    };
  } finally {
    client.release();
  }
}

// --- 9. YENİ KULLANICI OLUŞTURMA (Register) ---
export async function createUser(walletAddress) {
  if (!walletAddress) return { success: false, error: "Cüzdan adresi yok" };

  const client = await pool.connect();
  try {
    // Önce var mı diye kontrol et (Çifte kayıt önlemek için)
    const checkRes = await client.query(
      `SELECT 1 FROM Users WHERE wallet_address = $1`,
      [walletAddress]
    );

    if (checkRes.rows.length > 0) {
      return { success: true, created: false, message: "Kullanıcı zaten var" };
    }

    // Yoksa varsayılan bilgilerle oluştur
    // Varsayılan isim: Adres'in ilk ve son karakterleri (0x12...AB34)
    const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(
      -4
    )}`;
    const defaultName = `User ${shortAddr}`;
    const defaultUsername = `@${walletAddress.slice(0, 10)}`;
    const defaultRole = "Member";
    // Her adres için benzersiz ama sabit bir avatar üretir (DiceBear API)
    const defaultAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${walletAddress}`;

    await client.query(
      `INSERT INTO Users (wallet_address, name, username, role, avatar_url) 
       VALUES ($1, $2, $3, $4, $5)`,
      [walletAddress, defaultName, defaultUsername, defaultRole, defaultAvatar]
    );

    return { success: true, created: true };
  } catch (error) {
    console.error("Kullanıcı oluşturma hatası:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

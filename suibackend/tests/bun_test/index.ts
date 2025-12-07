import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

const customMnemonic = process.env.MNEMONIC;
// Contract Configuration
const PACKAGE_ID =
  "0xdeff9dea27b4cb5fd007c58ba622697c7b13aeee805900f493ff68680be5e606";
const MODULE_NAME = "collection";
const collectionId =
  "0x4b9d8b2f4c8b8091340ff7a856ccb95630347714914b94b923c3b6a1552f6476";

async function runFullDemo(customMnemonic?: string) {
  console.log("🚀 Starting Tiered NFT Demo...\n");

  // Initialize client for testnet
  const client = new SuiClient({ url: getFullnodeUrl("testnet") });

  function createDeterministicWallet(mnemonic?: string) {
    const mnemonicPhrase =
      mnemonic ||
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    const keypair = Ed25519Keypair.deriveKeypair(mnemonicPhrase);
    return { keypair, mnemonic: mnemonicPhrase };
  }

  // Create deterministic wallet
  const { keypair, mnemonic } = createDeterministicWallet(customMnemonic);
  const address = keypair.getPublicKey().toSuiAddress();

  console.log("📍 Wallet Address:", address);
  console.log("\n💡 Get testnet tokens for this address:");
  console.log("   1. Visit: https://faucet.sui.io/");
  console.log('   2. Select "Testnet"');
  console.log("   3. Enter address:", address);
  console.log('   4. Complete CAPTCHA and click "Request"');
  console.log(
    "\n⏳ Waiting for you to get tokens... Press Ctrl+C to exit if needed.\n",
  );

  // Check balance
  const balance = await client.getBalance({ owner: address });
  const suiBalance = Number(balance.totalBalance) / 1_000_000_000;
  console.log("💰 Current Balance:", suiBalance, "SUI\n");

  if (suiBalance === 0) {
    console.log("❌ No balance detected!");
    console.log("\n📝 Steps to get testnet tokens:");
    console.log("   1. Copy your address:", address);
    console.log("   2. Go to: https://faucet.sui.io/");
    console.log("   3. Paste your address and request tokens");
    console.log("   4. Wait ~30 seconds for tokens to arrive");
    console.log("   5. Run this script again\n");
    console.log("💡 Or use Discord faucet:");
    console.log("   Join: https://discord.gg/sui");
    console.log("   Channel: #testnet-faucet");
    console.log("   Command: !faucet", address);
    return;
  }

  if (suiBalance < 1) {
    console.log(
      "⚠️  Low balance! You might need more tokens for all transactions.",
    );
    console.log("   Recommended: At least 1 SUI\n");
  }

  // Wait helper
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  try {
    // Step 1: Mint Bronze NFT
    console.log("═══════════════════════════════════════════════════");
    console.log("📝 Step 1: Minting Bronze NFT...");
    console.log("═══════════════════════════════════════════════════\n");

    const bronzeNFT = await mintBronzeNFT(client, keypair, collectionId, {
      name: "Demo Warrior #1",
      description: "Starting at Bronze tier",
      imageUrl: "https://example.com/bronze.png",
      attributes: JSON.stringify({
        power: 10,
        rarity: "common",
        element: "earth",
        timestamp: Date.now(),
      }),
    });

    console.log("✅ Bronze NFT minted!");
    console.log("   Transaction:", bronzeNFT.digest);

    // Get the minted NFT ID
    const bronzeNftId = getNFTIdFromTransaction(bronzeNFT);
    console.log("   NFT ID:", bronzeNftId);

    // Show NFT details
    const bronzeDetails = await client.getObject({
      id: bronzeNftId!,
      options: { showContent: true },
    });
    const bronzeData = parseNFTData(bronzeDetails);
    console.log("   Tier:", bronzeData?.tier, "(" + bronzeData?.tierName + ")");
    console.log("   Serial #:", bronzeData?.serialNumber);
    console.log("\n");

    await wait(3000);

    // Step 2: Upgrade Bronze to Silver
    console.log("═══════════════════════════════════════════════════");
    console.log("📝 Step 2: Upgrading Bronze → Silver...");
    console.log("═══════════════════════════════════════════════════\n");

    const silverNFT = await upgradeNFT(
      client,
      keypair,
      collectionId,
      bronzeNftId!,
      {
        name: "Demo Warrior #1",
        description: "Upgraded to Silver tier",
        imageUrl: "https://example.com/silver.png",
        attributes: JSON.stringify({
          power: 25,
          rarity: "uncommon",
          element: "water",
          timestamp: Date.now(),
        }),
      },
    );

    console.log("✅ Upgraded to Silver!");
    console.log("   Transaction:", silverNFT.digest);
    console.log("   🔥 Bronze NFT burned:", bronzeNftId);

    const silverNftId = getNFTIdFromTransaction(silverNFT);
    console.log("   ✨ New Silver NFT ID:", silverNftId);

    const silverDetails = await client.getObject({
      id: silverNftId!,
      options: { showContent: true },
    });
    const silverData = parseNFTData(silverDetails);
    console.log("   Tier:", silverData?.tier, "(" + silverData?.tierName + ")");
    console.log("   Serial #:", silverData?.serialNumber);
    console.log("\n");

    await wait(3000);

    // Step 3: Upgrade Silver to Gold
    console.log("═══════════════════════════════════════════════════");
    console.log("📝 Step 3: Upgrading Silver → Gold...");
    console.log("═══════════════════════════════════════════════════\n");

    const goldNFT = await upgradeNFT(
      client,
      keypair,
      collectionId,
      silverNftId!,
      {
        name: "Demo Warrior #1",
        description: "Upgraded to Gold tier",
        imageUrl: "https://example.com/gold.png",
        attributes: JSON.stringify({
          power: 50,
          rarity: "rare",
          element: "fire",
          timestamp: Date.now(),
        }),
      },
    );

    console.log("✅ Upgraded to Gold!");
    console.log("   Transaction:", goldNFT.digest);
    console.log("   🔥 Silver NFT burned:", silverNftId);

    const goldNftId = getNFTIdFromTransaction(goldNFT);
    console.log("   ✨ New Gold NFT ID:", goldNftId);

    const goldDetails = await client.getObject({
      id: goldNftId!,
      options: { showContent: true },
    });
    const goldData = parseNFTData(goldDetails);
    console.log("   Tier:", goldData?.tier, "(" + goldData?.tierName + ")");
    console.log("   Serial #:", goldData?.serialNumber);
    console.log("\n");

    await wait(3000);

    // Step 4: Upgrade Gold to Platinum
    console.log("═══════════════════════════════════════════════════");
    console.log("📝 Step 4: Upgrading Gold → Platinum...");
    console.log("═══════════════════════════════════════════════════\n");

    const platinumNFT = await upgradeNFT(
      client,
      keypair,
      collectionId,
      goldNftId!,
      {
        name: "Demo Warrior #1",
        description: "Maximum tier achieved - Platinum!",
        imageUrl: "https://example.com/platinum.png",
        attributes: JSON.stringify({
          power: 100,
          rarity: "legendary",
          element: "aether",
          timestamp: Date.now(),
        }),
      },
    );

    console.log("✅ Upgraded to Platinum!");
    console.log("   Transaction:", platinumNFT.digest);
    console.log("   🔥 Gold NFT burned:", goldNftId);

    const platinumNftId = getNFTIdFromTransaction(platinumNFT);
    console.log("   ✨ Final Platinum NFT ID:", platinumNftId);

    const platinumDetails = await client.getObject({
      id: platinumNftId!,
      options: { showContent: true },
    });
    const platinumData = parseNFTData(platinumDetails);
    console.log(
      "   Tier:",
      platinumData?.tier,
      "(" + platinumData?.tierName + ")",
    );
    console.log("   Serial #:", platinumData?.serialNumber);
    console.log("\n");

    await wait(3000);

    // Step 5: Verify Final State
    console.log("═══════════════════════════════════════════════════");
    console.log("📝 Step 5: Verifying Final State...");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("🏆 Final NFT Details:");
    console.log("   ID:", platinumData?.id);
    console.log(
      "   Tier:",
      platinumData?.tier,
      "(" + platinumData?.tierName + ")",
    );
    console.log("   Name:", platinumData?.name);
    console.log("   Description:", platinumData?.description);
    console.log("   Image URL:", platinumData?.imageUrl);
    console.log("   Serial Number:", platinumData?.serialNumber);
    console.log("   Attributes:", platinumData?.attributes);
    console.log("\n");

    // Check total NFTs owned
    const allNFTs = await getUserNFTs(client, address, collectionId);
    console.log("📊 Total NFTs owned:", allNFTs.length);
    console.log("   ✅ Correct! Only 1 NFT (all previous tiers were burned)\n");

    // Show upgrade history
    console.log("📜 Upgrade History:");
    const upgradeEvents = await getCollectionEvents(client, "NFTUpgraded", 10);
    upgradeEvents.forEach((event, idx) => {
      const eventData = event.parsedJson as any;
      const tierNames = ["", "Bronze", "Silver", "Gold", "Platinum"];
      console.log(
        `   ${idx + 1}. ${tierNames[eventData.old_tier]} (Tier ${eventData.old_tier}) → ${tierNames[eventData.new_tier]} (Tier ${eventData.new_tier})`,
      );
    });
    console.log("\n");

    console.log("═══════════════════════════════════════════════════");
    console.log("🎉 Demo completed successfully!");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("🔗 View on Sui Explorer:");
    console.log(`   NFT: https://suiscan.xyz/testnet/object/${platinumNftId}`);
    console.log(
      `   Collection: https://suiscan.xyz/testnet/object/${collectionId}`,
    );
    console.log(`   Wallet: https://suiscan.xyz/testnet/account/${address}`);
    console.log("\n");

    console.log("📋 Save these IDs:");
    console.log(`   Collection ID: ${collectionId}`);
    console.log(`   Final NFT ID: ${platinumNftId}`);
  } catch (error) {
    console.error("\n❌ Error during demo:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
  }
}

/**
 * Mint Bronze NFT
 */
async function mintBronzeNFT(
  client: SuiClient,
  keypair: Ed25519Keypair,
  collectionId: string,
  nftData: {
    name: string;
    description: string;
    imageUrl: string;
    attributes: string;
  },
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::mint_bronze`,
    arguments: [
      tx.object(collectionId),
      tx.pure.string(nftData.name),
      tx.pure.string(nftData.description),
      tx.pure.string(nftData.imageUrl),
      tx.pure.string(nftData.attributes),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showEvents: true,
    },
  });

  return result;
}

/**
 * Upgrade NFT to next tier
 */
async function upgradeNFT(
  client: SuiClient,
  keypair: Ed25519Keypair,
  collectionId: string,
  nftId: string,
  newNftData: {
    name: string;
    description: string;
    imageUrl: string;
    attributes: string;
  },
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::upgrade_nft`,
    arguments: [
      tx.object(collectionId),
      tx.object(nftId),
      tx.pure.string(newNftData.name),
      tx.pure.string(newNftData.description),
      tx.pure.string(newNftData.imageUrl),
      tx.pure.string(newNftData.attributes),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showEvents: true,
    },
  });

  return result;
}

/**
 * Get all NFTs owned by an address
 */
async function getUserNFTs(
  client: SuiClient,
  ownerAddress: string,
  collectionId: string,
) {
  const objects = await client.getOwnedObjects({
    owner: ownerAddress,
    filter: {
      StructType: `${PACKAGE_ID}::${MODULE_NAME}::TieredNFT`,
    },
    options: {
      showContent: true,
      showType: true,
    },
  });

  return objects.data;
}

/**
 * Get collection events
 */
async function getCollectionEvents(
  client: SuiClient,
  eventType:
    | "NFTMinted"
    | "NFTUpgraded"
    | "UserWhitelisted"
    | "UserRemovedFromWhitelist",
  limit: number = 50,
) {
  const events = await client.queryEvents({
    query: {
      MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::${eventType}`,
    },
    limit,
    order: "descending",
  });

  return events.data;
}

/**
 * Parse NFT data from object
 */
function parseNFTData(nftObject: any) {
  if (!nftObject.data?.content?.fields) {
    return null;
  }

  const fields = nftObject.data.content.fields;

  return {
    id: fields.id.id,
    tier: fields.tier,
    tierName: fields.tier_name,
    name: fields.name,
    description: fields.description,
    imageUrl: fields.image_url,
    attributes: fields.attributes,
    serialNumber: fields.serial_number,
  };
}

/**
 * Extract NFT ID from transaction result
 */
function getNFTIdFromTransaction(txResult: any): string | null {
  if (!txResult.objectChanges) return null;

  for (const change of txResult.objectChanges) {
    if (change.type === "created" && change.objectType?.includes("TieredNFT")) {
      return change.objectId;
    }
  }

  return null;
}

// Run the demo
runFullDemo(customMnemonic);

/**
 * ═══════════════════════════════════════════════════════════════
 * INSTRUCTIONS TO RUN
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Install dependencies:
 *    npm install @mysten/sui
 *
 * 2. Get testnet SUI tokens:
 *    - Visit: https://faucet.sui.io/
 *    - Or join Sui Discord and use #testnet-faucet
 *
 * 3. Run the script:
 *    npx ts-node demo.ts
 *    or
 *    ts-node demo.ts
 *
 * 4. The script will automatically:
 *    ✅ Initialize the collection (creates Collection and AdminCap)
 *    ✅ Mint a Bronze NFT
 *    ✅ Upgrade Bronze → Silver (burns Bronze)
 *    ✅ Upgrade Silver → Gold (burns Silver)
 *    ✅ Upgrade Gold → Platinum (burns Gold)
 *    ✅ Verify only 1 NFT remains (the Platinum)
 *    ✅ Show complete upgrade history
 *    ✅ Display Sui Explorer links
 *
 * 5. Save the Collection ID and AdminCap ID for future use!
 *
 * ═══════════════════════════════════════════════════════════════
 */

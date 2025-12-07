import React, { useState } from "react";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient, RetryableWalrusClientError } from "@mysten/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

// Walrus Configuration
const WALRUS_NETWORK = "testnet";
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

// Initialize Sui Client
const suiClient = new SuiClient({
  url: getFullnodeUrl(WALRUS_NETWORK),
});

// Initialize Walrus Client
const walrusClient = new WalrusClient({
  network: WALRUS_NETWORK,
  suiClient,
});

// Walrus Upload Hook
const useWalrusUpload = (mnemonic) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const getKeypair = () => {
    return Ed25519Keypair.deriveKeypair(mnemonic || "your-mnemonic-here");
  };

  const uploadJsonToWalrus = async (jsonObject, epochs = 5) => {
    setUploading(true);
    setError(null);

    try {
      const jsonString = JSON.stringify(jsonObject, null, 2);
      const jsonBuffer = new TextEncoder().encode(jsonString);
      const fileSize = jsonBuffer.length;

      console.log(`📤 Uploading JSON data to Walrus...`);
      console.log(`   File size: ${(fileSize / 1024).toFixed(2)} KB`);

      const keypair = getKeypair();

      const { blobId, blobObject } = await walrusClient.writeBlob({
        blob: jsonBuffer,
        deletable: true,
        epochs: epochs,
        signer: keypair,
      });

      const url = `${WALRUS_AGGREGATOR_URL}/v1/${blobId}`;

      console.log("✅ Upload successful!");
      console.log("   Blob ID:", blobId);
      console.log("   URL:", url);

      setUploading(false);
      return {
        blobId,
        blobObjectId: blobObject.id.id,
        url,
      };
    } catch (err) {
      if (err instanceof RetryableWalrusClientError) {
        console.warn("⚠️  Retryable error, resetting client...");
        walrusClient.reset();
        return uploadJsonToWalrus(jsonObject, epochs);
      }
      console.error("❌ Upload error:", err);
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  const downloadJsonBlob = async (blobId) => {
    try {
      console.log(`📥 Downloading blob ${blobId}...`);
      const data = await walrusClient.readBlob({ blobId });
      const jsonString = new TextDecoder().decode(data);
      const jsonData = JSON.parse(jsonString);
      console.log(`✅ Downloaded JSON data`);
      return jsonData;
    } catch (err) {
      if (err instanceof RetryableWalrusClientError) {
        walrusClient.reset();
        return downloadJsonBlob(blobId);
      }
      throw err;
    }
  };

  const uploadMultipleTiers = async (tierDataArray) => {
    setUploading(true);
    setError(null);

    try {
      const results = {};

      for (const tierData of tierDataArray) {
        const { tierName, data } = tierData;
        console.log(`   Processing ${tierName}...`);

        const result = await uploadJsonToWalrus(data);
        results[tierName.toLowerCase()] = {
          blobId: result.blobId,
          url: result.url,
          objectId: result.blobObjectId,
        };
      }

      setUploading(false);
      return results;
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  return {
    uploadJsonToWalrus,
    downloadJsonBlob,
    uploadMultipleTiers,
    uploading,
    error,
  };
};

// Example React Component
export default function WalrusUploader() {
  const [mnemonic, setMnemonic] = useState("");
  const [uploadResults, setUploadResults] = useState(null);
  const [downloadedData, setDownloadedData] = useState(null);

  const {
    uploadJsonToWalrus,
    downloadJsonBlob,
    uploadMultipleTiers,
    uploading,
    error,
  } = useWalrusUpload(mnemonic);

  // Example: Upload single JSON
  const handleSingleUpload = async () => {
    const exampleData = {
      name: "Example NFT",
      description: "This is a test NFT",
      image: "walrus://example_image_blob",
      attributes: [
        { trait_type: "Type", value: "Test" },
        { trait_type: "Rarity", value: "Common" },
      ],
    };

    try {
      const result = await uploadJsonToWalrus(exampleData);
      setUploadResults([result]);
      alert(
        `Upload successful!\nBlob ID: ${result.blobId}\nURL: ${result.url}`
      );
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  // Example: Upload multiple tiers
  const handleMultipleUpload = async () => {
    const tierData = [
      {
        tierName: "Bronze",
        data: {
          name: "Bronze Tier NFT",
          description: "Bronze tier membership",
          image: "walrus://bronze_image",
          attributes: [
            { trait_type: "Tier", value: "Bronze" },
            { trait_type: "Rarity", value: "Common" },
          ],
        },
      },
      {
        tierName: "Silver",
        data: {
          name: "Silver Tier NFT",
          description: "Silver tier membership",
          image: "walrus://silver_image",
          attributes: [
            { trait_type: "Tier", value: "Silver" },
            { trait_type: "Rarity", value: "Uncommon" },
          ],
        },
      },
      {
        tierName: "Gold",
        data: {
          name: "Gold Tier NFT",
          description: "Gold tier membership",
          image: "walrus://gold_image",
          attributes: [
            { trait_type: "Tier", value: "Gold" },
            { trait_type: "Rarity", value: "Rare" },
          ],
        },
      },
    ];

    try {
      const results = await uploadMultipleTiers(tierData);
      setUploadResults(results);
      alert("All tiers uploaded successfully!");
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  // Example: Download and view blob
  const handleDownload = async () => {
    if (!uploadResults || uploadResults.length === 0) {
      alert("No uploaded data to download");
      return;
    }

    try {
      const blobId = Array.isArray(uploadResults)
        ? uploadResults[0].blobId
        : uploadResults.bronze?.blobId;

      if (!blobId) {
        alert("No blob ID found");
        return;
      }

      const data = await downloadJsonBlob(blobId);
      setDownloadedData(data);
      alert("Download successful! Check the downloaded data section.");
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 z-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🗄️ Walrus JSON Uploader
          </h1>
          <p className="text-gray-600 mb-8">
            Upload JSON data to Walrus decentralized storage
          </p>

          {/* Mnemonic Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Mnemonic
            </label>
            <input
              type="password"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your mnemonic phrase"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your mnemonic is used locally and never sent anywhere
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleSingleUpload}
              disabled={uploading || !mnemonic}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {uploading ? "⏳ Uploading..." : "📤 Upload Single"}
            </button>

            <button
              onClick={handleMultipleUpload}
              disabled={uploading || !mnemonic}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {uploading ? "⏳ Uploading..." : "📤 Upload Tiers"}
            </button>

            <button
              onClick={handleDownload}
              disabled={!uploadResults}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              📥 Download
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">❌ Error: {error}</p>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-green-800 mb-4">
                ✅ Upload Results
              </h2>
              <pre className="bg-white p-4 rounded border border-green-200 overflow-x-auto text-sm">
                {JSON.stringify(uploadResults, null, 2)}
              </pre>
            </div>
          )}

          {/* Downloaded Data */}
          {downloadedData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">
                📥 Downloaded Data
              </h2>
              <pre className="bg-white p-4 rounded border border-blue-200 overflow-x-auto text-sm">
                {JSON.stringify(downloadedData, null, 2)}
              </pre>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-2">💡 How to Use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>Enter your wallet mnemonic phrase</li>
              <li>Click "Upload Single" for one JSON object</li>
              <li>Click "Upload Tiers" for multiple tier data</li>
              <li>Click "Download" to retrieve uploaded data</li>
              <li>Use the returned URLs in your NFT metadata</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

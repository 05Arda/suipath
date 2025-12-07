#[test_only]
module tiered_nft::collection_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils;
    use tiered_nft::collection::{Self, AdminCap, Collection, TieredNFT};
    use std::string;

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0xB1;
    const USER2: address = @0xB2;

    // Helper function to initialize the collection
    fun init_collection(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            collection::test_init(ts::ctx(scenario));
        };
    }

    #[test]
    fun test_init_creates_admin_cap_and_collection() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // Check that admin received AdminCap
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_for_sender<AdminCap>(&scenario), 0);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_mint_bronze_nft() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // User1 mints a Bronze NFT
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            
            collection::mint_bronze(
                &mut collection,
                string::utf8(b"Bronze Warrior #1"),
                string::utf8(b"First Bronze NFT"),
                string::utf8(b"https://example.com/bronze1.png"),
                string::utf8(b"{\"power\": 10, \"rarity\": \"common\"}"),
                ts::ctx(&mut scenario)
            );

            ts::return_shared(collection);
        };

        // Verify USER1 received the NFT
        ts::next_tx(&mut scenario, USER1);
        {
            assert!(ts::has_most_recent_for_sender<TieredNFT>(&scenario), 1);
            
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            assert!(collection::get_tier(&nft) == 1, 2); // Bronze = 1
            assert!(collection::get_name(&nft) == string::utf8(b"Bronze Warrior #1"), 3);
            assert!(collection::get_serial_number(&nft) == 1, 4);
            
            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_whitelist_and_upgrade_bronze_to_silver() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // USER1 mints Bronze NFT
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            
            collection::mint_bronze(
                &mut collection,
                string::utf8(b"Bronze Warrior"),
                string::utf8(b"Bronze tier"),
                string::utf8(b"https://example.com/bronze.png"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );

            ts::return_shared(collection);
        };

        // Admin whitelists USER1 for Silver (tier 2)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            
            collection::whitelist_user(
                &admin_cap,
                &mut collection,
                USER1,
                2, // Silver tier
                ts::ctx(&mut scenario)
            );

            assert!(collection::is_whitelisted(&collection, USER1), 5);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        // USER1 upgrades Bronze to Silver
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let bronze_nft = ts::take_from_sender<TieredNFT>(&scenario);
            
            collection::upgrade_nft(
                &mut collection,
                bronze_nft,
                string::utf8(b"Silver Warrior"),
                string::utf8(b"Silver tier"),
                string::utf8(b"https://example.com/silver.png"),
                string::utf8(b"{\"power\": 25}"),
                ts::ctx(&mut scenario)
            );

            ts::return_shared(collection);
        };

        // Verify USER1 now has Silver NFT
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            assert!(collection::get_tier(&nft) == 2, 6); // Silver = 2
            assert!(collection::get_name(&nft) == string::utf8(b"Silver Warrior"), 7);
            
            ts::return_to_sender(&scenario, nft);
        };

        // Verify USER1 is no longer whitelisted after upgrade
        ts::next_tx(&mut scenario, USER1);
        {
            let collection = ts::take_shared<Collection>(&scenario);
            assert!(!collection::is_whitelisted(&collection, USER1), 8);
            ts::return_shared(collection);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_full_upgrade_path_bronze_to_platinum() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // USER1 mints Bronze
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::mint_bronze(
                &mut collection,
                string::utf8(b"Warrior"),
                string::utf8(b"desc"),
                string::utf8(b"url"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );
            ts::return_shared(collection);
        };

        // Upgrade Bronze -> Silver
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 2, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            collection::upgrade_nft(&mut collection, nft, string::utf8(b"Silver"), string::utf8(b"d"), string::utf8(b"u"), string::utf8(b"{}"), ts::ctx(&mut scenario));
            ts::return_shared(collection);
        };

        // Upgrade Silver -> Gold
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 3, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            collection::upgrade_nft(&mut collection, nft, string::utf8(b"Gold"), string::utf8(b"d"), string::utf8(b"u"), string::utf8(b"{}"), ts::ctx(&mut scenario));
            ts::return_shared(collection);
        };

        // Upgrade Gold -> Platinum
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 4, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            collection::upgrade_nft(&mut collection, nft, string::utf8(b"Platinum"), string::utf8(b"d"), string::utf8(b"u"), string::utf8(b"{}"), ts::ctx(&mut scenario));
            ts::return_shared(collection);
        };

        // Verify final Platinum NFT
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            assert!(collection::get_tier(&nft) == 4, 9); // Platinum = 4
            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = collection::ENotWhitelisted)]
    fun test_upgrade_without_whitelist_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // USER1 mints Bronze
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::mint_bronze(
                &mut collection,
                string::utf8(b"Bronze"),
                string::utf8(b"desc"),
                string::utf8(b"url"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );
            ts::return_shared(collection);
        };

        // USER1 tries to upgrade without being whitelisted
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            
            // This should fail with ENotWhitelisted
            collection::upgrade_nft(
                &mut collection,
                nft,
                string::utf8(b"Silver"),
                string::utf8(b"desc"),
                string::utf8(b"url"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );

            ts::return_shared(collection);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = collection::ENotAuthorized)]
    fun test_upgrade_wrong_tier_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // USER1 mints Bronze
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::mint_bronze(
                &mut collection,
                string::utf8(b"Bronze"),
                string::utf8(b"desc"),
                string::utf8(b"url"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );
            ts::return_shared(collection);
        };

        // Admin whitelists USER1 for Gold (tier 3) instead of Silver (tier 2)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 3, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        // USER1 tries to upgrade Bronze to Silver, but whitelisted for Gold
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            
            // This should fail with ENotAuthorized
            collection::upgrade_nft(
                &mut collection,
                nft,
                string::utf8(b"Silver"),
                string::utf8(b"desc"),
                string::utf8(b"url"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );

            ts::return_shared(collection);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_multiple_users_independent_progression() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // USER1 mints Bronze
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::mint_bronze(&mut collection, string::utf8(b"U1"), string::utf8(b"d"), string::utf8(b"u"), string::utf8(b"{}"), ts::ctx(&mut scenario));
            ts::return_shared(collection);
        };

        // USER2 mints Bronze
        ts::next_tx(&mut scenario, USER2);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::mint_bronze(&mut collection, string::utf8(b"U2"), string::utf8(b"d"), string::utf8(b"u"), string::utf8(b"{}"), ts::ctx(&mut scenario));
            ts::return_shared(collection);
        };

        // Admin whitelists only USER1 for Silver
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 2, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        // USER1 upgrades to Silver
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            collection::upgrade_nft(&mut collection, nft, string::utf8(b"Silver U1"), string::utf8(b"d"), string::utf8(b"u"), string::utf8(b"{}"), ts::ctx(&mut scenario));
            ts::return_shared(collection);
        };

        // Verify USER1 has Silver
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            assert!(collection::get_tier(&nft) == 2, 10);
            ts::return_to_sender(&scenario, nft);
        };

        // Verify USER2 still has Bronze
        ts::next_tx(&mut scenario, USER2);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            assert!(collection::get_tier(&nft) == 1, 11);
            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_remove_from_whitelist() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // Admin whitelists USER1
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 2, ts::ctx(&mut scenario));
            
            assert!(collection::is_whitelisted(&collection, USER1), 12);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        // Admin removes USER1 from whitelist
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::remove_from_whitelist(&admin_cap, &mut collection, USER1, ts::ctx(&mut scenario));
            
            assert!(!collection::is_whitelisted(&collection, USER1), 13);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_view_functions() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // USER1 mints Bronze with specific metadata
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::mint_bronze(
                &mut collection,
                string::utf8(b"Epic Warrior"),
                string::utf8(b"A legendary bronze warrior"),
                string::utf8(b"https://example.com/warrior.png"),
                string::utf8(b"{\"strength\": 100, \"rarity\": \"epic\"}"),
                ts::ctx(&mut scenario)
            );
            ts::return_shared(collection);
        };

        // Test all view functions
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            
            assert!(collection::get_tier(&nft) == 1, 14);
            assert!(collection::get_tier_name(&nft) == string::utf8(b"Bronze"), 15);
            assert!(collection::get_name(&nft) == string::utf8(b"Epic Warrior"), 16);
            assert!(collection::get_description(&nft) == string::utf8(b"A legendary bronze warrior"), 17);
            assert!(collection::get_image_url(&nft) == string::utf8(b"https://example.com/warrior.png"), 18);
            assert!(collection::get_serial_number(&nft) == 1, 19);
            
            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_old_nft_burned_after_upgrade() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // USER1 mints Bronze NFT
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::mint_bronze(
                &mut collection,
                string::utf8(b"Bronze Warrior"),
                string::utf8(b"Original Bronze"),
                string::utf8(b"https://example.com/bronze.png"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );
            ts::return_shared(collection);
        };

        // Get the Bronze NFT ID before upgrade
        let bronze_nft_id;
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            bronze_nft_id = object::id(&nft);
            assert!(collection::get_tier(&nft) == 1, 20); // Verify it's Bronze
            ts::return_to_sender(&scenario, nft);
        };

        // Admin whitelists USER1 for Silver upgrade
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 2, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        // USER1 upgrades Bronze to Silver (this burns the Bronze NFT)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let bronze_nft = ts::take_from_sender<TieredNFT>(&scenario);
            
            collection::upgrade_nft(
                &mut collection,
                bronze_nft, // This NFT will be burned
                string::utf8(b"Silver Warrior"),
                string::utf8(b"Upgraded to Silver"),
                string::utf8(b"https://example.com/silver.png"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );

            ts::return_shared(collection);
        };

        // Verify USER1 now has Silver NFT (not Bronze)
        ts::next_tx(&mut scenario, USER1);
        {
            let silver_nft = ts::take_from_sender<TieredNFT>(&scenario);
            let silver_nft_id = object::id(&silver_nft);
            
            // Verify it's a Silver tier NFT
            assert!(collection::get_tier(&silver_nft) == 2, 21);
            assert!(collection::get_name(&silver_nft) == string::utf8(b"Silver Warrior"), 22);
            
            // Verify the NFT ID is different (old one was burned, new one created)
            assert!(bronze_nft_id != silver_nft_id, 23);
            
            ts::return_to_sender(&scenario, silver_nft);
        };

        // Critical check: Verify USER1 only has ONE NFT (the Silver one)
        // The Bronze NFT should no longer exist
        ts::next_tx(&mut scenario, USER1);
        {
            // Take the Silver NFT
            let silver_nft = ts::take_from_sender<TieredNFT>(&scenario);
            
            // Try to take another NFT - this should fail because Bronze was burned
            // We use most_recent_id_for_sender to check if there's another NFT
            assert!(!ts::has_most_recent_for_sender<TieredNFT>(&scenario), 24);
            
            ts::return_to_sender(&scenario, silver_nft);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_multiple_upgrades_burn_previous_nfts() {
        let mut scenario = ts::begin(ADMIN);
        init_collection(&mut scenario);

        // USER1 mints Bronze
        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::mint_bronze(
                &mut collection,
                string::utf8(b"Warrior"),
                string::utf8(b"desc"),
                string::utf8(b"url"),
                string::utf8(b"{}"),
                ts::ctx(&mut scenario)
            );
            ts::return_shared(collection);
        };

        // Store all NFT IDs to verify they're different
        let bronze_id;
        let silver_id;
        let gold_id;

        // Get Bronze ID
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            bronze_id = object::id(&nft);
            ts::return_to_sender(&scenario, nft);
        };

        // Upgrade to Silver
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 2, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            collection::upgrade_nft(&mut collection, nft, string::utf8(b"Silver"), string::utf8(b"d"), string::utf8(b"u"), string::utf8(b"{}"), ts::ctx(&mut scenario));
            ts::return_shared(collection);
        };

        // Get Silver ID
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            silver_id = object::id(&nft);
            assert!(bronze_id != silver_id, 25); // Different IDs
            ts::return_to_sender(&scenario, nft);
        };

        // Upgrade to Gold
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut collection = ts::take_shared<Collection>(&scenario);
            collection::whitelist_user(&admin_cap, &mut collection, USER1, 3, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(collection);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut collection = ts::take_shared<Collection>(&scenario);
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            collection::upgrade_nft(&mut collection, nft, string::utf8(b"Gold"), string::utf8(b"d"), string::utf8(b"u"), string::utf8(b"{}"), ts::ctx(&mut scenario));
            ts::return_shared(collection);
        };

        // Get Gold ID and verify all three are different
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            gold_id = object::id(&nft);
            assert!(bronze_id != silver_id, 26);
            assert!(silver_id != gold_id, 27);
            assert!(bronze_id != gold_id, 28);
            assert!(collection::get_tier(&nft) == 3, 29); // Verify it's Gold
            
            // Verify USER1 only has this ONE Gold NFT (all previous burned)
            ts::return_to_sender(&scenario, nft);
        };

        // Final check: Only one NFT exists for USER1
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<TieredNFT>(&scenario);
            assert!(!ts::has_most_recent_for_sender<TieredNFT>(&scenario), 30);
            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }
}

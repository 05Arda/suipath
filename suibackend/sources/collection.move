module tiered_nft::collection {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::table::{Self, Table};
    use sui::event;

    // Error codes
    const ENotAuthorized: u64 = 1;
    const ENotWhitelisted: u64 = 2;
    const EInvalidTier: u64 = 3;
    const EAlreadyWhitelisted: u64 = 4;

    // Tier levels
    const TIER_BRONZE: u8 = 1;
    const TIER_SILVER: u8 = 2;
    const TIER_GOLD: u8 = 3;
    const TIER_PLATINUM: u8 = 4;

    // Collection Admin Capability
    public struct AdminCap has key, store {
        id: UID,
    }

    // Main Collection Registry
    public struct Collection has key {
        id: UID,
        name: String,
        description: String,
        // Track whitelisted users for each tier upgrade
        // Maps address -> next tier they're eligible for
        whitelist: Table<address, u8>,
        total_minted: u64,
    }

    // NFT struct with tier and metadata
    public struct TieredNFT has key, store {
        id: UID,
        tier: u8,
        tier_name: String,
        name: String,
        description: String,
        image_url: String,
        attributes: String, // JSON string for flexibility
        serial_number: u64,
    }

    // Events
    public struct NFTMinted has copy, drop {
        nft_id: ID,
        tier: u8,
        owner: address,
        serial_number: u64,
    }

    public struct NFTUpgraded has copy, drop {
        old_nft_id: ID,
        new_nft_id: ID,
        old_tier: u8,
        new_tier: u8,
        owner: address,
    }

    public struct UserWhitelisted has copy, drop {
        user: address,
        tier: u8,
    }

    public struct UserRemovedFromWhitelist has copy, drop {
        user: address,
        tier: u8,
    }

    // Initialize the collection
    fun init(ctx: &mut TxContext) {
        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        // Create collection registry
        let collection = Collection {
            id: object::new(ctx),
            name: string::utf8(b"Tiered Achievement NFTs"),
            description: string::utf8(b"Upgradeable NFT collection with Bronze, Silver, Gold, and Platinum tiers"),
            whitelist: table::new(ctx),
            total_minted: 0,
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(collection);
    }

    // Test-only initialization function
    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }

    // Helper function to get tier name from tier number
    fun tier_number_to_name(tier: u8): String {
        if (tier == TIER_BRONZE) {
            string::utf8(b"Bronze")
        } else if (tier == TIER_SILVER) {
            string::utf8(b"Silver")
        } else if (tier == TIER_GOLD) {
            string::utf8(b"Gold")
        } else if (tier == TIER_PLATINUM) {
            string::utf8(b"Platinum")
        } else {
            string::utf8(b"Unknown")
        }
    }

    // Admin: Whitelist user for next tier upgrade
    public fun whitelist_user(
        _admin: &AdminCap,
        collection: &mut Collection,
        user: address,
        tier: u8,
        _ctx: &mut TxContext
    ) {
        assert!(tier >= TIER_BRONZE && tier <= TIER_PLATINUM, EInvalidTier);
        
        // Add or update whitelist entry
        if (table::contains(&collection.whitelist, user)) {
            table::remove(&mut collection.whitelist, user);
        };
        
        table::add(&mut collection.whitelist, user, tier);

        event::emit(UserWhitelisted {
            user,
            tier,
        });
    }

    // Admin: Remove user from whitelist
    public fun remove_from_whitelist(
        _admin: &AdminCap,
        collection: &mut Collection,
        user: address,
        _ctx: &mut TxContext
    ) {
        assert!(table::contains(&collection.whitelist, user), ENotWhitelisted);
        
        let tier = table::remove(&mut collection.whitelist, user);

        event::emit(UserRemovedFromWhitelist {
            user,
            tier,
        });
    }

    // Mint initial Bronze NFT (anyone can mint)
    #[allow(lint(self_transfer))]
    public fun mint_bronze(
        collection: &mut Collection,
        name: String,
        description: String,
        image_url: String,
        attributes: String,
        ctx: &mut TxContext
    ) {
        collection.total_minted = collection.total_minted + 1;
        
        let nft = TieredNFT {
            id: object::new(ctx),
            tier: TIER_BRONZE,
            tier_name: tier_number_to_name(TIER_BRONZE),
            name,
            description,
            image_url,
            attributes,
            serial_number: collection.total_minted,
        };

        let nft_id = object::id(&nft);
        let sender = tx_context::sender(ctx);

        event::emit(NFTMinted {
            nft_id,
            tier: TIER_BRONZE,
            owner: sender,
            serial_number: collection.total_minted,
        });

        transfer::transfer(nft, sender);
    }

    // Upgrade NFT to next tier (burns old NFT)
    #[allow(lint(self_transfer))]
    public fun upgrade_nft(
        collection: &mut Collection,
        nft: TieredNFT,
        name: String,
        description: String,
        image_url: String,
        attributes: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if user is whitelisted for the next tier
        assert!(table::contains(&collection.whitelist, sender), ENotWhitelisted);
        
        //let eligible_tier = *table::borrow(&collection.whitelist, sender);
        let current_tier = nft.tier;
        let next_tier = current_tier + 1;
        
        // Verify user is eligible for the next tier
        assert!(eligible_tier == next_tier, ENotAuthorized);
        assert!(next_tier <= TIER_PLATINUM, EInvalidTier);

        // Store old NFT ID for event
        let old_nft_id = object::id(&nft);

        // Burn the old NFT
        let TieredNFT { 
            id, 
            tier: _,
            tier_name: _,
            name: _,
            description: _,
            image_url: _,
            attributes: _,
            serial_number: _,
        } = nft;
        object::delete(id);

        // Mint new NFT with upgraded tier
        collection.total_minted = collection.total_minted + 1;
        
        let new_nft = TieredNFT {
            id: object::new(ctx),
            tier: next_tier,
            tier_name: tier_number_to_name(next_tier),
            name,
            description,
            image_url,
            attributes,
            serial_number: collection.total_minted,
        };

        let new_nft_id = object::id(&new_nft);

        // Remove from whitelist after successful upgrade
        table::remove(&mut collection.whitelist, sender);

        event::emit(NFTUpgraded {
            old_nft_id,
            new_nft_id,
            old_tier: current_tier,
            new_tier: next_tier,
            owner: sender,
        });

        transfer::transfer(new_nft, sender);
    }

    // View functions
    public fun get_tier(nft: &TieredNFT): u8 {
        nft.tier
    }

    public fun get_tier_name(nft: &TieredNFT): String {
        nft.tier_name
    }

    public fun get_name(nft: &TieredNFT): String {
        nft.name
    }

    public fun get_description(nft: &TieredNFT): String {
        nft.description
    }

    public fun get_image_url(nft: &TieredNFT): String {
        nft.image_url
    }

    public fun get_serial_number(nft: &TieredNFT): u64 {
        nft.serial_number
    }

    public fun is_whitelisted(collection: &Collection, user: address): bool {
        table::contains(&collection.whitelist, user)
    }
}

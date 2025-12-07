module walrus_demo::storage {
    use std::string::String;
    use sui::event;
    
    // Veri referansını tutan obje
    public struct BlobPointer has key, store {
        id: UID,
        blob_id: String,
        description: String,
        owner: address
    }

    // Event yapısı
    public struct BlobStored has copy, drop {
        object_id: address,
        blob_id: String,
        sender: address
    }

    // Blob ID'yi zincire kaydetme fonksiyonu
    public fun save_blob_ref(
        blob_id: String, 
        description: String, 
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender(); 
        let id = object::new(ctx);
        let object_id = id.to_address(); 

        let pointer = BlobPointer {
            id,
            blob_id: blob_id,
            description,
            owner: sender
        };

        event::emit(BlobStored {
            object_id,
            blob_id: pointer.blob_id,
            sender
        });

        // Objeyi kullanıcıya transfer et
        transfer::public_transfer(pointer, sender);
    }

    // --- TEST KODU ---
    #[test]
    fun test_save_blob_flow() {
        use sui::test_scenario;
        use std::string;

        let user = @0xA;
        let mut scenario = test_scenario::begin(user);

        // 1. Fonksiyonu çalıştır
        save_blob_ref(
            string::utf8(b"blob_id_12345"), 
            string::utf8(b"Test Aciklamasi"), 
            scenario.ctx()
        );

        // 2. Transaction'ı bitir ve bir sonrakine geç
        test_scenario::next_tx(&mut scenario, user);
        
        {
            // Kullanıcıya gönderilen objeyi kontrol et (take_from_sender kullanıyoruz)
            let pointer = test_scenario::take_from_sender<BlobPointer>(&scenario);
            
            // Objeyi test bitiminde yok et (veya geri koy)
            test_scenario::return_to_sender(&scenario, pointer);
        };
        
        test_scenario::end(scenario);
    }
}
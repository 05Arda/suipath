module walrus_demo::calculator {
    use sui::event;

    // Sonucu frontend'e taşımak için bir "Kutu" (Event) tanımlıyoruz
    public struct SonucEvent has copy, drop {
        islem: std::string::String,
        sonuc: u64,
        yapan: address
    }

    // Toplama Fonksiyonu
    public entry fun topla_ve_duyur(sayi1: u64, sayi2: u64, ctx: &mut TxContext) {
        let toplam = sayi1 + sayi2;
        let sender = ctx.sender();

        // Sonucu event olarak fırlatıyoruz (Frontend bunu yakalayacak)
        event::emit(SonucEvent {
            islem: std::string::utf8(b"Toplama"),
            sonuc: toplam,
            yapan: sender
        });
    }
}
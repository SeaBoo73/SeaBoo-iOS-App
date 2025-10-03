# iOS In-App Purchase - Setup Completo

## ✅ Stato Implementazione

### Backend (Completato)
- ✅ Endpoint `/api/verify-purchase` - Verifica receipt con Apple
- ✅ Protezione replay - Unique index su `paymentTransactionId`
- ✅ Idempotency completa - Blocca transazioni duplicate cross-user
- ✅ Logging transazioni - Tracking completo per debug

### Frontend Web (Completato)
- ✅ Plugin installato: `cordova-plugin-purchase` (compatibile Capacitor)
- ✅ Modulo TypeScript: `client/src/lib/iap-storekit.ts`
- ✅ Funzioni: `purchaseProduct()`, `fetchProducts()`, `restorePurchases()`

## 🚀 Setup iOS Nativo

### 1. Sincronizza Capacitor

Dal terminale **sul tuo Mac** (non su Replit):

```bash
# Sincronizza il progetto iOS con i nuovi plugin
npx cap sync ios

# Apri in Xcode
npx cap open ios
```

### 2. Configura prodotti in App Store Connect

Crea questi prodotti IAP:

| Product ID | Tipo | Prezzo | Descrizione |
|-----------|------|--------|-------------|
| `it.seaboo.rental.basic` | Consumable | €50 | Noleggio barche base |
| `it.seaboo.rental.premium` | Consumable | €200 | Noleggio barche premium |
| `it.seaboo.experience.sunset` | Consumable | €80 | Esperienza tramonto |
| `it.seaboo.experience.diving` | Consumable | €120 | Esperienza diving |
| `it.seaboo.experience.fishing` | Consumable | €90 | Esperienza pesca |

### 3. Info.plist

Assicurati che `Info.plist` contenga:

```xml
<key>NSAppleEventsUsageDescription</key>
<string>Necessario per gestire i pagamenti in-app</string>
```

### 4. Inizializza IAP all'avvio

Nel tuo componente principale (es. `App.tsx`), aggiungi:

```typescript
import { useEffect } from 'react';
import { initializeIAP } from '@/lib/iap-storekit';

function App() {
  useEffect(() => {
    // Inizializza IAP quando l'app si avvia
    initializeIAP().catch(console.error);
  }, []);
  
  // ... resto del codice
}
```

## 💳 Uso nel Frontend

### Esempio: Pagamento Booking

```typescript
import { purchaseProduct, getProductIdForBooking } from '@/lib/iap-storekit';

async function handlePayBooking(bookingId: number, totalPrice: number) {
  const productId = getProductIdForBooking(totalPrice);
  
  const result = await purchaseProduct(productId, bookingId);
  
  if (result.success) {
    alert('Pagamento completato! Booking confermato.');
    // Aggiorna UI, naviga alla conferma, etc.
  } else {
    alert(`Errore: ${result.error}`);
  }
}
```

### Esempio: Mostra Prodotti Disponibili

```typescript
import { fetchProducts, SEABOO_PRODUCTS } from '@/lib/iap-storekit';

async function showProducts() {
  const products = await fetchProducts([
    SEABOO_PRODUCTS.BOAT_RENTAL_BASIC,
    SEABOO_PRODUCTS.BOAT_RENTAL_PREMIUM
  ]);
  
  products.forEach(p => {
    console.log(`${p.title}: ${p.price}`);
  });
}
```

## 🧪 Testing

### Sandbox Testing
1. **Crea Sandbox Tester** in App Store Connect
2. **Logout** dal tuo Apple ID su device/simulator
3. **Run app** in Xcode
4. **Prova acquisto** - iOS chiederà login Sandbox
5. **Verifica backend** - Controlla logs console per conferma

### Verifica Backend
```bash
# Sul server, controlla i logs quando fai un acquisto
# Dovresti vedere:
✅ Booking X confirmed via IAP
  - transactionId: 1000000xxxxx
  - productId: it.seaboo.rental.basic
  - environment: Sandbox
```

## 🔒 Sicurezza (Già Implementata)

✅ **Receipt Verification**
- Inviato ai server Apple per validazione
- Verifica firma, scadenza, audience

✅ **Idempotency**
- Unique index su `bookings.paymentTransactionId`
- Blocca replay anche con race condition
- Gestione errore 23505 PostgreSQL

✅ **Ownership Verification**
- Solo il proprietario del booking può confermarlo
- Check user_id prima di aggiornare

✅ **Logging Completo**
- Ogni transazione loggata con originalTransactionId
- Tracking per debug e fraud detection

## ⚠️ Checklist Pre-Submission

Prima di inviare ad Apple:

- [ ] Tutti i prodotti creati in App Store Connect
- [ ] Testato flusso completo in Sandbox
- [ ] Backend verifica receipt correttamente
- [ ] Bottone "Restore Purchases" presente nell'app (richiesto da Apple)
- [ ] Screenshot/video con acquisto funzionante per review

## 🐛 Troubleshooting

**"No products found"**
→ Prodotti non configurati in App Store Connect o ID errati

**"Receipt verification failed"**
→ Backend non raggiungibile o errore rete

**"Transaction already used"**
→ Corretto! Protezione replay funziona

**"Sandbox account not working"**
→ Assicurati di aver fatto logout dall'Apple ID normale

---

## ✅ Stato Finale

| Componente | Stato | Note |
|-----------|-------|------|
| Backend API | ✅ Completo | Sicuro e production-ready |
| Frontend Web | ✅ Completo | Plugin Cordova installato |
| iOS Native | ⚠️ Da sincronizzare | Run `npx cap sync ios` |
| Prodotti ASC | ⚠️ Da configurare | Crea i 5 prodotti |
| Testing | ⏳ Da testare | Usa Sandbox Tester |

**L'app è pronta per la submission Apple una volta completati gli step iOS! 🚀**

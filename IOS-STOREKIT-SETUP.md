# iOS StoreKit In-App Purchase - Guida Implementazione Nativa

## ⚠️ IMPORTANTE
Questo file contiene le istruzioni per implementare il plugin StoreKit nativo in Xcode.
Il codice TypeScript è già pronto in `client/src/lib/iap-storekit.ts`.

## 📋 Prerequisiti
1. Xcode installato
2. Account Apple Developer
3. Prodotti IAP configurati in App Store Connect

## 🛠️ Implementazione Swift Nativa

### Step 1: Apri il progetto iOS
```bash
npx cap sync ios
npx cap open ios
```

### Step 2: Crea il file `StoreKitPlugin.swift`

In Xcode, crea un nuovo file Swift in `App/App/` chiamato `StoreKitPlugin.swift`:

```swift
import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, SKProductsRequestDelegate, SKPaymentTransactionObserver {
    
    private var productsRequest: SKProductsRequest?
    private var productsCallID: String?
    private var purchaseCallID: String?
    private var currentProductId: String?
    
    override public func load() {
        SKPaymentQueue.default().add(self)
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    // MARK: - Get Products
    
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self) else {
            call.reject("Product IDs required")
            return
        }
        
        self.productsCallID = call.callbackId
        let request = SKProductsRequest(productIdentifiers: Set(productIds))
        request.delegate = self
        self.productsRequest = request
        request.start()
    }
    
    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        guard let callID = self.productsCallID,
              let call = self.bridge?.savedCall(withID: callID) else {
            return
        }
        
        var products: [[String: Any]] = []
        
        for product in response.products {
            let formatter = NumberFormatter()
            formatter.numberStyle = .currency
            formatter.locale = product.priceLocale
            
            let priceString = formatter.string(from: product.price) ?? ""
            
            products.append([
                "productId": product.productIdentifier,
                "title": product.localizedTitle,
                "description": product.localizedDescription,
                "price": priceString,
                "priceValue": product.price.doubleValue,
                "currency": product.priceLocale.currencyCode ?? "USD"
            ])
        }
        
        call.resolve(["products": products])
        self.productsCallID = nil
    }
    
    public func request(_ request: SKRequest, didFailWithError error: Error) {
        if let callID = self.productsCallID,
           let call = self.bridge?.savedCall(withID: callID) {
            call.reject("Failed to load products: \(error.localizedDescription)")
            self.productsCallID = nil
        }
    }
    
    // MARK: - Purchase
    
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Product ID required")
            return
        }
        
        self.currentProductId = productId
        self.purchaseCallID = call.callbackId
        
        let payment = SKMutablePayment()
        payment.productIdentifier = productId
        SKPaymentQueue.default().add(payment)
    }
    
    // MARK: - Transaction Observer
    
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                handlePurchased(transaction)
            case .failed:
                handleFailed(transaction)
            case .restored:
                handleRestored(transaction)
            case .deferred, .purchasing:
                break
            @unknown default:
                break
            }
        }
    }
    
    private func handlePurchased(_ transaction: SKPaymentTransaction) {
        guard let callID = self.purchaseCallID,
              let call = self.bridge?.savedCall(withID: callID) else {
            SKPaymentQueue.default().finishTransaction(transaction)
            return
        }
        
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            
            call.resolve([
                "success": true,
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString
            ])
        } else {
            call.reject("No receipt available")
        }
        
        self.purchaseCallID = nil
        self.currentProductId = nil
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        guard let callID = self.purchaseCallID,
              let call = self.bridge?.savedCall(withID: callID) else {
            SKPaymentQueue.default().finishTransaction(transaction)
            return
        }
        
        let errorCode = (transaction.error as? SKError)?.code.rawValue ?? 0
        var errorMessage = transaction.error?.localizedDescription ?? "Purchase failed"
        
        if errorCode == SKError.paymentCancelled.rawValue {
            errorMessage = "ERR_PAYMENT_CANCELLED"
        }
        
        call.reject(errorMessage, "\(errorCode)")
        
        SKPaymentQueue.default().finishTransaction(transaction)
        self.purchaseCallID = nil
        self.currentProductId = nil
    }
    
    private func handleRestored(_ transaction: SKPaymentTransaction) {
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    // MARK: - Finish Transaction
    
    @objc func finishTransaction(_ call: CAPPluginCall) {
        guard let transactionId = call.getString("transactionId") else {
            call.reject("Transaction ID required")
            return
        }
        
        // Find and finish the transaction
        for transaction in SKPaymentQueue.default().transactions {
            if transaction.transactionIdentifier == transactionId {
                SKPaymentQueue.default().finishTransaction(transaction)
                call.resolve()
                return
            }
        }
        
        call.reject("Transaction not found")
    }
    
    // MARK: - Restore Purchases
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        call.reject("Restore purchases not yet implemented")
        // TODO: Implement restore logic if needed
    }
}
```

### Step 3: Registra il Plugin

In `App/App/AppDelegate.swift`, non serve modificare nulla - Capacitor registra automaticamente i plugin.

### Step 4: Info.plist

Assicurati che `Info.plist` contenga le chiavi necessarie per StoreKit:

```xml
<key>SKAdNetworkItems</key>
<array>
    <!-- Aggiungi eventuali network di advertising qui -->
</array>
```

## 📦 Prodotti App Store Connect

Configura questi prodotti in App Store Connect:

| Product ID | Tipo | Descrizione |
|-----------|------|-------------|
| `it.seaboo.rental.basic` | Consumable | Noleggio barche base (≤€100) |
| `it.seaboo.rental.premium` | Consumable | Noleggio barche premium (>€100) |
| `it.seaboo.experience.sunset` | Consumable | Esperienza tramonto |
| `it.seaboo.experience.diving` | Consumable | Esperienza diving |
| `it.seaboo.experience.fishing` | Consumable | Esperienza pesca |

## ✅ Test

### Test in Sandbox
1. Crea un Sandbox Tester in App Store Connect
2. Esegui l'app su device/simulator
3. Accedi con l'account Sandbox quando richiesto
4. Testa il flusso di acquisto

### Test Backend
Il backend verifica automaticamente i receipt con i server Apple:
- Endpoint: `POST /api/verify-purchase`
- Verifica firma, audience, scadenza
- Protegge da receipt replay con unique index DB

## 🔒 Sicurezza Implementata

✅ **Backend già sicuro**:
- Verifica receipt con server Apple
- Validazione productId obbligatoria
- Idempotency completa (unique index su transactionId)
- Protezione replay cross-user
- Logging completo transazioni

## 🚀 Utilizzo nel Frontend

```typescript
import { purchaseProduct } from '@/lib/iap-storekit';

// Quando l'utente vuole pagare un booking
const handlePayment = async (bookingId: number, price: number) => {
  const productId = getProductIdForBooking(price);
  
  const result = await purchaseProduct(productId, bookingId);
  
  if (result.success) {
    // Booking confermato!
    alert('Pagamento completato!');
  } else {
    alert(result.error);
  }
};
```

## 📝 Note

- **Sandbox Testing**: Usa account Sandbox per testare
- **Production**: I receipt production vengono verificati automaticamente
- **Restore**: Apple richiede un bottone "Restore Purchases" nell'app
- **Rejection Risk**: Assicurati che tutti i prodotti siano configurati prima della submission

## 🐛 Troubleshooting

**"No products found"**
→ Controlla che i Product IDs in App Store Connect corrispondano esattamente

**"Receipt verification failed"**
→ Verifica che il backend `/api/verify-purchase` sia raggiungibile

**"Transaction not found"**
→ Controlla che la transazione sia completata prima di chiamare finishTransaction

---

**✅ Una volta implementato il codice Swift, il flusso completo sarà:**
1. User clicca "Prenota" → StoreKit mostra popup pagamento
2. User paga → Apple genera receipt
3. App invia receipt al backend → Backend verifica con Apple
4. Backend conferma booking → User riceve conferma

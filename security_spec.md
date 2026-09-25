# Security Spec: RF Investimentos Firebase Firestore

## 1. Data Invariants
1. **Master Gate / Subcollection Ownership**: All transactions live under `/users/{userId}/transactions/{transactionId}`. A user can only access, create, update, or delete transactions if `request.auth.uid == userId`.
2. **Transaction Integrity**: Every transaction must have valid types, strictly positive numbers where applicable, bounded string lengths (ticker <= 16, nome <= 120), and valid enums for `tipo`, `classe`, and `accountMode`.
3. **Immutability of Key Fields**: On updates, `userId` cannot be changed.
4. **PII Isolation**: User profile is private to the owner under `/users/{userId}/profile/main`.
5. **Catch-All Default Deny**: All other collections and documents outside user paths are locked down (`allow read, write: if false`).

## 2. The Dirty Dozen Payloads (Targeting PERMISSION_DENIED)
1. **Cross-Tenant Read**: User B attempting to read `/users/userA/transactions/tx1`.
2. **Cross-Tenant Write**: User B attempting to write to `/users/userA/transactions/tx2`.
3. **Unauthenticated Write**: Unauthenticated request attempting to create a transaction.
4. **Forged Owner**: User A attempting to create a transaction with `userId: "userB"`.
5. **ID Poisoning**: Path ID with invalid characters or exceeding 128 characters.
6. **Negative Quantity Attack**: Attempting to insert `qtd: -50`.
7. **Negative Unit Price Attack**: Attempting to insert `valorUn: -100`.
8. **Invalid Enum Attack**: Transaction with `classe: "CryptoMalware"` or `tipo: "HACK"`.
9. **Payload Oversize Attack**: `nome` or `observacoes` exceeding maximum declared lengths.
10. **Profile Impersonation**: Modifying someone else's profile document `/users/userA/profile/main`.
11. **Shadow Update Attack**: Injecting unapproved keys (e.g. `role: "admin"`) on transaction update.
12. **Global Scrape Attack**: Querying the root collection group without filtering by user ownership.

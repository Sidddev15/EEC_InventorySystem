# Production QA Checklist

Run this checklist before production deployment. Stock correctness is the release gate.

## Setup

- Run `npm run prisma:migrate:deploy`.
- Run `npm run seed`.
- Run `npm run seed:admin`.
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run build`.

## Manual Flow Checks

| Flow | User | Expected Result | Status |
| --- | --- | --- | --- |
| Login as Admin | Admin | Admin reaches dashboard and can access products, inventory, production, transactions, reports, and settings. | Pending manual run |
| Create parent product | Admin | Product is created with server-generated slug and duplicate validation. | Pending manual run |
| Create variant | Admin | Variant is created under the selected parent product with correct unit and inventory type. | Pending manual run |
| Add raw material inward | Admin or Factory | Inventory transaction, inventory quantity update, stock ledger entry, and audit log are created. | Pending manual run |
| Log production | Admin or Factory | Raw material stock decreases, finished/semi-finished stock increases, production entry and consumption rows are created, and all writes roll back on failure. | Pending manual run |
| View inventory update | Admin or Factory | Inventory screen shows updated quantity by variant and location. | Pending manual run |
| Check transaction log | Admin or Corporate | Transaction log shows inward, production consumption, and production output rows with reference and remarks. | Pending manual run |
| Export CSV | Admin or Corporate | Current stock, low stock, transactions, production history, and consumption summary download as CSV. | Pending manual run |
| Factory mobile panel | Factory | Large operational actions are visible and route to Add Raw Material, Log Production, Dispatch Goods, and View Stock. | Pending manual run |
| AI suggestions | Admin | Product duplicate, variant naming, unit, missing field, and reorder helpers return suggestions or safe fallbacks without blocking save actions. | Pending manual run |

## Stock Correctness Gate

Production deployment is blocked if any of these fail:

- Inward stock changes without an `InventoryTransaction`.
- Inward stock changes without a `StockLedger` row.
- Production output succeeds while any consumption write fails.
- Raw material quantity can go below zero.
- UI or API route writes inventory directly outside a domain service.
- Transaction records can be destructively deleted.

## Responsive UI Gate

- Dashboard, factory panel, products, inventory, production, transactions, and reports must be usable at phone width.
- Mobile bottom navigation must expose all allowed factory sections.
- Tables must remain readable with horizontal scroll where needed.
- Error messages must be visible and action-oriented.
- Empty states must explain what the user should do next.

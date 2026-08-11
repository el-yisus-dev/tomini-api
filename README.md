# Tomini API

Backend API for **Tomini POS**, a fast mobile Point of Sale system designed primarily for beverage shops, convenience stores, abarrotes, beer depots, and small businesses in Mexico.

Tomini is designed around a **mobile-first POS experience**, with the backend responsible for sales, inventory, cash registers, payments, customers, reporting, and synchronization with the mobile application.

The API is built with **Node.js, TypeScript, Express, MongoDB, and Mongoose**, focusing on simplicity, reliability, maintainability, and fast development without unnecessary overengineering.

## Features

### Authentication

* User registration
* Login
* JWT authentication
* Password hashing with bcrypt
* Authentication middleware
* Role-based access control

### Stores

* Store management
* User/store ownership
* Multi-tenant resource isolation
* Soft delete

### Catalog

* Categories
* Products
* Product variants
* SKU and barcode support
* Units and presentation quantities
* Purchase and sale prices
* Minimum stock thresholds

### Inventory

* Inventory automatically created for product variants
* Current stock tracking
* Manual inventory adjustments
* Inventory movement history
* Stock increase/decrease tracking
* Movement types:

  * `PURCHASE`
  * `SALE`
  * `ADJUSTMENT`
  * `DAMAGE`
  * `RETURN`

### Cash Register

* Open cash register
* Current active cash register
* Close cash register
* Opening amount
* Expected closing amount
* Counted closing amount
* Cash difference

The system is designed around **one active cash register/session per Store** for the MVP.

### Sales

* Create sales
* Sale items
* Product variant based sales
* Payment processing
* Inventory deduction
* Inventory movement generation
* Cash register integration
* Sale cancellation
* Transactional operations where consistency is required

### Customers

* Customer management
* Store-based customers
* Preparation for future credit/fiado functionality

### Reports

Basic reporting capabilities for:

* Daily sales
* Inventory
* Low stock
* Cash flow

Additional reporting functionality will be added progressively.

---

## Tech Stack

* Node.js
* TypeScript
* Express 5
* MongoDB
* Mongoose 9
* Zod
* JWT
* bcrypt
* Docker
* Docker Compose
* Postman

The project uses ES Modules:

```json
{
  "type": "module"
}
```

Local imports therefore use `.js` extensions:

```ts
import { User } from "../models/User.js";
```

---

## Architecture

Tomini intentionally uses a simple modular architecture:

```text
Router
   ↓
Middleware
   ↓
Controller
   ↓
Mongoose Model
   ↓
MongoDB
```

The project does **not** introduce services, repositories, use cases, or other abstraction layers unless the complexity of a module actually justifies them.

The goal is:

```text
Simple
+
Consistent
+
Maintainable
+
Professional
```

---

## Project Structure

```text
src/
├── app.ts
├── server.ts
│
├── config/
│   ├── config.ts
│   └── db.ts
│
├── controllers/
├── middleware/
├── models/
├── router/
├── schemas/
├── types/
└── utils/
```

Modules are organized around the actual domain rather than artificial architectural layers.

---

## Domain

The main domain relationships are:

```text
User
  ↓
Store
  │
  ├── Category
  │      ↓
  │    Product
  │      ↓
  │  ProductVariant
  │      ↓
  │   Inventory
  │      ↓
  │ InventoryMovement
  │
  ├── CashRegister
  │
  ├── Sales
  │    ├── SaleItems
  │    └── Payments
  │
  └── Customers
```

The core POS flow is:

```text
Catalog
   ↓
ProductVariant
   ↓
Inventory
   ↓
CashRegister
   ↓
Sale
   ↓
Payment
   ↓
InventoryMovement
   ↓
Cash
   ↓
Reports
```

---

## Data Consistency

Operations that modify multiple related MongoDB documents use transactions when atomicity is required.

For example, a sale may involve:

```text
Sale
+
SaleItems
+
Payment
+
Inventory
+
InventoryMovement
+
CashRegister
```

These operations must not leave the system in an inconsistent state.

MongoDB is therefore configured as a **replica set** for transactional operations.

---

## API Response Format

Successful response:

```json
{
  "status": "success",
  "message": "Operación realizada con éxito",
  "data": {}
}
```

Paginated response:

```json
{
  "status": "success",
  "data": {
    "items": [],
    "currentPage": 1,
    "totalPages": 1
  }
}
```

Error:

```json
{
  "status": "error",
  "message": "Recurso no encontrado"
}
```

Client-facing messages are written in Spanish.

---

## Mobile Application

Tomini is intended to be consumed primarily by a **mobile POS application**.

The mobile application will communicate with this API for:

```text
Authentication
Store information
Catalog
Inventory
Cash registers
Sales
Payments
Customers
Reports
```

The mobile client is expected to eventually support offline workflows and synchronization with the backend.

The backend remains the source of truth for operations that require transactional consistency.

---

## Development Philosophy

Tomini is being developed incrementally.

The project intentionally avoids premature complexity.

Rules:

* Keep controllers simple.
* Keep business logic close to the domain while complexity remains manageable.
* Validate input with Zod.
* Use `res.locals.user` for authenticated users.
* Never trust ownership information supplied by the client.
* Keep Store-based resources isolated.
* Use soft delete where historical relationships matter.
* Keep stock in Inventory, never in ProductVariant.
* Use transactions for multi-document critical operations.
* Avoid unnecessary abstractions.
* Prefer consistency over cleverness.
* Build and test one domain module at a time.

---

## Project Status

Current backend capabilities:

```text
Authentication       ✅
JWT                  ✅
Users                ✅
Store                ✅
Categories           ✅
Products             ✅
ProductVariants      ✅
Inventory            ✅
InventoryMovement    ✅
CashRegister         ✅
Sales                ✅
SaleItems            ✅
Payments             ✅
Inventory deduction  ✅
Sale cancellation    ✅
Cash integration     ✅
Customers            ✅
Basic Reports        ✅
```

The backend core POS flow is now functional.

The next major phase is the **mobile Android application**.

---

## Future Features

Planned functionality includes:

```text
Cash movements
Credits / Fiado
Suppliers
Purchases
Advanced reports
CFDI
Notifications
Offline synchronization
Real-time synchronization
Employee analytics
```

These features will be introduced only when they provide actual value to the product.

---

## Goal

Tomini is not intended to be an enterprise ERP.

The goal is to build a **fast, reliable, easy-to-use POS for small businesses**, particularly businesses where speed and simplicity matter more than complex administrative workflows.

```text
Open Store
   ↓
Open Cash Register
   ↓
Sell
   ↓
Receive Payment
   ↓
Update Inventory
   ↓
Track Cash
   ↓
Close Register
   ↓
Understand the Business
```

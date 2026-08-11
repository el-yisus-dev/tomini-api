# TOMINI POS — CONTEXTO DE DESARROLLO

> Documento de contexto reutilizable para continuar el desarrollo de Tomini POS en otros chats.
>
> **Última actualización:** 2026-08-10  
> **Estado actual:** Catálogo implementado, Inventory + InventoryMovement implementados y probados; siguiente módulo: Cash Register.

---

# 1. OBJETIVO DEL PROYECTO

**Tomini POS** es un sistema Point of Sale (POS) orientado principalmente a:

- Pequeñas tiendas.
- Abarrotes.
- Depósitos de cerveza.
- Pequeños comercios en México.

El objetivo es construir una API profesional, mantenible y escalable, **sin sobrearquitecturar**.

Principios:

```text
incremental
+
consistente
+
simple
+
profesional
```

El objetivo es construir un POS real y funcional, no demostrar patrones de arquitectura.

---

# 2. STACK

- Node.js
- TypeScript
- Express 5
- MongoDB
- Mongoose 9
- JWT
- bcrypt
- Zod
- ES Modules
- npm
- Docker / Docker Compose
- Postman

El proyecto utiliza:

```json
{
  "type": "module"
}
```

Por lo tanto, los imports locales utilizan `.js`:

```ts
import { User } from "../models/User.js";
```

---

# 3. ARQUITECTURA ACTUAL

No utilizar automáticamente:

- `services/`
- `repositories/`
- `use cases`
- patrones complejos

La arquitectura actual es:

```text
Router
   ↓
Middleware
   ↓
Controller
   ↓
Model
   ↓
MongoDB
```

Los controllers pueden utilizar Mongoose directamente.

La estructura general es:

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
│   ├── Auth.ts
│   ├── User.ts
│   ├── Store.ts
│   ├── Category.ts
│   ├── Product.ts
│   ├── ProductVariant.ts
│   ├── Inventory.ts
│   └── InventoryMovement.ts
│
├── middleware/
│   ├── ACL.ts
│   ├── Error.ts
│   ├── auth.ts
│   └── validateSchemas.ts
│
├── models/
│   ├── User.ts
│   ├── Store.ts
│   ├── Category.ts
│   ├── Product.ts
│   ├── ProductVariant.ts
│   ├── Inventory.ts
│   └── InventoryMovement.ts
│
├── router/
│   ├── Auth.ts
│   ├── User.ts
│   ├── Store.ts
│   ├── Category.ts
│   ├── Product.ts
│   ├── Inventory.ts
│   └── index.ts
│
├── schemas/
│   ├── auth.schema.ts
│   ├── id.schema.ts
│   ├── user.schema.ts
│   ├── store.schema.ts
│   ├── category.schema.ts
│   ├── product.schema.ts
│   ├── productVariant.schema.ts
│   └── inventory.schema.ts
│
├── types/
│   ├── Pagination.ts
│   ├── User.ts
│   ├── Store.ts
│   ├── Category.ts
│   ├── Product.ts
│   ├── ProductVariant.ts
│   └── InventoryMovement.ts
│
└── utils/
    ├── bcrypt.ts
    ├── jwt.ts
    ├── mongoose.ts
    └── pagination.ts
```

La estructura puede evolucionar cuando exista una razón concreta, pero no se debe refactorizar prematuramente.

---

# 4. ESTILO DE CÓDIGO

Preferencias:

- TypeScript.
- `async/await`.
- Controllers sencillos.
- Mongoose directamente desde controllers.
- Evitar callbacks innecesarios.
- Evitar complejidad innecesaria.
- Usar `Promise.all()` cuando tenga sentido.
- Evitar `for...of` cuando pueda utilizarse programación funcional.
- Mantener funciones pequeñas.
- No crear abstracciones únicamente por "buena arquitectura".
- No hacer refactors innecesarios.
- Adaptarse al código existente.

Patrón de controller:

```ts
export const example = async (
    req: Request,
    res: Response
) => {
    try {
        // lógica
    } catch (error) {
        errorHandler(error, req, res);
    }
};
```

No utilizar:

```ts
throw new Error();
```

para controlar flujo normal del negocio.

---

# 5. MANEJO DE ERRORES

Existe:

```text
middleware/Error.ts
```

Los controllers utilizan:

```ts
try {

} catch (error) {
    errorHandler(error, req, res);
}
```

Formato de error:

```json
{
    "status": "error",
    "message": "..."
}
```

Status codes:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Los mensajes dirigidos al cliente están en español.

---

# 6. VALIDACIÓN

Se utiliza Zod mediante:

```text
middleware/validateSchemas.ts
```

Los schemas están en:

```text
src/schemas/
```

Ejemplo:

```ts
router.post(
    "/",
    validate(createProductSchema),
    createProduct
);
```

Los IDs MongoDB se validan mediante:

```text
schemas/id.schema.ts
```

No mover controllers únicamente para resolver validación.

---

# 7. AUTENTICACIÓN

Endpoints:

```http
POST /auth/login
GET  /auth/me
```

El login:

1. Busca usuario.
2. Compara password con bcrypt.
3. Genera JWT.
4. Devuelve usuario sin password.

Existe:

```text
middleware/auth.ts
```

El usuario autenticado se encuentra en:

```ts
res.locals.user
```

**Nunca utilizar `req.user`.**

Ejemplo:

```ts
const { _id: owner } = res.locals.user;
```

---

# 8. ROLES Y ACL

Actualmente:

```text
ADMIN
USER
```

Existe:

```text
middleware/ACL.ts
```

Ejemplo:

```ts
verifyRole([UserRole.ADMIN])
```

Las operaciones administrativas de Products y ProductVariants requieren ADMIN.

No implementar roles más avanzados hasta que sean necesarios.

---

# 9. MULTI-TENANCY Y STORE

La relación principal es:

```text
User
  ↓
Store
```

El `owner` nunca debe venir desde `req.body`.

Debe obtenerse de:

```ts
res.locals.user._id
```

Los recursos privados deben filtrarse por el usuario y/o Store correspondiente.

---

# 10. SOFT DELETE

Las entidades importantes utilizan:

```ts
isActive: true
```

o:

```ts
isActive: false
```

No eliminar físicamente información que posteriormente pueda estar relacionada con:

```text
Products
Inventory
Sales
Customers
Cash Registers
```

Los listados normales filtran:

```ts
isActive: true
```

---

# 11. CATEGORY

Relación:

```text
Store
  ↓
Category
```

Una categoría pertenece a una Store.

Endpoints:

```http
POST   /categories
GET    /categories
GET    /categories/:id
PATCH  /categories/:id
DELETE /categories/:id
```

Las operaciones deben comprobar que la Store pertenezca al usuario autenticado.

---

# 12. PRODUCT

Product representa el producto conceptual.

Ejemplo:

```text
Indio
```

Relación:

```text
Store
  ↓
Category
  ↓
Product
```

Product también mantiene directamente la relación con Store para aislar rápidamente los recursos por tienda.

Conceptualmente:

```text
Product
├── name
├── sku
├── barcode
├── category
├── store
├── purchasePrice
├── salePrice
├── minStock
├── unit
├── isActive
├── createdAt
└── updatedAt
```

Endpoints:

```http
POST   /products
GET    /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
```

POST/PATCH/DELETE requieren ADMIN.

---

# 13. PRODUCT VARIANT

Una ProductVariant representa una **presentación concreta** de un Product.

Ejemplo:

```text
Product:
    Indio

Variants:
    Lata 355 ml
    Latón 473 ml
    940 ml
    1.2 L
```

La variante puede contener:

```text
SKU
Barcode
Unidad
Cantidad
Precio de compra
Precio de venta
Stock mínimo
```

Relación:

```text
Product
   ↓
ProductVariant
```

Product y ProductVariant comparten router, pero tienen controllers separados.

Router:

```text
router/Product.ts
```

Endpoints:

```http
POST   /products/:productId/variants
GET    /products/:productId/variants
GET    /products/:productId/variants/:variantId
PATCH  /products/:productId/variants/:variantId
DELETE /products/:productId/variants/:variantId
```

POST/PATCH/DELETE requieren ADMIN.

---

# 14. UNIT Y QUANTITY

Las variantes manejan:

```text
unit
quantity
```

Ejemplos:

```text
unit = ML
quantity = 355
```

```text
unit = ML
quantity = 473
```

```text
unit = ML
quantity = 940
```

`unit` + `quantity` describen la presentación.

**NO representan el stock disponible.**

---

# 15. DIFERENCIA ENTRE PRODUCTVARIANT Y INVENTORY

Esta distinción es fundamental.

### ProductVariant

Describe:

```text
qué producto es
qué presentación tiene
qué SKU tiene
qué código de barras tiene
qué precio tiene
qué unidad tiene
qué cantidad contiene
cuál es su stock mínimo
```

### Inventory

Describe:

```text
cuántas unidades existen actualmente en una Store
```

Ejemplo:

```text
Product:
    Indio

ProductVariant:
    Lata 355 ML

Inventory:
    stock = 24
```

Por lo tanto:

```text
ProductVariant.quantity = 355
```

significa:

> cada unidad de esa variante contiene 355 ml.

Mientras:

```text
Inventory.stock = 24
```

significa:

> existen 24 unidades disponibles.

`quantity` NO debe modificarse cuando se vende una unidad.

---

# 16. MINSTOCK

`minStock` pertenece a ProductVariant porque es una regla del catálogo/presentación.

Ejemplo:

```text
Indio 355 ML
minStock = 6
```

Si:

```text
Inventory.stock = 5
```

el inventario está bajo.

La comparación conceptual es:

```text
Inventory.stock <= ProductVariant.minStock
```

No guardar el stock dentro de ProductVariant.

---

# 17. INVENTORY

Inventory es independiente de Product/ProductVariant.

Modelo actual:

```ts
Inventory
├── store
├── productVariant
├── stock
├── createdAt
└── updatedAt
```

El modelo utiliza:

```ts
inventorySchema.index(
    {
        store: 1,
        productVariant: 1
    },
    {
        unique: true
    }
);
```

Esto significa:

> Una Store solo puede tener un Inventory para una ProductVariant.

Relación:

```text
ProductVariant
      ↓
Inventory
      ↓
InventoryMovement
```

---

# 18. CREACIÓN DE INVENTORY

Decisión actual:

**El Inventory se crea automáticamente al registrar una ProductVariant.**

Ejemplo:

```text
Crear Product:
    Indio

Crear ProductVariant:
    Indio 355 ML

Automáticamente:
    Inventory
        stock = 0
```

Esto evita tener variantes existentes sin registro de inventario.

El usuario posteriormente puede ajustar el stock.

---

# 19. INVENTORY ENDPOINTS ACTUALES

Router:

```text
router/Inventory.ts
```

Todos requieren:

```ts
router.use(protect);
```

Endpoints:

```http
GET   /inventory
GET   /inventory/:id
PATCH /inventory/:id/adjust
GET   /inventory/:id/movements
```

Actualmente el ajuste no es un CRUD genérico.

Es una operación de negocio:

```text
adjustInventory
```

---

# 20. INVENTORY SCHEMA DE AJUSTE

El ajuste utiliza Zod.

Conceptualmente:

```ts
export const updateInventorySchema = z.object({
    quantity: z
        .number()
        .refine(
            value => value !== 0,
            "La cantidad del ajuste no puede ser 0"
        ),

    reason: z
        .string()
        .trim()
        .max(
            500,
            "El motivo no puede superar los 500 caracteres"
        )
        .optional()
});
```

Importante:

```text
quantity
```

es la cantidad que se suma o resta al stock.

No es el nuevo stock absoluto.

Ejemplo:

```text
stock actual = 10

quantity = 5

nuevo stock = 15
```

o:

```text
stock actual = 10

quantity = -3

nuevo stock = 7
```

---

# 21. INVENTORY MOVEMENT

Existe:

```text
models/InventoryMovement.ts
types/InventoryMovement.ts
controllers/InventoryMovement.ts
```

Enum actual:

```ts
export enum InventoryMovementType {
    PURCHASE = "PURCHASE",
    SALE = "SALE",
    ADJUSTMENT = "ADJUSTMENT",
    DAMAGE = "DAMAGE",
    RETURN = "RETURN"
}
```

Modelo conceptual:

```text
InventoryMovement
├── store
├── productVariant
├── user
├── type
├── quantity
├── previousStock
├── newStock
├── reason
├── reference
├── createdAt
└── updatedAt
```

El movimiento registra:

- Quién realizó la operación.
- Qué variante afectó.
- Qué Store.
- Tipo de movimiento.
- Cantidad modificada.
- Stock anterior.
- Stock nuevo.
- Motivo.
- Referencia opcional.

---

# 22. AJUSTE DE INVENTORY ACTUAL

El ajuste de stock se realiza con una transacción MongoDB.

Conceptualmente:

```text
START TRANSACTION
       ↓
Obtener Inventory
       ↓
Validar Store/owner
       ↓
Calcular nuevo stock
       ↓
Validar que no sea negativo
       ↓
Actualizar Inventory
       ↓
Crear InventoryMovement
       ↓
COMMIT
```

Si alguna operación falla:

```text
ROLLBACK
```

Esto evita estados inconsistentes como:

```text
Inventory actualizado
pero
InventoryMovement no creado
```

o:

```text
InventoryMovement creado
pero
Inventory no actualizado
```

---

# 23. REGLA ACTUAL DE ADJUST

Actualmente el tipo de movimiento se determina así:

```ts
type:
    quantity < 0
        ? InventoryMovementType.DAMAGE
        : InventoryMovementType.ADJUSTMENT
```

Por lo tanto:

```text
quantity > 0
    → ADJUSTMENT
```

```text
quantity < 0
    → DAMAGE
```

Esto es válido para ajustes manuales del MVP.

Más adelante:

```text
SALE
```

no utilizará `adjustInventory`.

Una venta generará directamente:

```text
InventoryMovementType.SALE
```

Y una compra:

```text
InventoryMovementType.PURCHASE
```

---

# 24. INVENTORY MOVEMENTS

Endpoint:

```http
GET /inventory/:id/movements
```

Permite consultar el historial de movimientos de una variante dentro de una Store.

Utiliza paginación:

```text
page
limit
skip
totalPages
```

Los movimientos se ordenan:

```ts
.sort({ createdAt: -1 })
```

y se puede hacer populate del usuario responsable.

---

# 25. MONGODB TRANSACTIONS / REPLICA SET

Para utilizar:

```ts
mongoose.startSession()
session.withTransaction(...)
```

MongoDB debe funcionar como replica set o mediante mongos.

El Docker Compose fue configurado para utilizar un replica set local.

La conexión de la API utiliza una URI con:

```text
replicaSet=rs0
```

y autenticación:

```text
authSource=admin
```

Ejemplo conceptual:

```env
MONGO_URI=mongodb://admin:1234@localhost:27017/tomini_pos?replicaSet=rs0&authSource=admin
```

El nombre de la base de datos es:

```text
tomini_pos
```

Importante:

- No usar transacciones en MongoDB sin replica set.
- Si aparece:

```text
Transaction numbers are only allowed on a replica set member or mongos
```

la configuración de MongoDB no está lista para transacciones.

Durante la configuración local se presentó un problema de `security.keyFile` porque replica sets con authorization requieren una keyFile válida. Ya fue corregido y MongoDB quedó funcionando.

---

# 26. CONEXIÓN MONGOOSE

La conexión actual tiene aproximadamente este comportamiento:

```ts
export const connectToMongoDB = async (): Promise<void> => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        const connection = await mongoose.connect(mongoURI, {
            dbName,
            autoIndex: true
        });

        console.log(
            `Successfully connected to MongoDB: ${connection.connection.host}`
        );
    } catch (error) {
        const err = error as Error;

        console.log(
            "Error connecting to MongoDB",
            {
                message: err.message,
                stack: err.stack
            }
        );

        process.exit(1);
    }
};
```

No implementar una reconexión recursiva mediante el evento `disconnected`.

Evitar este patrón:

```ts
mongoose.connection.on("disconnected", () => {
    void connectToMongoDB();
});
```

porque puede generar bucles de reconexión y errores como:

```text
Maximum call stack size exceeded
```

La reconexión debe manejarse de forma controlada si posteriormente se necesita.

---

# 27. PAGINACIÓN

Existe:

```text
utils/pagination.ts
```

con:

```ts
getPagination()
getTotalPages()
```

Patrón:

```ts
const { page, limit, skip } = getPagination(req.query);

const [items, total] = await Promise.all([
    Model
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean(),

    Model.countDocuments(filter)
]);
```

---

# 28. POPULATE

Usar `populate()` cuando realmente se necesite información relacionada.

No usar populate indiscriminadamente.

Cuando solo se necesita comprobar una relación, preferir:

```ts
Model.exists(...)
```

cuando sea más sencillo.

---

# 29. API RESPONSE FORMAT

Éxito:

```json
{
    "status": "success",
    "message": "Operación realizada con éxito",
    "data": {}
}
```

Listado:

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

No cambiar arbitrariamente el formato entre módulos.

---

# 30. CASH REGISTER — SIGUIENTE MÓDULO

El siguiente módulo que debe construirse es:

```text
Cash Register
```

Se debe hacer **antes de Sales**.

Razón:

Una venta necesita saber en qué sesión de caja se está realizando.

Flujo:

```text
Store
  ↓
CashRegister
  ↓
Sale
```

---

# 31. CONCEPTO DE CASH REGISTER

Una Cash Register representa una **sesión de caja**.

Ejemplo:

```text
Caja #1

Apertura:
10 agosto 2026 - 08:00

Usuario:
Cajero

Monto inicial:
$500

Ventas:
$2,350

Efectivo esperado:
$2,850

Efectivo contado:
$2,830

Diferencia:
-$20
```

Modelo conceptual inicial:

```text
CashRegister
├── store
├── user
├── status
├── openingAmount
├── closingAmount
├── expectedAmount
├── difference
├── openedAt
└── closedAt
```

Estados iniciales:

```text
OPEN
CLOSED
```

---

# 32. CASH REGISTER ENDPOINTS INICIALES

Implementar inicialmente:

```http
POST /cash-registers/open
GET  /cash-registers/current
POST /cash-registers/close
```

### Abrir

```http
POST /cash-registers/open
```

Body:

```json
{
    "openingAmount": 500
}
```

El backend debe comprobar:

```text
Store pertenece al usuario
        ↓
Store está activa
        ↓
No existe una caja abierta
        ↓
Crear CashRegister OPEN
```

El cliente no debe enviar:

```text
user
owner
store de otro usuario
```

---

# 33. CURRENT CASH REGISTER

```http
GET /cash-registers/current
```

Debe devolver la caja abierta del usuario/Store correspondiente.

Si no existe:

```json
{
    "status": "error",
    "message": "No hay una caja abierta"
}
```

---

# 34. CLOSE CASH REGISTER

```http
POST /cash-registers/close
```

Body inicial:

```json
{
    "closingAmount": 2830
}
```

El backend debe calcular:

```text
expectedAmount
difference
```

El cliente **NO debe enviar**:

```text
expectedAmount
difference
```

porque son valores calculados por el backend.

El estado cambia:

```text
OPEN
 ↓
CLOSED
```

---

# 35. CASH MOVEMENT — DISEÑO FUTURO

Después de tener el flujo básico de caja se puede crear:

```text
CashMovement
```

Análogo a:

```text
Inventory
    ↓
InventoryMovement
```

La idea:

```text
CashRegister
    ↓
CashMovement
```

Ejemplo:

```text
OPENING       +500
SALE           +80
SALE          +120
REFUND         -50
WITHDRAWAL    -100
```

Resultado:

```text
500 + 80 + 120 - 50 - 100 = 550
```

Esto permitirá calcular correctamente el efectivo esperado.

**No sobreimplementar CashMovement antes de que el flujo básico de caja esté funcionando.**

---

# 36. SALES — DESPUÉS DE CASH REGISTER

Sales es el núcleo real del POS.

Conceptualmente:

```text
Sale
├── store
├── cashier/user
├── cashRegister
├── items
├── subtotal
├── discount
├── total
├── payment
├── status
└── timestamps
```

Cada SaleItem debe relacionarse con:

```text
ProductVariant
```

no únicamente con Product.

---

# 37. FLUJO DE UNA VENTA

El flujo esperado:

```text
Create Sale
    ↓
Validar CashRegister abierta
    ↓
Validar ProductVariants
    ↓
Validar Store
    ↓
Validar stock
    ↓
Obtener precios
    ↓
Calcular subtotal
    ↓
Calcular descuentos
    ↓
Calcular total
    ↓
Crear Sale
    ↓
Registrar SaleItems
    ↓
Reducir Inventory
    ↓
Crear InventoryMovement(SALE)
    ↓
Registrar Payment
    ↓
Actualizar Cash Register
    ↓
COMMIT
```

Todo lo que deba ser atómico debe realizarse dentro de una sesión/transacción MongoDB.

Nunca permitir fácilmente:

```text
Venta creada
pero stock no descontado
```

ni:

```text
Stock descontado
pero venta no creada
```

---

# 38. INVENTORY Y SALES

Una venta NO debe utilizar:

```text
adjustInventory
```

La venta debe realizar su propia operación:

```text
Inventory.stock -= quantity
```

y registrar:

```text
InventoryMovementType.SALE
```

Ejemplo:

```text
Stock anterior:
24

Venta:
2

Stock nuevo:
22

InventoryMovement:
    type = SALE
    quantity = -2
    previousStock = 24
    newStock = 22
```

Esto conserva un historial correcto.

---

# 39. PAYMENT

Payment será parte del flujo de Sales.

Inicialmente se deben contemplar métodos comunes para el POS:

```text
CASH
CARD
TRANSFER
```

El modelo final puede evolucionar.

La venta debe registrar cuánto se pagó y cómo.

Posteriormente pueden existir pagos múltiples si el negocio lo requiere:

```text
$100 CASH
$50 CARD
```

No implementar complejidad innecesaria desde el principio.

---

# 40. CUSTOMERS

Modelo conceptual:

```text
Customer
├── name
├── phone
├── email?
├── store
└── isActive
```

Los clientes pertenecen a una Store.

Endpoints CRUD se implementarán después del núcleo:

```text
Inventory
CashRegister
Sales
Payments
```

---

# 41. CREDITS / FIADO

Funcionalidad importante para pequeños comercios mexicanos.

Más adelante:

```text
Customer
   ↓
Credit
   ↓
Payments
```

Debe existir historial de:

```text
Deuda
Pagos
Saldo pendiente
```

No es prioridad inmediata.

---

# 42. SUPPLIERS / PURCHASES

Más adelante:

```text
Supplier
   ↓
Purchase
   ↓
InventoryMovement
   ↓
Stock increase
```

Una compra deberá generar:

```text
InventoryMovementType.PURCHASE
```

No implementar antes del núcleo de ventas/caja salvo que exista una necesidad concreta.

---

# 43. REPORTS

Los reportes se implementarán después de:

```text
Sales
Inventory
CashRegister
```

Inicialmente:

```http
GET /reports/dashboard
GET /reports/sales/today
GET /reports/inventory/low-stock
```

Información futura:

```text
Ventas del día
Ventas por periodo
Productos más vendidos
Inventario bajo
Ganancia estimada
Movimientos de caja
```

No crear reporting complejo prematuramente.

---

# 44. DOMINIO GENERAL

Actualmente:

```text
User
  │
  └── Store
        │
        ├── Category
        │      │
        │      └── Product
        │             │
        │             └── ProductVariant
        │                    │
        │                    └── Inventory
        │                           │
        │                           └── InventoryMovement
        │
        ├── CashRegister
        │
        ├── Sales
        │      │
        │      ├── SaleItems
        │      └── Payments
        │
        └── Customers
```

Más adelante:

```text
Customer
   ↓
Credit
   ↓
Payments
```

y:

```text
Supplier
   ↓
Purchase
   ↓
InventoryMovement
```

---

# 45. FLUJO COMPLETO DEL POS

Objetivo final:

```text
LOGIN
  ↓
STORE
  ↓
CATEGORY
  ↓
PRODUCT
  ↓
PRODUCT VARIANT
  ↓
INVENTORY
  ↓
OPEN CASH REGISTER
  ↓
SALE
  ↓
PAYMENT
  ↓
INVENTORY DECREASE
  ↓
INVENTORY MOVEMENT
  ↓
CASH INCREASE
  ↓
CLOSE CASH REGISTER
  ↓
REPORT
```

El objetivo no es crear CRUDs aislados.

El objetivo es conectar los módulos hasta obtener un POS funcional.

---

# 46. ESTADO ACTUAL DEL PROYECTO

```text
Auth              ✅
Users             ✅
Store             ✅
Categories        ✅
Products          🚧
ProductVariants   🚧
Inventory         ✅
InventoryMovement ✅
Cash Register     ⏳
Cash Movement     ⏳
Sales             ⏳
Sale Items        ⏳
Payments          ⏳
Customers         ⏳
Credits           ⏳
Suppliers         ⏳
Purchases         ⏳
Reports           ⏳
```

Estado importante:

```text
Product
   ↓
ProductVariant
   ↓
Inventory
   ↓
InventoryMovement
```

ya está conceptualmente definido y el módulo Inventory tiene implementación funcional.

El siguiente objetivo es:

```text
CashRegister
```

Después:

```text
Sales
```

---

# 47. MVP

El MVP debe poder:

```text
✅ Registrar usuarios
✅ Login
✅ JWT
✅ Autenticación
✅ Roles básicos
✅ Crear tienda
✅ Administrar tiendas
✅ Crear categorías
✅ Administrar categorías
✅ Crear productos
✅ Administrar productos
✅ Crear variantes
✅ Administrar variantes
✅ Crear Inventory automáticamente al crear Variant
✅ Consultar Inventory
✅ Ajustar Inventory
✅ Registrar InventoryMovement
⏳ Abrir caja
⏳ Consultar caja actual
⏳ Cerrar caja
⏳ Registrar ventas
⏳ Registrar pagos
⏳ Descontar inventario por venta
⏳ Actualizar caja por venta
⏳ Registrar clientes
⏳ Reportes básicos
```

Después:

```text
Credits
Suppliers
Purchases
Advanced Reports
CFDI
Notifications
etc.
```

---

# 48. REGLAS PARA GENERAR CÓDIGO

Cuando se genere código para Tomini POS:

1. Respetar la estructura actual.
2. No introducir `services/` sin una razón real.
3. Mantener lógica sencilla.
4. Usar controllers con Mongoose directamente mientras el módulo lo permita.
5. Utilizar `res.locals.user`.
6. No utilizar `req.user`.
7. Utilizar `errorHandler`.
8. Utilizar Zod mediante `validateSchemas`.
9. Usar mensajes en español.
10. Utilizar `.lean()` cuando no se necesiten documentos Mongoose.
11. Usar `Promise.all()` para consultas independientes.
12. Usar paginación en listados cuando corresponda.
13. Usar soft delete cuando sea necesario conservar historial.
14. No permitir que el cliente envíe relaciones sensibles como `owner`.
15. Filtrar recursos por usuario y Store.
16. Utilizar `runValidators: true` en updates.
17. Mantener imports ES Modules con `.js`.
18. No hacer refactors innecesarios.
19. No inventar estructuras que no existen.
20. Si falta información importante, preguntar antes de asumir.
21. Product y ProductVariant comparten router, controllers separados.
22. El stock pertenece a Inventory.
23. `ProductVariant.quantity` describe la presentación, no el stock.
24. `ProductVariant.minStock` es el umbral para detectar inventario bajo.
25. Una ProductVariant genera su Inventory automáticamente.
26. Los ajustes de stock deben registrar InventoryMovement.
27. Las ventas deben registrar movimientos `SALE`.
28. Las compras deben registrar movimientos `PURCHASE`.
29. No convertir ProductVariant en un módulo de inventario.
30. No mezclar responsabilidades entre catálogo, inventario, ventas y caja.
31. Las operaciones que modifican varios documentos deben considerar MongoDB transactions.
32. No usar transacciones si la conexión MongoDB no está configurada como replica set/mongos.
33. No implementar funcionalidades avanzadas antes de tener funcionando el flujo básico.
34. Mantener consistencia entre módulos.
35. Adaptarse al código existente en lugar de reemplazarlo por otra arquitectura.

---

# 49. FORMA DE TRABAJAR

Para cada nuevo módulo:

```text
1. Concepto
2. Model
3. Type
4. Zod Schema
5. Controller
6. Router
7. router/index.ts
8. Postman
9. Probar flujo completo
10. Continuar al siguiente módulo
```

No avanzar al siguiente módulo hasta que el actual funcione correctamente.

Primero aterrizar el concepto cuando exista una decisión de dominio importante.

Después escribir código.

---

# 50. PRIORIDAD INMEDIATA

El siguiente módulo a implementar es:

```text
CASH REGISTER
```

Primera versión:

```http
POST /cash-registers/open
GET  /cash-registers/current
POST /cash-registers/close
```

Después:

```text
CashMovement
```

si el flujo básico demuestra que es necesario.

Después:

```text
SALE
SALE ITEMS
PAYMENT
```

Y finalmente integrar:

```text
Sale
+
Inventory
+
InventoryMovement
+
CashRegister
+
Payment
```

dentro de una transacción cuando corresponda.

---

# 51. IDEA CENTRAL DEL SISTEMA

Tomini POS debe terminar funcionando como una cadena coherente:

```text
CATÁLOGO
    ↓
PRODUCT VARIANT
    ↓
INVENTORY
    ↓
CASH REGISTER
    ↓
SALE
    ↓
PAYMENT
    ↓
INVENTORY MOVEMENT
    ↓
CASH MOVEMENT
    ↓
REPORTS
```

Cada módulo tiene una responsabilidad clara.

No guardar información duplicada solamente por comodidad.

No poner `stock` dentro de ProductVariant.

No hacer que una venta modifique únicamente un documento.

El objetivo final es que cada operación importante deje un historial consistente y auditable.

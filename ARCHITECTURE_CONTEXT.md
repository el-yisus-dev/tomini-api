# TOMINI POS — CONTEXTO DE DESARROLLO

Actúa como **arquitecto backend senior y desarrollador experto en Node.js + TypeScript + Express + MongoDB/Mongoose**.

Estoy desarrollando **Tomini POS**, un sistema Point of Sale (POS) orientado principalmente a **pequeñas tiendas, abarrotes, depósitos de cerveza y pequeños comercios en México**.

El objetivo es construir una API profesional, mantenible y escalable, pero **sin sobrearquitecturar el proyecto**.

No quiero soluciones improvisadas, código innecesariamente complejo ni introducir patrones que no aporten valor real.

---

# 1. STACK ACTUAL

El proyecto utiliza:

* Node.js
* TypeScript
* Express 5
* MongoDB
* Mongoose 9
* JWT
* bcrypt
* Zod
* ES Modules
* npm
* Docker / Docker Compose
* Postman para pruebas de API

El proyecto utiliza:

```json
{
    "type": "module"
}
```

Por lo tanto, los imports locales deben utilizar extensión `.js`:

```ts
import { User } from "../models/User.js";
```

---

# 2. ARQUITECTURA ACTUAL

Actualmente **NO utilizo una arquitectura basada en services/repositories/use cases**.

La arquitectura real es:

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

La estructura actual sigue una organización modular:

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
│   └── ProductVariant.ts
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
│   └── ProductVariant.ts
│
├── router/
│   ├── Auth.ts
│   ├── User.ts
│   ├── Store.ts
│   ├── Category.ts
│   ├── Product.ts
│   └── index.ts
│
├── schemas/
│   ├── auth.schema.ts
│   ├── id.schema.ts
│   ├── user.schema.ts
│   ├── store.schema.ts
│   ├── category.schema.ts
│   ├── product.schema.ts
│   └── productVariant.schema.ts
│
├── types/
│   ├── Pagination.ts
│   ├── User.ts
│   ├── Store.ts
│   ├── Category.ts
│   ├── Product.ts
│   └── ProductVariant.ts
│
└── utils/
    ├── bcrypt.ts
    ├── jwt.ts
    ├── mongoose.ts
    └── pagination.ts
```

La estructura puede evolucionar conforme aumente la complejidad, pero **no introducir `services/`, `repositories/`, `use cases`, etc. automáticamente**.

Si un módulo se vuelve realmente complejo, se puede proponer una separación, pero primero debe existir una razón concreta.

---

# 3. ESTILO DE CÓDIGO

Quiero mantener controllers directamente conectados con Mongoose.

Patrón:

```ts
export const createUser = async (req: Request, res: Response) => {
    try {

        // lógica

    } catch (error) {
        errorHandler(error, req, res);
    }
};
```

Preferencias:

* TypeScript.
* `async/await`.
* Evitar callbacks innecesarios.
* Evitar complejidad innecesaria.
* Usar `Promise.all()` cuando tenga sentido.
* Evitar `for...of` cuando pueda utilizarse programación funcional.
* Mantener funciones pequeñas y fáciles de leer.
* No crear abstracciones únicamente por "buena arquitectura".
* Mantener consistencia entre módulos.
* No refactorizar código existente sin necesidad.
* Preferir soluciones simples y profesionales.
* No inventar estructuras que no existen.

---

# 4. MANEJO DE ERRORES

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

No utilizar:

```ts
throw new Error()
```

para controlar flujo normal del negocio.

Los errores deben terminar en respuestas JSON.

Formato:

```json
{
    "status": "error",
    "message": "..."
}
```

Éxito:

```json
{
    "status": "success",
    "message": "...",
    "data": {}
}
```

Status codes esperados:

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

---

# 5. VALIDACIÓN

Se utiliza **Zod** mediante:

```text
middleware/validateSchemas.ts
```

Los schemas se encuentran en:

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

La validación de entrada debe realizarse mediante middleware cuando sea posible.

No duplicar validaciones innecesariamente dentro del controller.

---

# 6. MENSAJES

Todos los mensajes dirigidos al cliente deben estar en **español**.

Mongoose debe utilizar mensajes personalizados.

Ejemplo:

```ts
required: [
    true,
    "El nombre de la categoría es obligatorio"
]
```

Otros ejemplos:

```ts
minlength: [
    2,
    "El nombre debe tener al menos 2 caracteres"
]

maxlength: [
    100,
    "El nombre no puede superar los 100 caracteres"
]

min: [
    0,
    "El precio no puede ser negativo"
]
```

Evitar mensajes genéricos de Mongoose en inglés cuando sea posible.

---

# 7. AUTENTICACIÓN

Existe un módulo Auth.

Endpoints:

```http
POST /auth/login
GET  /auth/me
```

El login:

1. Recibe email/password.
2. Busca usuario.
3. Compara contraseña mediante bcrypt.
4. Genera JWT.
5. Devuelve información del usuario sin password.

Existe:

```text
middleware/auth.ts
```

El usuario autenticado se almacena en:

```ts
res.locals.user
```

**NO utilizar:**

```ts
req.user
```

Patrón:

```ts
const owner = res.locals.user._id;
```

---

# 8. USERS

Users ya está implementado.

Archivos principales:

```text
controllers/User.ts
models/User.ts
schemas/user.schema.ts
types/User.ts
router/User.ts
```

Los controllers utilizan directamente Mongoose.

Ejemplo:

```ts
const user = await User.findById(id);
```

Las consultas de listado utilizan paginación cuando corresponde.

---

# 9. ROLES Y ACL

Actualmente existen:

```text
ADMIN
USER
```

El dominio puede evolucionar posteriormente hacia:

```text
OWNER
ADMIN
MANAGER
CASHIER
```

No implementar roles avanzados hasta que sean necesarios.

Existe:

```text
middleware/ACL.ts
```

para autorización.

Ejemplo:

```ts
verifyRole([UserRole.ADMIN])
```

Actualmente las operaciones administrativas de Products/ProductVariants utilizan `ADMIN`.

---

# 10. RESOURCES Y MULTI-TENANCY

El sistema actualmente sigue:

```text
User
  ↓
Store
```

Una Store pertenece a un usuario.

El `owner` **nunca debe venir desde `req.body`**.

Debe obtenerse de:

```ts
res.locals.user._id
```

Ejemplo:

```ts
owner: res.locals.user._id
```

Esto evita que un usuario pueda crear o modificar recursos pertenecientes a otro usuario.

---

# 11. STORE

Modelo conceptual:

```text
Store
├── name
├── description
├── phone
├── address
├── owner
├── isActive
├── createdAt
└── updatedAt
```

`owner`:

```ts
{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [
        true,
        "El propietario de la tienda es requerido"
    ],
    index: true
}
```

Utiliza:

```ts
timestamps: true
```

---

# 12. STORE CRUD

Endpoints:

```http
POST   /stores
GET    /stores
GET    /stores/:id
PATCH  /stores/:id
DELETE /stores/:id
```

Las operaciones privadas deben filtrar por el usuario autenticado:

```ts
Store.findOne({
    _id: id,
    owner: res.locals.user._id,
    isActive: true
});
```

No utilizar simplemente:

```ts
Store.findById(id)
```

para recursos privados.

---

# 13. SOFT DELETE

Las entidades importantes utilizan soft delete cuando sea necesario conservar historial.

En lugar de:

```ts
findByIdAndDelete()
```

se utiliza:

```ts
findOneAndUpdate(
    {
        _id: id,
        owner: res.locals.user._id,
        isActive: true
    },
    {
        isActive: false
    }
)
```

Por lo tanto:

```text
isActive: true
```

significa activo.

```text
isActive: false
```

significa desactivado.

Los listados normales deben filtrar:

```ts
isActive: true
```

No eliminar físicamente información que posteriormente pueda estar relacionada con:

```text
Products
Inventory
Sales
Customers
Cash Registers
```

---

# 14. CATEGORIES

Category ya está implementado.

Relación:

```text
Store
  ↓
Category
```

Una categoría **pertenece a una Store**.

No existen categorías globales.

Modelo conceptual:

```text
Category
├── name
├── description
├── store
├── isActive
├── createdAt
└── updatedAt
```

`store` referencia:

```ts
Schema.Types.ObjectId
```

con:

```ts
ref: "Store"
```

La categoría debe estar aislada por Store.

---

# 15. CATEGORY CRUD

Endpoints:

```http
POST   /categories
GET    /categories
GET    /categories/:id
PATCH  /categories/:id
DELETE /categories/:id
```

Las operaciones deben comprobar que la categoría pertenezca a una Store del usuario autenticado.

Ejemplo conceptual:

```text
Usuario
   ↓
Store
   ↓
Category
```

No confiar únicamente en el `store` recibido desde el cliente.

Cuando sea necesario validar la relación se puede utilizar:

```ts
.populate({
    path: "store",
    match: {
        owner,
        isActive: true
    },
    select: "_id name"
})
```

Si el `populate` no encuentra una Store válida, el recurso debe considerarse inaccesible.

---

# 16. PRODUCT

Product es el siguiente nivel del catálogo.

Relación:

```text
Store
  ↓
Category
  ↓
Product
```

Sin embargo, **Product también mantiene directamente la relación con Store**.

Esto es intencional y permite aislar rápidamente los productos por tienda.

Modelo conceptual:

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

El producto representa el producto conceptual.

Ejemplo:

```text
Indio
```

No necesariamente representa una presentación específica.

---

# 17. PRODUCT VARIANT

El POS necesita soportar productos que tienen diferentes presentaciones.

Ejemplo real:

```text
Indio
├── Lata 355 ml
├── Latón 473 ml
├── Caguama
└── Caguama pequeña
```

Por esta razón existe:

```text
ProductVariant
```

Relación:

```text
Product
  ↓
ProductVariant
```

Una variante representa una presentación específica del producto.

La variante debe poder identificar, según el caso:

```text
SKU
Barcode
Unidad
Cantidad
Precio de compra
Precio de venta
```

La combinación exacta dependerá del modelo final.

Ejemplo conceptual:

```text
Product:
    Indio

Variants:
    355 ml
    473 ml
    940 ml
    1.2 L
```

---

# 18. UNIDAD Y CANTIDAD

Las variantes deben manejar:

```text
unit
quantity
```

Esto permite representar correctamente productos vendidos en distintas presentaciones.

Ejemplos:

```text
unit = ml
quantity = 355
```

```text
unit = ml
quantity = 473
```

```text
unit = ml
quantity = 940
```

o:

```text
unit = l
quantity = 1
```

La unidad y cantidad describen la presentación.

**No representan el stock disponible.**

---

# 19. INVENTORY Y STOCK

El stock **NO se almacena dentro de Product ni ProductVariant**.

El inventario será un módulo independiente:

```text
ProductVariant
      ↓
Inventory
      ↓
InventoryMovement
```

Esto es importante porque una variante representa:

```text
qué producto es
qué presentación tiene
qué precio tiene
```

mientras Inventory representa:

```text
cuántas unidades existen
```

Por ejemplo:

```text
Product:
    Indio

Variant:
    355 ml

Inventory:
    stock = 24
```

El stock no debe agregarse al modelo ProductVariant solamente por comodidad.

---

# 20. PRODUCT ROUTER

Product y ProductVariant utilizan **el mismo router**.

Esto es intencional.

Controllers separados:

```text
controllers/Product.ts
controllers/ProductVariant.ts
```

pero router compartido:

```text
router/Product.ts
```

El router actual tiene conceptualmente:

```text
/products
/products/:id
/products/:productId/variants
/products/:productId/variants/:variantId
```

---

# 21. PRODUCT ENDPOINTS

Actualmente:

```http
POST   /products
GET    /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
```

Operaciones administrativas:

```text
POST
PATCH
DELETE
```

requieren:

```ts
verifyRole([UserRole.ADMIN])
```

El router utiliza:

```ts
router.use(protect);
```

por lo que todos los endpoints requieren autenticación.

---

# 22. PRODUCT VARIANT ENDPOINTS

Las variantes se manejan como recursos hijos de Product.

Endpoints:

```http
POST   /products/:productId/variants
GET    /products/:productId/variants
GET    /products/:productId/variants/:variantId
PATCH  /products/:productId/variants/:variantId
DELETE /products/:productId/variants/:variantId
```

Las operaciones administrativas:

```text
POST
PATCH
DELETE
```

requieren:

```ts
verifyRole([UserRole.ADMIN])
```

---

# 23. VALIDACIÓN DE IDS

El archivo:

```text
schemas/id.schema.ts
```

contiene schemas para validar parámetros MongoDB.

Actualmente se mantiene:

```ts
objectIdSchema
```

y existen schemas específicos relacionados con Products/ProductVariants cuando el endpoint necesita validar más de un parámetro.

Ejemplo conceptual:

```text
/products/:productId/variants/:variantId
```

requiere validar:

```text
productId
variantId
```

Los controllers **no deben moverse ni rediseñarse únicamente para adaptar la validación**.

La validación debe resolverse mediante middleware/schema.

---

# 24. PAGINACIÓN

Los listados utilizan:

```text
utils/pagination.ts
```

Funciones:

```ts
getPagination()
getTotalPages()
```

Ejemplo:

```ts
const { page, limit, skip } = getPagination(req.query);
```

Para consultas independientes:

```ts
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

# 25. POPULATE

Usar `populate()` cuando sea necesario obtener información relacionada.

Ejemplo:

```ts
.populate({
    path: "store",
    match: {
        owner,
        isActive: true
    },
    select: "_id name"
})
```

No utilizar populate indiscriminadamente.

Cuando solo se necesita verificar una relación, puede ser preferible una consulta directa con `exists()`.

Ejemplo:

```ts
const storeExists = await Store.exists({
    _id: store,
    owner,
    isActive: true
});
```

---

# 26. INVENTORY

Inventory será un módulo separado.

No debe mezclarse con Product/ProductVariant.

Debe manejar:

```text
Stock actual
```

y movimientos:

```text
PURCHASE
SALE
ADJUSTMENT
DAMAGE
RETURN
```

Conceptualmente:

```text
ProductVariant
      ↓
Inventory
      ↓
InventoryMovement
```

Una venta deberá afectar el inventario y generar su movimiento correspondiente.

---

# 27. SALES

Sales es uno de los módulos centrales del POS.

Conceptualmente:

```text
Sale
├── store
├── cashier/user
├── items
├── subtotal
├── discount
├── total
├── payment
├── status
└── timestamps
```

Cada item de venta deberá estar relacionado con una ProductVariant, no solamente con Product.

Flujo:

```text
Create Sale
    ↓
Validar ProductVariants
    ↓
Validar stock
    ↓
Obtener precios
    ↓
Calcular subtotal
    ↓
Calcular total
    ↓
Crear venta
    ↓
Registrar items
    ↓
Reducir Inventory
    ↓
Crear InventoryMovement
    ↓
Registrar Payment
    ↓
Actualizar Cash Register
```

Cuando una operación afecte múltiples documentos y deba ser atómica, considerar:

```text
MongoDB transactions / sessions
```

Nunca permitir fácilmente estados como:

```text
Venta creada
Stock no descontado
```

o:

```text
Stock descontado
Venta no creada
```

---

# 28. CASH REGISTER

El módulo de caja deberá manejar como mínimo:

```http
POST /cash-registers/open
GET  /cash-registers/current
POST /cash-registers/close
```

Conceptualmente:

```text
Opening amount
+
Sales
-
Refunds
=
Expected amount
```

Al cerrar:

```text
expectedAmount
closingAmount
difference
```

No implementar funcionalidades avanzadas hasta tener el flujo básico funcionando.

---

# 29. CUSTOMERS

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

Posteriormente podrán utilizarse para:

```text
Credits / Fiado
```

---

# 30. CREDITS / FIADO

Es una funcionalidad importante para pequeños comercios mexicanos.

Más adelante:

```text
Customer
   ↓
Credit
   ↓
Payments
```

Debe existir historial de deuda y pagos.

No es prioridad inmediata.

---

# 31. SUPPLIERS / PURCHASES

Existirán:

```text
Suppliers
Purchases
```

pero después del núcleo del POS.

Las compras deberán posteriormente generar movimientos de inventario:

```text
Purchase
   ↓
InventoryMovement
   ↓
Stock increase
```

---

# 32. REPORTS

Los reportes se implementarán después de tener funcionando Sales e Inventory.

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

No crear un sistema de reporting complejo prematuramente.

---

# 33. DOMINIO GENERAL

La estructura conceptual actual es:

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
        │
        ├── Inventory
        │
        ├── Sales
        │      │
        │      └── Payments
        │
        ├── Cash Register
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
Inventory
```

---

# 34. FLUJO PRINCIPAL DEL POS

El flujo esperado es:

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

El objetivo no es construir CRUDs aislados.

El objetivo es que los módulos terminen formando un POS funcional.

---

# 35. OBJETIVO DEL MVP

El MVP debe poder:

```text
✅ Registrar usuarios
✅ Login
✅ JWT
✅ Autenticación
✅ Roles básicos
✅ Crear tienda
✅ Listar tiendas
✅ Consultar tienda
✅ Actualizar tienda
✅ Desactivar tienda
✅ Crear categorías
✅ Administrar categorías
✅ Crear productos
✅ Administrar productos
✅ Crear variantes
✅ Administrar variantes
⏳ Administrar inventario
⏳ Abrir caja
⏳ Registrar ventas
⏳ Registrar pagos
⏳ Descontar inventario
⏳ Cerrar caja
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

# 36. ESTADO ACTUAL

Actualmente:

```text
Auth              ✅
Users             ✅
Store             ✅
Categories        ✅
Products          🚧
ProductVariants   🚧
Inventory         ⏳
Sales             ⏳
Cash Register     ⏳
Customers         ⏳
Credits           ⏳
Suppliers         ⏳
Purchases         ⏳
Reports           ⏳
```

El siguiente objetivo inmediato es terminar:

```text
Product
   ↓
ProductVariant
```

Después:

```text
ProductVariant
   ↓
Inventory
```

---

# 37. REGLAS AL GENERAR CÓDIGO

Cuando generes código para Tomini POS:

1. Respeta la estructura actual.
2. No introduzcas `services/` sin una razón real.
3. Mantén lógica sencilla y directa.
4. Usa controllers con Mongoose directamente mientras el módulo lo permita.
5. Utiliza `res.locals.user`.
6. No utilices `req.user`.
7. Utiliza `errorHandler`.
8. Utiliza Zod mediante `validateSchemas`.
9. Usa mensajes en español.
10. Utiliza `.lean()` cuando no necesitemos documentos Mongoose.
11. Usa `Promise.all()` para consultas independientes.
12. Utiliza paginación en endpoints de listado cuando corresponda.
13. Utiliza soft delete cuando sea necesario conservar historial.
14. No permitas que el cliente envíe relaciones sensibles como `owner`.
15. Filtra recursos por usuario y Store correspondiente.
16. Utiliza `runValidators: true` en updates.
17. Mantén imports compatibles con ES Modules (`.js`).
18. No hagas refactors innecesarios.
19. No inventes estructuras que no existen.
20. Si falta información importante, pregunta antes de asumir.
21. Product y ProductVariant comparten router, pero pueden tener controllers separados.
22. El stock pertenece a Inventory, no a Product ni ProductVariant.
23. Las variantes representan presentaciones concretas del producto.
24. Las relaciones entre Store, Category, Product y ProductVariant deben mantenerse aisladas por tienda.
25. No convertir ProductVariant en un módulo de inventario.
26. No mezclar responsabilidades entre catálogo, inventario, ventas y caja.

---

# 38. FORMATO DE RESPUESTAS DE API

Mantener consistencia.

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

# 39. FORMA DE TRABAJAR

Cuando se solicite un nuevo módulo, construirlo progresivamente.

Primero:

```text
Model
Types
Schema
Controller
Router
```

Después:

```text
router/index.ts
```

y finalmente:

```text
Postman
```

para probar el flujo.

No avanzar al siguiente módulo hasta que el actual esté funcionando correctamente.

Cuando proporcione código existente:

**adaptarse a ese código en lugar de reemplazarlo por una arquitectura completamente diferente.**

Tomini POS debe evolucionar de manera:

```text
incremental
+
consistente
+
simple
+
profesional
```

El objetivo es construir un sistema real y funcional, no demostrar patrones de arquitectura.

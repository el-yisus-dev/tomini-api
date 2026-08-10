# TOMINI POS — CONTEXTO DE DESARROLLO

Actúa como **arquitecto backend senior y desarrollador experto en Node.js + TypeScript + Express + MongoDB/Mongoose**.

Estoy desarrollando **Tomini POS**, un sistema Point of Sale (POS) orientado principalmente a **pequeñas tiendas, abarrotes, depósitos de cerveza y pequeños comercios en México**.

El objetivo es construir una API profesional, mantenible y escalable. No quiero soluciones improvisadas ni código innecesariamente complejo.

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

Por lo tanto, los imports locales deben utilizar extensión `.js` cuando corresponda:

```ts
import { User } from "../models/User.js";
```

---

# 2. ARQUITECTURA ACTUAL

Actualmente **NO estoy utilizando una arquitectura basada en services/repositories**.

La estructura real del proyecto es:

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
│   └── Store.ts
│
├── middleware/
│   ├── ACL.ts
│   ├── Error.ts
│   ├── auth.ts
│   └── validateSchemas.ts
│
├── models/
│   ├── User.ts
│   └── Store.ts
│
├── router/
│   ├── Auth.ts
│   ├── User.ts
│   ├── Store.ts
│   └── index.ts
│
├── schemas/
│   ├── auth.schema.ts
│   ├── id.schema.ts
│   ├── store.schema.ts
│   └── user.schema.ts
│
├── types/
│   ├── Pagination.ts
│   ├── Store.ts
│   └── User.ts
│
└── utils/
    ├── bcrypt.ts
    ├── jwt.ts
    ├── mongoose.ts
    └── pagination.ts
```

## IMPORTANTE

No introducir `services/`, `repositories/`, `use cases`, etc. automáticamente.

La arquitectura actual utiliza:

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

Si en el futuro un módulo se vuelve demasiado complejo, se puede proponer una separación adicional, pero **no debe hacerse innecesariamente**.

La prioridad actual es terminar el POS rápidamente manteniendo código limpio y consistente.

---

# 3. ESTILO DE CÓDIGO

Mi código actual utiliza controllers directamente con Mongoose.

Ejemplo del patrón:

```ts
export const createUser = async (req: Request, res: Response) => {
    try {

        // lógica

    } catch (error) {
        errorHandler(error, req, res);
    }
};
```

Quiero mantener este estilo.

Preferencias:

* TypeScript.
* `async/await`.
* Evitar callbacks.
* Evitar complejidad innecesaria.
* Usar `Promise.all()` cuando tenga sentido.
* Evitar `for...of` cuando pueda utilizarse programación funcional.
* Mantener funciones fáciles de leer.
* No crear abstracciones solamente por "buena arquitectura".
* Mantener consistencia entre módulos.
* No refactorizar código existente sin necesidad.

---

# 4. MANEJO DE ERRORES

Existe un middleware:

```text
middleware/Error.ts
```

Se utiliza:

```ts
try {

} catch (error) {
    errorHandler(error, req, res);
}
```

No utilizar `throw new Error()` para controlar flujo de negocio.

Los errores deben terminar en respuestas JSON consistentes.

Formato general:

```json
{
    "status": "success",
    "message": "..."
}
```

o:

```json
{
    "status": "success",
    "message": "...",
    "data": {}
}
```

Errores:

```json
{
    "status": "error",
    "message": "..."
}
```

Cuando corresponda, usar HTTP status codes apropiados:

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

Los schemas están en:

```text
src/schemas/
```

Ejemplos:

```text
auth.schema.ts
user.schema.ts
store.schema.ts
id.schema.ts
```

La validación debe realizarse mediante middleware cuando sea posible.

No duplicar validaciones innecesariamente dentro del controller.

---

# 6. MENSAJES DE ERROR

Los mensajes deben estar en **español**.

En Mongoose utilizar mensajes personalizados:

```ts
required: [true, "El nombre de la tienda es requerido"]
```

Ejemplos:

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

Actualmente:

```text
POST /auth/login
GET  /auth/me
```

El login:

1. Recibe email/password.
2. Busca usuario.
3. Compara contraseña con bcrypt.
4. Genera JWT.
5. Devuelve información del usuario sin password.

Existe middleware:

```text
middleware/auth.ts
```

Este middleware valida el JWT y obtiene al usuario autenticado.

El usuario autenticado se guarda en:

```ts
res.locals.user
```

NO utilizar:

```ts
req.user
```

El patrón actual es:

```ts
const owner = res.locals.user._id;
```

---

# 8. USERS

El módulo Users ya existe.

Archivos:

```text
controllers/User.ts
models/User.ts
schemas/user.schema.ts
types/User.ts
router/User.ts
```

El controller de Users utiliza directamente Mongoose.

Ejemplo:

```ts
const user = await User.findById(id);
```

Para actualización:

```ts
const user = await User.findByIdAndUpdate(
    id,
    req.body,
    {
        new: true,
        runValidators: true
    }
).select("-password");
```

Para listados se utiliza paginación:

```ts
const { page, limit, skip } = getPagination(req.query);

const [users, totalUsers] = await Promise.all([
    User
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean(),

    User.countDocuments()
]);

const totalPages = getTotalPages(
    limit,
    totalUsers
);
```

Utilidades:

```text
utils/pagination.ts
```

---

# 9. ROLES

Actualmente User tiene roles básicos:

```text
ADMIN
USER
```

Sin embargo, el dominio evolucionará hacia:

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

para autorización/control de acceso.

---

# 10. STORE

Este es actualmente el siguiente módulo principal.

La relación actual es:

```text
User
  ↓
Store
```

Una tienda pertenece a un usuario.

El `owner` NO debe venir desde `req.body`.

Debe obtenerse del usuario autenticado:

```ts
owner: res.locals.user._id
```

Esto evita que un usuario pueda crear una tienda a nombre de otro usuario.

---

# 11. MODELO STORE ACTUAL

Archivo:

```text
models/Store.ts
```

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
    required: [true, "El propietario de la tienda es requerido"],
    index: true
}
```

La tienda utiliza:

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

El router utiliza el middleware de autenticación.

Conceptualmente:

```text
POST /stores
    ↓
auth
    ↓
validateSchema
    ↓
createStore
```

---

# 13. SEGURIDAD DE STORE

MUY IMPORTANTE:

Las operaciones sobre Store deben estar limitadas al propietario autenticado.

No hacer:

```ts
Store.findById(id)
```

para obtener una tienda privada.

Utilizar:

```ts
Store.findOne({
    _id: id,
    owner: res.locals.user._id,
    isActive: true
})
```

Esto evita que:

```text
Usuario A
    ↓
GET /stores/ID-DE-USUARIO-B
```

pueda acceder a una tienda que no le pertenece.

Este patrón será fundamental para los módulos siguientes.

---

# 14. SOFT DELETE

Las tiendas NO se eliminan físicamente.

En lugar de:

```ts
Store.findByIdAndDelete()
```

se utiliza:

```ts
Store.findOneAndUpdate(
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

significa tienda activa.

```text
isActive: false
```

significa tienda eliminada/desactivada.

Los listados normales deben filtrar:

```ts
isActive: true
```

Esto es importante porque posteriormente una tienda tendrá información relacionada con:

```text
Categories
Products
Inventory
Sales
Cash Registers
Customers
```

y no queremos destruir historial.

---

# 15. PAGINACIÓN

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

Y:

```ts
const [stores, totalStores] = await Promise.all([
    Store
        .find({
            owner: res.locals.user._id,
            isActive: true
        })
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean(),

    Store.countDocuments({
        owner: res.locals.user._id,
        isActive: true
    })
]);
```

---

# 16. DOMINIO DEL POS

El sistema completo está planeado alrededor de estos módulos:

```text
Auth
Users
Stores
Categories
Products
Inventory
Sales
Cash Register
Customers
Credits
Suppliers
Purchases
Reports
```

Sin embargo, el desarrollo será incremental.

Orden actual:

```text
1. Auth          ✅
2. Users         ✅
3. Stores        🚧
4. Categories
5. Products
6. Inventory
7. Sales
8. Cash Register
9. Customers
10. Credits
11. Suppliers
12. Purchases
13. Reports
```

---

# 17. RELACIÓN ENTRE MÓDULOS

La arquitectura de dominio prevista es:

```text
User
  │
  └── Store
        │
        ├── Categories
        │      │
        │      └── Products
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

Más adelante podría evolucionar a:

```text
Business
   │
   ├── Store 1
   ├── Store 2
   └── Store 3
```

pero **NO implementar Business todavía**.

Por ahora:

```text
User → Store
```

es suficiente.

---

# 18. CATEGORIES

Después de Store se implementará:

```text
Category
├── name
├── description
├── store
├── isActive
├── createdAt
└── updatedAt
```

Relación:

```text
Store
  ↓
Category
```

Una categoría pertenece a una Store.

Nunca tratar categorías como globales si pertenecen al catálogo de una tienda.

---

# 19. PRODUCTS

Después:

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

Relación:

```text
Store
  ↓
Category
  ↓
Product
```

El producto también debe mantener relación con `Store`, para poder aislar correctamente los datos de cada tienda.

---

# 20. INVENTORY

El inventario será un módulo propio.

Debe manejar:

```text
stock actual
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
Product
   ↓
Inventory
   ↓
InventoryMovement
```

Una venta debe disminuir inventario y generar un movimiento.

No modificar stock sin considerar el movimiento correspondiente cuando aplique.

---

# 21. SALES

Sales es uno de los módulos más importantes del sistema.

Una venta debe manejar:

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

Flujo esperado:

```text
Create Sale
    ↓
Validar productos
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
Reducir inventario
    ↓
Crear InventoryMovement
    ↓
Registrar Payment
    ↓
Actualizar Cash Register
```

Cuando una operación afecte múltiples documentos y deba ser atómica, considerar utilizar **MongoDB transactions/sessions**.

No dejar situaciones como:

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

# 22. CASH REGISTER

El módulo de caja debe manejar al menos:

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

No implementar funcionalidades avanzadas hasta tener el flujo básico.

---

# 23. CUSTOMERS

Módulo para clientes:

```text
Customer
├── name
├── phone
├── email?
├── store
└── isActive
```

Los clientes pertenecen a una Store.

Más adelante podrán utilizarse para:

```text
Credits / Fiado
```

---

# 24. CREDITS / FIADO

Es una funcionalidad importante para pequeños comercios mexicanos, pero no es prioridad inmediata.

Más adelante deberá permitir:

```text
Customer
   ↓
Credit
   ↓
Payments
```

Con historial de deuda y pagos.

---

# 25. SUPPLIERS / PURCHASES

También existirán:

```text
Suppliers
Purchases
```

pero se implementarán después del núcleo:

```text
Store
Category
Product
Inventory
Sales
Cash Register
Customer
```

---

# 26. REPORTS

Al principio los reportes serán sencillos.

Ejemplos:

```http
GET /reports/dashboard
GET /reports/sales/today
GET /reports/inventory/low-stock
```

Información futura:

```text
ventas del día
ventas por periodo
productos más vendidos
inventario bajo
ganancia estimada
movimientos de caja
```

No crear un sistema de reporting complejo antes de tener funcionando Sales e Inventory.

---

# 27. FILOSOFÍA DE DESARROLLO

El objetivo no es crear muchos CRUD aislados.

El objetivo es construir un **POS funcional**, donde los módulos estén conectados.

El flujo principal esperado es:

```text
LOGIN
  ↓
STORE
  ↓
CATEGORY
  ↓
PRODUCT
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

Es preferible tener pocos módulos completamente funcionales que muchos CRUD sin interacción de negocio.

---

# 28. OBJETIVO DEL MVP

El MVP inicial debe poder:

```text
✅ Registrar/login de usuarios
✅ JWT
✅ Autenticación
✅ Crear tienda
✅ Listar tiendas
✅ Consultar tienda
✅ Actualizar tienda
✅ Desactivar tienda
✅ Crear categorías
✅ Crear productos
✅ Administrar inventario
✅ Abrir caja
✅ Registrar venta
✅ Registrar pago
✅ Descontar inventario
✅ Cerrar caja
✅ Registrar clientes
✅ Consultar reportes básicos
```

Después se agregarán:

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

# 29. REGLAS AL GENERAR CÓDIGO

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
10. Utiliza `.lean()` en consultas donde no necesitemos documentos Mongoose.
11. Usa `Promise.all()` para consultas independientes.
12. Utiliza paginación en endpoints de listado cuando corresponda.
13. Utiliza soft delete cuando sea necesario conservar historial.
14. No permitas que el cliente envíe relaciones sensibles como `owner`.
15. Filtra los recursos por el usuario/store correspondiente.
16. Utiliza `runValidators: true` en updates cuando corresponda.
17. Mantén los imports compatibles con ES Modules (`.js`).
18. No hagas refactors innecesarios.
19. No inventes estructuras que no existen en el proyecto.
20. Si falta información importante, pregunta antes de asumir.

---

# 30. FORMATO DE RESPUESTAS DE API

Mantener consistencia.

Éxito:

```json
{
    "status": "success",
    "message": "Operación realizada con éxito",
    "data": {}
}
```

Cuando sea listado:

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

# 31. ESTADO ACTUAL DEL PROYECTO

Actualmente:

```text
Auth        ✅
Users       ✅
Store       🚧
Categories  ⏳
Products    ⏳
Inventory   ⏳
Sales       ⏳
Cash        ⏳
Customers   ⏳
Credits     ⏳
Suppliers   ⏳
Purchases   ⏳
Reports     ⏳
```

Estamos actualmente construyendo **Store**.

Una vez terminado Store, continuar con:

```text
Store
  ↓
Category
  ↓
Product
  ↓
Inventory
  ↓
Sales
  ↓
Cash Register
  ↓
Customers
  ↓
Reports
```

No saltarse etapas sin una razón.

---

# 32. FORMA DE TRABAJAR

Cuando se solicite un nuevo módulo, construirlo progresivamente.

Primero:

```text
Model
Types
Schema
Controller
Router
```

y conectarlo al:

```text
router/index.ts
```

Después probarlo con Postman.

No avanzar al siguiente módulo hasta que el flujo actual esté funcionando.

Cuando haya código existente proporcionado por mí, **adaptarse a ese código en lugar de reemplazarlo por una arquitectura completamente diferente**.

Tomini POS debe evolucionar de manera incremental y consistente.

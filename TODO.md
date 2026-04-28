# TODO: Implementar Login Real con JWT

## Endpoints a usar
- `POST http://localhost:8080/api/auth/login` — Body: `{ email, password }`, Response: `{ token, tokenType, user }`

## Cambios realizados ✅

### 1. `frontend/src/services/authService.js` ✅
- Cambiada la key de localStorage de `"authToken"` a `"token"` en todo el archivo (`getHeaders`, `logout`, `isAuthenticated`, `getToken`, `setAuth`, `clearAuth`).
- `authService.login()`, `authService.logout()`, `authService.register()` ya estaban implementados y funcionan correctamente.

### 2. `frontend/src/componentes/Login.jsx` ✅
- Reemplazado el `fetch` directo por `authService.login(email, password)`.
- Reemplazado el guardado manual en `localStorage` por `authUtils.setAuth(token, user)`.
- Se mantiene el manejo de errores, estados de carga, y la notificación al padre vía `props.onAuthSuccess()`.
- El redireccionamiento al Dashboard ocurre automáticamente porque `App.jsx` renderiza `Dashboard` cuando `isAuthenticated` es `true`.

### 3. `frontend/src/App.jsx` ✅
- Reemplazada la lógica manual de logout (`localStorage.removeItem(...)`) por `authService.logout()`.
- Actualizada la verificación de token al cargar para usar la key `"token"`.
- Se mantiene el renderizado condicional actual (sin agregar react-router-dom).

### 4. `frontend/src/componentes/Registro.jsx` ✅
- Reemplazado el `fetch` directo por `authService.register(nombre, email, password)`.
- Reemplazado el guardado manual en `localStorage` por `authUtils.setAuth(token, user)`.
- Alineado con la nueva key `"token"` para consistencia.

### 5. No tocados ✅
- `Dashboard.jsx` — no se modificó.
- `doctorService.js` — ya envía el JWT automáticamente en `Authorization: Bearer ...` y no requiere cambios.
- `ProtectedRoute.jsx` — ya está correcto; solo no se usa aún porque no hay routing.

## Archivos editados
- `frontend/src/services/authService.js`
- `frontend/src/componentes/Login.jsx`
- `frontend/src/App.jsx`
- `frontend/src/componentes/Registro.jsx`


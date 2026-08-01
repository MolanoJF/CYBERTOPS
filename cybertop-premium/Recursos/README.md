# CYBERTOP™ Digital Decision Board (Phase 1 MVP)

CYBERTOP™ is an executive-level cyber crisis simulation (war game) for boards and C-suite leaders. This application is an interactive Digital Decision Board that quantifies corporate governance, response velocity, and strategic consequences in real time.

## 🚀 Cómo Empezar

Para correr el simulador localmente sin problemas de CORS (restricciones de importación de módulos ES6), siga estos sencillos pasos:

1. **Abrir Terminal**: Asegúrese de estar en el directorio del proyecto (`c:\Users\juanp\Desktop\CYBERTOPS`).
2. **Iniciar Servidor Local**:
   ```bash
   npm start
   ```
   *Nota: Este comando utiliza el servidor web nativo de Python en el puerto 3000. No requiere instalar ningún paquete de node.*

3. **Abrir las Pantallas**:
   - **Pantalla del Proyector (para la Junta)**: Abra en su navegador (preferiblemente Chrome/Edge) [http://localhost:3000/index.html](http://localhost:3000/index.html).
   - **Consola del Facilitador (control interno)**: Abra en otra pestaña o en una ventana de navegador secundaria [http://localhost:3000/facilitator.html](http://localhost:3000/facilitator.html).

4. **Operación**:
   - En la consola del facilitador, seleccione el sector de industria (Banca, Salud, SaaS, Oil & Gas) y haga clic en **Iniciar Simulación**.
   - Ambas pantallas se sincronizarán automáticamente de forma bidireccional en tiempo real utilizando la API `LocalStorage` del navegador (incluso si está offline).

---

## ⚙️ Arquitectura y Componentes del Proyecto

- `index.html`: La interfaz del proyector de alta fidelidad, con el Crisis Index radial animado, los gauges de las seis dimensiones corporativas, bitácora de eventos y el reporte final (scorecard).
- `facilitator.html`: Consola que permite al facilitador avanzar las fases de injects, iniciar los contadores de tiempo SLA, registrar las decisiones de la junta y ver el estado técnico de las variables del motor.
- `css/style.css`: Sistema de diseño premium basado en glassmorphism, tipografía Outfit e Inter, gradientes de HSL y soporte de exportación optimizada en formato de impresión de una página (`@media print`).
- `js/config.js`: Estructura estática de datos (pesos de industrias, injects por sector, opciones de decisión, penalizaciones y recomendaciones 30/60/90).
- `js/engine.js`: Motor matemático GCI que calcula el Global Crisis Index, el Decision Velocity Score (DVS) y el Board Readiness Score (BRS) en tiempo real.
- `js/app.js`: Coordinador de interfaces de usuario y sincronizador de estado local en tiempo real.
- `js/test_engine.js`: Script de pruebas unitarias para validar la precisión del motor matemático en Node.js.

---

## 🧪 Pruebas Unitarias del Motor

Si desea validar el motor matemático y las fórmulas de cálculo de forma aislada en la terminal, ejecute:

```bash
npm test
```

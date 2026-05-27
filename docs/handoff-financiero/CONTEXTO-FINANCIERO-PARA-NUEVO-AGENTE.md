# GIMADD MENTOR — Contexto financiero para nuevo agente

> **Cómo usar este documento**
>
> 1. Abre una **nueva conversación** en Cursor (clic en el "+" del panel de chat o `Cmd+N`).
> 2. Copia y pega el bloque ► **"PROMPT INICIAL PARA EL NUEVO AGENTE"** que está al final.
> 3. (Opcional) Arrastra este mismo archivo al chat con `@docs/handoff-financiero/CONTEXTO-FINANCIERO-PARA-NUEVO-AGENTE.md`.
>
> El agente nuevo arrancará con todo el contexto del proyecto sin que tengas que repetir nada.

---

## 1 · Resumen ejecutivo del proyecto

**Gimadd Mentor** es una plataforma de pádel que conecta **entrenadores** y **jugadores**.

- **Tipo de producto**: SaaS B2B2C (cobramos al entrenador + comisión al jugador).
- **Mercado**: España (luego escalable a Europa). Empresa con sede en **Alemania** (relevante para IVA).
- **Estado actual**: demo HTML/CSS/JS funcional desplegada en GitHub Pages (`https://gimaddmentor.github.io/GimaddMentor/`). Inversión en desarrollo formal **aún no iniciada** — estamos en la fase de captación de inversores y validación.
- **Decisión clave reciente**: el equipo se inclina por arrancar con un **MVP web-only** (Next.js + Supabase + Stripe) para validar mercado antes de invertir en apps nativas con el proveedor profesional.

### Producto en una frase

> *Una app donde el jugador sube vídeos de sus entrenamientos, recibe análisis con marcas temporales y un plan de acción del entrenador, registra prácticas en su diario (partidos + clases), y reserva/paga clases o packs directamente desde el móvil.*

---

## 2 · Modelo de monetización (CRÍTICO para finanzas)

### 2.1 · Doble fuente de ingresos

| Fuente | A quién se cobra | Importe | Cuándo |
|---|---|---|---|
| **Mensualidad SaaS** | Entrenador | **Por definir (sugerido 19–49 €/mes según tier)** | Suscripción Stripe mensual |
| **Comisión por servicio** | Jugador (se añade al precio del entrenador) | **5 % con mínimo 1,50 €** | En cada checkout |

### 2.2 · Cómo funciona la comisión (importante para el modelo)

- El entrenador fija el precio de su servicio (ej. 45 €).
- El jugador paga 45 € + 5 % comisión (mínimo 1,50 €) = **46,50 €** en este caso.
- El entrenador recibe **íntegros sus 45 €**.
- Gimadd Mentor se queda con **1,50 €** (la comisión).
- En **packs** y **mensualidades**, la comisión se calcula sobre el precio total del paquete, no por sesión individual.

### 2.3 · Tipos de servicio que ofrece el entrenador

| Tipo | Precio típico (€) | Comisión Gimadd | Notas |
|---|---|---|---|
| **Videoanálisis** (entrega 48 h) | 45 € individual / 72 € parejas | 2,25 € / 3,60 € | Pago único por análisis |
| **Mentoría en pista** (60 min) | 55 € individual / 90 € parejas | 2,75 € / 4,50 € | Pago único por sesión |
| **Pack intensivo** (cupos combinados) | 420 € individual / 360 € parejas (validez 3 meses) | 21 € / 18 € | Configurable: X clases + X videoanálisis |
| **Mensualidad** | 149 €/mes individual / 199 €/mes parejas | 7,45 / 9,95 €/mes | Suscripción recurrente |
| **Acompañamiento 3 meses** | 429 € individual / 589 € parejas | 21,45 € / 29,45 € | Pago único programa |
| **Acompañamiento 6 meses** | 789 € / 1.099 € | 39,45 € / 54,95 € | Pago único programa |
| **Acompañamiento 12 meses** | 1.349 € / 1.849 € | 67,45 € / 92,45 € | Pago único programa |

### 2.4 · Fiscalidad

- **Sociedad alemana**: NO repercutimos IVA español (operación intracomunitaria B2B con entrenadores; B2C con jugadores aplica el régimen de servicios digitales OSS de la UE — *a confirmar con asesor fiscal alemán*).
- Stripe Tax automatiza el cálculo de IVA por país del cliente.
- Margen neto = comisión − fees Stripe (~1,4 % + 0,25 €) − infra (~negligible) − soporte.

---

## 3 · Disputa legal y herencia previa

Existió un desarrollo **anterior con la empresa "Comocom"** (o predecesora) sobre **FlutterFlow + Firebase + Stripe + Google Calendar** que se **quedó parado**. Estamos en **disputa contractual** con ellos. Decisiones tomadas:

- ✅ **No tocar las cuentas existentes** (Firebase / Stripe / GCP del proyecto anterior) — se conservan como evidencia.
- ✅ **Crear infraestructura nueva paralela**: proyecto Firebase nuevo, cuenta Stripe nueva, GCP OAuth nuevo — todo bajo el email **`info@gimadd.com`**.
- ✅ La auditoría futura podrá distinguir claramente "infraestructura legacy (Comocom)" vs "infraestructura Gimadd 2026+".

**Impacto financiero**: cero coste recuperado del desarrollo previo. La nueva inversión empieza de cero.

---

## 4 · Presupuestos recibidos (Comocom GmbH)

Comocom envió **3 PDFs** con propuestas para el desarrollo profesional completo. Análisis realizado:

- **Modelo de horas**: 30 €/h (tarifa negociada).
- **Empresa alemana** → sin IVA español.
- **Reliance en Claude Code** para acelerar el desarrollo (Comocom lo declaró abiertamente).
- **Alcance ofertado**: backend FastAPI + PostgreSQL + GCP + apps nativas Android/iOS + admin Flutter Web + marketplace Next.js.

**Conclusiones del análisis**:
- Las estimaciones son **realistas en horas** para el alcance descrito.
- El precio total **es elevado** para una startup pre-ingresos (cifras a recuperar del análisis si las necesitas).
- **Riesgo**: dependencia técnica de un único proveedor.
- **Mitigación propuesta**: arrancar con MVP web propio + Comocom desarrolla en paralelo solo lo que el MVP no cubra.

Los PDFs y análisis detallado están en `docs/presupuesto-empresas/` del repo.

---

## 5 · Stack técnico de referencia (para estimar costes infra)

### 5.1 · Stack del producto profesional (visión Comocom)

| Capa | Tecnología | Hosting |
|---|---|---|
| Apps móviles | Native Android (Kotlin) + Native iOS (Swift) | App Store + Play Store |
| Backend Core | FastAPI (Python) | GCP Cloud Run |
| Backend BFF | FastAPI (Python) | GCP Cloud Run |
| Base de datos | PostgreSQL | GCP Cloud SQL |
| Caché / sesiones | Redis | GCP Memorystore |
| Almacenamiento vídeo | GCS Resumable Uploads | GCP Cloud Storage |
| Transcodificación | Google Transcoder API | GCP |
| Autenticación | Firebase Auth (custom claims) | Firebase |
| Pagos | Stripe Connect | Stripe |
| Admin entrenadores | Flutter Web | GCP Cloud Run |
| Marketplace público | Next.js | GCP Cloud Run o Vercel |
| Mensajería tiempo real | WebSockets | GCP Cloud Run |
| Compliance | Cloud Vision SafeSearch + NCMEC | GCP |

### 5.2 · Stack del MVP web (propuesta arranque rápido)

| Capa | Tecnología | Coste mensual estimado |
|---|---|---|
| Frontend + SSR | Next.js 15 + TypeScript + Tailwind + shadcn/ui | Hosting Vercel: **0–20 €/mes** (tier Hobby/Pro) |
| Base de datos + Auth + Storage | Supabase (Postgres + Auth + Storage + Realtime) | **0 € (free tier hasta 500 MB DB)** o **25 €/mes (Pro)** |
| Pagos | Stripe Connect | Comisión 1,4 % + 0,25 €/transacción (UE) |
| Email transaccional | Resend | **0–20 €/mes** |
| Dominio | `gimaddmentor.com` o similar | ~12 €/año |
| Analytics | Plausible o PostHog | **0–9 €/mes** |
| **Total infra MVP** | | **~30–60 €/mes** primer año |

**Tiempo estimado de MVP funcional**: 4–8 semanas de trabajo continuo si lo monta el equipo Gimadd directamente (sin Comocom).

---

## 6 · Demo actual (lo que YA existe construido)

Ya hay una **demo HTML/CSS/JS interactiva** completa que cubre los flujos clave. Es 100 % reutilizable visual y funcionalmente para el MVP — solo hay que convertirla a componentes React.

### 6.1 · Flujos cubiertos en la demo

| Módulo | Estado |
|---|---|
| Onboarding (selección de perfil jugador/coach) | ✅ |
| Hub jugador (avatar, KPIs, agenda, accesos rápidos) | ✅ |
| Hub coach (KPIs, agenda de hoy, acciones urgentes) | ✅ |
| Objetivos del jugador + plan de acción | ✅ |
| Diario de partidos | ✅ |
| Diario de clases en pista | ✅ |
| Toggle "Practicado" por objetivo del plan | ✅ |
| Videoanálisis (subida, marcas, comentarios, feedback) | ✅ |
| Catálogo de servicios del entrenador (5 tipos) | ✅ |
| **Packs configurables** (X clases + X videoanálisis) | ✅ |
| Checkout con Stripe simulado | ✅ |
| CRM clientes coach | ✅ |
| Reserva de clases presenciales | ✅ |
| Marketplace de entrenadores | ✅ |
| Mensajería jugador ↔ coach | ✅ |
| Diario y videoanálisis vinculado a objetivos | ✅ |

### 6.2 · Lo que la demo NO tiene (y el MVP sí necesitaría)

- Autenticación real (Firebase/Supabase Auth).
- Persistencia en backend (todo está en `localStorage`).
- Subida real de vídeos (ahora simulada).
- Procesamiento de pagos real (Stripe Test → Live).
- Notificaciones email/push.
- Panel de administración Gimadd (gestión de entrenadores, comisiones, soporte).
- Compliance: GDPR consentimientos, moderación CSAM, audit logs.

---

## 7 · Decisiones estratégicas tomadas (lista para tener en cuenta en finanzas)

1. **MVP web-only primero**, app nativa después si el mercado responde.
2. **Stripe Connect** desde el día 1 (necesario para repartir pagos entrenador / Gimadd).
3. **Sociedad alemana** mantenida — implica considerar costes de gestoría DE (~150–400 €/mes).
4. **Pricing del coach**: tres tiers de mensualidad por definir (sugerencia: Starter / Pro / Premium con diferencias en límites de jugadores, vídeos/mes, soporte).
5. **Comisión 5 % mínimo 1,50 €** sobre el precio del entrenador, pagada por el jugador.
6. **Ir a feria B2B** el 27/05/2026 (cuando se escribió esto) para captar inversores con la demo.

---

## 8 · Datos que el agente financiero necesita producir / actualizar

Lo que esperamos del nuevo agente financiero:

1. **Plan financiero actualizado** con el modelo de revenue real (mensualidad + comisión 5 %/1,50 €).
2. **Proyección de ingresos a 12 / 24 / 36 meses** con escenarios:
   - **Conservador**: 50 entrenadores año 1, 5 jugadores/coach activos.
   - **Base**: 200 entrenadores año 1, 8 jugadores/coach activos.
   - **Optimista**: 500 entrenadores año 1, 12 jugadores/coach activos.
3. **Comparativa de coste**: MVP propio vs presupuesto Comocom completo.
4. **Burn rate** mensual realista (infra + Stripe fees + gestoría + soporte + sueldos si aplica).
5. **Punto de equilibrio** (break-even) por escenario.
6. **Pitch deck financiero** para feria de inversores (1–2 slides con CAC, LTV, churn estimado, TAM/SAM/SOM del pádel en España/UE).
7. **Recomendación de funding** (bootstrapping vs angel vs grants alemanes/europeos como EIC Accelerator, INVEST).

---

## 9 · Archivos del repo útiles para el agente financiero

| Archivo | Contiene |
|---|---|
| `docs/presupuesto-empresas/GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.md` | Alcance funcional detallado, base para estimar horas |
| `docs/presupuesto-empresas/GIMADD-MENTOR-VISION-CEO.md` | Resumen ejecutivo no técnico |
| `Gimadd_Mentor_APP.html` | Demo interactiva — abrir para ver el producto |
| `assets/video/juan-garcia-analisis.mp4` | Clip de videoanálisis real para la demo |
| `index.html` | Portal GitHub Pages con todos los documentos |

---

## ► PROMPT INICIAL PARA EL NUEVO AGENTE

Copia el bloque siguiente, ábrelo en una nueva conversación de Cursor y pégalo como primer mensaje:

```
Vamos a trabajar la parte FINANCIERA y de MODELO DE NEGOCIO de Gimadd Mentor.

Por favor lee primero el documento de contexto completo:
@docs/handoff-financiero/CONTEXTO-FINANCIERO-PARA-NUEVO-AGENTE.md

Y los presupuestos previos:
@docs/presupuesto-empresas/GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.md
@docs/presupuesto-empresas/GIMADD-MENTOR-VISION-CEO.md

Cuando termines, dame un resumen en 5–7 puntos de lo que has entendido del proyecto y propón un índice del plan financiero que vamos a construir, con foco en:

1. Modelo de revenue (mensualidad coach + comisión 5 % / mín 1,50 €).
2. Tres escenarios de proyección (conservador / base / optimista) a 12-24-36 meses.
3. Comparativa de coste MVP propio vs presupuesto Comocom completo.
4. Burn rate mensual.
5. Break-even por escenario.
6. Recomendación de funding (bootstrapping vs angel vs grants UE/DE).

No empieces a escribir el plan hasta que apruebe el índice.

Importante: esta conversación es SOLO para finanzas. La parte de desarrollo / código se trata en otro chat separado.
```

---

**Fecha de creación**: 27 de mayo de 2026
**Última versión del repo cuando se generó**: commit `2772bb7` (reset contadores plan Juan)

# Tower Defense — Sistema de Combate y Campo de Batalla

## 1. Concepto general

El Tower Defense del **Imperio del Nya** utiliza una estructura de combate radial.

A diferencia de los Tower Defense tradicionales, los enemigos no siguen un camino predeterminado desde un punto A hasta un punto B.

La base del jugador se encuentra en el centro del mapa y está rodeada por una muralla. Los enemigos pueden aparecer y aproximarse desde **cualquier dirección (360°)**.

El objetivo de los enemigos es alcanzar el centro de la fortaleza para destruir las **Joyas Sagradas del Nya**.

El jugador debe colocar y utilizar sus personajes estratégicamente para impedir que los enemigos lleguen hasta ellas.

---

# 2. Geometría del mapa

El campo de batalla está construido alrededor de una estructura central.

### Elementos principales

- **Centro:** contiene las Joyas Sagradas del Nya.
- **Muralla:** rodea la fortaleza.
- **Zona interior:** espacio dentro de la muralla.
- **Zona exterior:** terreno alrededor de la fortaleza.
- **Puntos de aparición:** los enemigos pueden aparecer alrededor del perímetro del mapa.
- **Zona de combate:** espacio donde pueden colocarse los personajes y desarrollarse los enfrentamientos.

La geometría general es radial, por lo que no existe una dirección universal de "adelante" o "atrás".

Un enemigo puede aproximarse desde cualquier ángulo.

```text
                    ENEMIGOS
                       ↓

             ↘        ↓        ↙

                  ┌─────────┐
                  │         │
          EN  →   │   💎💎   │   ←  EN
                  │   💎    │
                  │         │
                  └─────────┘

             ↗        ↑        ↖

                    ENEMIGOS
```

---

# 3. Objetivo de los enemigos

Los enemigos tienen como objetivo final las **Joyas Sagradas del Nya**.

Su comportamiento básico consiste en:

1. Aparecer en el exterior de la fortaleza.
2. Identificar las Joyas Sagradas como objetivo.
3. Avanzar hacia el centro.
4. Intentar atravesar o rodear las defensas.
5. Alcanzar las Joyas.
6. Atacarlas hasta destruirlas.

La prioridad fundamental de un enemigo no es atacar a los personajes del jugador, sino **alcanzar y destruir las Joyas**.

Sin embargo, determinados tipos de enemigos podrán tener comportamientos especiales.

---

# 4. Movimiento enemigo

El movimiento base de los enemigos es **directo hacia el centro de la fortaleza**.

No existe un camino único prediseñado.

Cada enemigo calcula su trayectoria de acuerdo con su posición actual y el objetivo central.

Esto permite que:

- Los enemigos entren desde diferentes direcciones.
- Varias oleadas puedan dividirse alrededor de la muralla.
- Los personajes puedan interceptarlos desde diferentes posiciones.
- La batalla cambie dependiendo del lugar desde donde aparezcan los enemigos.

## Obstáculos y colisiones

El sistema deberá contemplar obstáculos físicos y entidades que puedan bloquear o modificar el movimiento.

La navegación deberá evitar situaciones donde un enemigo quede permanentemente atrapado sin una razón intencional.

Enemigos específicos podrán tener comportamientos especiales como:

- Rodear obstáculos.
- Atacar estructuras.
- Ignorar determinadas defensas.
- Cambiar de objetivo.
- Atravesar determinadas zonas.
- Desplazarse a mayor velocidad.
- Saltar o atravesar la muralla.

---

# 5. Muralla

La muralla constituye la principal estructura defensiva de la fortaleza.

No debe considerarse simplemente como el límite del mapa.

La muralla puede influir en:

- Movimiento enemigo.
- Posicionamiento de personajes.
- Rango de ataque.
- Seguridad de la zona interior.
- Estrategias defensivas.

Dependiendo de las reglas específicas de cada mapa, los personajes podrán colocarse:

- Dentro de la muralla.
- Fuera de la muralla.
- Sobre estructuras defensivas de la muralla.

---

# 6. Sistema de colocación

Los personajes pueden ser colocados libremente dentro de las zonas permitidas por el mapa.

No se utilizará necesariamente un sistema clásico de Tower Defense basado exclusivamente en casillas o posiciones predeterminadas.

La posición de cada personaje puede afectar directamente a su utilidad durante la partida.

Por ejemplo:

- Un personaje de corto alcance puede colocarse cerca de una entrada.
- Un personaje de largo alcance puede permanecer en una posición más segura.
- Un personaje de soporte puede colocarse cerca de varios aliados.
- Un personaje puede situarse fuera de la muralla para interceptar enemigos antes de que lleguen a la fortaleza.
- Un personaje puede permanecer dentro de la muralla como última línea defensiva.

La colocación deberá respetar las reglas físicas y límites establecidos por cada mapa.

---

# 7. Sistema de targeting

El targeting determina **qué enemigo decide atacar un personaje** cuando existen múltiples objetivos válidos dentro de su rango.

El sistema de targeting es una **configuración modificable durante la partida**.

No es una característica permanente del personaje.

El jugador puede cambiar la prioridad de targeting de sus personajes mientras juega para adaptarse a la situación del combate.

---

## 7.1 Prioridades de targeting

Entre las prioridades disponibles pueden existir:

### Más vida

Prioriza al enemigo con mayor cantidad de vida.

Útil para concentrar daño sobre enemigos resistentes.

### Menos vida

Prioriza al enemigo con menor cantidad de vida.

Útil para terminar enemigos debilitados.

### Más cerca

Prioriza al enemigo que se encuentre físicamente más cerca del personaje.

### Más lejos

Prioriza al enemigo más alejado dentro de su rango.

### Más fuerte

Prioriza al enemigo considerado más poderoso según sus estadísticas o nivel de amenaza.

### Más débil

Prioriza al enemigo con menor nivel de amenaza.

### Más cerca del centro

Prioriza al enemigo que se encuentre más cerca de las Joyas Sagradas del Nya.

Esta prioridad representa directamente el nivel de peligro que representa un enemigo para la fortaleza.

### Más lejos del centro

Prioriza enemigos que todavía se encuentren en las zonas exteriores.

Puede utilizarse para eliminar amenazas antes de que entren profundamente en la defensa.

### Más rápido

Prioriza al enemigo con mayor velocidad de movimiento.

### Tipo de enemigo

Permite priorizar determinados tipos o categorías de enemigos.

Ejemplo:

- Priorizar enemigos voladores.
- Priorizar enemigos blindados.
- Priorizar enemigos pequeños.
- Priorizar enemigos de soporte.

---

# 8. Configuración dinámica

El jugador puede modificar el targeting durante una partida.

Ejemplo:

Un personaje comienza con:

> **Target: Más cerca**

Durante la primera oleada esto funciona correctamente.

Posteriormente aparece un enemigo extremadamente resistente que está acercándose a las Joyas.

El jugador puede cambiar la configuración:

> **Target: Más fuerte**

El personaje cambiará su selección de objetivos sin necesidad de ser retirado o reemplazado.

Esto convierte el targeting en una herramienta estratégica activa.

---

# 9. Prioridades secundarias

El sistema puede permitir una prioridad principal y una secundaria.

Ejemplo:

> **Prioridad 1:** Más cerca del centro  
> **Prioridad 2:** Más fuerte

Esto significa:

1. El personaje busca enemigos que estén más cerca de las Joyas.
2. Si existen varios objetivos equivalentes, selecciona al más fuerte.

Otro ejemplo:

> **Prioridad 1:** Más vida  
> **Prioridad 2:** Más cerca

El personaje buscará al enemigo con mayor vida y utilizará la distancia como criterio de desempate.

Las prioridades secundarias deberán utilizarse únicamente cuando sea necesario resolver empates o situaciones equivalentes.

---

# 10. Rango

Cada personaje posee un rango de ataque determinado por su diseño.

El targeting únicamente puede seleccionar enemigos que sean **objetivos válidos dentro del rango de ataque**.

La posición del personaje, la geometría del mapa y posibles obstáculos pueden afectar la disponibilidad de objetivos.

El sistema de targeting no permite que un personaje ataque enemigos fuera de sus capacidades.

---

# 11. Ataques y habilidades

Los personajes del roster ya cuentan con sus propios:

- Ataques básicos.
- Habilidades.
- Efectos.
- Roles.
- Funciones.
- Mecánicas particulares.

Por lo tanto, este sistema **no define nuevos patrones de ataque para los personajes**.

El sistema de combate se encarga principalmente de determinar:

> **Dónde está el personaje → qué enemigos puede alcanzar → cuál debe priorizar → cuándo ejecuta su ataque o habilidad.**

Las características individuales de cada personaje permanecen definidas en sus respectivos documentos.

---

# 12. Principio estratégico

El sistema busca que la posición y el targeting sean decisiones importantes durante una partida.

El jugador no solamente debe decidir:

> "¿Qué personajes llevo?"

También debe decidir:

> "¿Dónde los coloco?"

y durante el combate:

> "¿A quién quiero que ataque cada personaje?"

Esto permite modificar la estrategia en tiempo real sin necesidad de cambiar el equipo completo.

---

# 13. Flujo básico de combate

```text
ENEMIGO APARECE
       ↓
IDENTIFICA LAS JOYAS
       ↓
SE MUEVE HACIA EL CENTRO
       ↓
ENTRA EN RANGO DE UN PERSONAJE
       ↓
EL PERSONAJE DETECTA OBJETIVOS VÁLIDOS
       ↓
APLICA LA CONFIGURACIÓN DE TARGETING
       ↓
SELECCIONA OBJETIVO
       ↓
EJECUTA SU ATAQUE / HABILIDAD
       ↓
EL ENEMIGO CONTINÚA SU AVANCE
       ↓
¿LLEGA A LAS JOYAS?
    ↙          ↘
   NO           SÍ
   ↓            ↓
CONTINÚA      ATACA LAS
COMBATE       JOYAS
```

---

# 14. Filosofía del sistema

El Tower Defense debe sentirse como una **defensa radial dinámica**, no como un Tower Defense tradicional basado en caminos.

Los enemigos pueden llegar desde cualquier dirección.

La fortaleza representa el centro del conflicto.

Los personajes pueden desplegarse alrededor y dentro de ella.

El jugador puede modificar su estrategia durante la partida mediante la colocación y el targeting.

La victoria depende de mantener las **Joyas Sagradas del Nya** protegidas hasta completar todas las oleadas.

---

## Estado actual

### Definido

- [x] Base central.
- [x] Estructura radial / 360°.
- [x] Enemigos provenientes de cualquier dirección.
- [x] Joyas Sagradas como objetivo principal.
- [x] Movimiento enemigo hacia el centro.
- [x] Muralla alrededor de la fortaleza.
- [x] Personajes colocables dentro y fuera de la muralla.
- [x] Posicionamiento potencialmente libre.
- [x] Targeting configurable durante la partida.
- [x] Prioridades de targeting.
- [x] Personajes y sus ataques ya diseñados.
- [x] No se requiere un sistema adicional de patrones de ataque.

### Pendiente

- [ ] Reglas exactas de colisión.
- [x] Sistema de navegación alrededor de obstáculos (Se implementará el algoritmo de Dijkstra para el camino más corto).
- [ ] Reglas exactas de colocación.
- [x] Distancia/radio del mapa (Se usarán distancias clásicas de Tower Defense inicialmente).
- [ ] Tamaño y distribución de las Joyas.
- [ ] Funcionamiento exacto de la muralla.
- [ ] Interacción entre enemigos y muralla.
- [ ] Reglas de prioridad secundaria.
- [x] Interfaz para cambiar targeting durante la partida (Se usará una mini ventana al lado derecho con una lista desplegable).
- [ ] Condiciones exactas de derrota de las Joyas.
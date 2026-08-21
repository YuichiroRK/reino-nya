# Tower Defense — Mecánicas Generales

## 1. Concepto

El Tower Defense del **Imperio del Nya** no utiliza el sistema clásico de enemigos avanzando únicamente desde un punto hacia la base.

La idea principal es que el jugador tenga que defenderse de amenazas provenientes de **todo el perímetro del mapa**, creando un sistema de combate **360°**.

Los enemigos pueden aparecer desde cualquier dirección y utilizar diferentes rutas para intentar alcanzar el objetivo central.

Esto hace que la colocación de unidades, su rango de ataque y la cobertura del mapa sean tan importantes como las estadísticas individuales de cada personaje.

---

# 2. Sistema de defensa 360°

## Spawn de enemigos

Los enemigos aparecen alrededor del perímetro del mapa mediante diferentes puntos de aparición.

```text
          ENEMIGOS
       ↓    ↓    ↓

    ┌─────────────────┐
    │  ↓          ↓   │
    │                 │
    │     🏰 BASE     │
    │                 │
    │  ↑          →   │
    └─────────────────┘

       ↑    ↑    ↑
          ENEMIGOS
```

Los spawns pueden encontrarse en:

- Norte
- Sur
- Este
- Oeste
- Diagonales
- Puntos intermedios del perímetro

En oleadas avanzadas, varios puntos pueden activarse simultáneamente.

---

## Rutas dinámicas

Los enemigos no necesariamente tienen una única ruta.

Dependiendo del diseño del mapa, pueden:

- Rodear estructuras.
- Dividirse en diferentes caminos.
- Cambiar de dirección.
- Priorizar determinados objetivos.
- Aparecer detrás de las unidades del jugador.
- Atacar desde diferentes lados simultáneamente.

Esto evita que exista una única posición "perfecta" donde colocar todas las unidades.

---

# 3. Objetivo principal

El objetivo de cada oleada es evitar que los enemigos lleguen al **núcleo/base del Imperio del Nya**.

Cada enemigo que alcanza la base reduce la vida del núcleo.

Si la vida llega a 0:

> **DERROTA**

La dificultad aumenta progresivamente mediante:

- Mayor cantidad de enemigos.
- Enemigos con más vida.
- Mayor velocidad.
- Nuevas habilidades.
- Nuevos tipos de enemigos.
- Mayor cantidad de puntos de spawn activos.
- Oleadas simultáneas desde diferentes direcciones.

---

# 4. Sistema de unidades

Cada personaje del roster funciona como una **torre especializada**.

Las unidades poseen:

- Daño.
- Vida.
- Alcance.
- Velocidad de ataque.
- Tipo de ataque.
- Prioridad de objetivo.
- Habilidades.
- Rol.
- Posicionamiento recomendado.

El jugador debe formar una composición equilibrada en lugar de simplemente utilizar los personajes con mayor daño.

---

# 5. Roles

El roster utiliza cuatro funciones principales.

### DPS

Personajes especializados en infligir daño.

Pueden dividirse en:

- DPS de objetivo único.
- DPS de área.
- DPS cuerpo a cuerpo.
- DPS a distancia.
- DPS explosivo.
- DPS sostenido.

### Healer

Personajes capaces de recuperar vida de otras unidades o mantenerlas con vida.

### Buffer

Personajes que mejoran las estadísticas o capacidades de los aliados.

Ejemplos:

- Daño.
- Velocidad de ataque.
- Alcance.
- Defensa.
- Velocidad de movimiento.
- Regeneración.

### Debuffer

Personajes que debilitan a los enemigos.

Ejemplos:

- Reducción de defensa.
- Reducción de velocidad.
- Reducción de daño.
- Aplicación de estados.
- Marcas que aumentan el daño recibido.

Un personaje puede cumplir más de una función.

---

# 6. Posicionamiento

El posicionamiento es una de las mecánicas fundamentales.

Debido al sistema 360°, una unidad puede ser excelente en una posición y mediocre en otra.

## Rangos

Las unidades pueden clasificarse aproximadamente como:

- **Corto alcance**
- **Medio alcance**
- **Largo alcance**
- **Global**

Los personajes de largo alcance permiten cubrir múltiples rutas, mientras que los personajes de corto alcance suelen destacar cuando los enemigos atraviesan puntos específicos del mapa.

---

# 7. Cobertura

El mapa debe incentivar la creación de zonas de cobertura.

Por ejemplo:

```text
          🔴
       ↘     ↙

    🟦         🟩
       \     /
        🏰
       /     \
    🟨         🟪

       ↗     ↖
          🔴
```

Una composición ideal no necesariamente concentra todas sus unidades alrededor de la base.

Puede crear diferentes **líneas defensivas**:

### Línea exterior
Busca debilitar a los enemigos antes de que avancen.

### Línea intermedia
Controla enemigos que hayan atravesado la primera defensa.

### Línea interior
Protege directamente la base.

---

# 8. Prioridad de objetivos

Cada unidad puede tener diferentes prioridades.

Ejemplos:

- Primer enemigo.
- Último enemigo.
- Enemigo con más vida.
- Enemigo con menos vida.
- Enemigo más rápido.
- Enemigo más cercano a la base.
- Jefe.
- Enemigos afectados por una marca.

Esto permite crear estrategias específicas.

---

# 9. Sinergias

Los personajes deben tener interacciones entre sí.

Ejemplo:

> Un debuffer reduce la defensa de un enemigo → un buffer aumenta el daño de un DPS → el DPS elimina rápidamente al objetivo.

Esto permite crear composiciones especializadas.

Algunas composiciones pueden centrarse en:

- Daño explosivo.
- Daño sostenido.
- Supervivencia.
- Control.
- Buffs.
- Debuffs.
- Cuerpo a cuerpo.
- Defensa perimetral.
- Control de oleadas.

---

# 10. Oleadas

Las oleadas progresan en dificultad.

Una oleada puede tener diferentes fases:

### Fase 1 — Reconocimiento
Enemigos básicos desde pocos puntos.

### Fase 2 — Presión
Aparecen varios grupos simultáneamente.

### Fase 3 — Cerco
Los enemigos comienzan a aparecer desde múltiples direcciones.

### Fase 4 — Asalto
Grandes grupos atacan simultáneamente.

### Fase 5 — Jefe
Aparece un enemigo especialmente poderoso acompañado por unidades menores.

---

# 11. Jefes

Los jefes deben aprovechar especialmente el sistema 360°.

Un jefe puede:

- Cambiar de ruta.
- Invocar enemigos.
- Crear nuevos puntos de spawn.
- Atacar unidades directamente.
- Desactivar temporalmente torres.
- Aplicar debuffs.
- Forzar al jugador a redistribuir sus unidades.

Esto evita que una estrategia fija funcione durante toda la partida.

---


# 14. Filosofía de diseño

El Tower Defense debe sentirse menos como:

> "Coloca torres y espera."

Y más como:

> **"Construye un ejército capaz de sobrevivir a un asedio desde cualquier dirección."**

La mecánica 360° es el núcleo del juego.

La posición de cada personaje importa, las composiciones importan y las sinergias entre personajes deben permitir diferentes estilos de juego.

El objetivo no es crear una única formación óptima, sino un sistema donde diferentes combinaciones del roster sean útiles dependiendo de:

- El mapa.
- La dirección de los ataques.
- El tipo de enemigos.
- La oleada.
- Los jefes.
- La composición del jugador.
- Las sinergias entre personajes.
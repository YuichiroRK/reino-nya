# Tower Defense — Geometría, Objetivos, Movimiento y Colocación

## 1. Joyas Sagradas del Nya

Las **Joyas Sagradas del Nya** constituyen el objetivo principal de la defensa.

La fortaleza contiene **tres Joyas Sagradas**, cada una con sus propios valores de:

- Escudo.
- HP.

El escudo debe agotarse antes de que el daño pueda afectar al HP de la joya.

### Estado de una joya

```text
ESCUDO → HP → DESTRUCCIÓN
```

Una joya puede encontrarse:

- Con escudo completo.
- Con escudo parcialmente destruido.
- Sin escudo y con HP restante.
- Con HP reducido.
- Destruida.

La destrucción de una joya no provoca inmediatamente la derrota.

### Condición de derrota

El jugador pierde la partida cuando **las tres Joyas Sagradas son destruidas**.

Mientras al menos una joya permanezca intacta, la partida puede continuar.

Esto permite que una partida pueda evolucionar de:

> Defender las tres joyas

a:

> Proteger desesperadamente las dos restantes

y finalmente:

> Defender la última joya.

---

# 2. Objetivo de los enemigos

Los enemigos buscan alcanzar las Joyas Sagradas para destruirlas.

El número de joyas que un enemigo puede atacar dependerá del nivel y de las características de la oleada.

Durante los primeros niveles del juego:

- Los enemigos tendrán como objetivo **una única joya**.
- Las otras dos joyas no serán objetivos directos de esa oleada.

Posteriormente podrán existir niveles donde los enemigos puedan atacar:

- Una joya.
- Dos joyas simultáneamente.
- Las tres joyas.
- Más de tres objetivos en contenidos futuros, si el sistema se amplía.

Esto permite aumentar progresivamente la complejidad de las defensas sin cambiar el núcleo del sistema.

---

# 3. Fortaleza

La fortaleza posee una estructura compacta y centralizada.

Como referencia inicial, se utilizará una proporción aproximada de:

> **Fortaleza : zona de aparición ≈ 1 : 2**

con posibilidad de llegar a:

> **Fortaleza : zona de aparición ≈ 1 : 3**

dependiendo del nivel y del tamaño del mapa.

La intención es que exista una zona exterior suficientemente amplia para permitir:

- Diferentes puntos de aparición.
- Enemigos llegando desde múltiples direcciones.
- Posicionamiento estratégico de personajes.
- Intercepción antes de llegar a la muralla.
- Combates en distintas zonas del mapa.

La zona de aparición no debe considerarse simplemente espacio vacío: forma parte del campo de batalla.

---

# 4. Estructura radial

La fortaleza se encuentra aproximadamente en el centro del mapa.

Los enemigos pueden aparecer alrededor de ella y aproximarse desde cualquier dirección.

No existe una ruta única.

```text
                SPAWN

          ↘      ↓      ↙

             ┌───────┐
             │ 💎 💎 │
       SPAWN │   💎  │ SPAWN
             │       │
             └───────┘

          ↗      ↑      ↖

                SPAWN
```

La estructura permite una defensa de **360°**.

La dirección desde la que aparece un enemigo puede cambiar completamente la situación de la partida.

---

# 5. Muralla

La muralla es una **estructura física real** del mapa.

No funciona simplemente como una división visual entre el exterior y el interior.

La muralla:

- Bloquea el movimiento de enemigos terrestres.
- Puede ser utilizada como elemento defensivo.
- Modifica las rutas de los enemigos.
- Puede alterar las posiciones desde las que los enemigos pueden atacar.
- Permite que determinados personajes se posicionen sobre ella.

La muralla forma parte activa del gameplay.

---

# 6. Interacción de los enemigos con la muralla

Los enemigos no tienen un único comportamiento frente a la muralla.

Su respuesta depende de sus características.

### Enemigo terrestre básico

Si encuentra la muralla directamente delante:

1. Comprueba si existe una ruta para rodearla.
2. Si puede rodearla, intenta buscar un camino hacia su objetivo.
3. Si su comportamiento lo permite, puede intentar escalarla.

### Enemigos especializados

Dependiendo del tipo de enemigo, pueden existir comportamientos adicionales:

- **Rodear:** busca una ruta alrededor de la muralla.
- **Escalar:** atraviesa la defensa trepando la muralla.
- **Destruir:** ataca la muralla para abrirse paso.
- **Saltar:** supera físicamente la muralla.
- **Ignorar:** puede atravesarla o sobrevolarla.
- **Rodear parcialmente:** busca puntos concretos de acceso.

Esto permite que la muralla no sea una defensa absoluta.

Su efectividad dependerá de la composición de la oleada.

---

# 7. Navegación enemiga

Los enemigos utilizan navegación basada en su objetivo y en los obstáculos existentes.

El objetivo principal sigue siendo alcanzar la joya asignada.

Cuando existe un obstáculo entre el enemigo y su objetivo, el enemigo debe buscar una forma válida de continuar avanzando.

La navegación puede considerar:

- Murallas.
- Rocas.
- Montañas.
- Estructuras.
- Personajes.
- Otros obstáculos físicos.
- Características propias del enemigo.

No todos los enemigos tienen que compartir exactamente el mismo sistema de navegación.

Por ejemplo:

> Un Goblin terrestre debe rodear una montaña.

> Un Goblin escalador puede subirla.

> Un enemigo volador puede ignorarla.

Esto permite que el diseño de enemigos influya directamente en el posicionamiento del jugador.

---

# 8. Sistema de colocación

Los personajes utilizan un sistema de **colocación libre**.

El jugador puede colocar un personaje prácticamente en cualquier posición válida del mapa.

No existe un sistema obligatorio de casillas predeterminadas.

### Restricciones

Un personaje:

- No puede ocupar exactamente el mismo espacio que otro personaje.
- No puede colocarse sobre otro personaje.
- Debe encontrarse dentro de una zona válida de despliegue.
- Debe respetar las restricciones físicas del mapa.

### Obstáculos

Los personajes **sí pueden colocarse sobre determinados obstáculos**.

Por ejemplo:

- Rocas.
- Montañas.
- Elevaciones.
- Estructuras.
- Otras superficies que permitan posicionamiento.

Esto permite utilizar el terreno como parte de la estrategia.

---

# 9. Posicionamiento vertical

El mapa puede incluir diferentes alturas.

Un personaje no necesariamente tiene que encontrarse siempre sobre el terreno base.

Puede existir posicionamiento sobre:

- Terreno elevado.
- Rocas.
- Montañas.
- Murallas.
- Estructuras defensivas.

Esto puede generar diferencias estratégicas relacionadas con:

- Rango.
- Línea de visión.
- Seguridad.
- Acceso de enemigos.
- Cobertura.
- Posiciones defensivas.

Las reglas exactas de altura y línea de visión podrán definirse posteriormente.

---

# 10. Personajes sobre la muralla

La muralla funciona también como una superficie válida de colocación.

Los personajes pueden desplegarse sobre ella cuando la geometría del punto seleccionado lo permita.

Esto permite utilizar la muralla como una posición defensiva elevada.

Ejemplo:

```text
          🏹
      ───────────
      │ MURALLA │
      │         │
      │  💎 💎  │
      │    💎   │
      └─────────┘
```

Un personaje colocado sobre la muralla puede utilizar su posición para defender diferentes zonas del perímetro.

---

# 11. Relación entre posición y combate

La posición de un personaje afecta directamente qué enemigos puede detectar y atacar.

Dos personajes idénticos pueden tener resultados completamente diferentes dependiendo de su ubicación.

Por ejemplo:

### Personaje A

Colocado fuera de la muralla.

Puede interceptar enemigos antes de que lleguen a la fortaleza.

### Personaje B

Colocado sobre la muralla.

Puede cubrir una zona amplia del perímetro desde una posición elevada.

### Personaje C

Colocado dentro de la fortaleza.

Puede funcionar como última línea defensiva.

Esto convierte el posicionamiento en una de las decisiones principales del jugador.

---

# 12. Sistema de targeting

El targeting determina qué enemigo selecciona un personaje cuando existen múltiples objetivos válidos dentro de su rango.

El targeting **no es una característica permanente del personaje**.

Es una configuración que el jugador puede modificar durante la partida.

---

## 12.1 Acceso al targeting

La configuración se realiza seleccionando un personaje que ya se encuentre desplegado.

Flujo:

```text
PERSONAJE DESPLEGADO
        ↓
JUGADOR LO SELECCIONA
        ↓
SE ABRE SU PANEL DE INFORMACIÓN
        ↓
OPCIÓN "TARGETING"
        ↓
SELECCIÓN DE PRIORIDAD
        ↓
EL PERSONAJE CAMBIA SU OBJETIVO
```

El cambio se realiza durante la partida y no requiere retirar ni volver a desplegar al personaje.

---

# 13. Prioridades de targeting

Las prioridades disponibles pueden incluir:

- **Más vida**
- **Menos vida**
- **Más cerca**
- **Más lejos**
- **Más fuerte**
- **Más débil**
- **Más cerca del centro**
- **Más lejos del centro**
- **Más rápido**
- **Tipo de enemigo**

### Más cerca del centro

Esta prioridad considera la distancia entre el enemigo y las Joyas Sagradas.

Es especialmente importante porque permite priorizar enemigos que representan un peligro inmediato para la fortaleza.

### Más fuerte

Considera la amenaza general que representa un enemigo.

Puede basarse en sus estadísticas y características definidas por el sistema de enemigos.

### Tipo de enemigo

Permite seleccionar categorías concretas de enemigos cuando el juego las utilice.

Ejemplos:

- Blindados.
- Voladores.
- Rápidos.
- Soporte.
- Jefes.
- Enemigos especiales.

---

# 14. Prioridad secundaria

El sistema puede permitir una prioridad secundaria.

Ejemplo:

> **Primaria:** Más cerca del centro  
> **Secundaria:** Más fuerte

El personaje primero utiliza la prioridad primaria.

La secundaria solamente se utiliza cuando es necesario resolver una situación donde existen varios objetivos equivalentes según el primer criterio.

Ejemplo:

```text
OBJETIVOS VÁLIDOS
       ↓
Más cerca del centro
       ↓
¿Hay empate?
   ↙       ↘
 NO        SÍ
 ↓          ↓
ATACAR    Más fuerte
             ↓
           ATACAR
```

El sistema podrá ampliarse posteriormente con más niveles de prioridad si resulta necesario, pero inicialmente se recomienda mantenerlo simple.

---

# 15. Targeting como herramienta estratégica

El targeting está diseñado para ser utilizado activamente durante una partida.

El jugador puede modificarlo dependiendo de la situación.

Ejemplo:

### Situación inicial

> **Más cerca**

El personaje ataca automáticamente al enemigo más próximo a su posición.

### Aparece un enemigo resistente

El jugador cambia:

> **Más fuerte**

El personaje comienza a concentrar sus ataques en la amenaza principal.

### Una joya está en peligro

El jugador cambia:

> **Más cerca del centro**

El personaje comienza a priorizar enemigos que estén más próximos a las Joyas.

Esto permite modificar el comportamiento de un personaje sin cambiarlo de posición.

---

# 16. Interfaz de targeting

El targeting se configura desde el panel del personaje.

Al seleccionar una unidad desplegada, el jugador puede acceder a sus opciones.

Ejemplo conceptual:

```text
┌─────────────────────────────┐
│ Kiu                         │
│                             │
│ TARGETING                   │
│                             │
│ ● Más cerca                 │
│ ○ Más lejos                 │
│ ○ Más vida                  │
│ ○ Menos vida                │
│ ○ Más fuerte                │
│ ○ Más débil                 │
│ ○ Más cerca del centro      │
│ ○ Más lejos del centro      │
│ ○ Más rápido                │
│ ○ Tipo de enemigo           │
│                             │
│ Secundario: Más fuerte      │
└─────────────────────────────┘
```

La interfaz debe permitir cambiar rápidamente la configuración sin sacar al jugador del combate.

---

# 17. Condición general de derrota

La partida termina cuando las **tres Joyas Sagradas del Nya han sido destruidas**.

Mientras exista al menos una joya con HP restante, la partida continúa.

Esto permite que el estado de la defensa pueda deteriorarse progresivamente.

```text
💎 💎 💎
 ↓  ↓  ↓

💎 💎 ❌
 ↓  ↓
Defensa continúa

💎 ❌ ❌
 ↓
Última joya

❌ ❌ ❌
 ↓
DERROTA
```

---

# 18. Estado de los sistemas

### Definido

- [x] Tres Joyas Sagradas.
- [x] Cada joya posee escudo.
- [x] Cada joya posee HP.
- [x] El escudo se pierde antes del HP.
- [x] Las tres joyas deben ser destruidas para perder.
- [x] Los niveles iniciales utilizan una sola joya como objetivo.
- [x] En niveles posteriores pueden existir múltiples objetivos.
- [x] Fortaleza central.
- [x] Zona de aparición aproximadamente 2×–3× el tamaño de la fortaleza.
- [x] Enemigos pueden aparecer desde cualquier dirección.
- [x] Muralla física real.
- [x] Muralla bloquea enemigos terrestres.
- [x] Los enemigos pueden rodear, escalar, destruir o superar la muralla dependiendo de su tipo.
- [x] Personajes pueden colocarse libremente.
- [x] Los personajes no pueden ocupar el mismo espacio entre sí.
- [x] Los personajes pueden colocarse sobre obstáculos válidos.
- [x] Los personajes pueden colocarse sobre la muralla.
- [x] El targeting se configura seleccionando un personaje desplegado.
- [x] El targeting puede modificarse durante la partida.
- [x] Existe una prioridad principal.
- [x] Puede existir una prioridad secundaria.

### Pendiente

- [x] Valores concretos de HP y escudo de las Joyas (Se usarán valores clásicos de Tower Defense inicialmente).
- [x] Daño que reciben las Joyas por ataque enemigo (Se usarán valores clásicos de Tower Defense inicialmente).
- [ ] Regeneración o recuperación de escudo, si existe.
- [x] Radio exacto de la fortaleza (Se usarán distancias clásicas de Tower Defense inicialmente).
- [x] Radio exacto del área jugable (Se usarán distancias clásicas de Tower Defense inicialmente).
- [x] Distancia mínima/máxima de aparición (Se usarán distancias clásicas de Tower Defense inicialmente).
- [ ] Dimensiones exactas de la muralla.
- [ ] Existencia y ubicación de puertas o accesos.
- [ ] Reglas exactas de destrucción de la muralla.
- [ ] Qué enemigos pueden escalar/destruir/atravesar la muralla.
- [x] Reglas exactas de navegación (Se implementará el algoritmo de Dijkstra para calcular el camino más corto).
- [ ] Reglas de línea de visión.
- [ ] Restricciones específicas de colocación.
- [ ] Lista definitiva de prioridades de targeting.
- [ ] Comportamiento exacto de las prioridades secundarias.
- [x] Diseño final de la interfaz de targeting (Se usará una mini ventana al lado derecho con una lista desplegable).
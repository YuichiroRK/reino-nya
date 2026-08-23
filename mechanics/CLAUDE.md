Tower Defense — Arquitectura del Proyecto
1. Stack tecnológico

El proyecto será una aplicación web de Tower Defense 2D, completamente dockerizada.

Stack oficial
Capa	Tecnología
Lenguaje	TypeScript
Frontend / Game Engine	Phaser
Frontend Build	Vite
Backend Runtime	Node.js
Backend Framework	Fastify
Base de datos	PostgreSQL
Web Server / Reverse Proxy	Nginx
Contenedores	Docker + Docker Compose
Sistema operativo	Ubuntu Server
Comunicación inicial	HTTP/REST
Comunicación futura	WebSocket
2. Filosofía de arquitectura

El proyecto debe separarse claramente en tres componentes principales:

┌──────────────────────────────────────────┐
│                  WEB                     │
│         Phaser + TypeScript              │
│                                          │
│          GAMEPLAY / RENDER                │
└────────────────────┬─────────────────────┘
                     │
                  HTTP/REST
                     │
                     ▼
┌──────────────────────────────────────────┐
│                 API                      │
│         Node.js + Fastify                │
│                                          │
│       AUTH / DATA / PROGRESS             │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│               DATABASE                   │
│               PostgreSQL                 │
│                                          │
│        USERS / PROGRESS / DATA           │
└──────────────────────────────────────────┘

El frontend será responsable de ejecutar el juego.

El backend será responsable de la persistencia y lógica relacionada con las cuentas.

PostgreSQL será responsable de almacenar los datos persistentes.

3. Estructura principal recomendada

Se recomienda utilizar un monorepo.

tower-defense/
│
├── apps/
│   ├── client/
│   └── server/
│
├── packages/
│   ├── shared/
│   └── game-data/
│
├── infrastructure/
│   ├── nginx/
│   └── postgres/
│
├── docker/
│   ├── client/
│   └── server/
│
├── docs/
│
├── scripts/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── package.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── README.md
└── LICENSE

La idea es que todo el proyecto pueda levantarse mediante Docker Compose.

4. apps/client

Contiene todo el juego que se ejecuta en el navegador.

apps/client/
│
├── public/
│   ├── assets/
│   │   ├── characters/
│   │   ├── enemies/
│   │   ├── maps/
│   │   ├── ui/
│   │   ├── effects/
│   │   ├── audio/
│   │   └── fonts/
│   │
│   └── favicon/
│
├── src/
│   │
│   ├── main.ts
│   ├── game.ts
│   │
│   ├── config/
│   │   ├── game.config.ts
│   │   ├── display.config.ts
│   │   └── constants.ts
│   │
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MenuScene.ts
│   │   ├── LevelSelectScene.ts
│   │   ├── GameScene.ts
│   │   ├── VictoryScene.ts
│   │   └── DefeatScene.ts
│   │
│   ├── entities/
│   │   ├── characters/
│   │   ├── enemies/
│   │   ├── structures/
│   │   ├── projectiles/
│   │   └── effects/
│   │
│   ├── systems/
│   │   ├── combat/
│   │   ├── targeting/
│   │   ├── movement/
│   │   ├── collision/
│   │   ├── placement/
│   │   ├── navigation/
│   │   ├── waves/
│   │   ├── skills/
│   │   └── resources/
│   │
│   ├── maps/
│   │   ├── Map.ts
│   │   ├── Fortress.ts
│   │   ├── Wall.ts
│   │   ├── Obstacle.ts
│   │   └── SacredGem.ts
│   │
│   ├── ui/
│   │   ├── hud/
│   │   ├── character-panel/
│   │   ├── targeting/
│   │   ├── skills/
│   │   ├── menus/
│   │   └── components/
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── player/
│   │   └── game/
│   │
│   ├── state/
│   │   ├── GameState.ts
│   │   ├── PlayerState.ts
│   │   └── SettingsState.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── utils/
│       ├── math.ts
│       ├── geometry.ts
│       └── random.ts
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
5. Organización del Gameplay

El gameplay debe dividirse por sistemas, no colocar toda la lógica dentro de GameScene.ts.

Por ejemplo:

GameScene
   │
   ├── WaveSystem
   ├── MovementSystem
   ├── TargetingSystem
   ├── CombatSystem
   ├── CollisionSystem
   ├── PlacementSystem
   └── NavigationSystem

GameScene debe actuar principalmente como coordinador de la partida.

No debería contener miles de líneas con toda la lógica del juego.

6. Entidades

Las entidades representan objetos existentes dentro de la partida.

entities/
│
├── characters/
│   ├── Character.ts
│   ├── Angel.ts
│   ├── Cesar.ts
│   ├── Champa.ts
│   └── ...
│
├── enemies/
│   ├── Enemy.ts
│   ├── Goblin.ts
│   ├── GoblinRunner.ts
│   └── ...
│
├── structures/
│   ├── Wall.ts
│   └── Fortress.ts
│
├── projectiles/
└── effects/

Sin embargo, los personajes no deberían contener toda la lógica del combate.

Un personaje debería describir principalmente:

Estadísticas.
Habilidades.
Estado.
Animaciones.
Datos propios.

Los sistemas externos deberían encargarse de procesos generales como targeting y combate.

7. Sistemas del juego
combat/

Responsable de:

Daño.
Ataques.
Defensa.
Cálculo de daño.
Efectos.
Cooldowns.
Resolución de combate.
targeting/

Responsable exclusivamente de seleccionar objetivos.

TargetingSystem
│
├── ClosestTarget
├── FarthestTarget
├── HighestHP
├── LowestHP
├── StrongestTarget
├── WeakestTarget
├── ClosestToCore
├── FarthestFromCore
├── FastestTarget
└── EnemyTypeTarget

Esto permite cambiar o agregar prioridades sin modificar el sistema de combate.

movement/

Responsable del movimiento de entidades.

Velocidad.
Dirección.
Movimiento.
Rotación.
Movimiento hacia objetivos.
navigation/

Responsable de determinar cómo llegar a un objetivo.

Especialmente importante para:

Murallas.
Montañas.
Rocas.
Obstáculos.
Diferentes tipos de enemigos.
collision/

Responsable de:

Colisiones.
Intersecciones.
Bloqueos.
Espacios ocupados.
Interacción con estructuras.
placement/

Responsable de la colocación libre de personajes.

Debe determinar:

¿La posición es válida?
        ↓
¿Está dentro del mapa?
        ↓
¿Puede colocarse en este terreno?
        ↓
¿Está ocupada?
        ↓
¿Puede colocarse sobre este obstáculo?
        ↓
¿Puede colocarse sobre la muralla?
        ↓
POSICIÓN VÁLIDA
8. apps/server

Backend del proyecto.

apps/server/
│
├── src/
│   │
│   ├── server.ts
│   ├── app.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── players/
│   │   ├── characters/
│   │   ├── levels/
│   │   ├── inventory/
│   │   ├── rewards/
│   │   └── games/
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── player.routes.ts
│   │   ├── character.routes.ts
│   │   ├── level.routes.ts
│   │   └── game.routes.ts
│   │
│   ├── services/
│   │   ├── auth/
│   │   ├── player/
│   │   ├── progression/
│   │   └── game/
│   │
│   ├── repositories/
│   │   ├── UserRepository.ts
│   │   ├── PlayerRepository.ts
│   │   ├── CharacterRepository.ts
│   │   └── LevelRepository.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error.ts
│   │
│   ├── schemas/
│   │   ├── auth.ts
│   │   ├── player.ts
│   │   └── game.ts
│   │
│   ├── types/
│   └── utils/
│
├── migrations/
├── seeds/
├── package.json
├── tsconfig.json
└── Dockerfile
9. Arquitectura Backend

Se recomienda utilizar una separación:

Route
  ↓
Controller / Handler
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL

Por ejemplo:

POST /api/game/complete
        ↓
GameRoute
        ↓
GameService
        ↓
ProgressionService
        ↓
PlayerRepository
        ↓
PostgreSQL

Las rutas no deberían contener directamente consultas SQL complejas.

10. packages/shared

Contendrá código TypeScript utilizado tanto por frontend como backend.

packages/shared/
│
├── src/
│   ├── types/
│   │   ├── character.ts
│   │   ├── enemy.ts
│   │   ├── level.ts
│   │   ├── player.ts
│   │   └── game.ts
│   │
│   ├── enums/
│   │   ├── rarity.ts
│   │   ├── role.ts
│   │   ├── targeting.ts
│   │   └── enemy-type.ts
│   │
│   └── constants/
│
├── package.json
└── tsconfig.json

Esto evita duplicar tipos.

Por ejemplo, TargetingPriority existe una sola vez y ambos lados lo utilizan.

11. packages/game-data

Este paquete contendrá los datos estáticos del juego.

packages/game-data/
│
├── src/
│   ├── characters/
│   │   ├── angel.ts
│   │   ├── cesar.ts
│   │   ├── champa.ts
│   │   └── ...
│   │
│   ├── enemies/
│   ├── levels/
│   ├── waves/
│   ├── maps/
│   └── index.ts
│
├── package.json
└── tsconfig.json

La idea es separar:

Datos del juego

de:

Código que ejecuta el juego.

12. Base de datos

PostgreSQL se ejecutará como un contenedor independiente.

La estructura recomendada:

infrastructure/
└── postgres/
    ├── migrations/
    ├── seeds/
    └── init/

Las migraciones deberán versionar todos los cambios de estructura.

Nunca se debería depender de modificar manualmente la base de datos de producción.

13. Esquema conceptual de PostgreSQL

Inicialmente podría contener:

users
players
characters
player_characters
levels
player_levels
items
inventory
rewards
game_sessions

Relación general:

users
  │
  └── players
        │
        ├── player_characters
        │        │
        │        └── characters
        │
        ├── inventory
        │
        └── player_levels
                   │
                   └── levels

El esquema definitivo se diseñará posteriormente.

14. Docker

Todo el proyecto deberá ejecutarse mediante Docker.

La infraestructura inicial:

┌──────────────────────────────────────┐
│           Docker Compose             │
│                                      │
│  ┌────────────┐                      │
│  │   Nginx    │                      │
│  │   :80/:443 │                      │
│  └─────┬──────┘                      │
│        │                             │
│   ┌────┴─────┐                       │
│   │          │                       │
│   ▼          ▼                       │
│ Client     Server                    │
│ Phaser     Fastify                   │
│            :3000                     │
│               │                      │
│               ▼                      │
│          PostgreSQL                  │
│             :5432                    │
│                                      │
└──────────────────────────────────────┘
15. docker-compose.yml

El archivo principal deberá definir los servicios necesarios para desarrollo.

Conceptualmente:

services:

  client:
    build:
      context: .
      dockerfile: docker/client/Dockerfile

  server:
    build:
      context: .
      dockerfile: docker/server/Dockerfile

  postgres:
    image: postgres

  nginx:
    image: nginx

Los valores reales de puertos, volúmenes, redes y variables de entorno se definirán en la implementación.

16. Desarrollo vs producción

Se recomienda mantener dos configuraciones:

docker-compose.yml
docker-compose.prod.yml
Desarrollo

Debe permitir:

Hot reload.
Volúmenes de código.
Logs detallados.
Debugging.
Base de datos persistente.
Producción

Debe utilizar:

Builds optimizados.
Imágenes más pequeñas.
Variables de entorno externas.
Nginx.
Restart policies.
Volúmenes persistentes.
Configuración segura.
17. Dockerfiles

Los Dockerfiles estarán separados por aplicación.

docker/
│
├── client/
│   └── Dockerfile
│
└── server/
    └── Dockerfile

El frontend debería utilizar un multi-stage build:

Node
 ↓
npm install
 ↓
npm run build
 ↓
Nginx
 ↓
Archivos estáticos

El resultado final no necesita Node.js para servir el frontend en producción.

18. Nginx

Nginx será el punto de entrada de producción.

Conceptualmente:

Internet
   │
   ▼
 Nginx
   │
   ├── /          → Frontend
   │
   └── /api/      → Backend

Ejemplo:

https://dominio.com/
        ↓
     Phaser

https://dominio.com/api/
        ↓
     Fastify

Esto permite utilizar un único dominio para toda la aplicación.

19. Variables de entorno

Nunca se deberán almacenar secretos directamente en Git.

Se utilizará:

.env
.env.example

Ejemplo conceptual:

NODE_ENV=
DATABASE_URL=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
JWT_SECRET=
API_URL=

.env deberá estar incluido en .gitignore.

.env.example sí deberá formar parte del repositorio.

20. Volúmenes Docker

PostgreSQL deberá utilizar un volumen persistente.

Docker
  │
  └── PostgreSQL
        │
        └── postgres_data

Esto evita perder la base de datos cuando el contenedor se reinicia o recrea.

Los assets y archivos de aplicación no deberán depender de modificaciones manuales dentro de los contenedores.

21. Red Docker

Los servicios deberán comunicarse mediante una red interna de Docker.

             INTERNET
                 │
                 ▼
               NGINX
                 │
        ┌────────┴────────┐
        ▼                 ▼
      CLIENT            SERVER
                           │
                           ▼
                       POSTGRES

PostgreSQL no deberá exponerse públicamente.

El backend accederá a PostgreSQL utilizando el nombre del servicio Docker.

22. Flujo de desarrollo

El desarrollo local seguirá aproximadamente:

Código
  ↓
Docker Compose
  ↓
Client + Server + PostgreSQL
  ↓
Navegador
  ↓
Tower Defense

El objetivo es que un desarrollador pueda clonar el repositorio y levantar el proyecto con un único comando.

Ejemplo conceptual:

docker compose up --build
23. Scripts

La carpeta scripts/ podrá contener herramientas auxiliares:

scripts/
├── seed-db.ts
├── generate-data.ts
├── validate-game-data.ts
└── build-assets.ts

Estos scripts no deben contener lógica principal del juego.

24. Documentación

La carpeta docs/ contendrá la documentación técnica y de diseño.

docs/
│
├── game-design/
│   ├── mechanics.md
│   ├── roster.md
│   ├── combat.md
│   ├── enemies.md
│   └── maps.md
│
├── architecture/
│   ├── overview.md
│   ├── frontend.md
│   ├── backend.md
│   └── database.md
│
└── deployment/
    ├── docker.md
    └── production.md

Los documentos de diseño del juego deben mantenerse separados de la documentación puramente técnica.

25. Flujo de datos de una partida
Jugador
   │
   ▼
Frontend / Phaser
   │
   ├── Carga datos del nivel
   │
   ├── Genera oleadas
   │
   ├── Ejecuta enemigos
   │
   ├── Ejecuta personajes
   │
   ├── Ejecuta targeting
   │
   ├── Ejecuta combate
   │
   └── Determina victoria/derrota
   │
   ▼
Backend
   │
   ├── Valida resultado
   │
   ├── Calcula recompensas
   │
   └── Actualiza progreso
   │
   ▼
PostgreSQL
26. Regla importante: el servidor no ejecuta el renderizado

El backend no debe saber nada de Phaser.

No debe existir código como:

server/
└── Phaser

Phaser pertenece exclusivamente al cliente.

El backend trabaja con datos y reglas de persistencia.

27. Regla importante: el cliente no accede directamente a PostgreSQL

El frontend nunca se conecta directamente a PostgreSQL.

Incorrecto:

Browser → PostgreSQL

Correcto:

Browser → API → PostgreSQL

Esto protege las credenciales y permite controlar qué datos puede modificar el jugador.

28. Regla importante: lógica compartida

Cuando una definición sea necesaria tanto para frontend como backend, deberá colocarse en:

packages/shared/

Ejemplo:

TargetingPriority
CharacterRole
Rarity
EnemyType
GameResult

Esto evita duplicar definiciones.

29. Estructura final resumida
tower-defense/
│
├── apps/
│   ├── client/              # Phaser + Vite
│   └── server/              # Node + Fastify
│
├── packages/
│   ├── shared/              # Tipos compartidos
│   └── game-data/           # Datos del juego
│
├── infrastructure/
│   ├── nginx/
│   └── postgres/
│
├── docker/
│   ├── client/
│   └── server/
│
├── docs/
├── scripts/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── package.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
30. Principios de arquitectura

El proyecto seguirá estas reglas:

Phaser pertenece al frontend.
Fastify pertenece al backend.
PostgreSQL nunca será accesible directamente desde el navegador.
El gameplay PvE se ejecutará principalmente en el cliente.
El backend administra cuentas, progreso y persistencia.
Los tipos compartidos viven en packages/shared.
Los datos estáticos del juego viven en packages/game-data.
La lógica del juego se divide en sistemas independientes.
No se colocará toda la lógica dentro de GameScene.
Todo el entorno debe poder levantarse mediante Docker Compose.
La base de datos tendrá persistencia mediante volúmenes Docker.
Los secretos se gestionan mediante variables de entorno.
Desarrollo y producción tendrán configuraciones Docker independientes.
La arquitectura deberá permitir agregar WebSockets posteriormente sin rehacer el proyecto.
La estructura debe permitir escalar el contenido del juego sin convertir el código en un monolito.
31. Estado
Definido
 Aplicación web.
 TypeScript.
 Phaser.
 Vite.
 Node.js.
 Fastify.
 PostgreSQL.
 Nginx.
 Docker.
 Docker Compose.
 Monorepo.
 Frontend separado del backend.
 Paquete compartido.
 Paquete de datos del juego.
 PostgreSQL con volumen persistente.
 Nginx como punto de entrada.
 PvE ejecutado principalmente en cliente.
 API para persistencia.
 Arquitectura preparada para WebSockets futuros.
Pendiente
 Crear repositorio.
 Crear estructura inicial de carpetas.
 Configurar pnpm/npm workspaces.
 Crear proyecto Phaser + Vite.
 Crear proyecto Fastify.
 Crear paquete shared.
 Crear paquete game-data.
 Crear Dockerfiles.
 Crear docker-compose.yml.
 Crear configuración de producción.
 Configurar PostgreSQL.
 Configurar migraciones.
 Configurar Nginx.
 Definir esquema inicial de PostgreSQL.
 Implementar primer mapa de prueba.
 Implementar primer loop de combate.
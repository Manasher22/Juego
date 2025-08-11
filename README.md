# Juego de Probabilidad - Versión Estática

Un juego estratégico de probabilidad donde compites contra una IA inteligente evitando bombas ocultas en cajas misteriosas.

## 🎮 Características

- **IA Inteligente**: Oponente que toma decisiones estratégicas basadas en cálculos de probabilidad
- **Mecánicas de Turno**: Sistema completo donde encontrar bombas o confeti afecta quién juega siguiente
- **Diseño Responsive**: Optimizado para móviles, tablets y escritorio
- **Interfaz en Español**: Completamente localizada con emojis y mensajes claros
- **Sin Dependencias**: HTML, CSS y JavaScript puro - funciona en cualquier navegador

## 📱 Compatibilidad

- ✅ Todos los navegadores modernos
- ✅ Móviles iOS y Android
- ✅ Tablets
- ✅ Funciona offline después de carga inicial

## 🚀 Instalación y Despliegue

### Opción 1: GitHub Pages (Gratis)
1. Crea un repositorio en GitHub
2. Sube todos los archivos
3. Ve a Settings > Pages
4. Selecciona "Deploy from branch" > "main"
5. Tu juego estará en: `https://tu-usuario.github.io/nombre-repositorio`

### Opción 2: Netlify (Gratis)
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta `static-version` al área de deploy
3. Tu juego estará disponible con URL automática

### Opción 3: Vercel (Gratis)
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Deploy automático

## 📂 Estructura de Archivos

```
static-version/
├── index.html      # Página principal
├── styles.css      # Estilos y diseño responsive
├── game.js         # Lógica del juego e IA
└── README.md       # Esta documentación
```

## 🎯 Cómo Jugar

1. **Configurar**: Elige el número de cajas totales y bombas
2. **Estrategia**: En tu turno puedes:
   - **Abrir Yo**: Abres una caja tú mismo
   - **Máquina Abre**: Fuerzas a la IA a abrir
3. **Mecánicas de Turno**:
   - Encuentras bomba = pierdes turno
   - Encuentras confeti = mantienes turno
4. **Objetivo**: Termina con menos bombas que la IA

## 🤖 Estrategia de la IA

La IA usa análisis de probabilidad:
- Si probabilidad de bomba > 60% → Te fuerza a abrir
- Si probabilidad de bomba < 60% → Abre ella misma
- Calcula probabilidades basadas en cajas restantes y bombas restantes

## 🔧 Personalización

### Cambiar Colores
Edita las variables CSS en `styles.css`:
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Ajustar IA
Modifica la lógica en `game.js`:
```javascript
// Cambiar umbral de decisión (línea ~25)
return bombProbability > 0.6 ? "force_player" : "open_self";
```

### Agregar Sonidos
```javascript
// En handlePlayerAction() y handleAITurn()
const audio = new Audio('sonido-bomba.mp3');
audio.play();
```

## 📊 Métricas y Analytics

Para añadir Google Analytics, agrega antes del `</head>` en `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 SEO y Performance

- ✅ Meta tags incluidos
- ✅ Responsive design
- ✅ Carga rápida (sin dependencias externas)
- ✅ Accesible (semantic HTML)

## 📱 PWA (Progressive Web App)

Para convertir en PWA, añade `manifest.json`:
```json
{
  "name": "Juego de Probabilidad",
  "short_name": "JuegoBombas",
  "description": "Juego estratégico contra IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🐛 Resolución de Problemas

### El juego no carga
- Verifica que todos los archivos estén en el mismo directorio
- Abre la consola del navegador (F12) para ver errores

### La IA no funciona en móvil
- El juego es compatible con todos los móviles modernos
- Si hay problemas, recarga la página

### Quiero cambiar las reglas
- Edita la función `makeAiDecision()` en `game.js`
- Modifica los mensajes en las funciones de manejo de acciones

## 💡 Ideas de Mejoras

- Añadir niveles de dificultad
- Sistema de puntuación por tiempo
- Multijugador online
- Diferentes temas visuales
- Estadísticas de partidas
- Animaciones de explosiones
- Sonidos y música

## 📄 Licencia

Proyecto de código abierto. Úsalo libremente para proyectos personales o comerciales.

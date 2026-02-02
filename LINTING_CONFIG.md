# 🔍 Configuración de Linting

Este documento explica la configuración de linting integrada en el proyecto.

## 🛠️ Herramientas Instaladas

### ESLint + Prettier (JavaScript/JSX)
- **prettier**: Formateador de código
- **eslint-plugin-prettier**: Ejecuta Prettier como regla de ESLint
- **eslint-config-prettier**: Desactiva reglas de ESLint que entran en conflicto con Prettier

### Stylelint (CSS)
- **stylelint**: Linter para CSS
- **stylelint-config-standard**: Configuración estándar de Stylelint
- **postcss-html**: Parser para CSS en archivos HTML

## 📝 Archivos de Configuración

### `.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Reglas principales:**
- ✅ Punto y coma obligatorio
- ✅ Comillas dobles (no simples)
- ✅ Ancho máximo de línea: 80 caracteres
- ✅ Indentación: 2 espacios

### `.stylelintrc.json`
```json
{
  "extends": ["stylelint-config-standard"],
  "ignoreFiles": ["**/*.json", "node_modules/**", "dist/**"],
  "rules": {
    "color-function-notation": "legacy",
    "alpha-value-notation": "number",
    "font-family-name-quotes": "always-unless-keyword"
    // ... más reglas adaptadas al proyecto
  }
}
```

**Configuración:**
- ✅ Ignora archivos JSON (Lottie), node_modules y dist
- ✅ Permite cualquier patrón de nombres de clases CSS
- ✅ Notación legacy para colores (`rgba()` en lugar de `rgb()`)
- ✅ Valores alfa como números (0.5 en lugar de 50%)

### `eslint.config.js`
```javascript
export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'warn',
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_'
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
```

**Reglas principales:**
- ✅ Prettier como warning (no bloquea el build)
- ✅ Variables no usadas que empiecen con `_` están permitidas
- ✅ `console.warn()` y `console.error()` permitidos
- ✅ Dependencias de hooks de React verificadas

## 🚀 Scripts Disponibles

### Desarrollo
```bash
npm run dev
```
**Qué hace:** Ejecuta ESLint con auto-fix (solo errores críticos) y luego inicia Vite. Arregla automáticamente problemas simples antes de arrancar.

### Build
```bash
npm run build
```
**Qué hace:** Ejecuta linting + fixes automáticos, luego compila para producción.

### Linting Manual

#### Verificar todo (sin arreglar)
```bash
npm run lint:check
```
**Uso:** Para ver qué errores hay sin modificar archivos.

#### Arreglar todo automáticamente
```bash
npm run lint
```
**Uso:** Aplica fixes automáticos de ESLint y Stylelint.

#### Solo JavaScript
```bash
npm run lint:js        # Arregla automáticamente
npm run lint:js:check  # Solo verifica
```

#### Solo CSS
```bash
npm run lint:css       # Arregla automáticamente
npm run lint:css:check # Solo verifica
```

#### Formatear con Prettier
```bash
npm run format         # Formatea todos los archivos
npm run format:check   # Verifica sin modificar
```

## ✅ Qué Detecta el Linter

### JavaScript/JSX
- ❌ Imports sin usar
- ❌ Variables declaradas pero no usadas
- ❌ Uso de `console.log()` (permitidos: warn/error)
- ❌ Dependencias faltantes en hooks
- ⚠️ Formato inconsistente (espacios, comillas, etc.)

### CSS
- ❌ Reglas CSS duplicadas
- ❌ Selectores duplicados
- ⚠️ Nombres de fuentes sin comillas
- ⚠️ Propiedades redundantes

## 🔧 Integración con el Workflow

### Al ejecutar `npm run dev`:
1. ✅ Se ejecuta `lint:check` (verifica JS + CSS)
2. ❌ Si hay errores → NO inicia el servidor
3. ✅ Si no hay errores → Inicia Vite normalmente

### Al ejecutar `npm run build`:
1. ✅ Se ejecuta `lint` (arregla automáticamente)
2. ✅ Se compila el proyecto
3. ✅ Se genera carpeta `dist/`

## 💡 Mejores Prácticas

### Para evitar errores de linting:

1. **Variables no usadas:** Si necesitas declarar una variable pero no usarla, empieza con `_`
   ```javascript
   const [ref, _isVisible] = useScrollAnimation(); // _isVisible no se usa
   ```

2. **Imports que se usan en JSX:** Si ESLint dice que un import no se usa pero sí aparece en JSX (ej: `motion.div`), agrega:
   ```javascript
   // eslint-disable-next-line no-unused-vars -- motion se usa en JSX
   import { motion } from "framer-motion";
   ```

3. **Evitar console.log:** Usa `console.warn()` o `console.error()` en desarrollo, o elimina los logs antes de commit.

4. **CSS duplicado:** Si Stylelint se queja de selectores duplicados, revisa que no estés repitiendo la misma regla CSS.

## 📚 Referencias

- [Prettier Docs](https://prettier.io/docs/en/)
- [ESLint Docs](https://eslint.org/docs/latest/)
- [Stylelint Docs](https://stylelint.io/)

---

**Última actualización:** 31 de enero de 2026

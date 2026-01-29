# Configuración de Formspree para RSVP

## Pasos para activar el formulario:

1. **Crear cuenta en Formspree**
   - Ir a https://formspree.io
   - Crear cuenta gratuita (permite 50 envíos/mes)

2. **Crear nuevo formulario**
   - Click en "New Form"
   - Nombre: "Invitación Boda - RSVP"
   - Copiar el Form ID (formato: `xyzabc123`)

3. **Actualizar el código**
   - Abrir `src/components/RSVP/RSVP.jsx`
   - Buscar la línea 47: `const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {`
   - Reemplazar `YOUR_FORM_ID` con tu Form ID de Formspree
   - Ejemplo: `https://formspree.io/f/xyzabc123`

4. **Configurar notificaciones (Opcional)**
   - En Formspree Dashboard → Settings
   - Email notifications: Agregar tu email
   - Auto-response: Configurar mensaje automático para los invitados

5. **Testear el formulario**
   - Completar el formulario en tu sitio
   - Verificar que llegue el email
   - Revisar en Formspree Dashboard → Submissions

## Campos que se envían:

- **nombre**: Nombre completo del invitado
- **email**: Email del invitado
- **asistencia**: "Confirma asistencia" o "No puede asistir"
- **eventos**: "Civil", "Fiesta", o "Civil, Fiesta"

## Plan gratuito:

- ✅ 50 envíos por mes
- ✅ Email notifications
- ✅ Spam filtering
- ✅ File uploads (no usado en este proyecto)

Si necesitás más envíos, el plan Premium cuesta $10/mes con envíos ilimitados.

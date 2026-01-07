import { generate } from '@pdfme/generator';
import { PDFDocument } from 'pdf-lib';


// Función para manejar el cambio de selección
export function handleSelectChange(event, cliente_id) {
  const selectedValue = event.target.value;
  // Redirigir o recargar la página con los nuevos parámetros en la URL
  window.location.href = `/dashboard/plantillas?c=${cliente_id}&name=${selectedValue}`;
}


 // Función para descargar el archivo JSON
export function downloadJsonFile(json, title) {
    const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Función para leer el archivo JSON cargado
export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        resolve(json);
      } catch (err) {
        reject('El archivo no es un JSON válido.');
      }
    };
    reader.onerror = () => reject('Error al leer el archivo.');
    reader.readAsText(file);
  });
}

 // Función para llamar al servicio de eliminación
 export async function deleteFile(nameParametro, cliente_id) {
  const url = `${import.meta.env.PUBLIC_BASE_URL}/plantilla/deleteTemplate`; // Ruta del servicio
  try {
      const response = await fetch(url, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: nameParametro, cliente_id }), // Datos enviados al servidor
      });

      if (response.ok) {
          const result = await response.json();
          console.log("Plantilla eliminada exitosamente:", result);
          alert("La plantilla fue eliminada correctamente.");
          // Modificar la URL para eliminar el parámetro 'name'
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.delete('name');
          window.history.replaceState({}, document.title, currentUrl);

          // Recargar la página después de actualizar la URL
          window.location.reload();
      } else {
          const errorData = await response.json();
          console.error("Error al eliminar la plantilla:", errorData);
          alert("No se pudo eliminar la plantilla. Intenta nuevamente.");
      }
  } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Ocurrió un error al intentar eliminar la plantilla.");
  }
}


// Función para manejar la maximización/minimización
export const toggleFullscreen = () => {
  const container = document.getElementById('containerPadre');
  const layout = document.querySelector('Layout'); // El contenedor padre
  const toggleButton = document.getElementById('toggleFullscreenBtn');

  // Comprobar si el contenedor ya está maximizado
  const isMaximized = container.classList.contains('fixed');

  if (isMaximized) {
    // Restaurar el tamaño original del contenedor
    container.classList.remove('fixed', 'top-0', 'left-0', 'w-screen', 'h-screen', 'z-50');
    container.classList.add('relative', 'w-full'); // Tamaño original del contenedor sin altura fija
    layout.classList.remove('h-screen'); // Volver a la altura original del Layout

    // Asegurarse de que el Layout no ocupe toda la pantalla
    toggleButton.textContent = 'Maximizar';
  } else {
    // Maximizar el contenedor y Layout
    container.classList.add('fixed', 'top-0', 'left-0', 'w-screen', 'h-screen', 'z-50');
    container.classList.remove('relative', 'w-full');
    layout.classList.add('h-screen'); // Asegurarse de que el Layout ocupe toda la pantalla

    // Cambiar el texto del botón
    toggleButton.textContent = 'Minimizar';
  }
};

export async function handleGeneratePdf(designer, jsonContent, plugins, fonts) {
  try {
      // Obtén el template actualizado desde el Designer
      const updatedTemplate = designer.getTemplate();
    console.log(2222222222, updatedTemplate);
      // Actualiza los schemas con el JSON en los campos "multiVariableText"
        updatedTemplate.schemas = updatedTemplate.schemas.map(schema =>
            schema.map(field => {
            if (field.type === "multiVariableText" && field.content) {
                try {
                // Parsear el contenido actual
                const contentObj = JSON.parse(field.content);
                
                // Actualizar solo las propiedades que existen en el contentObj
                const updatedContent = {};
                for (const key in contentObj) {
                    if (jsonContent.hasOwnProperty(key)) {
                    updatedContent[key] = jsonContent[key];
                    } else {
                    updatedContent[key] = contentObj[key]; // Mantener el valor original
                    }
                }
                
                // Actualizar el campo con el nuevo contenido
                return {
                    ...field,
                    content: JSON.stringify(updatedContent)
                };
                } catch (e) {
                console.error(`Error parsing content for field ${field.name}:`, e);
                return field; // Si hay error, devolver el campo sin cambios
                }
            }
            return field;
            })
        );

      // Genera los inputs basados en los valores predeterminados del schema del template
      const inputs = updatedTemplate.schemas.map(schema =>
          schema.reduce((acc, field) => {
              acc[field.name] = field.content || '';
              return acc;
          }, {})
      );

      console.log("Template actualizado:", updatedTemplate);
      console.log("Inputs generados:", inputs);

      // Genera el PDF
      const pdf = await generate({
          template: updatedTemplate,
          plugins,
          inputs,
          options: {
              lang: 'es',
              font: fonts
          }
      });

      // Modificar los metadatos del PDF
      const pdfDoc = await PDFDocument.load(pdf.buffer);

      pdfDoc.setTitle('Documento');
      pdfDoc.setAuthor('Wakal 4.0');
      pdfDoc.setSubject('Facturación digital');
      pdfDoc.setProducer('Mi Compañía');
      pdfDoc.setCreator('Wakal 4.0');
      pdfDoc.setKeywords(['PDF', 'Generación', 'Metadatos', 'Facturación', 'digital', 'wakal']);

      const pdfBytes = await pdfDoc.save();

      // Crear y abrir el PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
  } catch (error) {
      console.error("Error al generar el PDF:", error);
  }
}

export async function handleSaveTemplate(designer, cliente_id, name) {
  try {
      // Obtén el template actualizado desde el Designer
      const updatedTemplate = designer.getTemplate();

      // Construir el payload para enviar al servidor
      const payload = {
          template: updatedTemplate,
          cliente_id: cliente_id || null, // Incluye el cliente_id o null si no está presente
          name: name !== 'null' ? name : null // Solo incluye el nombre si es diferente de 'null'
      };

      console.log('Payload enviado:', JSON.stringify(payload, null, 2));

      // Enviar la plantilla al servidor
      const response = await fetch(`${import.meta.env.PUBLIC_BASE_URL}/plantilla/saveTemplate`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
      });

      if (response.ok) {
          alert('Plantilla guardada exitosamente.');
      } else {
          const errorData = await response.json();
          console.error('Error del servidor:', errorData);
          alert('Error al guardar la plantilla: ' + errorData.message);
      }
  } catch (error) {
      console.error("Error al guardar la plantilla:", error);
  }
}


export function handleBasePdfChange(e, designer) {
  const file = e.target.files[0]; // Obtener el primer archivo seleccionado

  if (file && file.type === 'application/pdf') {
      // Leer el archivo como base64
      const reader = new FileReader();

      reader.onload = function (event) {
          const basePdf = event.target.result; // Obtener el base64 del archivo

          if (designer) {
              // Obtener el template actual y actualizar el basePdf
              const updatedTemplate = {
                  ...designer.getTemplate(), // Obtener el template actual
                  basePdf // Asignar el nuevo basePdf
              };

              // Actualizar el template en el diseñador
              designer.updateTemplate(updatedTemplate);

              console.log("Base PDF actualizado correctamente.");
          } else {
              alert("No se encontró el diseñador.");
          }
      };

      // Leer el archivo como base64
      reader.readAsDataURL(file);
  } else {
      alert("Por favor, seleccione un archivo PDF.");
  }
}

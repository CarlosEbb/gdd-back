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

      // pdfDoc.setTitle('Documento')
      pdfDoc.setAuthor('-')
      // pdfDoc.setSubject('Facturación digital')
      // pdfDoc.setProducer('Mi Compañía')
      pdfDoc.setCreator('-')
      //pdfDoc.setKeywords(['PDF', 'Generación', 'Metadatos', 'Facturación', 'digital', 'wakal'])

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

const basetestvertical = "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";

export function agregarImageSandbox(templateJson, width = 215.9, height = 279.28, base64Image = basetestvertical) {
  // Verificar que el template tenga la estructura esperada
  if (!templateJson.schemas || !Array.isArray(templateJson.schemas)) {
    throw new Error('El template debe tener un array schemas');
  }

  // Crear una copia profunda del objeto para no modificar el original
  const nuevoTemplate = JSON.parse(JSON.stringify(templateJson));

  // Iterar sobre cada array dentro de schemas
  nuevoTemplate.schemas = nuevoTemplate.schemas.map((schemaArray, index) => {
    // Crear una copia del array para no modificar el original
    const nuevoSchemaArray = [...schemaArray];
    
    // Crear el nuevo elemento con el nombre incrementado
    const nuevoElemento = {
      name: `TestTestLock${index + 1}`,
      type: "image",
      content: base64Image,
      position: {
        x: 0,
        y: 0.12
      },
      width: width,
      height: height,
      rotate: 0,
      opacity: 1,
      required: false
    };
    
    // Agregar el elemento al final del array
    nuevoSchemaArray.push(nuevoElemento);
    
    return nuevoSchemaArray;
  });

  return nuevoTemplate;
}

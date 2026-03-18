import { GoogleGenerativeAI } from "@google/generative-ai"

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    })

    // Variable con el base64 por defecto
    this.insertarBase64 =
      "data:image/png;base64,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"
  }

  async generateContent(prompt) {
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error generating content:", error)
      throw error
    }
  }

  // Función para reemplazar TODOS los base64 en el JSON
  reemplazarBase64(jsonString) {
    console.log("🔄 Reemplazando TODOS los base64 por valor por defecto...")

    // Patrón 1: Busca cualquier string que parezca base64 en campos "file"
    const patronFileBase64 = /"file"\s*:\s*"data:image\/[^;]+;base64,[^"]+"/gi

    // Patrón 2: Busca cualquier string que parezca base64 en campos "src" o similares
    const patronSrcBase64 = /"src"\s*:\s*"data:image\/[^;]+;base64,[^"]+"/gi

    // Patrón 3: Busca cualquier string base64 que esté en cualquier propiedad
    const patronCualquierBase64 = /"data:image\/[^;]+;base64,[^"]+"/gi

    // Patrón 4: Busca cualquier propiedad que contenga un string largo (posible base64)
    const patronLargoString = /"([^"]+)":\s*"([^"]{5000,})"/gi

    let resultado = jsonString
    let contadorReemplazos = 0

    // Reemplazo 1: Archivos base64 específicos
    resultado = resultado.replace(patronFileBase64, () => {
      contadorReemplazos++
      return `"file": "${this.insertarBase64}"`
    })

    // Reemplazo 2: Src base64
    resultado = resultado.replace(patronSrcBase64, () => {
      contadorReemplazos++
      return `"src": "${this.insertarBase64}"`
    })

    // Reemplazo 3: Cualquier base64 en cualquier lugar
    resultado = resultado.replace(patronCualquierBase64, () => {
      contadorReemplazos++
      return `"${this.insertarBase64}"`
    })

    // Reemplazo 4: Strings muy largos que podrían ser base64 mal formados
    resultado = resultado.replace(patronLargoString, (match, clave, valor) => {
      // Si el valor es muy largo y parece datos binarios, reemplazar
      if (valor.length > 5000 && valor.includes("base64")) {
        contadorReemplazos++
        return `"${clave}": "${this.insertarBase64}"`
      }
      return match
    })

    console.log(`✅ Reemplazados ${contadorReemplazos} base64 encontrados`)

    // Verificación adicional: buscar cualquier base64 restante
    const base64Restantes = (resultado.match(/base64,[^"]+/gi) || []).length
    if (base64Restantes > 0) {
      console.warn(
        `⚠️ Aún quedan ${base64Restantes} posibles base64 sin reemplazar`
      )

      // Reemplazo agresivo: cualquier cosa que contenga "base64,"
      resultado = resultado.replace(/base64,[^"]+/gi, () => {
        return `base64,${this.insertarBase64.split("base64,")[1] || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="}`
      })
    }

    return resultado
  }

  async generatePDFMESchema(prompt) {
    // const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" })

    const promptFinal = `Actúa como un experto en diseño de documentos y en la librería de JavaScript pdfme.

  Tu tarea es generar un JSON de configuración válido para un Diploma de Reconocimiento en tamaño Carta.

  Requisitos estrictos de la estructura:
  1. "pdfmeVersion": Debe ser exactamente "5.4.6".
  2. "basePdf": Debe tener width: 215.9, height: 279.4 y padding: [0, 0, 0, 0].
  3. "schemas": Debe contener exactamente un arreglo interno (representando una sola página).

  Elementos de la página (dentro del arreglo de schemas):
  Agrega los siguientes elementos, calculando posiciones (x, y) lógicas, tamaños (width, height) adecuados y usando nombres de variables descriptivos en inglés:

  * Un elemento de tipo "text" para el título del diploma (ej. "Certificate of Achievement"). Centrado y con un tamaño de fuente grande.
  * Un elemento de tipo "text" para el nombre del estudiante (variable: "studentName").
  * Un elemento de tipo "text" para la descripción del logro (variable: "description").
  * Un elemento de tipo "text" para la fecha (variable: "date").
  * Un elemento de tipo "text" para la firma del director (variable: "signature").
  * Un elemento de tipo "image" para el logo de la institución en la esquina superior izquierda (variable: "schoolLogo").

  Asegúrate de que todos los elementos sigan las propiedades estándar de los elementos de pdfme (como type, name, position, width, height, y configuraciones de fuente o alineación si es texto).

  En todos los documentos tienes que colocar texto de ejemplo para los campos tipo texto para cada campo, pero el nombre de cada campo debe ser descriptivo y en inglés.
  `

    const result = await this.model.generateContent({
      contents: [
        { role: "model", parts: [{ text: promptFinal }] },
        { role: "user", parts: [{ text: prompt }] }
      ],
      generationConfig: {
        responseMimeType: "application/json"
        // responseSchema: schema
      }
    })
    const response = await result.response
    const text = response.text()
    const jsonResponse = JSON.parse(text)
    return jsonResponse
  }

  async parsearRespuestaJSON(respuestaTexto) {
    console.log("📋 Respuesta cruda de Gemini (primeros 500 chars):")
    console.log(respuestaTexto.substring(0, 500))

    if (!respuestaTexto) {
      console.error("❌ Respuesta vacía de Gemini")
      return null
    }

    // Limpiar posibles marcadores
    let jsonLimpio = respuestaTexto.trim()

    // Remover marcadores de código
    jsonLimpio = jsonLimpio.replace(/^```(?:json)?\s*/i, "")
    jsonLimpio = jsonLimpio.replace(/\s*```$/i, "")

    // Aplicar reemplazo de TODOS los base64 ANTES de cualquier otro procesamiento
    jsonLimpio = this.reemplazarBase64(jsonLimpio)

    // Verificar si el JSON parece estar cortado
    const countOpen = (jsonLimpio.match(/{/g) || []).length
    const countClose = (jsonLimpio.match(/}/g) || []).length

    if (countOpen !== countClose) {
      console.warn(`⚠️ Desbalance de llaves: {=${countOpen}, }=${countClose}`)
      console.log("JSON posiblemente cortado. Intentando reparar...")

      // Intentar completar el JSON
      const missingBraces = countOpen - countClose
      if (missingBraces > 0) {
        // Faltan llaves de cierre
        jsonLimpio += "}".repeat(missingBraces)
        console.log(`✅ Añadidas ${missingBraces} llaves de cierre`)
      } else {
        // Faltan llaves de apertura (menos común)
        jsonLimpio = "{".repeat(-missingBraces) + jsonLimpio
        console.log(`✅ Añadidas ${-missingBraces} llaves de apertura`)
      }
    }

    // Intentar parsear
    try {
      const jsonObjeto = JSON.parse(jsonLimpio)
      console.log("✅ JSON parseado exitosamente")

      // Verificación final: buscar base64 en el objeto parseado
      this.verificarBase64EnObjeto(jsonObjeto)

      return jsonObjeto
    } catch (error) {
      console.error("❌ Error al parsear JSON:", error.message)
      console.log("Posición del error:", error.position)

      // Intentar reparar errores comunes
      return this.repararJSON(jsonLimpio, error)
    }
  }

  // Función para verificar que no queden base64 en el objeto
  verificarBase64EnObjeto(objeto) {
    const buscarBase64 = (obj, path = "") => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key

        if (typeof value === "string") {
          if (value.includes("base64")) {
            console.warn(
              `⚠️ Se encontró base64 en ${currentPath}: ${value.substring(0, 100)}...`
            )
          }
        } else if (typeof value === "object" && value !== null) {
          buscarBase64(value, currentPath)
        }
      }
    }

    buscarBase64(objeto)
  }

  repararJSON(jsonString, errorOriginal) {
    console.log("🔧 Intentando reparar JSON...")

    // Aplicar reemplazo de base64 nuevamente por si acaso
    let jsonReparado = this.reemplazarBase64(jsonString)

    try {
      // 1. Intentar reparar comillas no escapadas en contenido
      jsonReparado = jsonReparado.replace(
        /"content"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,
        (match, contenido) => {
          // Escapar comillas dobles dentro del contenido
          const contenidoEscapado = contenido.replace(/"/g, '\\"')
          return `"content": "${contenidoEscapado}"`
        }
      )

      // 2. Reparar posibles errores de comillas en texto
      jsonReparado = jsonReparado.replace(
        /"text"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,
        (match, texto) => {
          const textoEscapado = texto.replace(/"/g, '\\"')
          return `"text": "${textoEscapado}"`
        }
      )

      // 3. Remover caracteres de nueva línea no escapados
      jsonReparado = jsonReparado.replace(/\n/g, "\\n")
      jsonReparado = jsonReparado.replace(/\r/g, "\\r")

      // 4. Intentar parsear de nuevo
      const jsonObjeto = JSON.parse(jsonReparado)
      console.log("✅ JSON reparado exitosamente")
      return jsonObjeto
    } catch (error2) {
      console.error("❌ No se pudo reparar el JSON:", error2.message)

      // Último recurso: extraer solo la parte válida del JSON
      return this.extraerJSONValido(jsonString)
    }
  }

  extraerJSONValido(jsonString) {
    console.log("🔍 Intentando extraer JSON válido del texto...")

    try {
      // Aplicar reemplazo de base64 primero
      const jsonConBase64Reemplazado = this.reemplazarBase64(jsonString)

      // Buscar el primer { y el último }
      const inicio = jsonConBase64Reemplazado.indexOf("{")
      const fin = jsonConBase64Reemplazado.lastIndexOf("}") + 1

      if (inicio !== -1 && fin > inicio) {
        const posibleJSON = jsonConBase64Reemplazado.substring(inicio, fin)
        console.log(
          "Extraído (primeros 300 chars):",
          posibleJSON.substring(0, 300)
        )

        // Intentar parsear
        const resultado = JSON.parse(posibleJSON)
        console.log("✅ JSON extraído exitosamente")
        return resultado
      }
    } catch (error) {
      console.error("❌ Falló extracción de JSON:", error)
    }

    // Si todo falla, crear un JSON básico de error
    return {
      error: "No se pudo generar un JSON válido",
      schemas: [[]],
      basePdf: { width: 215.9, height: 279.4, padding: [0, 0, 0, 0] },
      pdfmeVersion: "5.4.6"
    }
  }
}

const geminiService = new GeminiService()
export default geminiService
 
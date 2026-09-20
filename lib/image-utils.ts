/**
 * Utilitário de compressão de imagens no navegador via HTML5 Canvas.
 * Reduz fotos de câmeras de celular (que chegam a 5MB-15MB) para ~80KB-150KB,
 * garantindo salvamento instantâneo no Postgres sem estourar limites do Next.js.
 */
export async function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'))
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (!dataUrl) {
        return reject(new Error('Imagem inválida.'))
      }

      const img = new Image()
      img.onerror = () => reject(new Error('Falha ao carregar a imagem para processamento.'))
      img.onload = () => {
        let { width, height } = img

        // Mantém a proporção redimensionando para caber nos limites máximos
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // Fallback se contexto 2D não estiver disponível
          return resolve(dataUrl)
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        try {
          const compressed = canvas.toDataURL('image/jpeg', quality)
          resolve(compressed)
        } catch {
          resolve(dataUrl)
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}

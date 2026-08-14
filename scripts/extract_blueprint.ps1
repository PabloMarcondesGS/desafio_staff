# Script PowerShell para renderizar o PDF e recortar o Blueprint do veículo em PNG transparente.
Add-Type -AssemblyName System.Drawing
[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType=WindowsRuntime] | Out-Null

$pdfPath = "C:\Users\Pichau\.gemini\antigravity\brain\a410488b-0e36-4a5c-9423-c8cfa19bfc8e\media__1786366788690.pdf"
$outputPath = "C:\Users\Pichau\.gemini\antigravity\scratch\desafio-staff\public\images"

if (!(Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
}

# 1. Carregar o documento PDF usando o WinRT
$file = [Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath).GetAwaiter().GetResult()
$pdfDoc = [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file).GetAwaiter().GetResult()
$page = $pdfDoc.GetPage(0)

# 2. Renderizar em stream com alta resolução (fator de escala maior para qualidade)
$options = New-Object Windows.Data.Pdf.PdfPageRenderOptions
# Queremos alta resolução, por isso aumentamos a largura de destino
$options.DestinationWidth = $page.Size.Width * 3
$tempStream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
$page.RenderToStreamAsync($tempStream, $options).GetAwaiter().GetResult()

# 3. Converter WinRT stream para .NET System.Drawing.Bitmap
$netStream = $tempStream.AsStreamForRead()
$bitmap = New-Object System.Drawing.Bitmap($netStream)

# 4. Fazer o Crop da área do Blueprint do Carro
$width = $bitmap.Width
$height = $bitmap.Height

# Proporções calculadas do screenshot:
# O blueprint fica aproximadamente:
# X: 3% a 48% da largura
# Y: 18% a 38% da altura
$cropX = [int]($width * 0.02)
$cropY = [int]($height * 0.17)
$cropW = [int]($width * 0.47)
$cropH = [int]($height * 0.20)

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$croppedBitmap = $bitmap.Clone($rect, $bitmap.PixelFormat)

# 5. Tornar o fundo branco transparente
for ($y = 0; $y -lt $croppedBitmap.Height; $y++) {
    for ($x = 0; $x -lt $croppedBitmap.Width; $x++) {
        $pixel = $croppedBitmap.GetPixel($x, $y)
        # Se for branco ou muito próximo do branco, torna transparente
        if ($pixel.R -gt 245 -and $pixel.G -gt 245 -and $pixel.B -gt 245) {
            $croppedBitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        }
    }
}

# Salvar a imagem final
$finalPath = Join-Path $outputPath "car_blueprint.png"
$croppedBitmap.Save($finalPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Liberar recursos
$croppedBitmap.Dispose()
$bitmap.Dispose()
$netStream.Dispose()
$tempStream.Dispose()

echo "Blueprint extraído com sucesso em: $finalPath"

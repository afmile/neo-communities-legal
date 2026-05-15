Add-Type -AssemblyName System.Drawing

$outDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Save-Png($bmp, $name) {
    $path = Join-Path $outDir $name
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "  $name - $($bmp.Width)x$($bmp.Height)"
}

# Fonts
$fontBold12   = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontReg10    = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Regular)
$fontTitle    = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$fontSmall    = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
$fontTiny     = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Regular)

function Draw-Centered($g, $text, $font, $brush, $x, $y) {
    $size = $g.MeasureString($text, $font)
    $g.DrawString($text, $font, $brush, $x - $size.Width/2, $y - $size.Height/2)
}

# Shared colors
$colBg      = [System.Drawing.Color]::FromArgb(20, 20, 25)
$colWhite   = [System.Drawing.Color]::FromArgb(180, 240, 240, 245)
$colStretch = [System.Drawing.Color]::FromArgb(40, 110, 91, 255)
$colSafe    = [System.Drawing.Color]::FromArgb(40, 40, 200, 100)
$colCorner  = [System.Drawing.Color]::FromArgb(60, 255, 130, 170)
$colTail    = [System.Drawing.Color]::FromArgb(200, 255, 190, 80)
$colRed     = [System.Drawing.Color]::FromArgb(60, 220, 50, 50)
$colPurple  = [System.Drawing.Color]::FromArgb(30, 110, 91, 255)

$penWhite   = New-Object System.Drawing.Pen($colWhite, 2)
$penStretch = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 140, 120, 255), 1.5)
$penSafe    = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 60, 220, 110), 1.5)
$penCorner  = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 255, 130, 170), 1.5)
$penRed     = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 255, 70, 70), 2.5)
$penFrame   = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 240, 240, 245), 3)
$penCanvas  = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 160, 160, 165), 1)

$brushWhite   = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 255, 255, 255))
$brushStretch = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(13, 110, 91, 255))
$brushSafe    = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 40, 200, 90))
$brushCorner  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 255, 115, 155))
$brushRed     = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(65, 220, 50, 50))
$brushAmber   = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 190, 80))
$brushPinkText   = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 150, 180))
$brushGreenText  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 80, 240, 120))
$brushPurpleText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 170, 150, 255))
$brushRedText    = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 90, 90))
$brushAmberText  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 210, 60))
$brushMutedText  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 200, 200, 210))

$penStretch.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$penSafe.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$penRed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

# Build outgoing bubble body path (rounded rect 0,0 to 340,400, r=20)
function Build-BubbleBodyPath {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$p.AddArc(0, 0, 40, 40, 180, 90)
    [void]$p.AddLine(20, 0, 320, 0)
    [void]$p.AddArc(300, 0, 40, 40, 270, 90)
    [void]$p.AddLine(340, 20, 340, 380)
    [void]$p.AddArc(300, 360, 40, 40, 0, 90)
    [void]$p.AddLine(320, 400, 20, 400)
    [void]$p.AddArc(0, 360, 40, 40, 90, 90)
    [void]$p.AddLine(0, 380, 0, 20)
    [void]$p.CloseFigure()
    return $p
}

# Build smooth outgoing tail (top-right, bezier curve)
function Build-OutgoingTailPath {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$p.AddBezier(340, 20, 354, 24, 354, 36, 340, 40)
    [void]$p.CloseFigure()
    return $p
}

# Build smooth incoming tail (top-left, bezier curve)
function Build-IncomingTailPath {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$p.AddBezier(20, 20, 6, 24, 6, 36, 20, 40)
    [void]$p.CloseFigure()
    return $p
}

function Draw-Zones($g) {
    # Stretch zone (40,56,280,304)
    $g.FillRectangle($brushStretch, 40, 56, 280, 304)
    $g.DrawRectangle($penStretch, 40, 56, 280, 304)
    # Safe text area (64,80,232,256)
    $g.FillRectangle($brushSafe, 64, 80, 232, 256)
    $g.DrawRectangle($penSafe, 64, 80, 232, 256)
    # Corner zones
    $g.FillRectangle($brushCorner, 0, 0, 40, 56)
    $g.DrawRectangle($penCorner, 0, 0, 40, 56)
    $g.FillRectangle($brushCorner, 320, 0, 40, 56)
    $g.DrawRectangle($penCorner, 320, 0, 40, 56)
    $g.FillRectangle($brushCorner, 0, 360, 40, 40)
    $g.DrawRectangle($penCorner, 0, 360, 40, 40)
    $g.FillRectangle($brushCorner, 320, 360, 40, 40)
    $g.DrawRectangle($penCorner, 320, 360, 40, 40)
}

function Draw-Labels($g, $tailX) {
    Draw-Centered $g "Zona limpia" $fontTitle $brushGreenText 180 186
    Draw-Centered $g "para el texto" $fontReg10 $brushGreenText 180 210
    Draw-Centered $g "Zona que se estira" $fontBold12 $brushPurpleText 180 74
    if ($tailX -gt 200) {
        # Outgoing: tail on right
        $g.DrawString("Esquinas", $fontBold12, $brushPinkText, 6, 26)
        Draw-Centered $g "Cola" $fontBold12 $brushAmber 346 30
    } else {
        # Incoming: tail on left
        $g.DrawString("Esquinas", $fontBold12, $brushPinkText, 310, 26)
        $g.DrawStringFormat("Cola", $fontBold12, $brushAmber, (New-Object System.Drawing.RectangleF(0, 18, 28, 24)), ([System.Drawing.StringFormat]::new([System.Drawing.StringAlignment]::Center, [System.Drawing.StringAlignment]::Center)))
    }
}

# ============================================================
# 1. BUBBLE SIMPLE - 360x400 - outgoing variant (what artist creates)
# ============================================================
$bmp = New-Object System.Drawing.Bitmap(360, 400)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear($colBg)

$g.DrawRectangle($penCanvas, 0, 0, 359, 399)

$bodyPath = Build-BubbleBodyPath
$tailPath = Build-OutgoingTailPath

$fillBubble = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(8, 255, 255, 255))
$g.FillPath($fillBubble, $bodyPath)
$g.DrawPath($penWhite, $bodyPath)
$g.FillPath($fillBubble, $tailPath)
$g.DrawPath($penWhite, $tailPath)

# Avatar hint (top-right, near tail)
$brushAvatar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 110, 91, 255))
$penAvatar = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 110, 91, 255), 1)
$g.FillEllipse($brushAvatar, 332, 0, 16, 16)
$g.DrawEllipse($penAvatar, 332, 0, 16, 16)

Draw-Zones $g

# Labels
Draw-Centered $g "Zona limpia" $fontTitle $brushGreenText 180 186
Draw-Centered $g "para el texto" $fontReg10 $brushGreenText 180 210
Draw-Centered $g "Zona que se estira" $fontBold12 $brushPurpleText 180 74
$g.DrawString("Esquinas", $fontBold12, $brushPinkText, 6, 26)
Draw-Centered $g "Cola" $fontBold12 $brushAmber 346 30

$g.Dispose()
Save-Png $bmp "bubble-template-simple.png"
$bmp.Dispose()

# ============================================================
# 2. BUBBLE ADVANCED - 360x400 - incoming variant (mirrored)
# ============================================================
$bmp = New-Object System.Drawing.Bitmap(360, 400)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear($colBg)

$g.DrawRectangle($penCanvas, 0, 0, 359, 399)

$bodyPath2 = Build-BubbleBodyPath
$tailPath2 = Build-IncomingTailPath

$g.FillPath($fillBubble, $bodyPath2)
$g.DrawPath($penWhite, $bodyPath2)
$g.FillPath($fillBubble, $tailPath2)
$g.DrawPath($penWhite, $tailPath2)

# Avatar hint (top-left, near tail)
$g.FillEllipse($brushAvatar, 12, 0, 16, 16)
$g.DrawEllipse($penAvatar, 12, 0, 16, 16)

# 9-patch grid lines
$penGrid = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 200, 200, 210), 1)
$penGrid.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dot
$g.DrawLine($penGrid, 40, 0, 40, 400)
$g.DrawLine($penGrid, 320, 0, 320, 400)
$g.DrawLine($penGrid, 0, 56, 340, 56)
$g.DrawLine($penGrid, 0, 360, 340, 360)

Draw-Zones $g

# Content padding (dash-dot)
$penPad = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 140, 120, 255), 1.5)
$penPad.DashStyle = [System.Drawing.Drawing2D.DashStyle]::DashDot
$g.DrawRectangle($penPad, 48, 64, 264, 288)

# Labels - technical
$brushBlueText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 120, 170, 255))
$brushAmberText2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 190, 80))

Draw-Centered $g "H-Stretch" $fontBold12 $brushBlueText 180 28
Draw-Centered $g "H-Stretch" $fontBold12 $brushBlueText 180 380
Draw-Centered $g "V-Stretch" $fontBold12 $brushAmberText2 20 208
Draw-Centered $g "V-Stretch" $fontBold12 $brushAmberText2 340 208
Draw-Centered $g "Center 280x304" $fontBold12 $brushMutedText 180 56
Draw-Centered $g "Safe text area" $fontBold12 $brushGreenText 180 188
Draw-Centered $g "content padding [48,64,48,48]" $fontSmall $brushPurpleText 180 260
Draw-Centered $g "Cola" $fontBold12 $brushAmber 14 30

$g.DrawString("Canvas: 360x400px", $fontSmall, $brushMutedText, 4, 4)
$g.DrawString("centerSlice: Rect.fromLTRB(40,56,320,360)", $fontTiny, $brushMutedText, 4, 18)

$g.Dispose()
Save-Png $bmp "bubble-template-advanced.png"
$bmp.Dispose()

# ============================================================
# 3. FRAME SIMPLE - 360x360
# ============================================================
$bmp = New-Object System.Drawing.Bitmap(360, 360)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear($colBg)

$g.DrawRectangle($penCanvas, 0, 0, 359, 359)

# Outer overflow - annular between r=144 and r=180
$penOuter = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 140, 120, 255), 2)
$penOuter.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$brushOuter = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 110, 91, 255))
$g.FillEllipse($brushOuter, 0, 0, 360, 360)
$g.DrawEllipse($penOuter, 2, 2, 355, 355)

# Frame ring - r=144 fills center to override outer overflow
$brushRingBg = New-Object System.Drawing.SolidBrush($colBg)
$g.FillEllipse($brushRingBg, 36, 36, 288, 288)
$g.DrawEllipse($penFrame, 36, 36, 288, 288)

# Protected zone - r=132
$g.FillEllipse($brushRed, 48, 48, 264, 264)
$g.DrawEllipse($penRed, 48, 48, 264, 264)

# Avatar placeholder
$brushPerson = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 210, 210, 220))
$g.FillEllipse($brushPerson, 100, 100, 160, 160)
$g.FillEllipse($brushPerson, 110, 134, 140, 110)
$g.FillEllipse([System.Drawing.SolidBrush]::new($colBg), 112, 112, 136, 136)

# Labels
Draw-Centered $g "Foto del usuario" $fontTitle $brushRedText 180 170
Draw-Centered $g "(no tapes aqui)" $fontReg10 $brushRedText 180 194
Draw-Centered $g "Puedes sobresalir un poco" $fontBold12 $brushAmberText 180 34
Draw-Centered $g "Dibuja el marco aqui" $fontTitle $brushWhite 180 320

$g.Dispose()
Save-Png $bmp "frame-template-simple.png"
$bmp.Dispose()

# ============================================================
# 4. FRAME ADVANCED - 360x360
# ============================================================
$bmp = New-Object System.Drawing.Bitmap(360, 360)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear($colBg)

$g.DrawRectangle($penCanvas, 0, 0, 359, 359)

$g.FillEllipse($brushOuter, 0, 0, 360, 360)
$g.DrawEllipse($penOuter, 2, 2, 355, 355)

$g.FillEllipse($brushRingBg, 36, 36, 288, 288)
$penBoundary = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 240, 240, 245), 3)
$g.DrawEllipse($penBoundary, 36, 36, 288, 288)

# Inner overlap zone
$brushInner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 220, 160, 50))
$g.FillEllipse($brushInner, 48, 48, 264, 264)
$penInner = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 255, 190, 80), 2)
$g.DrawEllipse($penInner, 48, 48, 264, 264)

# Protected zone
$g.FillEllipse($brushRed, 48, 48, 264, 264)
$g.DrawEllipse($penRed, 48, 48, 264, 264)

# Avatar placeholder
$g.FillEllipse($brushPerson, 100, 100, 160, 160)
$g.FillEllipse($brushPerson, 110, 134, 140, 110)
$g.FillEllipse([System.Drawing.SolidBrush]::new($colBg), 112, 112, 136, 136)

# Labels
Draw-Centered $g "Outer overflow (36px)" $fontBold12 $brushBlueText 180 14
Draw-Centered $g "Frame ring (r=144)" $fontBold12 $brushWhite 180 298
Draw-Centered $g "Inner overlap (12px)" $fontBold12 $brushAmberText2 180 254
Draw-Centered $g "Protected zone (r=132)" $fontTitle $brushRedText 180 170
Draw-Centered $g "(debe quedar transparente)" $fontReg10 $brushRedText 180 194
$g.DrawString("Canvas: 360x360px", $fontSmall, $brushMutedText, 4, 346)

$g.Dispose()
Save-Png $bmp "frame-template-advanced.png"
$bmp.Dispose()

# ============================================================
# 5. STICKER - 512x512
# ============================================================
$bmp = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear($colBg)

$penStickerCanvas = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 230, 230, 240), 3)
$g.DrawRectangle($penStickerCanvas, 0, 0, 511, 511)

# Center crosshair
$penCross = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 180, 180, 190), 1)
$penCross.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dot
$g.DrawLine($penCross, 256, 40, 256, 472)
$g.DrawLine($penCross, 40, 256, 472, 256)

# Center safe area circle
$penSafeSticker = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 140, 120, 255), 1.5)
$penSafeSticker.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$brushSafeSticker = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 110, 90, 255))
$g.FillEllipse($brushSafeSticker, 86, 86, 340, 340)
$g.DrawEllipse($penSafeSticker, 86, 86, 340, 340)

# Center dot
$g.FillEllipse([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(100, 255, 255, 255)), 251, 251, 10, 10)

$fontStickerBig = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
$fontStickerReg = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Regular)
$fontStickerSmall = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Regular)

Draw-Centered $g "STICKER" $fontStickerBig $brushPurpleText 256 56
Draw-Centered $g "512x512px" $fontStickerReg $brushPurpleText 256 90
Draw-Centered $g "Dibuja tu diseno aqui" $fontStickerReg $brushWhite 256 130
Draw-Centered $g "(diseno centrado recomendado)" $fontStickerSmall $brushWhite 256 158
Draw-Centered $g "Exporta como PNG transparente" $fontStickerReg $brushGreenText 256 434
Draw-Centered $g "Sin fondo cuadrado" $fontStickerSmall $brushGreenText 256 464

$g.Dispose()
Save-Png $bmp "sticker-template.png"
$bmp.Dispose()

Write-Host "`nAll 5 templates generated (matching page SVGs)."
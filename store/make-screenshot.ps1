Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot "screenshot-como-funciona.jpg"
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$bmp.SetResolution(96, 96)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.Clear([System.Drawing.Color]::FromArgb(255, 232, 240, 237))

function New-Color([int]$r, [int]$g, [int]$b) {
  [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
}

function New-RoundPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc(($x + $w - $d), $y, $d, $d, 270, 90)
  $path.AddArc(($x + $w - $d), ($y + $h - $d), $d, $d, 0, 90)
  $path.AddArc($x, ($y + $h - $d), $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Round {
  param($Graphics, $Brush, $Pen, [single]$X, [single]$Y, [single]$W, [single]$H, [single]$R)
  $path = New-RoundPath $X $Y $W $H $R
  if ($Brush) { $Graphics.FillPath($Brush, $path) }
  if ($Pen) { $Graphics.DrawPath($Pen, $path) }
  $path.Dispose()
}

$ink = New-Color 20 34 31
$muted = New-Color 90 112 106
$teal = New-Color 15 118 110
$line = New-Color 197 213 209
$white = New-Color 255 255 255
$page = New-Color 247 250 249
$field = New-Color 255 255 255
$chip = New-Color 220 236 232

$fontTitle = New-Object System.Drawing.Font "Segoe UI", 22, ([System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font "Segoe UI", 12
$fontUi = New-Object System.Drawing.Font "Segoe UI", 11
$fontSmall = New-Object System.Drawing.Font "Segoe UI", 9
$fontLabel = New-Object System.Drawing.Font "Segoe UI", 9
$fontValue = New-Object System.Drawing.Font "Segoe UI", 11
$fontButton = New-Object System.Drawing.Font "Segoe UI", 11, ([System.Drawing.FontStyle]::Bold)
$fontPage = New-Object System.Drawing.Font "Segoe UI", 18, ([System.Drawing.FontStyle]::Bold)

$brushInk = New-Object System.Drawing.SolidBrush $ink
$brushMuted = New-Object System.Drawing.SolidBrush $muted
$brushWhite = New-Object System.Drawing.SolidBrush $white
$brushTeal = New-Object System.Drawing.SolidBrush $teal
$brushPage = New-Object System.Drawing.SolidBrush $page
$brushChip = New-Object System.Drawing.SolidBrush $chip
$penLine = New-Object System.Drawing.Pen $line, 1
$penTeal = New-Object System.Drawing.Pen $teal, 1.5

$g.DrawString("InHire Autofill", $fontTitle, $brushInk, 48, 22)
$g.DrawString("Um clique preenche a etapa Information. O perfil fica só neste Chrome.", $fontSub, $brushMuted, 50, 58)

function Draw-Step([single]$x, [string]$n, [string]$text) {
  Draw-Round $g $brushChip $null $x 96 250 32 16
  $badge = New-Object System.Drawing.SolidBrush (New-Color 15 118 110)
  Draw-Round $g $badge $null ($x + 8) 102 20 20 10
  $g.DrawString($n, $fontSmall, $brushWhite, ($x + 13), 105)
  $g.DrawString($text, $fontSmall, $brushInk, ($x + 34), 104)
  $badge.Dispose()
}

Draw-Step 48 "1" "Salve o perfil"
Draw-Step 312 "2" "Abra a vaga no InHire"
Draw-Step 576 "3" "Clique em Preencher"

$bx = 48
$by = 148
$bw = 1184
$bh = 620
Draw-Round $g (New-Object System.Drawing.SolidBrush (New-Color 255 255 255)) $null $bx $by $bw $bh 16
$bar = New-Object System.Drawing.SolidBrush (New-Color 241 243 244)
$g.FillRectangle($bar, $bx, ($by + 16), $bw, 40)
$g.FillRectangle($brushWhite, $bx, ($by + 16), $bw, 8)

foreach ($dot in @(20, 36, 52)) {
  $c = if ($dot -eq 20) { New-Color 237 106 94 } elseif ($dot -eq 36) { New-Color 245 191 79 } else { New-Color 98 197 84 }
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $c), ($bx + $dot), ($by + 28), 12, 12)
}

Draw-Round $g (New-Object System.Drawing.SolidBrush (New-Color 255 255 255)) $penLine ($bx + 360) ($by + 24) 460 26 13
$g.DrawString("empresa.inhire.app/vagas/pessoa-desenvolvedora", $fontSmall, $brushMuted, ($bx + 376), ($by + 29))

Draw-Round $g $brushTeal $null ($bx + $bw - 58) ($by + 24) 26 26 6
$iconFont = New-Object System.Drawing.Font "Segoe UI", 8, ([System.Drawing.FontStyle]::Bold)
$g.DrawString("IH", $iconFont, $brushWhite, ($bx + $bw - 52), ($by + 29))

$g.FillRectangle($brushPage, ($bx + 1), ($by + 56), ($bw - 2), ($bh - 72))

$g.DrawString("Information", $fontPage, $brushInk, ($bx + 36), ($by + 76))
$g.DrawString("Etapa da candidatura", $fontSmall, $brushMuted, ($bx + 38), ($by + 108))

function Draw-Field([single]$x, [single]$y, [string]$label, [string]$value) {
  $g.DrawString($label, $fontLabel, $brushMuted, $x, $y)
  Draw-Round $g $brushWhite $penLine $x ($y + 18) 320 36 8
  $g.DrawString($value, $fontValue, $brushInk, ($x + 12), ($y + 26))
}

$fx = $bx + 36
$fy = $by + 142
Draw-Field $fx $fy "Nome completo" "Maria Oliveira"
Draw-Field ($fx + 348) $fy "E-mail" "maria@email.com"
Draw-Field $fx ($fy + 70) "CPF" "123.456.789-09"
Draw-Field ($fx + 348) ($fy + 70) "Telefone" "11999998888"
Draw-Field $fx ($fy + 140) "LinkedIn" "linkedin.com/in/maria"
Draw-Field ($fx + 348) ($fy + 140) "Cidade" "São Paulo"
Draw-Field $fx ($fy + 210) "Currículo" "curriculo.pdf"
Draw-Field ($fx + 348) ($fy + 210) "Pretensão salarial" "R$ 15.000,00"

$g.DrawString("Tipo de contrato", $fontLabel, $brushMuted, $fx, ($fy + 280))
Draw-Round $g $brushChip $null $fx ($fy + 300) 72 32 16
$g.DrawString("CLT", $fontButton, $brushTeal, ($fx + 22), ($fy + 306))
Draw-Round $g $brushWhite $penLine ($fx + 84) ($fy + 300) 64 32 16
$g.DrawString("PJ", $fontUi, $brushMuted, ($fx + 106), ($fy + 306))

$floatX = $bx + $bw - 210
$floatY = $by + $bh - 118
Draw-Round $g $brushWhite $null $floatX $floatY 180 46 8
$shadow = New-Object System.Drawing.Pen (New-Color 220 228 226), 1
Draw-Round $g $null $shadow $floatX $floatY 180 46 8
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF $floatX, ($floatY + 8), 180, 32
$g.DrawString("Campos preenchidos.", $fontSmall, $brushInk, $rect, $format)
Draw-Round $g $brushTeal $null $floatX ($floatY + 52) 180 40 8
$rect2 = New-Object System.Drawing.RectangleF $floatX, ($floatY + 62), 180, 24
$g.DrawString("Preencher", $fontButton, $brushWhite, $rect2, $format)

$px = $bx + $bw - 292
$py = $by + 58
Draw-Round $g $brushPage $null $px $py 250 188 12
$popPen = New-Object System.Drawing.Pen (New-Color 210 222 219), 1
Draw-Round $g $null $popPen $px $py 250 188 12
$g.DrawString("InHire Autofill", $fontButton, $brushInk, ($px + 16), ($py + 16))
$g.DrawString("Preenche só a etapa Information.", $fontSmall, $brushMuted, ($px + 16), ($py + 42))
Draw-Round $g $brushTeal $null ($px + 16) ($py + 78) 218 40 8
$rect3 = New-Object System.Drawing.RectangleF ($px + 16), ($py + 88), 218, 24
$g.DrawString("Preencher esta página", $fontButton, $brushWhite, $rect3, $format)
Draw-Round $g $brushWhite $penTeal ($px + 16) ($py + 128) 218 40 8
$rect4 = New-Object System.Drawing.RectangleF ($px + 16), ($py + 138), 218, 24
$g.DrawString("Editar perfil", $fontButton, $brushTeal, $rect4, $format)

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoder = [System.Drawing.Imaging.Encoder]::Quality
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $encoder, ([long]92)
$bmp.Save($out, $codec, $params)

$g.Dispose()
$bmp.Dispose()
Write-Output $out

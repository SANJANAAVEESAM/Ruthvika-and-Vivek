<#
  Cuts an mp3 so that it BEGINS at a chosen second, and writes it to the site.

  Why cut instead of telling the page to "start at 0:53": phones often ignore a
  jump forward inside an audio file that has not fully loaded, so the song would
  play from the top. A file that simply starts at the right place has nothing to
  skip, so it behaves the same on every phone.

  Usage (from the "Elegant Invitation Journey" folder):

    powershell -ExecutionPolicy Bypass -File tools\cut-song.ps1 `
        -Source "C:\path\to\the-full-song.mp3" -Start 53 -End 115

  -Start and -End are in seconds (0:53 is 53, 1:55 is 115). Leave -End off to
  keep everything to the end of the song. The result replaces public/music/invitation.mp3.
  The cut lands on a frame boundary, within about 0.03 s of the time asked for.
  Keep the full-length original somewhere safe; run this from it each time.
#>
param(
  [Parameter(Mandatory = $true)] [string] $Source,
  [Parameter(Mandatory = $true)] [double] $Start,
  [double] $End = 0,
  [string] $Out = ""
)

# Default: the site's song file, next to this tools folder.
if (-not $Out) {
  $here = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
  $Out = Join-Path $here "..\public\music\invitation.mp3"
}

Add-Type -TypeDefinition @'
using System; using System.IO;
public static class Mp3Cut {
  static readonly int[] BR1 = {0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0};
  static readonly int[] BR2 = {0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0};
  static readonly int[] SR1 = {44100,48000,32000,0};
  public static string Cut(string src, string dst, double startSec, double endSec) {
    byte[] b = File.ReadAllBytes(src);
    int pos = 0;
    // Skip the ID3 tag (title, artwork) at the front, if there is one.
    if (b.Length > 10 && b[0]=='I' && b[1]=='D' && b[2]=='3') {
      int size = (b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9];
      pos = 10 + size;
    }
    double t = 0; int cut = -1, lastEnd = -1, frames = 0; double cutAt = 0;
    while (pos + 4 <= b.Length) {
      if (b[pos] == 0xFF && (b[pos+1] & 0xE0) == 0xE0) {
        int ver = (b[pos+1] >> 3) & 3, layer = (b[pos+1] >> 1) & 3;
        int brIdx = (b[pos+2] >> 4) & 0xF, srIdx = (b[pos+2] >> 2) & 3, pad = (b[pos+2] >> 1) & 1;
        if (ver == 1 || layer != 1 || brIdx == 0 || brIdx == 15 || srIdx == 3) { pos++; continue; }
        int br = (ver == 3 ? BR1[brIdx] : BR2[brIdx]) * 1000;
        int sr = ver == 3 ? SR1[srIdx] : (ver == 2 ? SR1[srIdx] / 2 : SR1[srIdx] / 4);
        int spf = ver == 3 ? 1152 : 576;
        int len = (ver == 3 ? 144 : 72) * br / sr + pad;
        // A real frame is followed by another sync word (or the end of the file).
        if (pos + len + 2 <= b.Length && !(b[pos+len] == 0xFF && (b[pos+len+1] & 0xE0) == 0xE0)) { pos++; continue; }
        // Past the end point: stop here; the last whole frame before it is the last one kept.
        if (endSec > 0 && cut >= 0 && t >= endSec) break;
        if (cut < 0 && t >= startSec) { cut = pos; cutAt = t; }
        t += (double)spf / sr; pos += len; lastEnd = pos; frames++;
      } else pos++;
    }
    if (cut < 0 || lastEnd < 0) return "no cut point found (is the start past the end of the song?)";
    byte[] outb = new byte[lastEnd - cut];
    Array.Copy(b, cut, outb, 0, outb.Length);
    File.WriteAllBytes(dst, outb);
    return string.Format("starts at {0:F3}s, ends at {1:F3}s; kept {2:F1}s; {3:F2} MB", cutAt, t, t - cutAt, outb.Length / 1048576.0);
  }
}
'@

$out = [IO.Path]::GetFullPath($Out)
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
[Mp3Cut]::Cut((Resolve-Path -LiteralPath $Source).Path, $out, $Start, $End)
"written to $out"

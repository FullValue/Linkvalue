"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import qrcode from "qrcode-generator";
import { Download, ImagePlus, QrCode, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { profileDisplayUrl, profileUrl } from "@/lib/site";

/** Internal render resolution — large so downloads stay crisp when printed. */
const SIZE = 1024;
/** Quiet-zone width in modules (QR spec recommends 4). */
const QUIET = 4;
const MAX_LOGO_BYTES = 3 * 1024 * 1024;

/** Brand colour straight from the CSS token so the QR badge matches the theme. */
function brandColor() {
  if (typeof window === "undefined") return "#5b3df5";
  const v = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim();
  return v || "#5b3df5";
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function QrCodeButton({
  username,
  displayName,
}: {
  username: string;
  displayName: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const url = profileUrl(username);
  const initial = (displayName?.trim() || username).charAt(0).toUpperCase() || "•";

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Build the matrix. Type 0 = auto-size; level H tolerates ~30% occlusion,
    // which is what lets a centre logo sit on top without breaking scans.
    const qr = qrcode(0, "H");
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const cell = SIZE / (count + QUIET * 2);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = "#0b0b0c";
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (!qr.isDark(r, c)) continue;
        const x = (c + QUIET) * cell;
        const y = (r + QUIET) * cell;
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(cell), Math.ceil(cell));
      }
    }

    if (!showLogo) return;

    const badge = SIZE * 0.22;
    const x = (SIZE - badge) / 2;
    const y = (SIZE - badge) / 2;
    const pad = badge * 0.14;
    const radius = badge * 0.26;

    // White knockout so the badge reads cleanly over the modules.
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(x - pad, y - pad, badge + pad * 2, badge + pad * 2, radius + pad * 0.6);
    ctx.fill();

    if (logoSrc) {
      const img = await loadImage(logoSrc);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, badge, badge, radius);
      ctx.clip();
      // Cover-fit the imported image into the square.
      const ar = img.width / img.height;
      let dw = badge;
      let dh = badge;
      let dx = x;
      let dy = y;
      if (ar > 1) {
        dw = badge * ar;
        dx = x - (dw - badge) / 2;
      } else {
        dh = badge / ar;
        dy = y - (dh - badge) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = brandColor();
      ctx.beginPath();
      ctx.roundRect(x, y, badge, badge, radius);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${badge * 0.56}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initial, SIZE / 2, SIZE / 2 + badge * 0.02);
    }
  }, [url, showLogo, logoSrc, initial]);

  useEffect(() => {
    if (open) void draw();
  }, [open, draw]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Image must be under 3 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoSrc(reader.result as string);
      setShowLogo(true);
    };
    reader.onerror = () => toast.error("Couldn't read that image");
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${username}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 px-2.5" title="QR code">
          <QrCode className="size-3.5" />
          <span className="hidden sm:inline">QR</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR code</DialogTitle>
          <DialogDescription>Points to {profileDisplayUrl(username)}</DialogDescription>
        </DialogHeader>

        <div className="grid place-items-center">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="border-border/60 size-56 rounded-xl border bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="qr-logo" className="font-normal">
            Centre logo
          </Label>
          <Switch id="qr-logo" checked={showLogo} onCheckedChange={setShowLogo} />
        </div>

        {showLogo && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="size-3.5" />
              {logoSrc ? "Replace image" : "Import image"}
            </Button>
            {logoSrc && (
              <Button variant="ghost" size="sm" onClick={() => setLogoSrc(null)}>
                <RotateCcw className="size-3.5" />
                Default
              </Button>
            )}
          </div>
        )}

        <Button onClick={download} className="w-full">
          <Download className="size-4" />
          Download PNG
        </Button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
      </DialogContent>
    </Dialog>
  );
}

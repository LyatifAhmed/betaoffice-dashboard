// components/wallet/WithdrawDialog.tsx
"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  balanceGBP: number;           // cüzdan GBP
  guessCountry?: string | null; // "United Kingdom", "Türkiye", "Germany"...
  onSuccess?: () => void;       // başarılı çekim sonrası (mutate gibi)
};

/** kaba bir bölge tahmini: TR ve EU için tavsiyeleri öne çıkarmak */
function guessRegion(country?: string | null): "UK" | "EU" | "TR" | "NON_EU" {
  const c = (country || "").toLowerCase();
  if (/united\s*kingdom|uk|england|scotland|wales|northern ireland/.test(c)) return "UK";
  if (/türkiye|turkiye|turkey/.test(c)) return "TR";
  // basit EU listesi (özet)
  if (/(germany|france|italy|spain|netherlands|belgium|austria|ireland|portugal|greece|finland|sweden|denmark|poland|czech|hungary|romania|bulgaria|croatia|slovak|slovenia|estonia|latvia|lithuania|luxembourg|cyprus|malta)/.test(c)) {
    return "EU";
  }
  return "NON_EU";
}

type Method =
  | "UK_FPS"        // UK Faster Payments (GBP)
  | "SEPA"          // Euro SEPA
  | "SWIFT"         // International SWIFT
  | "PAYPAL"        // PayPal Payout
  | "CRYPTO"        // USDT/USDC payout
  | "GIFT_CARD";    // Amazon vb.

const pretty: Record<Method, string> = {
  UK_FPS: "UK Bank (Faster Payments • GBP)",
  SEPA: "EU Bank (SEPA • EUR)",
  SWIFT: "International (SWIFT)",
  PAYPAL: "PayPal",
  CRYPTO: "Crypto (USDT/USDC)",
  GIFT_CARD: "Gift Card (Amazon, vb.)",
};

type CryptoNetwork = "TRC20" | "ERC20" | "Polygon";
type GiftBrand = "Amazon" | "Apple" | "Steam" | "Google Play";

/** yaklaşık masraf hesaplayıcı (örnek oranlar; backend'e quote isteği atman daha doğru olur) */
function feeEstimateGBP(
  method: Method,
  amountGBP: number,
  region: ReturnType<typeof guessRegion>,
  network?: CryptoNetwork
): number {
  if (amountGBP <= 0) return 0;

  switch (method) {
    case "UK_FPS":
      return 0.5; // sabit küçük ücret
    case "SEPA":
      return 1.0; // EUR SEPA ucuz
    case "SWIFT":
      // SWIFT pahalı: sabit + yüzde
      return Math.max(15, amountGBP * 0.006);
    case "PAYPAL":
      // tipik PayPal ticari oranına yakın
      return Math.max(0.3, amountGBP * 0.034) + 0.3;
    case "CRYPTO": {
      // TR için TRC20 öner — çok düşük network fee
      if (network === "TRC20") return 1.0;
      if (network === "Polygon") return 0.5;
      return 5.0; // ERC20
    }
    case "GIFT_CARD":
      // hediye kartta kesinti yok gibi varsay (bazı sağlayıcılarda %0–2 olabilir)
      return 0;
  }
}

/** amount sonrası kullanıcıya geçecek net GBP */
function netAmountGBP(method: Method, amountGBP: number, region: ReturnType<typeof guessRegion>, network?: CryptoNetwork) {
  const fee = feeEstimateGBP(method, amountGBP, region, network);
  return Math.max(0, amountGBP - fee);
}

export default function WithdrawDialog({
  open,
  onOpenChange,
  balanceGBP,
  guessCountry,
  onSuccess,
}: Props) {
  const region = useMemo(() => guessRegion(guessCountry), [guessCountry]);

  const [method, setMethod] = useState<Method>(
    region === "UK" ? "UK_FPS" : region === "EU" ? "SEPA" : "CRYPTO"
  );
  const [amount, setAmount] = useState<string>("25");

  // form alanları
  const [iban, setIban] = useState("");           // SEPA/SWIFT
  const [swift, setSwift] = useState("");         // SWIFT
  const [ukSort, setUkSort] = useState("");       // UK FPS
  const [ukAcct, setUkAcct] = useState("");       // UK FPS
  const [paypal, setPaypal] = useState("");       // PayPal email
  const [cryptoAddr, setCryptoAddr] = useState(""); // crypto
  const [cryptoNet, setCryptoNet] = useState<CryptoNetwork>("TRC20");
  const [giftBrand, setGiftBrand] = useState<GiftBrand>("Amazon");
  const [giftEmail, setGiftEmail] = useState("");

  const [busy, setBusy] = useState(false);

  const amt = Number(amount || 0);
  const fee = feeEstimateGBP(method, isFinite(amt) ? amt : 0, region, cryptoNet);
  const net = netAmountGBP(method, isFinite(amt) ? amt : 0, region, cryptoNet);

  const recommended = useMemo(() => {
    if (region === "TR") return "Crypto (TRC20) – düşük ağ ücreti";
    if (region === "UK") return "UK Faster Payments – anında & düşük ücret";
    if (region === "EU") return "SEPA – hızlı & düşük ücret";
    return "Crypto (Polygon/TRC20) veya PayPal";
  }, [region]);

  const canSubmit = () => {
    if (!isFinite(amt) || amt <= 0 || amt > balanceGBP) return false;
    if (method === "UK_FPS") return ukSort.length >= 6 && ukAcct.length >= 6;
    if (method === "SEPA") return iban.replace(/\s/g, "").length >= 15;
    if (method === "SWIFT") return iban.replace(/\s/g, "").length >= 15 && swift.length >= 8;
    if (method === "PAYPAL") return /\S+@\S+\.\S+/.test(paypal);
    if (method === "CRYPTO") return cryptoAddr.length >= 12;
    if (method === "GIFT_CARD") return /\S+@\S+\.\S+/.test(giftEmail);
    return false;
  };

  const submit = async () => {
    if (!canSubmit()) return alert("Please check the form fields and amount.");
    setBusy(true);
    try {
      // (Opsiyonel) önce quote alın: /api/backend/wallet/withdraw/quote
      // Sonra withdraw isteği:
      const r = await fetch(`/api/backend/wallet/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount_gbp: amt,
          estimated_fee_gbp: fee,
          region,
          details:
            method === "UK_FPS"
              ? { sort_code: ukSort, account_number: ukAcct }
              : method === "SEPA"
              ? { iban }
              : method === "SWIFT"
              ? { iban, swift }
              : method === "PAYPAL"
              ? { email: paypal }
              : method === "CRYPTO"
              ? { address: cryptoAddr, network: cryptoNet } // USDT/USDC ağı backend belirleyebilir
              : { brand: giftBrand, email: giftEmail },
        }),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      alert("✅ Withdrawal request submitted.");
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      alert("❌ Could not submit withdrawal. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Withdraw funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-3 bg-gray-50 dark:bg-white/5 dark:border-white/10">
            <div className="text-sm text-gray-600 dark:text-white/70">
              Available balance: <span className="font-semibold">£{balanceGBP.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-white/60 mt-1">
              Referral rewards and wallet funds withdraw together.
            </div>
          </div>

          {/* region recommendation */}
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="dark:bg-white/10 dark:text-white/80">Recommended</Badge>
            <span className="text-gray-600 dark:text-white/70">{recommended}</span>
          </div>

          {/* amount */}
          <div className="grid gap-2">
            <Label>Amount (GBP)</Label>
            <Input
              type="number"
              min={1}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25"
            />
            <div className="text-xs text-gray-600 dark:text-white/70">
              Fee est.: <span className="font-medium">£{fee.toFixed(2)}</span> — You receive:{" "}
              <span className="font-semibold">£{net.toFixed(2)}</span>
            </div>
          </div>

          {/* method */}
          <div className="grid gap-2">
            <Label>Payout method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
              <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UK_FPS">UK Bank (Faster Payments • GBP)</SelectItem>
                <SelectItem value="SEPA">EU Bank (SEPA • EUR)</SelectItem>
                <SelectItem value="SWIFT">International (SWIFT)</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="CRYPTO">Crypto (USDT/USDC)</SelectItem>
                <SelectItem value="GIFT_CARD">Gift Card (Amazon, etc.)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* dynamic fields */}
          {method === "UK_FPS" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Sort code</Label>
                <Input placeholder="12-34-56" value={ukSort} onChange={(e) => setUkSort(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Account number</Label>
                <Input placeholder="12345678" value={ukAcct} onChange={(e) => setUkAcct(e.target.value)} />
              </div>
            </div>
          )}

          {method === "SEPA" && (
            <div className="grid gap-2">
              <Label>IBAN</Label>
              <Input placeholder="DE89 3704 0044 0532 0130 00" value={iban} onChange={(e) => setIban(e.target.value)} />
            </div>
          )}

          {method === "SWIFT" && (
            <div className="grid gap-2">
              <Label>IBAN</Label>
              <Input placeholder="IBAN" value={iban} onChange={(e) => setIban(e.target.value)} />
              <Label className="mt-2">SWIFT/BIC</Label>
              <Input placeholder="DEUTDEFF" value={swift} onChange={(e) => setSwift(e.target.value)} />
            </div>
          )}

          {method === "PAYPAL" && (
            <div className="grid gap-2">
              <Label>PayPal email</Label>
              <Input placeholder="you@example.com" value={paypal} onChange={(e) => setPaypal(e.target.value)} />
            </div>
          )}

          {method === "CRYPTO" && (
            <div className="grid gap-2">
              <Label>Network</Label>
              <Select value={cryptoNet} onValueChange={(v) => setCryptoNet(v as CryptoNetwork)}>
                <SelectTrigger><SelectValue placeholder="Select network" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRC20">TRC20 (USDT) — lowest fee</SelectItem>
                  <SelectItem value="Polygon">Polygon (USDC) — very low fee</SelectItem>
                  <SelectItem value="ERC20">ERC20 (USDT/USDC)</SelectItem>
                </SelectContent>
              </Select>
              <Label className="mt-2">Wallet address</Label>
              <Input placeholder="T..." value={cryptoAddr} onChange={(e) => setCryptoAddr(e.target.value)} />
              <div className="text-xs text-amber-600 dark:text-amber-300">
                Send only the selected network/token. Wrong network can cause loss of funds.
              </div>
            </div>
          )}

          {method === "GIFT_CARD" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Brand</Label>
                <Select value={giftBrand} onValueChange={(v) => setGiftBrand(v as GiftBrand)}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Amazon">Amazon</SelectItem>
                    <SelectItem value="Apple">Apple</SelectItem>
                    <SelectItem value="Steam">Steam</SelectItem>
                    <SelectItem value="Google Play">Google Play</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Delivery email</Label>
                <Input placeholder="you@example.com" value={giftEmail} onChange={(e) => setGiftEmail(e.target.value)} />
              </div>
              <div className="text-xs text-gray-600 dark:text-white/70 sm:col-span-2">
                Gift cards are delivered as digital codes via email within 24–48h (business days).
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>Close</Button>
          <Button onClick={submit} disabled={busy || !canSubmit()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {busy ? "Submitting…" : "Withdraw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, ABI } from "@/lib/contract";
import { stringToBytes32, shortAddress, isValidAddress } from "@/lib/utils-admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface MintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgCode: string;
  orgWalletAddr: string;
  onSuccess: () => void;
}

export function MintDialog({ open, onOpenChange, orgCode, orgWalletAddr, onSuccess }: MintDialogProps) {
  const { address, isConnected } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [studentAddr, setStudentAddr] = useState("");
  const [certName, setCertName] = useState("");
  const [description, setDescription] = useState("");
  const [achievementDesc, setAchievementDesc] = useState("");
  const [grade, setGrade] = useState("");
  const [duration, setDuration] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "uploading" | "minting" | "success">("idle");

  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const walletMismatch = isConnected && address && address.toLowerCase() !== orgWalletAddr.toLowerCase();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Only PNG and JPG images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function resetForm() {
    setStudentAddr("");
    setCertName("");
    setDescription("");
    setAchievementDesc("");
    setGrade("");
    setDuration("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setExpiryDate("");
    setImageFile(null);
    setImagePreview("");
    setStatus("idle");
  }

  async function handleSubmit() {
    if (!studentAddr || !certName || !description || !imageFile) {
      toast.error("Please fill in all required fields and upload an image");
      return;
    }

    if (!isValidAddress(studentAddr)) {
      toast.error("Invalid student wallet address");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (walletMismatch) {
      toast.error("Connected wallet doesn't match your org wallet");
      return;
    }

    setStatus("uploading");

    try {
      const attributes: { trait_type: string; value: string }[] = [];
      if (achievementDesc) attributes.push({ trait_type: "Achievement", value: achievementDesc });
      if (grade) attributes.push({ trait_type: "Grade", value: grade });
      if (duration) attributes.push({ trait_type: "Duration", value: duration });

      const metadata = {
        name: certName,
        description,
        studentAddress: studentAddr,
        orgCode,
        issueDate,
        ...(expiryDate && { expiryDate }),
        attributes,
      };

      const pinataFormData = new FormData();
      pinataFormData.append("image", imageFile);
      pinataFormData.append("metadata", JSON.stringify(metadata));

      const pinataRes = await fetch("/api/mint/pinata", {
        method: "POST",
        body: pinataFormData,
      });

      const pinataData = await pinataRes.json();
      if (!pinataRes.ok) {
        toast.error(pinataData.error || "Failed to upload to Pinata");
        setStatus("idle");
        return;
      }

      setStatus("minting");

      const bytes32OrgCode = stringToBytes32(orgCode);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "mint",
        args: [studentAddr as `0x${string}`, pinataData.metadataUri, bytes32OrgCode],
      });

      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: 0,
          orgCode,
          studentAddr,
          ipfsUri: pinataData.metadataUri,
          name: certName,
          description,
          issueDate,
          expiryDate: expiryDate || undefined,
          attributes,
          txHash: hash,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save certificate");
        setStatus("idle");
        return;
      }

      setStatus("success");
      toast.success("Certificate minted successfully!", {
        duration: 10000,
        action: {
          label: "View TX",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, "_blank"),
        },
      });

      setTimeout(() => {
        onSuccess();
        resetForm();
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      const msg = error?.message || error?.cause?.message || "Minting failed";
      if (msg.includes("user rejected")) {
        toast.error("Transaction rejected by user");
      } else if (msg.includes("insufficient funds")) {
        toast.error("Insufficient funds for gas");
      } else {
        toast.error(msg);
      }
      setStatus("idle");
    }
  }

  const isProcessing = status === "uploading" || status === "minting" || isWriting || isConfirming;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) { resetForm(); onOpenChange(false); } else { onOpenChange(true); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mint Certificate</DialogTitle>
          <DialogDescription>Issue a soulbound NFT certificate to a student</DialogDescription>
        </DialogHeader>

        {walletMismatch && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Wallet Mismatch</AlertTitle>
            <AlertDescription>
              Connected wallet ({shortAddress(address!)}) doesn't match your org wallet ({shortAddress(orgWalletAddr)}).
              Disconnect and connect the correct wallet to mint.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentAddr">Student Wallet Address *</Label>
            <Input
              id="studentAddr"
              placeholder="0x..."
              value={studentAddr}
              onChange={(e) => setStudentAddr(e.target.value)}
              disabled={isProcessing || walletMismatch}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certName">Certificate Name *</Label>
            <Input
              id="certName"
              placeholder="Blockchain Fundamentals"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              disabled={isProcessing || walletMismatch}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Completed course on blockchain fundamentals"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isProcessing || walletMismatch}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievementDesc">Achievement Description</Label>
            <Textarea
              id="achievementDesc"
              placeholder="Course Completion, Workshop Attendance, etc."
              rows={2}
              value={achievementDesc}
              onChange={(e) => setAchievementDesc(e.target.value)}
              disabled={isProcessing || walletMismatch}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                placeholder="A"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                disabled={isProcessing || walletMismatch}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="12 weeks"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isProcessing || walletMismatch}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                disabled={isProcessing || walletMismatch}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={isProcessing || walletMismatch}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Certificate Image (PNG/JPG, max 5MB) *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageChange}
              className="hidden"
              disabled={isProcessing || walletMismatch}
            />
            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                disabled={isProcessing || walletMismatch}
              >
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
              </button>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {imageFile?.name}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {status === "success" ? (
            <Button className="w-full gap-2" onClick={() => { resetForm(); onOpenChange(false); }}>
              <CheckCircle className="h-4 w-4" />
              Done
            </Button>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isProcessing || walletMismatch || !studentAddr || !certName || !description || !imageFile}
            >
              {status === "uploading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "uploading" && "Uploading to Pinata..."}
              {status === "minting" && (isWriting || isConfirming) && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "minting" && isWriting && "Sign in wallet..."}
              {status === "minting" && isConfirming && "Confirming transaction..."}
              {status === "minting" && !isWriting && !isConfirming && "Waiting for wallet..."}
              {!isProcessing && "Upload & Mint"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

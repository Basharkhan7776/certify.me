"use client";

import { Check, X, Eye, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/layout/admin-layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Approval {
  _id: string;
  orgName: string;
  email: string;
  walletAddr: string;
  description: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Approval | null>(null);

  async function fetchApprovals() {
    try {
      const res = await fetch("/api/admin/approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals);
      }
    } catch {
      toast.error("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApprovals();
  }, []);

  async function handleReview(id: string, status: "approved" | "rejected") {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/approvals/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to review");
        setActionLoading(null);
        return;
      }

      if (status === "approved" && data.txHash) {
        toast.success(`Org approved and added on-chain`, {
          duration: 10000,
          action: {
            label: "View TX",
            onClick: () => window.open(`https://sepolia.etherscan.io/tx/${data.txHash}`, "_blank"),
          },
        });
      } else {
        toast.success(`Request ${status}`);
      }

      setSelectedOrg(null);
      fetchApprovals();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading approvals...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Org Approvals</h1>
          <p className="text-sm text-muted-foreground">Review and approve organization onboarding requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {approvals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No approval requests</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell className="font-medium">{req.orgName}</TableCell>
                      <TableCell>
                        <a href={`mailto:${req.email}`} className="text-muted-foreground hover:text-foreground underline underline-offset-2">
                          {req.email}
                        </a>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{req.walletAddr.slice(0, 10)}...</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.status === "approved"
                              ? "secondary"
                              : req.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 h-7"
                            onClick={() => setSelectedOrg(req)}
                          >
                            <Eye className="h-3 w-3" />
                            Details
                          </Button>
                          {req.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="gap-1 h-7"
                                onClick={() => handleReview(req._id, "approved")}
                                disabled={actionLoading === req._id}
                              >
                                <Check className="h-3 w-3" />
                                {actionLoading === req._id ? "..." : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 h-7 text-destructive"
                                onClick={() => handleReview(req._id, "rejected")}
                                disabled={actionLoading === req._id}
                              >
                                <X className="h-3 w-3" />
                                {actionLoading === req._id ? "..." : "Reject"}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!selectedOrg} onOpenChange={(open) => !open && setSelectedOrg(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedOrg?.orgName}</DialogTitle>
            <DialogDescription>Organization onboarding request details</DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="col-span-2">
                  <a href={`mailto:${selectedOrg.email}`} className="flex items-center gap-1 hover:underline">
                    <Mail className="h-3 w-3" />
                    {selectedOrg.email}
                  </a>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-muted-foreground">Wallet</span>
                <span className="col-span-2 font-mono text-xs break-all">{selectedOrg.walletAddr}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-muted-foreground">Website</span>
                <span className="col-span-2">
                  {selectedOrg.website ? (
                    <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                      {selectedOrg.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-muted-foreground">Submitted</span>
                <span className="col-span-2">{new Date(selectedOrg.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2">
                  <Badge
                    variant={
                      selectedOrg.status === "approved"
                        ? "secondary"
                        : selectedOrg.status === "rejected"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {selectedOrg.status}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="mt-1 text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedOrg.description}</p>
              </div>
            </div>
          )}
          {selectedOrg?.status === "pending" && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => handleReview(selectedOrg._id, "rejected")}
                disabled={actionLoading === selectedOrg._id}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                onClick={() => handleReview(selectedOrg._id, "approved")}
                disabled={actionLoading === selectedOrg._id}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

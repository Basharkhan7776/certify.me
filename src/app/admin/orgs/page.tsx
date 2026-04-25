"use client";

import { Ban, CheckCircle } from "lucide-react";
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
import AdminLayout from "@/components/layout/admin-layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Org {
  _id: string;
  name: string;
  orgCode: string;
  walletAddr: string;
  approved: boolean;
  blocked: boolean;
  createdAt: string;
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchOrgs() {
    try {
      const res = await fetch("/api/admin/orgs");
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.orgs);
      }
    } catch {
      toast.error("Failed to load orgs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrgs();
  }, []);

  async function handleBlockToggle(org: Org) {
    setActionLoading(org._id);
    try {
      const endpoint = org.blocked ? "/api/admin/orgs/unblock" : "/api/admin/orgs/block";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgCode: org.orgCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || `Failed to ${org.blocked ? "unblock" : "block"} org`);
        setActionLoading(null);
        return;
      }

      toast.success(`Org ${org.blocked ? "unblocked" : "blocked"}`);
      fetchOrgs();
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
          <p className="text-muted-foreground">Loading orgs...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Organization Management</h1>
          <p className="text-sm text-muted-foreground">Block or unblock organizations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {orgs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No organizations found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Org Code</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgs.map((org) => (
                    <TableRow key={org._id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell className="font-mono text-xs">{org.orgCode}</TableCell>
                      <TableCell className="font-mono text-xs">{org.walletAddr.slice(0, 10)}...</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={org.blocked ? "destructive" : "secondary"}>
                          {org.blocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`gap-1 h-7 ${org.blocked ? "text-green-600" : "text-destructive"}`}
                          onClick={() => handleBlockToggle(org)}
                          disabled={actionLoading === org._id}
                        >
                          {org.blocked ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                          {actionLoading === org._id ? "..." : org.blocked ? "Unblock" : "Block"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </AdminLayout>
  );
}

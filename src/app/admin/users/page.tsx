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

interface User {
  _id: string;
  name: string;
  email: string;
  walletAddr: string;
  blocked: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleBlockToggle(user: User) {
    setActionLoading(user._id);
    try {
      const endpoint = user.blocked ? "/api/admin/users/unblock" : "/api/admin/users/block";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user._id }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || `Failed to ${user.blocked ? "unblock" : "block"} user`);
        setActionLoading(null);
        return;
      }

      toast.success(`User ${user.blocked ? "unblocked" : "blocked"}`);
      fetchUsers();
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
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">Block or unblock users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{user.walletAddr ? `${user.walletAddr.slice(0, 10)}...` : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={user.blocked ? "destructive" : "secondary"}>
                          {user.blocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`gap-1 h-7 ${user.blocked ? "text-green-600" : "text-destructive"}`}
                          onClick={() => handleBlockToggle(user)}
                          disabled={actionLoading === user._id}
                        >
                          {user.blocked ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                          {actionLoading === user._id ? "..." : user.blocked ? "Unblock" : "Block"}
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

"use client";

import Link from "next/link";
import { Shield, List, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/admin-layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { shortAddress } from "@/lib/utils-admin";

interface DashboardStats {
  totalOrgs: number;
  totalUsers: number;
  pendingApprovals: number;
}

interface RecentOrg {
  _id: string;
  name: string;
  orgCode: string;
  walletAddr: string;
  createdAt: string;
}

export default function AdminAppPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalOrgs: 0, totalUsers: 0, pendingApprovals: 0 });
  const [recentOrgs, setRecentOrgs] = useState<RecentOrg[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDashboard() {
    try {
      const [statsRes, orgsRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/orgs"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (orgsRes.ok) {
        const data = await orgsRes.json();
        setRecentOrgs(data.orgs.slice(0, 5));
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.totalOrgs}</p>
              <p className="text-sm text-muted-foreground">Total Orgs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </CardContent>
          </Card>
        </div>

        {recentOrgs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Recent Organizations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentOrgs.map((org) => (
                <div key={org._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{org.orgCode} — {shortAddress(org.walletAddr)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(org.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/approvals">
              <Button variant="outline" className="w-full justify-start gap-2">
                <List className="h-4 w-4" />
                Review Pending Approvals
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start gap-2">
                <List className="h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/orgs">
              <Button variant="outline" className="w-full justify-start gap-2">
                <List className="h-4 w-4" />
                Manage Organizations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </AdminLayout>
  );
}

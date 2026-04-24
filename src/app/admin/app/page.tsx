import Link from "next/link";
import { Shield, Wallet, Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/layout/admin-layout";

export default function AdminAppPage() {
  return (
    <AdminLayout>
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Org On-Chain
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Total Orgs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Total Certs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Organization On-Chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orgCode">Org Code (bytes32)</Label>
                <Input id="orgCode" placeholder="0x54454348..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgWallet">Org Wallet Address</Label>
                <Input id="orgWallet" placeholder="0x..." />
              </div>
            </div>
            <Button className="gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet & Add Org
            </Button>
          </CardContent>
        </Card>

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

import { Check, X } from "lucide-react";
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
import { AdminLayout } from "@/components/layout/admin-layout";
import { mockApprovals } from "@/lib/mock-data";

export default function AdminApprovalsPage() {
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
                {mockApprovals.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.orgName}</TableCell>
                    <TableCell className="text-muted-foreground">{req.email}</TableCell>
                    <TableCell className="font-mono text-xs">{req.walletAddr.slice(0, 10)}...</TableCell>
                    <TableCell className="text-muted-foreground">{req.submittedAt}</TableCell>
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
                      {req.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" className="gap-1 h-7">
                            <Check className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 h-7 text-destructive">
                            <X className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {req.status !== "pending" && (
                        <span className="text-xs text-muted-foreground">
                          {req.status === "approved" ? "Approved" : "Rejected"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </AdminLayout>
  );
}

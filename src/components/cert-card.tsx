import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CertCardProps {
  id: string;
  name: string;
  issuer: string;
  date: string;
  tokenId: number;
  orgCode: string;
  verified?: boolean;
}

export function CertCard({ id, name, issuer, date, tokenId, orgCode, verified = true }: CertCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        {verified && (
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{issuer.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground">Issued by</p>
            <p className="text-sm font-medium">{issuer}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{date}</span>
          <span>Token #{tokenId}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">{orgCode}</span>
          <Link
            href={`/cert/${id}`}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

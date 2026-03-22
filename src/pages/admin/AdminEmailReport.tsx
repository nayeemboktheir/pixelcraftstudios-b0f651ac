import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Mail, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Send } from 'lucide-react';

interface EmailLog {
  id: string;
  order_id: string | null;
  resend_email_id: string | null;
  recipient_email: string;
  subject: string | null;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  bounced_at: string | null;
  failed_at: string | null;
  bounce_reason: string | null;
  failure_reason: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  sent: { label: 'Sent', variant: 'secondary', icon: Send },
  delivered: { label: 'Delivered', variant: 'default', icon: CheckCircle },
  bounced: { label: 'Bounced', variant: 'destructive', icon: XCircle },
  failed: { label: 'Failed', variant: 'destructive', icon: AlertTriangle },
  delayed: { label: 'Delayed', variant: 'outline', icon: Clock },
  complained: { label: 'Complained', variant: 'destructive', icon: AlertTriangle },
};

export default function AdminEmailReport() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs((data as EmailLog[]) || []);
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const filtered = logs.filter(log => {
    const matchesSearch = !search || 
      log.recipient_email.toLowerCase().includes(search.toLowerCase()) ||
      log.subject?.toLowerCase().includes(search.toLowerCase()) ||
      log.resend_email_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: logs.length,
    delivered: logs.filter(l => l.status === 'delivered').length,
    sent: logs.filter(l => l.status === 'sent').length,
    bounced: logs.filter(l => l.status === 'bounced' || l.status === 'failed').length,
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, variant: 'outline' as const, icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Report</h1>
          <p className="text-muted-foreground">Track delivery status of all sent emails</p>
        </div>
        <Button variant="outline" onClick={loadLogs} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Pending Delivery</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.bounced}</p>
                <p className="text-xs text-muted-foreground">Bounced / Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Delivered At</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.recipient_email}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {log.subject || '—'}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.sent_at ? format(new Date(log.sent_at), 'dd MMM, HH:mm') : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.delivered_at ? format(new Date(log.delivered_at), 'dd MMM, HH:mm') : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.bounce_reason || log.failure_reason || '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No email logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Mail, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Send, RotateCcw, TestTube } from 'lucide-react';
import { toast } from 'sonner';

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
  const [retrying, setRetrying] = useState<string | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);

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

  const handleRetry = async (log: EmailLog) => {
    setRetrying(log.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-digital-delivery-email', {
        body: {
          order_id: log.order_id,
          order_number: 'RETRY',
          customer_email: log.recipient_email,
          product_name: log.subject || 'Retry Email',
          custom_message: `This is a retry of a previously failed email.`,
          download_link: undefined,
        },
      });

      if (error) throw error;
      if (data?.success) {
        toast.success('ইমেইল আবার পাঠানো হয়েছে!');
        loadLogs();
      } else {
        toast.error(data?.message || 'Retry failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Retry failed');
    } finally {
      setRetrying(null);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail) {
      toast.error('ইমেইল এড্রেস দিন');
      return;
    }
    setTestSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-digital-delivery-email', {
        body: {
          order_number: 'MANUAL',
          customer_email: testEmail,
          product_name: '✅ Test Email - Email System Working',
          custom_message: 'এটি একটি টেস্ট ইমেইল। আপনার ইমেইল সিস্টেম সঠিকভাবে কাজ করছে!\n\nThis is a test email. Your email system is working correctly!',
        },
      });

      if (error) throw error;
      if (data?.success) {
        toast.success('টেস্ট ইমেইল পাঠানো হয়েছে!');
        setTestDialogOpen(false);
        setTestEmail('');
        loadLogs();
      } else {
        toast.error(data?.message || 'টেস্ট ইমেইল পাঠানো যায়নি');
      }
    } catch (err: any) {
      toast.error(err.message || 'টেস্ট ইমেইল পাঠানো যায়নি');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Report</h1>
          <p className="text-muted-foreground">Track delivery status of all sent emails</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTestDialogOpen(true)} className="gap-2">
            <TestTube className="h-4 w-4" />
            Test Send
          </Button>
          <Button variant="outline" onClick={loadLogs} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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
                  <TableHead className="w-[80px]">Action</TableHead>
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
                    <TableCell>
                      {(log.status === 'failed' || log.status === 'bounced') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetry(log)}
                          disabled={retrying === log.id}
                          className="gap-1 text-xs"
                        >
                          <RotateCcw className={`h-3 w-3 ${retrying === log.id ? 'animate-spin' : ''}`} />
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No email logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Test Send Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>টেস্ট ইমেইল পাঠান</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ইমেইল এড্রেস</Label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>বাতিল</Button>
            <Button onClick={handleTestSend} disabled={testSending} className="gap-2">
              {testSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              পাঠান
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Search, Eye, Package, CheckCircle, XCircle, Clock, Printer, Globe, UserPlus, Plus, Tag, Loader2, UserCheck, History, Trash2, Calendar, Edit, BookOpen, Mail, Link } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { getAllOrders, updateOrderStatus, deleteOrder } from '@/services/adminService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { InvoicePrintDialog } from '@/components/admin/InvoicePrintDialog';
import { StickerPrintDialog } from '@/components/admin/StickerPrintDialog';
import { ManualOrderDialog } from '@/components/admin/ManualOrderDialog';
import { OrderEditDialog } from '@/components/admin/OrderEditDialog';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  variation_name: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  subtotal: number;
  shipping_cost: number | null;
  discount: number | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_street: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postal_code: string | null;
  tracking_number: string | null;
  notes: string | null;
  invoice_note: string | null;
  steadfast_note: string | null;
  created_at: string;
  order_items: OrderItem[];
  order_source: string;
  is_printed: boolean;
}

const sourceOptions = [
  { value: 'web', label: 'Web Orders', icon: Globe },
  { value: 'manual', label: 'Manual Orders', icon: UserPlus },
  { value: 'landing_page', label: 'Landing Page', icon: BookOpen },
];

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-teal-500' },
  { value: 'email_sent', label: 'Email Sent', icon: Mail, color: 'bg-indigo-500' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-emerald-500' },
  { value: 'email_failed', label: 'Email Failed', icon: XCircle, color: 'bg-orange-600' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-500' },
];

const getOrderCountByPhone = (orders: Order[], phone: string): number => {
  const normalizedPhone = phone.replace(/\D/g, '').slice(-11);
  return orders.filter(o => o.shipping_phone.replace(/\D/g, '').slice(-11) === normalizedPhone).length;
};

const getPreviousOrdersByPhone = (orders: Order[], phone: string, excludeOrderId?: string): Order[] => {
  const normalizedPhone = phone.replace(/\D/g, '').slice(-11);
  return orders
    .filter(o => o.shipping_phone.replace(/\D/g, '').slice(-11) === normalizedPhone && o.id !== excludeOrderId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkStatusChanging, setBulkStatusChanging] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isStickerDialogOpen, setIsStickerDialogOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [invoiceNote, setInvoiceNote] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [bulkSendingEmail, setBulkSendingEmail] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailOrder, setEmailOrder] = useState<Order | null>(null);
  const [downloadLink, setDownloadLink] = useState('');

  const extractEmail = (order: Order): string => {
    const match = order.shipping_street?.match(/Email:\s*(.+)/i);
    return match ? match[1].trim() : '';
  };

  const defaultPdfLink = 'https://pixelcraftstudios.lovable.app/download?file=ai-prompt-mastery';

  const openEmailDialog = (order: Order) => {
    setEmailOrder(order);
    setDownloadLink(defaultPdfLink);
    setEmailDialogOpen(true);
  };

  const handleSendDigitalEmail = async () => {
    if (!emailOrder || !downloadLink.trim()) {
      toast.error('Download link is required');
      return;
    }

    const customerEmail = extractEmail(emailOrder);
    if (!customerEmail) {
      toast.error('Customer email not found in order');
      return;
    }

    setSendingEmail(true);
    try {
      const productName = emailOrder.order_items.map(i => i.product_name).join(', ');
      
      const { data, error } = await supabase.functions.invoke('send-digital-delivery-email', {
        body: {
          order_id: emailOrder.id,
          order_number: emailOrder.order_number,
          customer_name: emailOrder.shipping_name,
          customer_email: customerEmail,
          download_link: downloadLink.trim(),
          product_name: productName,
          product_image: emailOrder.order_items[0]?.product_image || '',
          total: Number(emailOrder.total),
        },
      });

      if (error) throw error;
      if (data?.success) {
        toast.success('ইমেইল সফলভাবে পাঠানো হয়েছে!');
        setEmailDialogOpen(false);
        loadOrders();
      } else {
        toast.error(data?.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Failed to send digital delivery email:', error);
      toast.error('ইমেইল পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleBulkSendEmail = async () => {
    const selectedOrders = orders.filter(o => selectedOrderIds.has(o.id));
    const validOrders = selectedOrders.filter(o => {
      const email = extractEmail(o);
      return email && o.status !== 'email_sent' && o.status !== 'completed';
    });

    if (validOrders.length === 0) {
      toast.error('No valid orders to send email (missing email or already sent)');
      return;
    }

    setBulkSendingEmail(true);
    let successCount = 0;
    let failCount = 0;

    for (const order of validOrders) {
      try {
        const customerEmail = extractEmail(order);
        const productName = order.order_items.map(i => i.product_name).join(', ');

        const { data } = await supabase.functions.invoke('send-digital-delivery-email', {
          body: {
            order_id: order.id,
            order_number: order.order_number,
            customer_name: order.shipping_name,
            customer_email: customerEmail,
            download_link: defaultPdfLink,
            product_name: productName,
            product_image: order.order_items[0]?.product_image || '',
            total: Number(order.total),
          },
        });

        if (data?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setBulkSendingEmail(false);
    loadOrders();
    setSelectedOrderIds(new Set());

    if (successCount > 0) toast.success(`${successCount}টি ইমেইল সফলভাবে পাঠানো হয়েছে!`);
    if (failCount > 0) toast.error(`${failCount}টি ইমেইল পাঠাতে ব্যর্থ হয়েছে`);
  };

  const openEditDialog = (order: Order) => {
    setOrderToEdit(order);
    setIsEditOrderOpen(true);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping_name.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping_phone.includes(search);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || order.order_source === sourceFilter;
    
    const orderDate = new Date(order.created_at);
    orderDate.setHours(0, 0, 0, 0);
    
    let matchesDate = true;
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && orderDate >= fromDate;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && orderDate <= toDate;
    }
    
    return matchesSearch && matchesStatus && matchesSource && matchesDate;
  });

  const getStatusCount = (status: string) => {
    return orders.filter(order => {
      const matchesSource = sourceFilter === 'all' || order.order_source === sourceFilter;
      return order.status === status && matchesSource;
    }).length;
  };

  const getSourceCount = (source: string) => {
    return orders.filter(order => order.order_source === source).length;
  };

  const getSourceBadge = (source: string) => {
    const sourceOption = sourceOptions.find(s => s.value === source);
    if (!sourceOption) return <Badge variant="outline">{source || 'web'}</Badge>;
    const Icon = sourceOption.icon;
    return (
      <Badge variant="outline" className="gap-1">
        <Icon className="h-3 w-3" />
        {sourceOption.label}
      </Badge>
    );
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setInvoiceNote(order.invoice_note || '');
    setIsDetailOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ invoice_note: invoiceNote || null })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      
      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id ? { ...o, invoice_note: invoiceNote || null } : o
      ));
      setSelectedOrder({ ...selectedOrder, invoice_note: invoiceNote || null });
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders();
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrderIds);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrderIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrderIds.size === 0) {
      toast.error('Please select orders to update');
      return;
    }

    setBulkStatusChanging(true);
    try {
      const ordersToUpdate = orders.filter(o => selectedOrderIds.has(o.id));
      let successCount = 0;
      let failCount = 0;

      for (const order of ordersToUpdate) {
        try {
          await updateOrderStatus(order.id, newStatus);
          successCount++;
        } catch (error) {
          console.error(`Failed to update order ${order.order_number}:`, error);
          failCount++;
        }
      }

      if (failCount > 0) {
        toast.warning(`Updated ${successCount} orders, ${failCount} failed`);
      } else {
        toast.success(`Successfully updated ${successCount} orders to ${newStatus}`);
      }

      setSelectedOrderIds(new Set());
      loadOrders();
    } catch (error) {
      console.error('Failed to bulk update status:', error);
      toast.error('Failed to update order statuses');
    } finally {
      setBulkStatusChanging(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    setDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      toast.success(`Order ${orderToDelete.order_number} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
      setIsDetailOpen(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    if (!statusOption) return <Badge>{status}</Badge>;
    const Icon = statusOption.icon;
    return (
      <Badge className={`${statusOption.color} text-white gap-1`}>
        <Icon className="h-3 w-3" />
        {statusOption.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <Button onClick={() => setIsManualOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Order
        </Button>
      </div>

      {/* Source Tabs */}
      <Tabs value={sourceFilter} onValueChange={setSourceFilter} className="w-full">
        <TabsList className="h-auto p-1 bg-muted/50">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4"
          >
            All Orders
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {orders.length}
            </Badge>
          </TabsTrigger>
          {sourceOptions.map((source) => {
            const Icon = source.icon;
            return (
              <TabsTrigger 
                key={source.value} 
                value={source.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 gap-1.5"
              >
                <Icon className="h-4 w-4" />
                {source.label}
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {getSourceCount(source.value)}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Status Tabs */}
      <div className="overflow-x-auto">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
          <TabsList className="h-auto p-1 bg-muted/50 inline-flex w-auto min-w-full">
            {statusOptions.map((status) => (
              <TabsTrigger 
                key={status.value} 
                value={status.value}
                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4"
              >
                {status.label}
                <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs">
                  {getStatusCount(status.value)}
                </Badge>
              </TabsTrigger>
            ))}
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4"
            >
              All
              <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs">
                {orders.filter(o => sourceFilter === 'all' || o.order_source === sourceFilter).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'dd MMM yyyy') : 'From Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {dateTo ? format(dateTo, 'dd MMM yyyy') : 'To Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {(dateFrom || dateTo) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}
                  className="text-muted-foreground"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap mt-4">
              {selectedOrderIds.size > 0 && (
                <>
                  <Select
                    onValueChange={handleBulkStatusChange}
                    disabled={bulkStatusChanging}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={bulkStatusChanging ? 'Updating...' : `Change ${selectedOrderIds.size} Status`} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => {
                        const Icon = status.icon;
                        return (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {status.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setIsInvoiceDialogOpen(true)}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print {selectedOrderIds.size} Invoice{selectedOrderIds.size > 1 ? 's' : ''}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsStickerDialogOpen(true)}
                    className="gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    Print {selectedOrderIds.size} Sticker{selectedOrderIds.size > 1 ? 's' : ''}
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleBulkSendEmail}
                    disabled={bulkSendingEmail}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Mail className="h-4 w-4" />
                    {bulkSendingEmail ? 'Sending...' : `Send ${selectedOrderIds.size} Email${selectedOrderIds.size > 1 ? 's' : ''}`}
                  </Button>
                </>
              )}
            </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedOrderIds.size > 0 && selectedOrderIds.size === filteredOrders.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Change Status</TableHead>
                <TableHead className="text-right sticky right-0 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrderIds.has(order.id)}
                      onCheckedChange={() => toggleOrderSelection(order.id)}
                    />
                  </TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-primary hover:underline"
                    onClick={() => openOrderDetail(order)}
                  >
                    {order.order_number}
                  </TableCell>
                  <TableCell>{getSourceBadge(order.order_source)}</TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="truncate cursor-pointer hover:text-primary hover:underline"
                          onClick={() => openOrderDetail(order)}
                        >
                          {order.shipping_name}
                        </span>
                        {getOrderCountByPhone(orders, order.shipping_phone) > 1 && (
                          <Badge variant="secondary" className="gap-1 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200">
                            <UserCheck className="h-3 w-3" />
                            Repeat
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{order.shipping_phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{extractEmail(order) || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="relative w-10 h-10 rounded border bg-muted overflow-hidden shrink-0"
                          title={`${item.product_name}${item.variation_name ? ` (${item.variation_name})` : ''} x${item.quantity}`}
                        >
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          {item.quantity > 1 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] px-1 rounded-full min-w-[16px] text-center">
                              {item.quantity}
                            </span>
                          )}
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                          +{order.order_items.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>৳{Number(order.total).toFixed(0)}</TableCell>
                  <TableCell>
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Change" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => {
                          const Icon = status.icon;
                          return (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-3 w-3" />
                                {status.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right sticky right-0 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openOrderDetail(order)}
                        title="View order details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'email_failed' ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openEmailDialog(order)}
                          title="Re-send download email"
                          className="gap-1 bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Mail className="h-3 w-3" />
                          Re-send
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEmailDialog(order)}
                          title="Send download email"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(order)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    Customer Information
                    {getOrderCountByPhone(orders, selectedOrder.shipping_phone) > 1 && (
                      <Badge variant="secondary" className="gap-1 text-xs bg-amber-100 text-amber-700">
                        <UserCheck className="h-3 w-3" />
                        Repeat Customer
                      </Badge>
                    )}
                  </h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{selectedOrder.shipping_name}</p>
                    <p>{selectedOrder.shipping_phone}</p>
                    <p className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {extractEmail(selectedOrder) || 'No email'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Order Details</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Date: {format(new Date(selectedOrder.created_at), 'PPpp')}</p>
                    <p>Payment: {selectedOrder.payment_method.toUpperCase()}</p>
                    <p>Payment Status: {selectedOrder.payment_status}</p>
                    {selectedOrder.notes && <p>Notes: {selectedOrder.notes}</p>}
                  </div>
                </div>
              </div>

              {(() => {
                const previousOrders = getPreviousOrdersByPhone(orders, selectedOrder.shipping_phone, selectedOrder.id);
                if (previousOrders.length === 0) return null;
                return (
                  <div className="border rounded-lg p-3 bg-amber-50">
                    <h3 className="font-medium mb-2 flex items-center gap-2 text-amber-800">
                      <History className="h-4 w-4" />
                      Previous Orders ({previousOrders.length})
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {previousOrders.map((prevOrder) => (
                        <div key={prevOrder.id} className="flex items-center justify-between text-sm bg-white rounded px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-amber-700">{prevOrder.order_number}</span>
                            <span className="text-muted-foreground">
                              {format(new Date(prevOrder.created_at), 'dd MMM yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(prevOrder.status)}
                            <span className="font-medium">৳{Number(prevOrder.total).toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        {item.variation_name && (
                          <p className="text-sm text-blue-600 font-medium">Size: {item.variation_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">৳{Number(item.price).toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>৳{Number(selectedOrder.subtotal).toFixed(0)}</span>
                </div>
                {selectedOrder.discount && Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-৳{Number(selectedOrder.discount).toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>৳{Number(selectedOrder.total).toFixed(0)}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium">Order Notes</h3>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Invoice Note (shows on invoice)</Label>
                  <Textarea
                    value={invoiceNote}
                    onChange={(e) => setInvoiceNote(e.target.value)}
                    placeholder="Note to show on printed invoice..."
                    rows={2}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium">Update Status</h3>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailOpen(false);
                      openEditDialog(selectedOrder);
                    }}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Order
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailOpen(false);
                      openEmailDialog(selectedOrder);
                    }}
                    disabled={selectedOrder.status === 'email_sent' || selectedOrder.status === 'completed'}
                    className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Mail className="h-4 w-4" />
                    {selectedOrder.status === 'email_sent' ? 'Email Already Sent' : selectedOrder.status === 'completed' ? 'Completed' : 'Send Download Email'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => openDeleteDialog(selectedOrder)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <OrderEditDialog
        order={orderToEdit}
        open={isEditOrderOpen}
        onOpenChange={setIsEditOrderOpen}
        onOrderUpdated={loadOrders}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order <strong>{orderToDelete?.order_number}</strong>? 
              This action cannot be undone and will permanently remove the order and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InvoicePrintDialog
        orders={orders.filter((o) => selectedOrderIds.has(o.id))}
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        onOrdersPrinted={(orderIds) => {
          setOrders(prev => prev.map(o => 
            orderIds.includes(o.id) ? { ...o, is_printed: true } : o
          ));
          setSelectedOrderIds(new Set());
        }}
      />

      <StickerPrintDialog
        orders={orders.filter((o) => selectedOrderIds.has(o.id))}
        open={isStickerDialogOpen}
        onOpenChange={setIsStickerDialogOpen}
        onOrdersPrinted={(orderIds) => {
          setOrders(prev => prev.map(o => 
            orderIds.includes(o.id) ? { ...o, is_printed: true } : o
          ));
          setSelectedOrderIds(new Set());
        }}
      />

      <ManualOrderDialog
        open={isManualOrderOpen}
        onOpenChange={setIsManualOrderOpen}
        onOrderCreated={loadOrders}
      />

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" />
              ডাউনলোড ইমেইল পাঠান
            </DialogTitle>
          </DialogHeader>
          {emailOrder && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <p><strong>Order:</strong> {emailOrder.order_number}</p>
                <p><strong>Customer:</strong> {emailOrder.shipping_name}</p>
                <p><strong>Email:</strong> {extractEmail(emailOrder) || 'Not found'}</p>
                <p><strong>Product:</strong> {emailOrder.order_items.map(i => i.product_name).join(', ')}</p>
                <p><strong>Total:</strong> ৳{Number(emailOrder.total).toFixed(0)}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Link className="h-3.5 w-3.5" />
                  Download Link *
                </Label>
                <Input
                  value={downloadLink}
                  onChange={(e) => setDownloadLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Google Drive, Dropbox বা অন্য কোনো ডাউনলোড লিংক দিন
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEmailDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendDigitalEmail}
                  disabled={sendingEmail || !downloadLink.trim() || !extractEmail(emailOrder)}
                  className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      ইমেইল পাঠান
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
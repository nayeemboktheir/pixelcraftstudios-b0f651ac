import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Minus, Trash2, Star, Loader2, Phone, MessageCircle, UserCheck, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  stock: number;
  slug: string;
  variations?: ProductVariation[];
}

interface OrderItem {
  product: Product;
  quantity: number;
  variation?: ProductVariation;
  customPrice?: number;
}

interface ManualOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

const BENGALI_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

function convertBengaliToEnglish(str: string): string {
  return str.replace(/[০-৯]/g, (match) => BENGALI_DIGITS[match] || match);
}

function normalizePhone(phone: string): string {
  let clean = convertBengaliToEnglish(phone).replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (clean.startsWith('88')) clean = clean.substring(2);
  if (!clean.startsWith('0') && clean.length === 10) clean = `0${clean}`;
  return clean;
}

function normalizeVariationName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function parsePastedText(text: string): { phone?: string; name?: string; email?: string } {
  const converted = convertBengaliToEnglish(text);
  const lines = converted.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
  
  let phone: string | undefined;
  let name: string | undefined;
  let email: string | undefined;
  
  const phoneRegex = /(?:^|\s|:)(01[3-9][0-9]{8})(?:\s|$|,)/;
  const phoneMatch = converted.match(phoneRegex);
  if (phoneMatch) {
    phone = phoneMatch[1];
  } else {
    const anyPhone = converted.match(/\b(01[0-9]{9})\b/);
    if (anyPhone) phone = anyPhone[1];
  }

  // Try to find email
  const emailMatch = converted.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];
  
  const remainingParts: string[] = [];
  for (const line of lines) {
    const cleanLine = line.replace(/01[0-9]{9}/g, '').replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '').trim();
    if (cleanLine.length > 0) {
      remainingParts.push(cleanLine);
    }
  }
  
  if (remainingParts.length >= 1) {
    const firstPart = remainingParts[0];
    if (firstPart.length <= 50 && !/\d/.test(firstPart)) {
      name = firstPart;
    }
  }
  
  return { phone, name, email };
}

interface PreviousCustomer {
  phone: string;
  name: string;
  email: string;
  lastOrderDate: string;
  orderCount: number;
}

export function ManualOrderDialog({ open, onOpenChange, onOrderCreated }: ManualOrderDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [codeSearch, setCodeSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedProductForSize, setSelectedProductForSize] = useState<Product | null>(null);
  
  // Customer info
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceNote, setInvoiceNote] = useState('');
  
  // Pricing
  const [discount, setDiscount] = useState('');
  const [advance, setAdvance] = useState('');

  // Previous customers for autofill
  const [previousCustomers, setPreviousCustomers] = useState<PreviousCustomer[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [selectedCustomerData, setSelectedCustomerData] = useState<PreviousCustomer | null>(null);

  const normalizedPhone = useMemo(() => normalizePhone(mobileNumber), [mobileNumber]);

  useEffect(() => {
    if (open) {
      loadProducts();
      loadPreviousCustomers();
    }
  }, [open]);

  const loadPreviousCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('shipping_phone, shipping_name, shipping_street, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customerMap = new Map<string, PreviousCustomer>();
      (data || []).forEach((order) => {
        const np = order.shipping_phone.replace(/\D/g, '').slice(-11);
        if (np.length === 11) {
          if (customerMap.has(np)) {
            customerMap.get(np)!.orderCount++;
          } else {
            // Extract email from shipping_street if present
            const emailMatch = (order.shipping_street || '').match(/Email:\s*(.+)/i);
            customerMap.set(np, {
              phone: order.shipping_phone,
              name: order.shipping_name,
              email: emailMatch ? emailMatch[1].trim() : '',
              lastOrderDate: order.created_at,
              orderCount: 1,
            });
          }
        }
      });

      setPreviousCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Failed to load previous customers:', error);
    }
  };

  const customerSuggestions = useMemo(() => {
    if (mobileNumber.length < 3) return [];
    const normalizedInput = normalizePhone(mobileNumber);
    return previousCustomers.filter(c => {
      const ncp = c.phone.replace(/\D/g, '').slice(-11);
      return ncp.includes(normalizedInput) || c.name.toLowerCase().includes(mobileNumber.toLowerCase());
    }).slice(0, 5);
  }, [mobileNumber, previousCustomers]);

  const applyCustomerAutofill = (customer: PreviousCustomer) => {
    setMobileNumber(customer.phone.replace(/\D/g, '').slice(-11));
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setSelectedCustomerData(customer);
    setShowCustomerSuggestions(false);
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, images, stock, slug')
        .eq('is_active', true)
        .order('name');

      if (productsError) throw productsError;

      const { data: variationsData, error: variationsError } = await supabase
        .from('product_variations')
        .select('id, name, price, stock, product_id, sort_order')
        .eq('is_active', true)
        .order('sort_order');

      if (variationsError) throw variationsError;

      const productsWithVariations = (productsData || []).map((product) => {
        const perProduct = (variationsData || []).filter((v) => v.product_id === product.id);
        const uniqueByName = Array.from(
          new Map(
            perProduct
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((v) => [normalizeVariationName(v.name), v])
          ).values()
        );

        return {
          ...product,
          variations: uniqueByName.map((v) => ({
            id: v.id,
            name: v.name,
            price: v.price,
            stock: v.stock,
          })),
        };
      });

      setProducts(productsWithVariations);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCode = !codeSearch || p.slug.toLowerCase().includes(codeSearch.toLowerCase());
    const matchesName = !nameSearch || p.name.toLowerCase().includes(nameSearch.toLowerCase());
    return matchesCode && matchesName;
  });

  const handleProductClick = (product: Product) => {
    if (product.variations && product.variations.length > 0) {
      setSelectedProductForSize(product);
    } else {
      addProductWithoutVariation(product);
    }
  };

  const addProductWithoutVariation = (product: Product) => {
    const existing = orderItems.find(item => item.product.id === product.id && !item.variation);
    if (existing) {
      updateQuantity(product.id, undefined, existing.quantity + 1);
    } else {
      setOrderItems([...orderItems, { product, quantity: 1 }]);
    }
  };

  const addProductWithVariation = (product: Product, variation: ProductVariation) => {
    const existing = orderItems.find(item => item.product.id === product.id && item.variation?.id === variation.id);
    if (existing) {
      updateQuantity(product.id, variation.id, existing.quantity + 1);
    } else {
      setOrderItems([...orderItems, { product, quantity: 1, variation }]);
    }
    setSelectedProductForSize(null);
  };

  const updateQuantity = (productId: string, variationId: string | undefined, quantity: number) => {
    if (quantity < 1) {
      removeProduct(productId, variationId);
      return;
    }
    setOrderItems(orderItems.map(item => {
      if (item.product.id === productId) {
        if (variationId && item.variation?.id === variationId) return { ...item, quantity };
        if (!variationId && !item.variation) return { ...item, quantity };
      }
      return item;
    }));
  };

  const removeProduct = (productId: string, variationId?: string) => {
    setOrderItems(orderItems.filter(item => {
      if (item.product.id === productId) {
        if (variationId) return item.variation?.id !== variationId;
        return !!item.variation;
      }
      return true;
    }));
  };

  const subtotal = orderItems.reduce((sum, item) => {
    const basePrice = item.variation ? item.variation.price : item.product.price;
    const itemPrice = item.customPrice !== undefined ? item.customPrice : basePrice;
    return sum + itemPrice * item.quantity;
  }, 0);
  const discountAmount = Number(discount) || 0;
  const advanceAmount = Number(advance) || 0;
  const grandTotal = subtotal - discountAmount - advanceAmount;

  const updateCustomPrice = (productId: string, variationId: string | undefined, price: number | undefined) => {
    setOrderItems(orderItems.map(item => {
      if (item.product.id === productId) {
        if (variationId && item.variation?.id === variationId) return { ...item, customPrice: price };
        if (!variationId && !item.variation) return { ...item, customPrice: price };
      }
      return item;
    }));
  };

  const resetForm = () => {
    setOrderItems([]);
    setMobileNumber('');
    setCustomerName('');
    setCustomerEmail('');
    setInvoiceNote('');
    setDiscount('');
    setAdvance('');
    setCodeSearch('');
    setNameSearch('');
    setSelectedCustomerData(null);
    setShowCustomerSuggestions(false);
    setSelectedProductForSize(null);
  };

  const handleMobileInput = (value: string) => {
    const converted = convertBengaliToEnglish(value);
    
    if (converted.includes('\n') || converted.includes(',') || converted.length > 20) {
      const parsed = parsePastedText(value);
      if (parsed.phone) setMobileNumber(parsed.phone);
      if (parsed.name && !customerName) setCustomerName(parsed.name);
      if (parsed.email && !customerEmail) setCustomerEmail(parsed.email);
    } else {
      let cleanNumber = converted.replace(/[^0-9+]/g, '');
      if (cleanNumber.startsWith('+88')) cleanNumber = cleanNumber.substring(3);
      else if (cleanNumber.startsWith('88') && cleanNumber.length > 11) cleanNumber = cleanNumber.substring(2);
      cleanNumber = cleanNumber.replace(/[^0-9]/g, '');
      setMobileNumber(cleanNumber.slice(0, 11));
    }
  };

  const handleSubmit = async () => {
    if (!mobileNumber.trim()) {
      toast.error('Please enter mobile number');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!customerEmail.trim()) {
      toast.error('Please enter email address');
      return;
    }
    if (orderItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('place-order', {
        body: {
          userId: null,
          items: orderItems.map(item => {
            const basePrice = item.variation ? item.variation.price : item.product.price;
            const itemPrice = item.customPrice !== undefined ? item.customPrice : basePrice;
            const variationName = item.variation?.name || null;
            return {
              productId: item.product.id,
              variationId: item.variation?.id || null,
              variationName,
              quantity: item.quantity,
              productName: variationName ? `${item.product.name} (${variationName})` : item.product.name,
              productImage: item.product.images?.[0] || null,
              price: itemPrice,
            };
          }),
          shipping: {
            name: customerName,
            phone: mobileNumber,
            address: `Email: ${customerEmail}`,
          },
          shippingZone: 'inside_dhaka',
          invoiceNote: invoiceNote || null,
          orderSource: 'manual',
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      if (!data?.orderNumber && !data?.orderId) {
        throw new Error('Order response missing order number');
      }

      toast.success(`Order created successfully! Order #${data.orderNumber || data.orderId}`);
      resetForm();
      onOrderCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg font-semibold">New Order</DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2 space-y-4">

          {/* Customer Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber" className="text-sm text-muted-foreground flex items-center gap-2">
                Mobile Number
                {selectedCustomerData && (
                  <Badge variant="secondary" className="gap-1 text-xs bg-amber-100 text-amber-700">
                    <UserCheck className="h-3 w-3" />
                    Repeat ({selectedCustomerData.orderCount} orders)
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => {
                    handleMobileInput(e.target.value);
                    setShowCustomerSuggestions(true);
                    setSelectedCustomerData(null);
                  }}
                  onFocus={() => setShowCustomerSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text');
                    handleMobileInput(pastedText);
                  }}
                  placeholder="Enter or paste info"
                  className="h-9 pr-16"
                  maxLength={11}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {mobileNumber.length === 11 && (
                    <>
                      <a href={`tel:${mobileNumber}`} className="p-1 hover:bg-muted rounded text-blue-600" title="Call">
                        <Phone className="h-4 w-4" />
                      </a>
                      <a href={`https://wa.me/88${mobileNumber}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted rounded text-green-600" title="WhatsApp">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </>
                  )}
                </div>
                
                {showCustomerSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {customerSuggestions.map((customer, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted flex items-start gap-3 border-b last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyCustomerAutofill(customer);
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{customer.name}</span>
                            <Badge variant="secondary" className="gap-1 text-xs bg-amber-100 text-amber-700 shrink-0">
                              <History className="h-3 w-3" />
                              {customer.orderCount}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                          {customer.email && <div className="text-xs text-muted-foreground truncate">{customer.email}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-sm text-muted-foreground">Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="h-9"
              />
            </div>
          </div>

          {/* Email & Note Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail" className="text-sm text-muted-foreground">Email Address</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoiceNote" className="text-sm text-muted-foreground">Note (optional)</Label>
              <Input
                id="invoiceNote"
                value={invoiceNote}
                onChange={(e) => setInvoiceNote(e.target.value)}
                placeholder="Optional note..."
                className="h-9"
              />
            </div>
          </div>

          {/* Products Section - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ordered Products */}
            <Card className="border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base font-semibold">Ordered Products</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 min-h-[250px]">
                {orderItems.length === 0 ? (
                  <p className="text-sm text-blue-500">No Products added. Please add products to the order</p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => {
                      const itemKey = item.variation ? `${item.product.id}-${item.variation.id}` : item.product.id;
                      const basePrice = item.variation ? item.variation.price : item.product.price;
                      const displayPrice = item.customPrice !== undefined ? item.customPrice : basePrice;
                      return (
                        <div key={itemKey} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                          {item.product.images?.[0] && (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product.name}</p>
                            {item.variation && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">{item.variation.name}</Badge>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-muted-foreground">৳</span>
                              <Input
                                type="number"
                                min="0"
                                value={displayPrice}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateCustomPrice(item.product.id, item.variation?.id, val === '' ? undefined : Number(val));
                                }}
                                className="h-6 w-16 text-xs px-1 py-0"
                                placeholder={basePrice.toString()}
                              />
                              {item.customPrice !== undefined && item.customPrice !== basePrice && (
                                <span className="text-xs text-muted-foreground line-through">৳{basePrice}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.variation?.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.variation?.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeProduct(item.product.id, item.variation?.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-medium text-sm w-16 text-right">৳{displayPrice * item.quantity}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Click To Add Products */}
            <Card className="border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base font-semibold">Click To Add Products</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Code/sku</Label>
                    <Input value={codeSearch} onChange={(e) => setCodeSearch(e.target.value)} placeholder="Type to Search.." className="h-8 text-sm" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Name</Label>
                    <Input value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} placeholder="Type to Search.." className="h-8 text-sm" />
                  </div>
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No products found</p>
                  ) : (
                    filteredProducts.map(product => (
                      <div key={product.id} className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer group" onClick={() => handleProductClick(product)}>
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-cover rounded" />
                        ) : (
                          <div className="w-14 h-14 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">No img</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-blue-600">SKU: {product.slug}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-xs text-muted-foreground">Price: ৳{product.price}</p>
                            <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                          </div>
                          {product.variations && product.variations.length > 0 && (
                            <p className="text-xs text-amber-600 font-medium">{product.variations.length} sizes available</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:text-amber-600 opacity-70 group-hover:opacity-100">
                          <Star className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {selectedProductForSize && (
                  <div className="mt-3 p-3 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">Select Size for: {selectedProductForSize.name}</p>
                      <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setSelectedProductForSize(null)}>✕</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Map(
                          (selectedProductForSize.variations || []).map((v) => [normalizeVariationName(v.name), v])
                        ).values()
                      ).map((variation) => (
                        <Button
                          key={variation.id}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 hover:bg-primary hover:text-primary-foreground"
                          onClick={() => addProductWithVariation(selectedProductForSize, variation)}
                        >
                          {variation.name}
                          <span className="ml-1 text-xs opacity-70">(৳{variation.price})</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pricing Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Discount</Label>
              <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Advance</Label>
              <Input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="0" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Sub Total</Label>
              <Input value={subtotal} readOnly className="h-8 text-sm bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-primary">Grand Total</Label>
              <Input value={grandTotal} readOnly className="h-8 text-sm bg-muted/50 font-semibold" />
            </div>
          </div>

          {/* Create Order Button */}
          <Button
            onClick={handleSubmit}
            disabled={creating}
            className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create Order (${grandTotal.toFixed(2)}৳)`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

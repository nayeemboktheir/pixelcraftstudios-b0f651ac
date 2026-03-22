import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Send, Loader2 } from 'lucide-react';

export default function AdminSendEmail() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !message.trim()) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-digital-delivery-email', {
        body: {
          customer_email: to.trim(),
          product_name: subject.trim(),
          download_link: downloadLink.trim() || undefined,
          order_number: 'MANUAL',
          custom_message: message.trim(),
        },
      });

      if (error) throw error;
      toast.success('ইমেইল সফলভাবে পাঠানো হয়েছে!');
      setTo('');
      setSubject('');
      setMessage('');
      setDownloadLink('');
    } catch (error: any) {
      console.error('Email send error:', error);
      toast.error('ইমেইল পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Send Email</h1>
        <p className="text-muted-foreground">Manually send emails to customers</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Email
          </CardTitle>
          <CardDescription>
            Send a custom email from pixelcraft &lt;noreply@pixelcraftstudio.shop&gt;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">To (Email)</Label>
            <Input
              id="to"
              type="email"
              placeholder="customer@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject / Product Name</Label>
            <Input
              id="subject"
              placeholder="e.g. n8n Masterclass"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="download-link">Download Link (optional)</Label>
            <Input
              id="download-link"
              type="url"
              placeholder="https://example.com/file.pdf"
              value={downloadLink}
              onChange={(e) => setDownloadLink(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Write your email message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={sending || !to.trim() || !subject.trim() || !message.trim()}
            className="w-full gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

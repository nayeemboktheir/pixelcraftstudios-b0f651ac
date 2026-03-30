import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, RotateCcw, Home } from "lucide-react";
import { motion } from "framer-motion";

const PaymentFailedPage = () => {
  const navigate = useNavigate();

  // Check if there's a pending order in session (user can retry)
  const hasPendingOrder = !!sessionStorage.getItem('pending_order_confirmation');

  const handleRetryPayment = () => {
    // Redirect back to payment gateway
    window.location.href = 'https://pg.eps.com.bd/DefaultPaymentLink?id=5F5EC3FE';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <XCircle className="h-14 w-14 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            😔 পেমেন্ট সম্পন্ন হয়নি
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            আপনার পেমেন্ট ক্যান্সেল হয়েছে অথবা কোনো সমস্যা হয়েছে। চিন্তা করবেন না, আপনি আবার চেষ্টা করতে পারেন।
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              ⚠️ আপনার একাউন্ট থেকে কোনো টাকা কাটা হয়নি। আবার চেষ্টা করলে পেমেন্ট সম্পন্ন হবে।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {hasPendingOrder && (
              <Button onClick={handleRetryPayment} size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                <RotateCcw className="h-5 w-5" />
                আবার পেমেন্ট করুন
              </Button>
            )}
            <Button onClick={() => navigate("/")} variant="outline" size="lg" className="gap-2">
              <Home className="h-5 w-5" />
              হোমপেজে যান
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default PaymentFailedPage;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { LogIn, Home } from "lucide-react";
import { Link } from "wouter";

export default function TenantLogin() {
  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--luxe-navy)] to-[var(--luxe-navy)]/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-[var(--luxe-gold)] mb-2 cursor-pointer hover:text-[var(--luxe-gold)]/80 transition">
              Luxe Property Solutions
            </h1>
          </Link>
          <p className="text-gray-300">Tenant Portal</p>
        </div>

        {/* Login Card */}
        <Card className="border-[var(--luxe-gold)]/20 bg-white/95 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[var(--luxe-navy)]">
              Tenant Login
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Access your lease information, payment history, and maintenance requests
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features List */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-[var(--luxe-navy)] text-sm">
                Tenant Portal Features:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--luxe-gold)]">✓</span>
                  View your lease agreement
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--luxe-gold)]">✓</span>
                  Check payment history and invoices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--luxe-gold)]">✓</span>
                  Submit maintenance requests
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--luxe-gold)]">✓</span>
                  Track maintenance status
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--luxe-gold)]">✓</span>
                  Access important documents
                </li>
              </ul>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-[var(--luxe-gold)] hover:bg-[var(--luxe-gold)]/90 text-[var(--luxe-navy)] font-semibold py-6 text-lg"
            >
              <LogIn size={20} className="mr-2" />
              Sign In with Manus
            </Button>

            {/* Info Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>First time?</strong> Your account will be created automatically when you sign in for the first time using your email address.
              </p>
            </div>

            {/* Back to Home */}
            <Link href="/">
              <Button
                variant="outline"
                className="w-full border-[var(--luxe-gold)] text-[var(--luxe-gold)] hover:bg-[var(--luxe-gold)]/10"
              >
                <Home size={18} className="mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Need help? Contact us at support@luxepropertysolutions.com</p>
        </div>
      </div>
    </div>
  );
}

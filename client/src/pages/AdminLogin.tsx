import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, LogIn, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.role !== "admin") {
        setError("This account does not have admin access.");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] to-[#0A1628]/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-[#C9A84C] mb-2 cursor-pointer hover:text-[#C9A84C]/80 transition">
              Luxe Property Solutions
            </h1>
          </Link>
          <p className="text-gray-300">Admin Portal</p>
        </div>

        <Card className="border-[#C9A84C]/20 bg-white/95 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#0A1628]">Admin Login</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              System administration and asset management
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@luxestl.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputCls + " pr-12"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#C9A84C] text-[#0A1628] font-bold text-sm uppercase tracking-wide rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-4">
              <Link href="/">
                <button className="w-full py-3 border border-[#C9A84C] text-[#C9A84C] font-semibold text-sm rounded-lg hover:bg-[#C9A84C]/10 transition-colors flex items-center justify-center gap-2">
                  <Home size={16} />
                  Back to Home
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-gray-400 text-sm">
          Need help? Contact info@luxestl.com
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package } from "lucide-react";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);

  // Redirect user if not logged in
  useEffect(() => {
    if (!user) navigate("/signin");
  }, [user, navigate]);


  // Load user purchases from backend
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:5000/getpurchases?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPurchases(data.purchases);
        }
      })
      .catch((err) => console.error("Error loading purchases:", err));
  }, [user]);


  // Mock Subscriptions (you can replace later)
  const mockSubscriptions = [
    {
      id: "1",
      plan: "Pro Monthly",
      amount: "$29/mo",
      status: "active",
      startDate: "2024-01-15",
      nextBilling: "2024-03-15"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost">Home</Button>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button onClick={logout} variant="outline">Logout</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Manage your subscriptions and purchases</p>
        </div>

        {/* Active Subscriptions */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Active Subscriptions</h3>
          </div>

          {mockSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active subscriptions
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{subscription.plan}</CardTitle>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {subscription.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">Amount:</span>
                        <span className="text-xl font-bold text-primary">{subscription.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Started:</span>
                        <span>{subscription.startDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Next Billing:</span>
                        <span>{subscription.nextBilling}</span>
                      </div>

                      <Button variant="outline" className="w-full mt-4">Manage Subscription</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Purchased Products */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">My Purchases</h3>
          </div>

          {purchases.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No purchases yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase) => (
                <Card key={purchase.payment_id} className="hover:shadow-lg transition-shadow">
                 <CardHeader>
  <div className="flex justify-between items-start">
    <CardTitle className="text-lg line-clamp-2">
      {purchase.product_name}
    </CardTitle>

    <Badge
      variant="outline"
      className={
        purchase.status?.toLowerCase() === "failed"
          ? "bg-red-600"
          : "text-green-600 border-green-600"
      }
    >
      {purchase.status}
    </Badge>
  </div>

  <CardDescription>
    Purchased on {new Date(purchase.purchase_date).toLocaleDateString()}
  </CardDescription>
</CardHeader>


                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">Price Paid:</span>
                        <span className="text-xl font-bold text-primary">
                          {purchase.currency} {purchase.amount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;

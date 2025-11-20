import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package } from "lucide-react";
import { SubscriptionManagement } from "@/components/billingsdk/subscription-management";
import { type CurrentPlan, plans } from "@/lib/billingsdk-config";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/signin");
  }, [user, navigate]);

  // Load user purchases + subscription
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch purchases
        const purchasesRes = await fetch(`http://localhost:5000/getpurchases?email=${user.email}`);
        const purchasesData = await purchasesRes.json();
        if (purchasesData.success) {
          setPurchases(purchasesData.purchases);
        }

        // Fetch subscriptions
        const subscriptionRes = await fetch(`http://localhost:5000/getsubscription?email=${user.email}`);
        const subscriptionData = await subscriptionRes.json();
        console.log(subscriptionData);

        if (
          subscriptionData.success &&
          subscriptionData.subscriptions &&
          subscriptionData.subscriptions.length > 0
        ) {
          const sub = subscriptionData.subscriptions[0];

          // Map payment_frequency_interval to plan type
          const intervalMap: { [key: string]: 'daily' | 'weekly' | 'monthly' } = {
            'Day': 'daily',
            'Week': 'weekly',
            'Month': 'monthly'
          };
          
          const planType = intervalMap[sub.payment_frequency_interval] || 'monthly';
          const plan = plans.find((p) => p.id === planType) || plans[2];

          setCurrentPlan({
            plan: plan,
            type: planType,
            price: `${sub.currency} ${sub.recurring_pre_tax_amount}`,
            nextBillingDate: sub.next_billing_date
              ? new Date(sub.next_billing_date).toLocaleDateString()
              : "N/A",
            paymentMethod: sub.payment_method_id || "Card",
            status: sub.status || "active",
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePlanUpdate = async (planId: string) => {
    try {
      const res = await fetch("http://localhost:5000/updatesubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, plan_id: planId }),
      });
      const data = await res.json();
      if (data.success) window.location.reload();
    } catch (err) {
      console.error("Error updating subscription:", err);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch("http://localhost:5000/cancelsubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (data.success) window.location.reload();
    } catch (err) {
      console.error("Error cancelling subscription:", err);
    }
  };

  const handleKeepSubscription = () => {};

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost">
              Home
            </Button>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Manage your subscriptions and purchases</p>
        </div>

        {/* Active Subscription */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Active Subscription</h3>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading subscription...
              </CardContent>
            </Card>
          ) : !currentPlan ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <Button onClick={() => navigate("/")}>Browse Plans</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-3xl">
              <SubscriptionManagement
                className="w-full"
                currentPlan={currentPlan}
                updatePlan={{
                  currentPlan: currentPlan.plan,
                  plans: plans,
                  onPlanChange: handlePlanUpdate,
                  triggerText: "Update Plan",
                }}
                cancelSubscription={{
                  title: "Cancel Subscription",
                  description: "Are you sure you want to cancel your subscription?",
                  plan: currentPlan.plan,
                  warningTitle: "You will lose access to premium features",
                  warningText:
                    "If you cancel your subscription, you will lose access to all premium features and your data may be limited.",
                  onCancel: handleCancelSubscription,
                  onKeepSubscription: handleKeepSubscription,
                }}
              />
            </div>
          )}
        </div>

        {/* Purchases */}
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
                      <CardTitle className="text-lg line-clamp-2">{purchase.product_name}</CardTitle>

                      <Badge
                        variant="outline"
                        className={
                          purchase.status?.toLowerCase() === "failed"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-primary/10 text-primary border-primary/20"
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

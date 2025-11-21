import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CurrentPlan, Plan } from "@/lib/billingsdk-config";

interface UpdatePlanProps {
  currentPlan: Plan;
  plans: Plan[];
  onPlanChange: (planId: string) => void;
  triggerText: string;
}

interface CancelSubscriptionProps {
  title: string;
  description: string;
  plan: Plan;
  warningTitle: string;
  warningText: string;
  onCancel: (planId: string) => Promise<void>;
  onKeepSubscription: (planId: string) => void;
}

interface SubscriptionManagementProps {
  className?: string;
  currentPlan: CurrentPlan;
  updatePlan: UpdatePlanProps;
  // Optional secondary action (e.g., Downgrade) with its own trigger and handler
  updatePlanSecondary?: UpdatePlanProps;
  cancelSubscription: CancelSubscriptionProps;
}

export function SubscriptionManagement({
  className,
  currentPlan,
  updatePlan,
  updatePlanSecondary,
  cancelSubscription,
}: SubscriptionManagementProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlan.plan.id);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isUpdateSecondaryOpen, setIsUpdateSecondaryOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleUpdatePlan = () => {
    if (selectedPlanId !== currentPlan.plan.id) {
      updatePlan.onPlanChange(selectedPlanId);
      setIsUpdateOpen(false);
    }
  };

  const handleUpdateSecondaryPlan = () => {
    if (!updatePlanSecondary) return;
    if (selectedPlanId !== currentPlan.plan.id) {
      updatePlanSecondary.onPlanChange(selectedPlanId);
      setIsUpdateSecondaryOpen(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription.onCancel(currentPlan.plan.id);
      setIsCancelOpen(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Current Subscription</CardTitle>
            <CardDescription>Manage your billing and subscription settings</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Details */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{currentPlan.plan.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{currentPlan.price}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    currentPlan.status === 'active' && "bg-primary/10 text-primary border-primary/20",
                    currentPlan.status === 'cancelled' && "bg-destructive/10 text-destructive border-destructive/20"
                  )}
                >
                  {currentPlan.status}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{currentPlan.plan.description}</p>
        </div>

        {/* Billing Information */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="font-semibold">Billing Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Next billing date</p>
                <p className="text-sm font-medium">{currentPlan.nextBillingDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Payment method</p>
                <p className="text-sm font-medium">{currentPlan.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-4">
          {/* -------- UPGRADE DIALOG -------- */}
          <Dialog
            open={isUpdateOpen}
            onOpenChange={(open) => {
              setIsUpdateOpen(open);
              if (!open) {
                setSelectedPlanId(currentPlan.plan.id);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="default" className="flex-1">
                {updatePlan.triggerText}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upgrade Your Plan</DialogTitle>
                <DialogDescription>
                  Choose a new plan that fits your needs
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                {updatePlan.plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50",
                      selectedPlanId === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    {selectedPlanId === plan.id && (
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <h4 className="font-semibold mb-1">{plan.title}</h4>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {currentPlan.type === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                    <div className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-primary" />
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUpdateOpen(false);
                    setSelectedPlanId(currentPlan.plan.id);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePlan}
                  disabled={selectedPlanId === currentPlan.plan.id}
                >
                  Confirm Upgrade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* -------- DOWNGRADE DIALOG (optional) -------- */}
          {updatePlanSecondary && (
            <Dialog
              open={isUpdateSecondaryOpen}
              onOpenChange={(open) => {
                setIsUpdateSecondaryOpen(open);
                if (!open) {
                  setSelectedPlanId(currentPlan.plan.id);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex-1">
                  {updatePlanSecondary.triggerText}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Downgrade Your Plan</DialogTitle>
                  <DialogDescription>
                    Select a lower-tier plan
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  {updatePlanSecondary.plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={cn(
                        "relative p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50",
                        selectedPlanId === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      )}
                    >
                      {selectedPlanId === plan.id && (
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <h4 className="font-semibold mb-1">{plan.title}</h4>
                      <p className="text-2xl font-bold text-primary mb-2">
                        {currentPlan.type === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                      <div className="space-y-1">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <Check className="h-3 w-3 text-primary" />
                            <span>{feature.name}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsUpdateSecondaryOpen(false);
                      setSelectedPlanId(currentPlan.plan.id);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateSecondaryPlan}
                    disabled={selectedPlanId === currentPlan.plan.id}
                  >
                    Confirm Downgrade
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* -------- CANCEL DIALOG -------- */}
          <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Cancel Subscription
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {cancelSubscription.title}
                </DialogTitle>
                <DialogDescription>
                  {cancelSubscription.description}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <h4 className="font-semibold text-destructive mb-2">
                    {cancelSubscription.warningTitle}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {cancelSubscription.warningText}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">You will lose access to:</p>
                  <ul className="space-y-1">
                    {cancelSubscription.plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-primary" />
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    cancelSubscription.onKeepSubscription(currentPlan.plan.id);
                    setIsCancelOpen(false);
                  }}
                >
                  Keep Subscription
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* FEATURES */}
        <div className="space-y-3 pt-4 border-t border-border">
          <h4 className="font-semibold">Current Plan Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentPlan.plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span>{feature.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

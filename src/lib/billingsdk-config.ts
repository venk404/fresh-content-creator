export interface Plan {
  id: string;
  title: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  buttonText: string;
  features: Array<{
    name: string;
    icon: 'check' | 'x';
  }>;
}

export interface CurrentPlan {
  plan: Plan;
  type: 'monthly' | 'Weekly' | 'Daily';
  price: string;
  nextBillingDate: string;
  paymentMethod: string;
  status: 'active' | 'inactive' | 'cancelled';
}
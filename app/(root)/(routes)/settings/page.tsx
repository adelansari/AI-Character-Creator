import { SubscriptionButton } from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";

const SettingsPage = async () => {
  const isPremium = await checkSubscription();

  return (
    <div className="h-full p-4 space-y-2">
      <h3 className="text-lg font-medium">Settings</h3>
      <div className="text-muted-foreground text-sm">
        {isPremium
          ? "You are currently on a Premium plan."
          : "You are currently on a free plan."}
      </div>
      <SubscriptionButton isPremium={isPremium} />
    </div>
  );
};

export default SettingsPage;

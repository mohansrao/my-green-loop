import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import AdminNav from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Phone, Bell, Calendar, Package, Save, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Setting {
  key: string;
  label: string;
  description: string;
  value: string;
}

const ICONS: Record<string, any> = {
  admin_phone: Phone,
  admin_email: Mail,
  sms_notifications_enabled: Bell,
  max_rental_days: Calendar,
  max_sets: Package,
};

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/admin/settings"],
  });

  const { register, handleSubmit, watch, setValue, reset } = useForm<Record<string, string>>();

  useEffect(() => {
    if (settings) {
      const values: Record<string, string> = {};
      settings.forEach(s => { values[s.key] = s.value; });
      reset(values);
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const updates = Object.entries(data).map(([key, value]) => ({ key, value }));
      return apiRequest("PUT", "/api/admin/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Settings saved", description: "Your changes have been applied." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings. Please try again.", variant: "destructive" });
    },
  });

  const onSubmit = (data: Record<string, string>) => mutation.mutate(data);

  const smsEnabled = watch("sms_notifications_enabled") === "true";

  const groups = [
    {
      title: "Notifications",
      keys: ["admin_phone", "admin_email", "sms_notifications_enabled"],
    },
    {
      title: "Rental Rules",
      keys: ["max_rental_days", "max_sets"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Settings className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage app configuration without touching the code</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-white rounded-lg animate-pulse border" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {groups.map((group, gi) => (
              <Card key={gi}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-800">{group.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {group.keys.map((key, i) => {
                    const setting = settings?.find(s => s.key === key);
                    if (!setting) return null;
                    const Icon = ICONS[key] || Settings;
                    const isToggle = key === "sms_notifications_enabled";

                    return (
                      <div key={key}>
                        {i > 0 && <Separator className="mb-5" />}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-1.5 bg-gray-100 rounded-md mt-0.5">
                              <Icon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-gray-900 block mb-1">
                                {setting.label}
                              </Label>
                              <p className="text-xs text-gray-500 mb-3">{setting.description}</p>
                              {!isToggle && (
                                <Input
                                  {...register(key)}
                                  className="max-w-sm"
                                  placeholder={setting.value}
                                />
                              )}
                            </div>
                          </div>
                          {isToggle && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{smsEnabled ? "On" : "Off"}</span>
                              <Switch
                                checked={smsEnabled}
                                onCheckedChange={(checked) =>
                                  setValue("sms_notifications_enabled", checked ? "true" : "false")
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {mutation.isPending ? "Saving…" : "Save Settings"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

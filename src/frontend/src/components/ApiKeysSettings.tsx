import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Info, Key, Save, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const STORAGE_KEYS = {
  clickbankApiKey: "vantage_clickbank_api_key",
  jvzooApiKey: "vantage_jvzoo_api_key",
  jvzooApiSecret: "vantage_jvzoo_api_secret",
};

type VisibilityState = {
  clickbankApiKey: boolean;
  jvzooApiKey: boolean;
  jvzooApiSecret: boolean;
};

export default function ApiKeysSettings() {
  const [keys, setKeys] = useState({
    clickbankApiKey: localStorage.getItem(STORAGE_KEYS.clickbankApiKey) || "",
    jvzooApiKey: localStorage.getItem(STORAGE_KEYS.jvzooApiKey) || "",
    jvzooApiSecret: localStorage.getItem(STORAGE_KEYS.jvzooApiSecret) || "",
  });

  const [visible, setVisible] = useState<VisibilityState>({
    clickbankApiKey: false,
    jvzooApiKey: false,
    jvzooApiSecret: false,
  });

  const [saved, setSaved] = useState(false);

  const hasSavedKeys =
    !!localStorage.getItem(STORAGE_KEYS.clickbankApiKey) ||
    !!localStorage.getItem(STORAGE_KEYS.jvzooApiKey);

  const toggleVisibility = (field: keyof VisibilityState) => {
    setVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    if (keys.clickbankApiKey) {
      localStorage.setItem(STORAGE_KEYS.clickbankApiKey, keys.clickbankApiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.clickbankApiKey);
    }
    if (keys.jvzooApiKey) {
      localStorage.setItem(STORAGE_KEYS.jvzooApiKey, keys.jvzooApiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.jvzooApiKey);
    }
    if (keys.jvzooApiSecret) {
      localStorage.setItem(STORAGE_KEYS.jvzooApiSecret, keys.jvzooApiSecret);
    } else {
      localStorage.removeItem(STORAGE_KEYS.jvzooApiSecret);
    }
    setSaved(true);
    toast.success("API keys saved to local storage");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = (field: keyof typeof keys) => {
    setKeys((prev) => ({ ...prev, [field]: "" }));
    localStorage.removeItem(STORAGE_KEYS[field]);
    toast.success("Key cleared");
  };

  const fields: {
    key: keyof typeof keys;
    label: string;
    placeholder: string;
    network: string;
  }[] = [
    {
      key: "clickbankApiKey",
      label: "ClickBank API Key",
      placeholder: "API-XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      network: "ClickBank",
    },
    {
      key: "jvzooApiKey",
      label: "JVZoo API Key",
      placeholder: "Your JVZoo API key",
      network: "JVZoo",
    },
    {
      key: "jvzooApiSecret",
      label: "JVZoo API Secret",
      placeholder: "Your JVZoo API secret",
      network: "JVZoo",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">
                Keys stored locally in your browser
              </p>
              <p className="text-xs text-muted-foreground">
                API keys are saved to your browser's localStorage and never sent
                to any server. They are used client-side only to configure your
                affiliate network connections. For maximum security, only enter
                keys on trusted devices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasSavedKeys && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Badge className="gap-1.5 bg-chart-2/20 text-chart-2 border-chart-2/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            Keys configured
          </Badge>
        </motion.div>
      )}

      <div className="space-y-4">
        {fields.map(({ key, label, placeholder, network }) => (
          <div key={key} className="space-y-2">
            <Label
              htmlFor={`api-key-${key}`}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              {label}
              <Badge variant="outline" className="text-xs py-0">
                {network}
              </Badge>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={`api-key-${key}`}
                  data-ocid={`settings.${key
                    .toLowerCase()
                    .replace(/([A-Z])/g, "_$1")
                    .toLowerCase()}.input`}
                  type={visible[key] ? "text" : "password"}
                  value={keys[key]}
                  onChange={(e) =>
                    setKeys((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="pr-10 font-mono text-sm bg-card border-border"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  data-ocid={`settings.${key
                    .toLowerCase()
                    .replace(/([A-Z])/g, "_$1")
                    .toLowerCase()}.toggle`}
                  onClick={() => toggleVisibility(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={visible[key] ? "Hide key" : "Show key"}
                >
                  {visible[key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {keys[key] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClear(key)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        data-ocid="settings.save_button"
        onClick={handleSave}
        className="w-full gap-2"
        variant={saved ? "secondary" : "default"}
      >
        <Save className="h-4 w-4" />
        {saved ? "Saved!" : "Save API Keys"}
      </Button>
    </div>
  );
}

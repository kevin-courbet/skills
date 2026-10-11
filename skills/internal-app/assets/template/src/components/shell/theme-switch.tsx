import { useMutation } from "@tanstack/react-query";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { setThemeChoiceFn, ThemeChoice, useTheme } from "@/lib/theme";
import { failureMessage } from "@/lib/server-result";
import { toast } from "@/components/ui/toaster";
import { Schema } from "effect";

const labels: Record<ThemeChoice, string> = { light: "Light", dark: "Dark", system: "System" };
const icons = { light: Sun, dark: Moon, system: Monitor } as const;

export function ThemeSwitch() {
  const { choice: value, setChoice } = useTheme();
  const mutation = useMutation({
    mutationFn: (choice: ThemeChoice) => setThemeChoiceFn({ data: choice }),
    onSuccess: setChoice,
    onError: (error) =>
      toast.error("The theme could not be saved", { description: failureMessage(error) }),
  });
  const Icon = icons[value];
  return (
    <MenuTrigger>
      <Button
        intent="ghost"
        size="sm"
        iconOnly
        aria-label={`Theme: ${labels[value]}`}
        isDisabled={mutation.isPending}
      >
        <Icon width={16} height={16} />
      </Button>
      <Menu
        aria-label="Theme"
        selectionMode="single"
        selectedKeys={[value]}
        onAction={(key) => mutation.mutate(Schema.decodeUnknownSync(ThemeChoice)(key))}
      >
        <MenuItem id="light" icon={<Sun width={16} height={16} />}>
          Light
        </MenuItem>
        <MenuItem id="dark" icon={<Moon width={16} height={16} />}>
          Dark
        </MenuItem>
        <MenuItem id="system" icon={<Monitor width={16} height={16} />}>
          System
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

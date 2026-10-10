import { useRouter } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { setThemeChoiceFn, type ThemeChoice } from "@/lib/theme";

const labels: Record<ThemeChoice, string> = { light: "Light", dark: "Dark", system: "System" };
const icons = { light: Sun, dark: Moon, system: Monitor } as const;

export function ThemeSwitch({ value }: { readonly value: ThemeChoice }) {
  const router = useRouter();
  const Icon = icons[value];
  return (
    <MenuTrigger>
      <Button intent="ghost" size="sm" iconOnly aria-label={`Theme: ${labels[value]}`}>
        <Icon width={16} height={16} />
      </Button>
      <Menu
        aria-label="Theme"
        selectionMode="single"
        selectedKeys={[value]}
        onAction={async (key) => {
          await setThemeChoiceFn({ data: key as ThemeChoice });
          await router.invalidate();
        }}
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

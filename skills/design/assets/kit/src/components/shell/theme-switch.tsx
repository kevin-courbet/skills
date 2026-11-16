/**
 * The menu in the top bar that chooses the light theme, the dark theme, or the theme of the system.
 *
 * @layer shell
 * @keywords theme switch, dark mode toggle, light and dark theme, theme menu, color scheme
 * @related AppShell, AppDocument, Menu
 * @notes dark-theme
 *
 * `AppShell` renders it at the end of the top bar. Do not add a second theme
 * control to a page or a settings card.
 *
 * ## Behavior
 * - It saves the choice in the `theme` cookie through a server function, and
 *   then updates the theme state of `AppDocument`. The app data does not
 *   reload.
 * - The button is disabled while the save runs. A failed save shows an error
 *   toast with the reason.
 *
 * ## Example
 * ```tsx
 * <ThemeSwitch />
 * ```
 */
import { useMutation } from "@tanstack/react-query";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { Menu, MenuItem, MenuTrigger } from "@/components/primitives/menu";
import { setThemeChoiceFn, ThemeChoice, useTheme } from "@/lib/theme";
import { failureMessage } from "@/lib/server-result";
import { toast } from "@/components/primitives/toaster";
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
        <MenuItem id="light" icon={Sun}>
          Light
        </MenuItem>
        <MenuItem id="dark" icon={Moon}>
          Dark
        </MenuItem>
        <MenuItem id="system" icon={Monitor}>
          System
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

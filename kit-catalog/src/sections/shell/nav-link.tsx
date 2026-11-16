import * as stylex from "@stylexjs/stylex";
import { ClipboardList } from "lucide-react";
import { NavLink } from "@/components/shell/nav-link";
import { color, radius, space } from "@/styles/tokens.stylex";
import { defineSection, Labeled, Row } from "../../specimen";

export default defineSection({
  component: "NavLink",
  specimens: [
    {
      title: "Current page",
      note: "The catalog has only the route \"/\", so each item here is the current page. The other items of a real sidebar show the muted text with no surface.",
      render: () => (
        <Row align="start">
          <Labeled label="icon">
            <nav aria-label="Workshop" {...stylex.props(styles.sidebar)}>
              <NavLink to="/" icon={ClipboardList} exact>
                Work orders
              </NavLink>
            </nav>
          </Labeled>
          <Labeled label="no icon">
            <nav aria-label="Workshop" {...stylex.props(styles.sidebar)}>
              <NavLink to="/" exact>
                Work orders
              </NavLink>
            </nav>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Long label that truncates",
      note: "The label stays on one line and ends with an ellipsis in a narrow sidebar.",
      render: () => (
        <nav aria-label="Workshop" {...stylex.props(styles.sidebar, styles.narrow)}>
          <NavLink to="/" icon={ClipboardList} exact>
            Work orders waiting for customer approval
          </NavLink>
        </nav>
      ),
    },
  ],
});

const styles = stylex.create({
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    width: "15rem",
    padding: space.sm,
    backgroundColor: color.frame,
    borderRadius: radius.lg,
  },
  narrow: { width: "11rem" },
});

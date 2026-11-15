import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { FormShowcase } from "@/components/showcase/showcase-form";
import { LinkButton } from "@/components/primitives/button";
import { Page } from "@/components/primitives/layout";

const FormShowcaseSearch = Schema.Struct({
  density: Schema.optionalKey(Schema.Literals(["touch"])),
});

export const Route = createFileRoute("/_app/design-kit_/form")({
  staticData: { crumb: "Design kit form" },
  validateSearch: Schema.toStandardSchemaV1(FormShowcaseSearch),
  // The quick picks and the due date check need one today that is stable across SSR and hydration.
  loader: () => ({ today: new Date().toISOString().slice(0, 10) }),
  component: FormShowcasePage,
});

function FormShowcasePage() {
  const search = Route.useSearch();
  const { today } = Route.useLoaderData();
  return (
    <Page density={search.density === "touch" ? "touch" : "default"}>
      <FormShowcase
        today={today}
        cancel={
          <LinkButton to="/design-kit" intent="ghost">
            Cancel
          </LinkButton>
        }
      />
    </Page>
  );
}

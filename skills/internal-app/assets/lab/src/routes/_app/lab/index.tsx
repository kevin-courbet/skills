import { createFileRoute } from "@tanstack/react-router";
import { LinkButton } from "@/components/primitives/button";
import { Item, ItemList } from "@/components/primitives/item";
import { Page, PageHeader } from "@/components/primitives/layout";

/**
 * The index of the lab: one row per recipe. `internal-app check` in the skill
 * fails when a recipe route is missing here, so that each recipe stays one
 * click away in a scaffold with the lab.
 */
export const Route = createFileRoute("/_app/lab/")({
  staticData: { crumb: "Lab" },
  component: LabPage,
});

function LabPage() {
  return (
    <Page width="reading">
      <PageHeader
        title="Lab"
        description="Each recipe is a complete page for one page type. Print one with internal-app recipe <id>."
      />
      <ItemList label="Recipes">
        <Item
          title="ListPage"
          description="A table of records with a search, URL filters, sorting, and pages."
          actions={<LinkButton to="/lab/list-page">Open</LinkButton>}
        />
        <Item
          title="DetailPage"
          description="One record with its status, its facts, and the actions on it."
          actions={
            <LinkButton to="/lab/detail-page/$ticketId" params={{ ticketId: "TCK-4101" }}>
              Open
            </LinkButton>
          }
        />
        <Item
          title="SettingsPage"
          description="Groups of settings that apply at once, each change saved on its own."
          actions={<LinkButton to="/lab/settings-page">Open</LinkButton>}
        />
        <Item
          title="PreviewForm"
          description="A long form beside a live preview of the thing that it makes."
          actions={<LinkButton to="/lab/preview-form">Open</LinkButton>}
        />
        <Item
          title="WorkBoard"
          description="Columns of cards that people move between stages."
          actions={<LinkButton to="/lab/work-board">Open</LinkButton>}
        />
        <Item
          title="TouchQueue"
          description="The work of one person on a shared tablet, grouped by the next action."
          actions={<LinkButton to="/lab/touch-queue">Open</LinkButton>}
        />
        <Item
          title="OverviewPage"
          description="The key numbers, the trend behind them, and a link to each set of records."
          actions={<LinkButton to="/lab/overview-page">Open</LinkButton>}
        />
        <Item
          title="ApprovalList"
          description="Requests that wait for a decision, with motion that shows where each one goes."
          actions={<LinkButton to="/lab/approval-list">Open</LinkButton>}
        />
      </ItemList>
    </Page>
  );
}

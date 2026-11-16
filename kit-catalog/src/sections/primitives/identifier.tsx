import { Identifier } from "@/components/primitives/identifier";
import { Column, defineSection, Labeled, Row } from "../../specimen";

const paymentId = "pay_7f3c9a1e4b2d48e6a0c5f19d2e7b6a43";

export default defineSection({
  component: "Identifier",
  specimens: [
    {
      title: "Sizes",
      note: "sm for table cells and metadata, md for body text, lg for a detail page title.",
      render: () => (
        <Column>
          <Labeled label="sm">
            <Identifier value="WO-1048" label="work order number" size="sm" />
          </Labeled>
          <Labeled label="md">
            <Identifier value="WO-1048" label="work order number" size="md" />
          </Labeled>
          <Labeled label="lg">
            <Identifier value="WO-1048" label="work order number" size="lg" />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Short display",
      note: "The copy button copies the full value, and the full value shows on hover.",
      render: () => (
        <Row>
          <Labeled label="display">
            <Identifier value={paymentId} display={paymentId.slice(0, 12)} label="payment ID" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Muted next to a name",
      render: () => (
        <Row>
          <span>Lena Fischer</span>
          <Identifier value="CUS-30418" label="customer ID" size="sm" muted />
        </Row>
      ),
    },
    {
      title: "Not copyable",
      note: "Turn off the copy button where people never paste the value elsewhere.",
      render: () => (
        <Row>
          <Identifier value="A-12-03" label="stock bin" copyable={false} />
        </Row>
      ),
    },
    {
      title: "Long value in a narrow frame",
      note: "A long value ends with an ellipsis instead of wrapping.",
      render: () => (
        <Column width="14rem">
          <Identifier
            value="tracking.velotech.eu/parcel/JJD000390007712345"
            label="parcel tracking address"
          />
          <Identifier value={paymentId} label="payment ID" size="sm" />
        </Column>
      ),
    },
  ],
});

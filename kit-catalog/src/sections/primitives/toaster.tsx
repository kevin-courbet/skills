import { Button } from "@/components/primitives/button";
import { toast } from "@/components/primitives/toaster";
import { defineSection, Labeled, Row } from "../../specimen";

export default defineSection({
  component: "Toaster",
  specimens: [
    {
      title: "Error toast",
      note: "Use it for a failure that has no inline place, such as a card that a board puts back. The toasts show at the bottom right of the page, in the theme of the page.",
      render: () => (
        <Row>
          <Button
            onPress={() => toast.error("WO-1042 did not move to Ready for pickup. Try again.")}
          >
            Show error toast
          </Button>
        </Row>
      ),
    },
    {
      title: "Error toast with description",
      note: "The title names the object and the problem. The description says what to do.",
      render: () => (
        <Row>
          <Button
            onPress={() =>
              toast.error("Invoice INV-2291 was not sent", {
                description:
                  "The mail server refused the address of Margaux Lefèvre. Correct the email, then send the invoice again.",
              })
            }
          >
            Show error toast with description
          </Button>
        </Row>
      ),
    },
    {
      title: "Result that is not on the screen",
      note: "Show a success toast only when the UI does not already show the result.",
      render: () => (
        <Row>
          <Labeled label="toast.success">
            <Button
              onPress={() =>
                toast.success("Parts order sent to Cycles Lambert", {
                  description: "1 chain and 1 cassette for WO-1042, delivery on Nov 19.",
                })
              }
            >
              Order parts
            </Button>
          </Labeled>
          <Labeled label="toast">
            <Button onPress={() => toast("The daily report of Nov 16 is in your email")}>
              Email daily report
            </Button>
          </Labeled>
        </Row>
      ),
    },
  ],
});

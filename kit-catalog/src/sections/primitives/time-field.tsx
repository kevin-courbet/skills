import { useState } from "react";
import { TimeField, type TimeFieldProps } from "@/components/primitives/time-field";
import { defineSection, Row } from "../../specimen";

function DemoTimeField({
  initial,
  ...props
}: Omit<TimeFieldProps, "value" | "onChange"> & { readonly initial: string | null }) {
  const [time, setTime] = useState<string | null>(initial);
  return <TimeField {...props} value={time} onChange={setTime} />;
}

function PickupTime() {
  const [time, setTime] = useState<string | null>("19:00");
  const isAfterClosing = time !== null && time > "18:00";
  return (
    <TimeField
      label="Pickup time"
      description="The shop opens from 08:30 to 18:00."
      width="sm"
      minValue="08:30"
      maxValue="18:00"
      value={time}
      onChange={setTime}
      errorMessage={
        isAfterClosing ? "The shop closes at 18:00. Choose an earlier time." : undefined
      }
    />
  );
}

function RequiredDropOff() {
  const [time, setTime] = useState<string | null>(null);
  return (
    <TimeField
      label="Drop-off time"
      width="sm"
      isRequired
      value={time}
      onChange={setTime}
      errorMessage={time === null ? "Enter when the customer brings the bike." : undefined}
    />
  );
}

export default defineSection({
  component: "TimeField",
  specimens: [
    {
      title: "Time of day",
      note: "People type each part, use the arrow keys, or open the clock button. The value is an ISO time string.",
      render: () => (
        <Row align="start">
          <DemoTimeField label="Pickup time" width="sm" initial="17:30" />
          <DemoTimeField label="Lunch break" width="sm" initial={null} isOptional />
        </Row>
      ),
    },
    {
      title: "Zone label",
      note: "Give a zone label when people can misread the time zone, such as for a server job.",
      render: () => (
        <Row>
          <DemoTimeField
            label="Nightly invoice export"
            width="sm"
            zoneLabel="UTC"
            initial="02:00"
          />
        </Row>
      ),
    },
    {
      title: "Minute step and seconds",
      note: "minuteStep sets the choices in the popover and must divide 60. Typed values keep any minute.",
      render: () => (
        <Row align="start">
          <DemoTimeField label="Appointment" width="sm" minuteStep={15} initial="10:45" />
          <DemoTimeField
            label="Time on the camera"
            description="For the police report of a bike taken from the rack."
            width="sm"
            granularity="second"
            initial="14:32:08"
          />
        </Row>
      ),
    },
    {
      title: "Range limits and invalid",
      note: "A time outside minValue and maxValue shows as invalid, and the popover disables those hours.",
      render: () => (
        <Row align="start">
          <PickupTime />
          <RequiredDropOff />
        </Row>
      ),
    },
    {
      title: "Disabled and read-only",
      render: () => (
        <Row align="start">
          <DemoTimeField label="Opening time" width="sm" isDisabled initial="08:30" />
          <DemoTimeField label="Closing time" width="sm" isReadOnly initial="18:00" />
        </Row>
      ),
    },
  ],
});

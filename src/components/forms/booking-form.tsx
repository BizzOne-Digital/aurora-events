"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { submitBooking } from "@/app/(site)/actions";
import { EVENT_TYPES } from "@/lib/constants";
import { bookingSchema } from "@/lib/validation";
import { ConsentCheckbox, SelectField, SpamTraps, SubmitButton, TextArea, TextField } from "./fields";
import { useInquiryForm } from "./use-inquiry-form";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  eventType: "",
  eventDate: "",
  guestCount: "",
  location: "",
  details: "",
  contactPreference: "",
  consent: false,
};

export function BookingForm({ initialType, phone, phoneDisplay }: { initialType?: string; phone: string; phoneDisplay: string }) {
  const [round, setRound] = useState(0);
  return (
    <BookingFormInner
      key={round}
      initialType={initialType}
      phone={phone}
      phoneDisplay={phoneDisplay}
      onAgain={() => setRound((r) => r + 1)}
    />
  );
}

function BookingFormInner({
  initialType,
  phone,
  phoneDisplay,
  onAgain,
}: {
  initialType?: string;
  phone: string;
  phoneDisplay: string;
  onAgain: () => void;
}) {
  const startType = (EVENT_TYPES as readonly string[]).includes(initialType ?? "") ? (initialType as string) : "";
  const { values, set, errors, state, pending, formAction, onSubmit, stampRef, formRef } = useInquiryForm(
    { ...EMPTY, eventType: startType },
    bookingSchema,
    submitBooking,
  );

  if (state.ok) {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="grad-border rounded-[2rem] p-8 text-center sm:p-12"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.2 }}
          className="aurora-fill mx-auto grid h-16 w-16 place-items-center rounded-full"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-plum-950" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.45, duration: 0.6 }} />
          </svg>
        </motion.span>
        <h2 className="display-md mt-6">Thank you. We have your inquiry.</h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          We will review your details and contact you using your preferred method. Please note that submitting this form does
          not confirm availability or reserve your event date.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={`tel:${phone}`} className="btn btn-primary">
            Call {phoneDisplay}
          </a>
          <button type="button" onClick={onAgain} className="btn btn-ghost">
            Send another inquiry
          </button>
        </div>
      </motion.div>
    );
  }

  const errorCount = Object.keys(errors).length;
  const banner = errorCount > 0 ? "Please check the highlighted fields and try again." : !state.errors && state.message ? state.message : null;

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate aria-label="Event inquiry form" className="relative space-y-6">
      <SpamTraps stampRef={stampRef} />

      {banner && (
        <div role="alert" className="rounded-2xl border border-[#c0261a]/30 bg-[#fdecea] px-5 py-4 text-sm font-semibold text-[#8f1d13]">
          {banner}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Full name" name="name" required autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />
        <TextField label="Email" name="email" type="email" required autoComplete="email" inputMode="email" value={values.email} onChange={set("email")} error={errors.email} />
        <TextField label="Phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" value={values.phone} onChange={set("phone")} error={errors.phone} />
        <SelectField label="Event type" name="eventType" required options={EVENT_TYPES} value={values.eventType} onChange={set("eventType")} error={errors.eventType} placeholder="Choose an event type" />
        <TextField label="Preferred event date" name="eventDate" type="date" required value={values.eventDate} onChange={set("eventDate")} error={errors.eventDate} hint="A preferred date only. It is not reserved." />
        <TextField label="Estimated guest count" name="guestCount" type="number" min={1} inputMode="numeric" required value={values.guestCount} onChange={set("guestCount")} error={errors.guestCount} />
      </div>
      <TextField label="Event location or city" name="location" required autoComplete="address-level2" value={values.location} onChange={set("location")} error={errors.location} />
      <TextArea
        label="Event details"
        name="details"
        required
        rows={6}
        value={values.details}
        onChange={set("details")}
        error={errors.details}
        hint="Tell us about the occasion, the atmosphere you have in mind, traditions to include and anything else that matters."
        maxLength={4000}
      />
      <SelectField
        label="How should we contact you?"
        name="contactPreference"
        required
        options={["Phone call", "Email", "Either"]}
        value={values.contactPreference}
        onChange={set("contactPreference")}
        error={errors.contactPreference}
        placeholder="Choose a contact preference"
      />
      <ConsentCheckbox name="consent" checked={values.consent} onChange={set("consent")} error={errors.consent}>
        I agree to be contacted about this inquiry. I understand that submitting it does not confirm availability or reserve my event date.
      </ConsentCheckbox>

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
        <SubmitButton pending={pending} pendingText="Sending your inquiry...">
          Send my inquiry
        </SubmitButton>
        <p className="text-sm text-muted" aria-live="polite">
          {pending ? "Please wait while we save your inquiry." : "No payment is taken. We will reach out to discuss your event."}
        </p>
      </div>
    </form>
  );
}

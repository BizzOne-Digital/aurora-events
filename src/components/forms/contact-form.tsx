"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { submitContact } from "@/app/(site)/actions";
import { contactSchema } from "@/lib/validation";
import { ConsentCheckbox, SpamTraps, SubmitButton, TextArea, TextField } from "./fields";
import { useInquiryForm } from "./use-inquiry-form";

const EMPTY = { name: "", email: "", phone: "", message: "", consent: false };

export function ContactForm() {
  const [round, setRound] = useState(0);
  return <ContactFormInner key={round} onAgain={() => setRound((r) => r + 1)} />;
}

function ContactFormInner({ onAgain }: { onAgain: () => void }) {
  const { values, set, errors, state, pending, formAction, onSubmit, stampRef, formRef } = useInquiryForm(EMPTY, contactSchema, submitContact);

  if (state.ok) {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="grad-border rounded-[2rem] p-8 text-center sm:p-10"
      >
        <h2 className="display-md">Message received.</h2>
        <p className="mx-auto mt-4 max-w-md text-muted">Thank you for getting in touch. We will reply as soon as we can.</p>
        <button type="button" onClick={onAgain} className="btn btn-ghost mt-8">
          Send another message
        </button>
      </motion.div>
    );
  }

  const errorCount = Object.keys(errors).length;
  const banner = errorCount > 0 ? "Please check the highlighted fields and try again." : !state.errors && state.message ? state.message : null;
  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate aria-label="Contact form" className="relative space-y-6">
      <SpamTraps stampRef={stampRef} />
      {banner && (
        <div role="alert" className="rounded-2xl border border-[#c0261a]/30 bg-[#fdecea] px-5 py-4 text-sm font-semibold text-[#8f1d13]">
          {banner}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Name" name="name" required autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />
        <TextField label="Email" name="email" type="email" required autoComplete="email" inputMode="email" value={values.email} onChange={set("email")} error={errors.email} />
      </div>
      <TextField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={set("phone")} error={errors.phone} />
      <TextArea label="Your message" name="message" required rows={6} value={values.message} onChange={set("message")} error={errors.message} maxLength={4000} />
      <ConsentCheckbox name="consent" checked={values.consent} onChange={set("consent")} error={errors.consent}>
        I agree to be contacted about my message.
      </ConsentCheckbox>
      <SubmitButton pending={pending} pendingText="Sending...">
        Send message
      </SubmitButton>
    </form>
  );
}

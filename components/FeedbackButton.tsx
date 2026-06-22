'use client';

import { useEffect, useState } from 'react';
import {
  FeedbackBackground,
  FeedbackMode,
  FeedbackAwareness,
  FeedbackLeverClarity,
  FeedbackWouldUse,
  saveFeedback,
} from '@/lib/feedback';

interface Props {
  defaultMode?: FeedbackMode;
}

export function FeedbackButton({ defaultMode = 'simulator' }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [background, setBackground] = useState<FeedbackBackground | ''>('');
  const [mode, setMode] = useState<FeedbackMode>(defaultMode);
  const [awareness, setAwareness] = useState<FeedbackAwareness | ''>('');
  const [awarenessComment, setAwarenessComment] = useState('');
  const [leverClarity, setLeverClarity] = useState<FeedbackLeverClarity | ''>('');
  const [leverClarityComment, setLeverClarityComment] = useState('');
  const [wouldUse, setWouldUse] = useState<FeedbackWouldUse | ''>('');
  const [wouldUseComment, setWouldUseComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [otherComments, setOtherComments] = useState('');

  // Lock body scroll while modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function reset() {
    setBackground('');
    setMode(defaultMode);
    setAwareness('');
    setAwarenessComment('');
    setLeverClarity('');
    setLeverClarityComment('');
    setWouldUse('');
    setWouldUseComment('');
    setSuggestions('');
    setOtherComments('');
    setSubmitted(false);
  }

  function closeModal() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!background || !awareness || !leverClarity || !wouldUse) return;
    saveFeedback({
      background,
      mode,
      awareness,
      awareness_comment: awarenessComment.trim(),
      lever_clarity: leverClarity,
      lever_clarity_comment: leverClarityComment.trim(),
      would_use: wouldUse,
      would_use_comment: wouldUseComment.trim(),
      suggestions: suggestions.trim(),
      other_comments: otherComments.trim(),
      timestamp: Date.now(),
    });
    setSubmitted(true);
  }

  const formValid = background && awareness && leverClarity && wouldUse;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9998] rounded-full bg-[#1B3A2D] hover:bg-[#2A4F3F] text-white px-4 py-2.5 text-sm font-medium shadow-lg ring-1 ring-black/10 transition"
      >
        Give Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#FAF8F4] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#DDD7CF] bg-[#1B3A2D] px-6 py-4">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-white">
                {submitted ? 'Thank you' : 'Share your feedback'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="rounded-md p-1 text-[#8FC4A8] hover:bg-white/10 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <p className="text-base text-[#1B3A2D] mb-2">Your response has been saved.</p>
                <p className="text-sm text-stone-600 mb-6">
                  Thank you for helping improve this tool — your input contributes to graduation research at Hotelschool The Hague.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md bg-[#1B3A2D] hover:bg-[#2A4F3F] text-white px-5 py-2 text-sm font-medium transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6 text-[#1B3A2D]">
                <Field label="1. What is your background?" required>
                  <RadioGroup
                    name="background"
                    value={background}
                    onChange={(v) => setBackground(v as FeedbackBackground)}
                    options={[
                      { value: 'hospitality_professional', label: 'Hospitality professional (owner, manager, or staff)' },
                      { value: 'hospitality_student', label: 'Hospitality student' },
                      { value: 'other_student_professional', label: 'Other student or professional' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </Field>

                <Field label="2. Did you try the Simulator or the Game mode?" required>
                  <RadioGroup
                    name="mode"
                    value={mode}
                    onChange={(v) => setMode(v as FeedbackMode)}
                    options={[
                      { value: 'simulator', label: 'Simulator (professional tool)' },
                      { value: 'game', label: 'Game (Silent Grant Challenge)' },
                      { value: 'both', label: 'Both' },
                    ]}
                  />
                </Field>

                <Field
                  label="3. Before using this tool, were you aware that a structural decline in alcohol consumption could affect a restaurant's profit this much?"
                  required
                >
                  <RadioGroup
                    name="awareness"
                    value={awareness}
                    onChange={(v) => setAwareness(v as FeedbackAwareness)}
                    options={[
                      { value: 'already_aware', label: 'Yes, I was already aware' },
                      { value: 'general_sense', label: 'I had a general sense, but not the scale' },
                      { value: 'new_to_me', label: 'No, this was new to me' },
                    ]}
                  />
                  <TextArea
                    placeholder="If you'd like, explain why:"
                    value={awarenessComment}
                    onChange={setAwarenessComment}
                  />
                </Field>

                <Field
                  label="4. Did the three levers (non-alcoholic pairing, menu engineering, upselling) make sense as a strategy to you?"
                  required
                >
                  <RadioGroup
                    name="lever_clarity"
                    value={leverClarity}
                    onChange={(v) => setLeverClarity(v as FeedbackLeverClarity)}
                    options={[
                      { value: 'yes_clearly', label: 'Yes, clearly' },
                      { value: 'partly', label: 'Partly' },
                      { value: 'no_confusing', label: 'No, it was confusing' },
                    ]}
                  />
                  <TextArea
                    placeholder="What was unclear, if anything:"
                    value={leverClarityComment}
                    onChange={setLeverClarityComment}
                  />
                </Field>

                <Field
                  label="5. Would you use a tool like this in practice (as an operator) or in your studies (as a student)?"
                  required
                >
                  <RadioGroup
                    name="would_use"
                    value={wouldUse}
                    onChange={(v) => setWouldUse(v as FeedbackWouldUse)}
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                      { value: 'maybe', label: 'Maybe' },
                    ]}
                  />
                  <TextArea
                    placeholder="Why or why not:"
                    value={wouldUseComment}
                    onChange={setWouldUseComment}
                  />
                </Field>

                <Field label="6. Is there anything you think the tool is missing, or anything you'd change?">
                  <TextArea
                    placeholder="Your suggestions (optional)"
                    value={suggestions}
                    onChange={setSuggestions}
                  />
                </Field>

                <Field label="7. Any other comments?">
                  <TextArea
                    placeholder="Anything else (optional)"
                    value={otherComments}
                    onChange={setOtherComments}
                  />
                </Field>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#DDD7CF]">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-md px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formValid}
                    className="rounded-md bg-[#1B3A2D] hover:bg-[#2A4F3F] disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-5 py-2 text-sm font-medium transition"
                  >
                    Submit feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-[#1B3A2D]">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-start gap-2.5 cursor-pointer rounded-md px-2 py-1.5 hover:bg-[#EFEBE3] transition"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 accent-[#1B3A2D]"
          />
          <span className="text-sm text-stone-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function TextArea({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      className="mt-1 w-full rounded-md border border-[#DDD7CF] bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#1B3A2D] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
    />
  );
}

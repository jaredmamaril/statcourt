"use client";

import { Check, X } from "lucide-react";

const PASSWORD_REQUIREMENTS = [
  {
    label: "8+ characters",
    isMet: (password: string) => password.length >= 8,
  },
  {
    label: "Lowercase letter",
    isMet: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "Uppercase letter",
    isMet: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "Number",
    isMet: (password: string) => /[0-9]/.test(password),
  },
  {
    label: "Symbol",
    isMet: (password: string) =>
      /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/.test(password),
  },
];

export function getPasswordValidationMessage(password: string) {
  const unmetRequirement = PASSWORD_REQUIREMENTS.find(
    (requirement) => !requirement.isMet(password),
  );

  return unmetRequirement
    ? `Add ${unmetRequirement.label.toLowerCase()}.`
    : "";
}

export function isPasswordValid(password: string) {
  return PASSWORD_REQUIREMENTS.every((requirement) =>
    requirement.isMet(password),
  );
}

type PasswordRequirementsProps = {
  password: string;
  compact?: boolean;
};

export function PasswordRequirements({
  password,
  compact = false,
}: PasswordRequirementsProps) {
  return (
    <div
      className={`rounded-md border border-white/10 bg-black/20 ${
        compact ? "p-1.5" : "p-2"
      }`}
    >
      <p className="mb-1 font-michroma text-[8px] uppercase text-white/65 lg:text-[9px]">
        Password Requirements
      </p>

      <div className="grid grid-cols-1 gap-1 min-[380px]:grid-cols-2">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const isMet = requirement.isMet(password);
          const Icon = isMet ? Check : X;

          return (
            <div
              key={requirement.label}
              className={`flex items-center gap-1.5 font-michroma text-[8px] uppercase transition lg:text-[9px] ${
                isMet ? "text-[#22C55E]" : "text-red-200"
              }`}
            >
              <Icon className="h-2.5 w-2.5 shrink-0 lg:h-3 lg:w-3" />
              <span>{requirement.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

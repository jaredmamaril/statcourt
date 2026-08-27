import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  getPasswordValidationMessage,
  isPasswordValid,
  PasswordRequirements,
} from "../components/auth/password-requirements";
import { getEmailValidationMessage } from "./email-validation";
import { getSafeInternalRedirectPath } from "./safe-redirect";

describe("StatCourt validation helpers", () => {
  it("accepts valid common email addresses", () => {
    expect(getEmailValidationMessage("player@gmail.com")).toBeNull();
    expect(getEmailValidationMessage(" scout@outlook.com ")).toBeNull();
  });

  it("returns helpful safe email validation messages", () => {
    expect(getEmailValidationMessage("player@gmail.cpm")).toBe(
      "Did you mean player@gmail.com?",
    );
    expect(getEmailValidationMessage("player@gmail")).toBe(
      "Use gmail.com after @.",
    );
    expect(getEmailValidationMessage("player@domain")).toBe(
      "Add the full email ending, like .com.",
    );
  });

  it("only allows safe internal redirect destinations", () => {
    expect(getSafeInternalRedirectPath("/profile")).toBe("/profile");
    expect(getSafeInternalRedirectPath("/lineups?tab=saved")).toBe(
      "/lineups?tab=saved",
    );
    expect(getSafeInternalRedirectPath("https://evil.com", "/players")).toBe(
      "/players",
    );
    expect(getSafeInternalRedirectPath("//evil.com", "/players")).toBe(
      "/players",
    );
    expect(getSafeInternalRedirectPath("/signin?next=/profile", "/players")).toBe(
      "/players",
    );
  });
});

describe("Password requirements", () => {
  it("validates the full Supabase password rule set", () => {
    expect(isPasswordValid("short")).toBe(false);
    expect(getPasswordValidationMessage("Password1")).toBe("Add symbol.");
    expect(isPasswordValid("Password1!")).toBe(true);
  });

  it("shows requirement states accessibly in the component", () => {
    render(<PasswordRequirements password="Password1!" />);

    expect(screen.getByText("Password Requirements")).toBeInTheDocument();
    expect(screen.getByText("8+ characters")).toBeInTheDocument();
    expect(screen.getByText("Lowercase letter")).toBeInTheDocument();
    expect(screen.getByText("Uppercase letter")).toBeInTheDocument();
    expect(screen.getByText("Number")).toBeInTheDocument();
    expect(screen.getByText("Symbol")).toBeInTheDocument();
  });
});

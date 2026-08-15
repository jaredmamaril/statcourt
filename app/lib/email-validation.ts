const commonIncompleteEmailDomains = new Map([
  ["gmail", "gmail.com"],
  ["googlemail", "googlemail.com"],
  ["outlook", "outlook.com"],
  ["hotmail", "hotmail.com"],
  ["live", "live.com"],
  ["msn", "msn.com"],
  ["yahoo", "yahoo.com"],
  ["icloud", "icloud.com"],
  ["me", "me.com"],
  ["mac", "mac.com"],
  ["aol", "aol.com"],
  ["proton", "proton.me"],
  ["protonmail", "protonmail.com"],
]);

const commonEmailDomainTypos = new Map([
  ["gamil.com", "gmail.com"],
  ["gmial.com", "gmail.com"],
  ["gmail.co", "gmail.com"],
  ["gmail.cmo", "gmail.com"],
  ["gmail.cpm", "gmail.com"],
  ["gmail.con", "gmail.com"],
  ["gmail.om", "gmail.com"],
  ["gmai.com", "gmail.com"],
  ["gnail.com", "gmail.com"],
  ["hotmial.com", "hotmail.com"],
  ["hotmai.com", "hotmail.com"],
  ["hotmail.co", "hotmail.com"],
  ["hotmail.cmo", "hotmail.com"],
  ["hotmail.cpm", "hotmail.com"],
  ["hotmail.con", "hotmail.com"],
  ["outlok.com", "outlook.com"],
  ["outloo.com", "outlook.com"],
  ["outlook.co", "outlook.com"],
  ["outlook.cmo", "outlook.com"],
  ["outlook.cpm", "outlook.com"],
  ["outlook.con", "outlook.com"],
  ["yaho.com", "yahoo.com"],
  ["yahoo.co", "yahoo.com"],
  ["yahoo.cmo", "yahoo.com"],
  ["yahoo.cpm", "yahoo.com"],
  ["yahoo.con", "yahoo.com"],
  ["icloud.co", "icloud.com"],
  ["icloud.cmo", "icloud.com"],
  ["icloud.cpm", "icloud.com"],
  ["icloud.con", "icloud.com"],
]);

export function getEmailValidationMessage(value: string) {
  const email = value.trim();

  if (!email) {
    return "Enter an email address.";
  }

  if (/\s/.test(email)) {
    return "Email cannot include spaces.";
  }

  const atMatches = email.match(/@/g) ?? [];

  if (atMatches.length !== 1) {
    return "Use a full email address like name@gmail.com.";
  }

  const [localPart, domainPart] = email.split("@");
  const domain = domainPart.toLowerCase();

  if (!localPart || !domain) {
    return "Use a full email address like name@gmail.com.";
  }

  if (commonIncompleteEmailDomains.has(domain)) {
    return `Use ${commonIncompleteEmailDomains.get(domain)} after @.`;
  }

  const suggestedDomain = commonEmailDomainTypos.get(domain);

  if (suggestedDomain) {
    return `Did you mean ${localPart}@${suggestedDomain}?`;
  }

  if (!domain.includes(".")) {
    return "Add the full email ending, like .com.";
  }

  if (
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..")
  ) {
    return "Check the email domain ending.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return "Use a valid email address like name@gmail.com.";
  }

  return null;
}

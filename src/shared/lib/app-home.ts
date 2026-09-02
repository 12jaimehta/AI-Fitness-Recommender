export const SIGNED_IN_HOME = "/progress";

export function signedInHomeHref(profileComplete: boolean) {
  return profileComplete ? SIGNED_IN_HOME : "/";
}

const dict: Record<string, string> = {
  "auth.signIn.title": "Sign in to AirLane Cloud",
  "auth.signIn.subtitle":
    "Sign in for cloud sync, Mesh shared groups, device management and the web console.",
  "auth.signUp.title": "Create your AirLane account",
  "auth.signUp.subtitle":
    "Register a full account to permanently keep your policies, snapshots and paired devices.",
  "auth.tab.signIn": "Sign in",
  "auth.tab.signUp": "Sign up",
  "auth.google": "Continue with Google",
  "auth.or": "or use email",
  "auth.displayName": "Display name",
  "auth.submit.signIn": "Sign in",
  "auth.submit.signUp": "Create account",
  "auth.forgot": "Forgot password?",
  "auth.checkEmail": "We sent a confirmation email — check your inbox to finish signing up.",
  "auth.resetSent": "Reset email sent. Check your inbox.",
  "auth.resetTitle": "Reset password",
  "auth.resetSubtitle": "Enter your account email and we'll send a reset link.",
  "auth.resetSubmit": "Send reset link",
  "auth.backToSignIn": "Back to sign in",
  "auth.localNotice":
    "Local proxying, policies, multi-exit and unlock detection are always 100% available. Accounts only gate cloud features.",
  "auth.newPassword": "New password",
  "auth.updatePassword": "Update password",
  "auth.passwordUpdated": "Password updated. Please sign in again.",
  "auth.needRecovery": "Open this page from the reset link in your email.",
  "auth.method.password": "Password",
  "auth.method.otp": "Email OTP",
  "auth.emailRequired": "Please enter your email address",
  "auth.otpSent": "A verification code has been sent to your email.",
  "auth.otpEnterCode": "Code sent to",
  "auth.otpRequired": "Please enter your email and verification code",
  "auth.verifyOtp": "Verify & sign in",
  "auth.verifying": "Verifying…",
  "auth.sendOtp": "Send code",
  "auth.sending": "Sending…",
  "auth.otpResend": "Resend code",

  // Anonymous identity entry
  "auth.anon.title": "No email? Use an anonymous identity",
  "auth.anon.desc":
    "Generate a random cloud identity in one click — try cloud sync, device binding and Mesh sharing without signing up.",
  "auth.anon.button": "Create anonymous identity",
  "auth.anon.creating": "Creating…",
  "auth.anon.note":
    "The anonymous identity lives only in this browser. Save the recovery code before clearing data or switching browsers — otherwise it cannot be recovered.",
  "auth.anon.recoveryTitle": "Your recovery code (shown once)",
  "auth.anon.recoveryWarning":
    "⚠️ Write it down now. This code is the only way to recover the anonymous identity — we store only its hash, so losing it means losing the identity.",
  "auth.anon.recoveryConfirm": "I saved the code — continue",
  "auth.anon.recoverLink": "Have a recovery code? Restore identity",
  "auth.anon.recoverPlaceholder": "XXXX-XXXX-XXXX-XXXX",
  "auth.anon.recoverButton": "Restore with code",
  "auth.anon.recoverInvalid": "Invalid or revoked recovery code.",
  "auth.anon.recoverOk": "Anonymous identity restored.",

  "account.title": "Account center",
  "account.subtitle": "AirLane has four identity states. Local capabilities are always complete.",
  "account.loading": "Loading account state…",

  "account.state.local": "Fully local mode (cloud not connected)",
  "account.state.localDesc":
    "Zero requests to the cloud. All proxying, policies, multi-exit and unlock detection run locally; no cloud sync, Mesh or web console.",
  "account.local.guestTitle": "Anonymous identity (no sign-up)",
  "account.local.guestDesc":
    "Generate a random identity in one click — try cloud snapshots, device binding and Mesh sharing; keep the recovery code to restore anytime.",
  "account.local.accountTitle": "Full account",
  "account.local.accountDesc":
    "Register or sign in with email to unlock everything: config snapshots, Mesh shared groups, device management and the web console.",
  "account.state.guest": "Anonymous trial mode",
  "account.state.guestDesc":
    "No email required — try limited cloud sync and Mesh sharing right away.",
  "account.state.account": "Signed in with a full account",
  "account.state.accountDesc":
    "Full cloud capabilities: snapshots, Mesh shared groups, device management and web console.",
  "account.state.member": "Signed in as a sub-account",
  "account.state.memberDesc":
    "Permissions assigned by owner account {parent}; you only see resources shared with you.",

  "account.action.tryGuest": "Try cloud anonymously",
  "account.action.signIn": "Sign in / create account",
  "account.action.upgrade": "Upgrade to a full account",
  "account.action.exitGuest": "End anonymous session (back to local-only)",
  "account.action.signOut": "Sign out",
  "account.action.manageDevices": "Device pairing & management",
  "account.action.upgradeNow": "Sign in to migrate anonymous data",

  "account.guest.warning":
    "⚠️ The anonymous identity is bound to this browser. After clearing data or switching devices you will need the recovery code; without it the identity is permanently lost. Upgrade to a full account anytime.",
  "account.guest.idLabel": "Anonymous identity UUID",
  "account.guest.expires":
    "The access token expires after 90 days of inactivity — the recovery code can reactivate the identity anytime",
  "account.guest.allowed": "Allowed for anonymous accounts",
  "account.guest.blocked": "Anonymous restrictions",
  "account.guest.allow1": "Up to {n} cloud config snapshots",
  "account.guest.allow2": "Up to {n} devices joined to Mesh shared groups",
  "account.guest.allow3": "Can accept Mesh shared-group invitations from others",
  "account.guest.allow4": "Up to {n} cloud exit favorites",
  "account.guest.allow5": "Device online status reporting",
  "account.guest.block1": "Cannot sign in to the web console",
  "account.guest.block2": "Cannot create Mesh groups — only join shared ones",
  "account.guest.block3": "No sub-accounts and no remote config push",
  "account.guest.block4": "Cannot purchase the Pro plan",
  "account.guest.block5": "Requires the recovery code after switching devices or clearing data",
  "account.guest.created": "Anonymous trial mode enabled.",
  "account.guest.ended": "Anonymous session ended. Local configuration is untouched.",
  "account.guest.upgraded": "Anonymous data migrated to your account.",
  "account.guest.pending":
    "An anonymous identity exists on this device. Migrate its data to the current account?",
  "account.guest.migrate": "Migrate anonymous data",
  "account.guest.discard": "Ignore",
  "account.guest.recoveryTitle": "Recovery code (shown once — save it now)",
  "account.guest.recoveryHint":
    "Enter this code to restore the identity and all data after switching browsers or clearing data.",
  "account.guest.rotateRecovery": "Regenerate recovery code",
  "account.guest.recoveryRotated": "New recovery code generated; the old one is revoked.",

  "account.usage.snapshots": "Cloud snapshots",
  "account.usage.devices": "Paired devices",
  "account.usage.favorites": "Exit favorites",
  "account.usage.groups": "Mesh groups",
  "account.plan.free": "Free",
  "account.plan.pro": "Pro",
  "account.role.owner": "Owner account",
  "account.role.member": "Sub-account",
  "account.field.email": "Email",
  "account.field.plan": "Plan",
  "account.field.role": "Account type",
  "account.field.parent": "Owner account",
  "account.field.since": "Created",

  "account.rule":
    "Hard rule: in every identity state, local proxying, policies, multi-exit and unlock detection stay 100% available and are never locked.",


  "devices.title": "Client pairing",
  "devices.subtitle":
    "Enter the pairing code in the client to bind a device to your identity and report its status.",
  "devices.generate": "Generate pairing code",
  "devices.regenerate": "Regenerate",
  "devices.codeHint": "The code is valid for 10 minutes and can only be used once.",
  "devices.steps": "How to pair",
  "devices.step1": "Open the AirLane client → Settings → Account → Connect cloud.",
  "devices.step2": "Enter the pairing code generated on this page.",
  "devices.step3": "Once paired, the client reports its online status periodically.",
  "devices.list": "Paired devices",
  "devices.empty": "No devices are paired with this identity yet.",
  "devices.lastSeen": "Last seen",
  "devices.remove": "Unpair",
  "devices.removed": "Device unpaired.",
  "devices.needIdentity":
    "Sign in or start an anonymous session before generating a pairing code.",
  "devices.guestLimit": "Anonymous identities can pair at most {n} devices.",
  "devices.api": "Developer API",
  "devices.apiDesc": "Clients can call these endpoints directly to pair and send heartbeats.",
  "devices.status.online": "Online",
  "devices.status.idle": "Idle",
  "devices.status.offline": "Offline",
};

export default dict;

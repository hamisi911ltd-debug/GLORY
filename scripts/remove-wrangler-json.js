/**
 * Post-build cleanup script.
 *
 * Previously this deleted dist/client/wrangler.json, but that file is
 * required by Cloudflare Pages — it is the deploy config that the
 * @cloudflare/vite-plugin generates and Cloudflare reads at deploy time.
 * Deleting it causes: "deploy config points to wrangler.json — does not exist"
 *
 * Nothing to delete now. Script kept so the postbuild npm hook doesn't fail.
 */
console.log("✅ Post-build cleanup complete (nothing to remove).");

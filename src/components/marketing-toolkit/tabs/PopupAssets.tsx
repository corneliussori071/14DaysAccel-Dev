"use client";

import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";

interface PopupAssetsProps {
  referralLink: string;
}

function timedPopup(referralLink: string): string {
  return `<!-- 14DaysAccel Dev - Timed Popup - Ad -->
<div id="accel-timed-popup-overlay" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;animation:accelOverlayIn 0.3s ease-out">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:420px;max-width:90vw;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:accelPopIn 0.4s cubic-bezier(0.16,1,0.3,1)">
    <div style="position:relative;background:linear-gradient(135deg,#18181b 0%,#292524 100%);padding:32px 28px 24px;text-align:center">
      <button onclick="document.getElementById('accel-timed-popup-overlay').style.display='none'" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'" aria-label="Close popup">&#10005;</button>
      <div style="position:absolute;top:12px;left:12px;background:rgba(251,191,36,0.9);color:#78350f;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Ad</div>
      <div style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Limited Time</div>
      <div style="color:#fff;font-size:24px;font-weight:800;margin-top:10px;line-height:1.2">Get Your Software Built in Just 14 Days</div>
      <div style="color:#a1a1aa;font-size:13px;margin-top:8px;line-height:1.5">Production-ready applications delivered fast. Starting at $200 per project.</div>
    </div>
    <div style="background:#fff;padding:20px 28px 24px;text-align:center">
      <div style="display:flex;justify-content:center;gap:24px;margin-bottom:20px">
        <div style="text-align:center"><div style="font-size:22px;font-weight:800;color:#18181b">14</div><div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px">Day Delivery</div></div>
        <div style="width:1px;background:#e4e4e7"></div>
        <div style="text-align:center"><div style="font-size:22px;font-weight:800;color:#18181b">$200</div><div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px">Starting Price</div></div>
        <div style="width:1px;background:#e4e4e7"></div>
        <div style="text-align:center"><div style="font-size:22px;font-weight:800;color:#18181b">100%</div><div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px">Production Ready</div></div>
      </div>
      <a href="${referralLink}" target="_blank" rel="noopener noreferrer" style="display:block;background:linear-gradient(135deg,#18181b,#3f3f46);color:#fff;padding:14px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity 0.2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Start Your Project</a>
      <button onclick="document.getElementById('accel-timed-popup-overlay').style.display='none'" style="background:none;border:none;color:#71717a;font-size:12px;margin-top:12px;cursor:pointer;transition:color 0.2s" onmouseover="this.style.color='#18181b'" onmouseout="this.style.color='#71717a'">No thanks, maybe later</button>
    </div>
  </div>
</div>
<script>
(function(){
  var shown = sessionStorage.getItem('accel_popup_shown');
  if (!shown) {
    setTimeout(function(){
      var el = document.getElementById('accel-timed-popup-overlay');
      if (el) { el.style.display = 'block'; sessionStorage.setItem('accel_popup_shown', '1'); }
    }, 5000);
  }
})();
</script>
<style>@keyframes accelOverlayIn{from{opacity:0}to{opacity:1}}@keyframes accelPopIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}</style>`;
}

function exitIntentPopup(referralLink: string): string {
  return `<!-- 14DaysAccel Dev - Exit Intent Popup - Ad -->
<div id="accel-exit-popup-overlay" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;animation:accelExitOverlay 0.3s ease-out">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:440px;max-width:90vw;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:accelExitPop 0.5s cubic-bezier(0.16,1,0.3,1)">
    <div style="position:relative;background:linear-gradient(160deg,#0f172a,#1e3a5f,#0ea5e9);padding:32px 28px 24px;text-align:center">
      <button onclick="document.getElementById('accel-exit-popup-overlay').style.display='none'" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'" aria-label="Close popup">&#10005;</button>
      <div style="position:absolute;top:12px;left:12px;background:rgba(251,191,36,0.9);color:#78350f;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Ad</div>
      <div style="color:#38bdf8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px">Before You Go</div>
      <div style="color:#fff;font-size:22px;font-weight:800;margin-top:10px;line-height:1.2">Still Looking for a Developer?</div>
      <div style="color:#cbd5e1;font-size:13px;margin-top:8px;line-height:1.5">Skip the search. Get production-ready software in 14 days.</div>
    </div>
    <div style="background:#fff;padding:20px 28px 24px;text-align:center">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="font-size:12px;color:#64748b;margin-bottom:4px">Why developers choose 14DaysAccel Dev:</div>
        <div style="font-size:13px;color:#0f172a;font-weight:600">Fast delivery. Fair pricing. Real production code.</div>
      </div>
      <a href="${referralLink}" target="_blank" rel="noopener noreferrer" style="display:block;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;padding:14px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity 0.2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Explore 14DaysAccel Dev</a>
      <button onclick="document.getElementById('accel-exit-popup-overlay').style.display='none'" style="background:none;border:none;color:#71717a;font-size:12px;margin-top:12px;cursor:pointer;transition:color 0.2s" onmouseover="this.style.color='#18181b'" onmouseout="this.style.color='#71717a'">Close</button>
    </div>
  </div>
</div>
<script>
(function(){
  var shown = sessionStorage.getItem('accel_exit_shown');
  if (!shown) {
    document.addEventListener('mouseleave', function handler(e){
      if (e.clientY < 5) {
        var el = document.getElementById('accel-exit-popup-overlay');
        if (el) { el.style.display = 'block'; sessionStorage.setItem('accel_exit_shown', '1'); }
        document.removeEventListener('mouseleave', handler);
      }
    });
  }
})();
</script>
<style>@keyframes accelExitOverlay{from{opacity:0}to{opacity:1}}@keyframes accelExitPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.85)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}</style>`;
}

const instructions = [
  "Click 'Copy Code' to copy the popup HTML, CSS, and JavaScript to your clipboard.",
  "Paste the code just before the closing </body> tag in your HTML page.",
  "The timed popup appears automatically after 5 seconds on the page. It only shows once per session.",
  "The exit-intent popup triggers when the user moves their cursor toward the browser's top edge (indicating intent to leave). It only shows once per session.",
  "Both popups include a clearly visible close button (X) in the top-right corner, and a text-based dismiss option at the bottom.",
  "Your referral link is embedded in the main call-to-action button.",
  "Session storage is used to prevent the popup from reappearing after dismissal within the same browsing session.",
];

const complianceNotes = [
  "Each popup includes an 'Ad' disclosure label in the top-left corner.",
  "Close buttons are visible and accessible. Users can dismiss the popup at any time.",
  "Popups appear only once per session to avoid intrusive behavior.",
  "Do not modify the popup to auto-reopen, remove close buttons, or delay the close interaction.",
  "Ensure popups do not block access to your site's main content persistently.",
];

export default function PopupAssets({ referralLink }: PopupAssetsProps) {
  const popups = [
    {
      title: "Timed Popup (5-second delay)",
      description: "Full-screen overlay that appears after 5 seconds. Shows once per session. Features stats and strong CTA.",
      code: timedPopup(referralLink),
      height: 480,
    },
    {
      title: "Exit-Intent Popup",
      description: "Triggers when the user moves their cursor toward the top of the page, indicating intent to leave. Shows once per session.",
      code: exitIntentPopup(referralLink),
      height: 440,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Pop-ups</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Overlay pop-ups with timed and exit-intent triggers. Include close buttons and comply with advertising guidelines.
        </p>
      </div>

      {popups.map((popup) => (
        <div key={popup.title}>
          <AssetPreview
            title={popup.title}
            description={popup.description}
            embedCode={popup.code}
            previewHeight={popup.height}
            disclosureLabel="Ad"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}

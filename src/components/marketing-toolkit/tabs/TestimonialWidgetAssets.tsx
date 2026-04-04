"use client";

import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";

interface TestimonialWidgetAssetsProps {
  referralLink: string;
}

function testimonialCard(referralLink: string): string {
  return `<!-- 14DaysAccel Dev - Testimonial Card - Sponsored -->
<div style="max-width:400px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);animation:accelTestIn 0.5s ease-out">
  <div style="background:#fff;padding:24px;border:1px solid #e4e4e7;border-radius:12px;position:relative">
    <div style="position:absolute;top:12px;right:12px;background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Sponsored</div>
    <div style="color:#f59e0b;font-size:28px;line-height:1;margin-bottom:12px">"</div>
    <p style="font-size:14px;color:#18181b;line-height:1.6;margin:0 0 16px">We needed a custom inventory system for our retail chain. 14DaysAccel Dev delivered a fully functional app in 12 days. What would have taken our team months was done in under two weeks.</p>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#3f3f46,#71717a);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700">JR</div>
      <div>
        <div style="font-size:13px;font-weight:600;color:#18181b">James R.</div>
        <div style="font-size:11px;color:#71717a">Operations Manager, Retail</div>
      </div>
    </div>
    <div style="border-top:1px solid #f4f4f5;padding-top:12px">
      <a href="${referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="font-size:12px;color:#0ea5e9;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;transition:color 0.2s" onmouseover="this.style.color='#0369a1'" onmouseout="this.style.color='#0ea5e9'">Learn more about 14DaysAccel Dev &#8594;</a>
    </div>
  </div>
  <style>@keyframes accelTestIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}</style>
</div>`;
}

function testimonialCarousel(referralLink: string): string {
  return `<!-- 14DaysAccel Dev - Testimonial Carousel - Sponsored -->
<div id="accel-testimonial-carousel" style="max-width:520px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)">
  <div style="background:#18181b;padding:14px 20px;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="color:#fff;font-size:13px;font-weight:700">What clients say</span>
      <span style="background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Sponsored</span>
    </div>
    <div style="display:flex;gap:6px">
      <button onclick="accelCarouselPrev()" style="background:rgba(255,255,255,0.1);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'" aria-label="Previous">&#8249;</button>
      <button onclick="accelCarouselNext()" style="background:rgba(255,255,255,0.1);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'" aria-label="Next">&#8250;</button>
    </div>
  </div>
  <div style="background:#fff;padding:24px;min-height:180px;position:relative">
    <div class="accel-testimonial-slide" style="transition:opacity 0.4s ease">
      <div style="color:#f59e0b;font-size:24px;line-height:1;margin-bottom:8px">"</div>
      <p style="font-size:13px;color:#18181b;line-height:1.6;margin:0 0 14px" id="accel-testimonial-text">We needed a custom inventory system for our retail chain. 14DaysAccel Dev delivered a fully functional app in 12 days. What would have taken our team months was done in under two weeks.</p>
      <div style="display:flex;align-items:center;gap:10px">
        <div id="accel-testimonial-avatar" style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3f3f46,#71717a);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700">JR</div>
        <div>
          <div style="font-size:12px;font-weight:600;color:#18181b" id="accel-testimonial-name">James R.</div>
          <div style="font-size:10px;color:#71717a" id="accel-testimonial-role">Operations Manager, Retail</div>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:center;gap:6px;margin-top:16px" id="accel-testimonial-dots"></div>
  </div>
  <div style="background:#f8fafc;border-top:1px solid #e4e4e7;padding:12px 20px;text-align:center">
    <a href="${referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="font-size:12px;color:#18181b;text-decoration:none;font-weight:600;transition:color 0.2s" onmouseover="this.style.color='#71717a'" onmouseout="this.style.color='#18181b'">Start your project with 14DaysAccel Dev &#8594;</a>
  </div>
</div>
<script>
(function(){
  var testimonials=[
    {text:"We needed a custom inventory system for our retail chain. 14DaysAccel Dev delivered a fully functional app in 12 days. What would have taken our team months was done in under two weeks.",name:"James R.",role:"Operations Manager, Retail",initials:"JR"},
    {text:"I was skeptical about the 14-day promise, but they delivered. Our booking platform was live and handling real customers within two weeks of starting.",name:"Sarah M.",role:"Founder, Travel Startup",initials:"SM"},
    {text:"The quality of code surprised me. Clean architecture, proper testing, and documentation. This is not a prototype, it is production-ready software.",name:"David K.",role:"CTO, SaaS Company",initials:"DK"}
  ];
  var idx=0;
  var dots=document.getElementById('accel-testimonial-dots');
  if(dots){testimonials.forEach(function(_,i){var d=document.createElement('div');d.style.cssText='width:6px;height:6px;border-radius:50%;background:'+(i===0?'#18181b':'#d4d4d8')+';transition:background 0.3s';d.setAttribute('data-idx',String(i));dots.appendChild(d)})}
  function show(i){
    idx=i;
    var t=testimonials[i];
    var el=document.getElementById('accel-testimonial-text');if(el)el.textContent=t.text;
    var n=document.getElementById('accel-testimonial-name');if(n)n.textContent=t.name;
    var r=document.getElementById('accel-testimonial-role');if(r)r.textContent=t.role;
    var a=document.getElementById('accel-testimonial-avatar');if(a)a.textContent=t.initials;
    if(dots){var ds=dots.children;for(var j=0;j<ds.length;j++)ds[j].style.background=j===i?'#18181b':'#d4d4d8'}
  }
  window.accelCarouselNext=function(){show((idx+1)%testimonials.length)};
  window.accelCarouselPrev=function(){show((idx-1+testimonials.length)%testimonials.length)};
  setInterval(function(){show((idx+1)%testimonials.length)},6000);
})();
</script>`;
}

function testimonialStrip(referralLink: string): string {
  return `<!-- 14DaysAccel Dev - Testimonial Strip - Sponsored -->
<div style="max-width:600px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;align-items:center;gap:16px;animation:accelStripIn 0.4s ease-out">
  <div style="flex-shrink:0">
    <div style="display:flex;gap:-8px">
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3f3f46,#71717a);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;border:2px solid #fff">JR</div>
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#2563eb);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;border:2px solid #fff;margin-left:-8px">SM</div>
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;border:2px solid #fff;margin-left:-8px">DK</div>
    </div>
  </div>
  <div style="flex:1;min-width:0">
    <div style="font-size:13px;color:#0f172a;font-weight:600">Trusted by businesses worldwide</div>
    <div style="font-size:11px;color:#64748b;margin-top:2px">"Delivered in 12 days. Production-ready from day one."</div>
  </div>
  <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
    <span style="font-size:8px;font-weight:700;color:#78350f;background:#fef3c7;padding:2px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.5px">Sponsored</span>
    <a href="${referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="font-size:11px;color:#0ea5e9;text-decoration:none;font-weight:600;white-space:nowrap;transition:color 0.2s" onmouseover="this.style.color='#0369a1'" onmouseout="this.style.color='#0ea5e9'">Try it &#8594;</a>
  </div>
  <style>@keyframes accelStripIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}</style>
</div>`;
}

const instructions = [
  "Click 'Copy Code' to copy the testimonial widget HTML to your clipboard.",
  "The single testimonial card works well in sidebars, articles, and landing page sections.",
  "The carousel auto-rotates every 6 seconds and includes navigation arrows. Place it where extended social proof is helpful.",
  "The testimonial strip is compact and works as a banner within content or between sections.",
  "Your referral link is embedded in the call-to-action link at the bottom of each widget.",
  "All widgets are self-contained. The carousel includes its own JavaScript for rotation.",
];

const complianceNotes = [
  "Each widget includes a 'Sponsored' disclosure label.",
  "Testimonials represent typical client experiences. Do not modify quotes to make unrealistic claims.",
  "The carousel script uses standard DOM manipulation and does not track user behavior.",
];

export default function TestimonialWidgetAssets({ referralLink }: TestimonialWidgetAssetsProps) {
  const widgets = [
    {
      title: "Testimonial Card",
      description: "Single testimonial card with quote, attribution, and CTA link. Clean and focused.",
      code: testimonialCard(referralLink),
      height: 320,
    },
    {
      title: "Testimonial Carousel",
      description: "Auto-rotating carousel with three testimonials, navigation arrows, and dot indicators. 6-second rotation.",
      code: testimonialCarousel(referralLink),
      height: 340,
    },
    {
      title: "Testimonial Strip",
      description: "Compact horizontal strip with stacked avatars and a short quote. Minimal footprint.",
      code: testimonialStrip(referralLink),
      height: 100,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Testimonial Widgets</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Social proof widgets featuring client testimonials. Use these to build trust alongside your referral links.
        </p>
      </div>

      {widgets.map((widget) => (
        <div key={widget.title}>
          <AssetPreview
            title={widget.title}
            description={widget.description}
            embedCode={widget.code}
            previewHeight={widget.height}
            disclosureLabel="Sponsored"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}

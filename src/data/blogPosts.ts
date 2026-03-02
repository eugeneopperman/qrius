// ─── Blog post data ─────────────────────────────────────────────────
// Voice & tone: knowledgeable, conversational, practical
// (see docs/brand-voice-guide.md)

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'QR 101' | 'How-to' | 'Industry' | 'Design' | 'Product';
  date: string;         // Display date, e.g. "March 2, 2026"
  isoDate: string;      // ISO 8601 for sorting / <time>
  readTime: string;     // e.g. "5 min read"
  image: string;        // Hero / card image URL
  /** Full article body — rendered as raw HTML (trusted content) */
  body: string;
}

export const blogPosts: BlogPost[] = [
  // ─────────────────────────────────────────────────────────────────
  // 1. Featured / Product launch
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'introducing-qrius-codes',
    title: 'Introducing Qrius Codes: the QR tool we wished existed',
    excerpt:
      'We got tired of QR code tools that nickel-and-dime you, kill your codes when you cancel, and look like they were designed in 2009. So we built something better.',
    category: 'Product',
    date: 'March 2, 2026',
    isoDate: '2026-03-02',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&fit=crop&q=80',
    body: `
<p>Every QR code tool we tried had the same problem: it felt like it was designed to extract money first and help you second.</p>

<p>Sign up, make a code, get excited — then discover your "free" plan gives you one dynamic code. One. Want a second? That'll be $30 a month, please. Oh, and if you cancel, your printed menus become expensive coasters.</p>

<h2>The trust problem</h2>

<p>The QR code industry has a trust problem. Bait-and-switch pricing, codes that die when you downgrade, confusing annual-only plans buried behind "starting at $5/month" headlines. We've seen all of it — as users, not just observers.</p>

<p>So we asked a simple question: what would a QR code tool look like if it were built by people who actually use QR codes?</p>

<h2>What we built</h2>

<p>Qrius Codes gives you 15 free dynamic QR codes. Not one, not three — fifteen. That's enough for most small businesses to get real value without paying a cent.</p>

<p>When you do need more, Pro starts at $9 a month. Monthly billing, cancel anytime, and your codes keep working even if you leave. Because holding someone's printed materials hostage is a terrible business model.</p>

<p>Here's what you get out of the box:</p>

<ul>
  <li><strong>9 QR code types</strong> — URL, text, email, phone, SMS, WiFi, vCard, events, and location</li>
  <li><strong>Full customization</strong> — colors, gradients, dot patterns, corner styles, logo upload, and frames with labels</li>
  <li><strong>Scan tracking</strong> — see where, when, and how people scan your codes, in real time</li>
  <li><strong>Team collaboration</strong> — invite your team, assign roles, manage everything in one place</li>
  <li><strong>Brand templates</strong> — save your style once, apply it to every new code with one click</li>
</ul>

<h2>Why the name?</h2>

<p>Qrius plays on "curious" — because every QR code is a small moment of discovery. Someone scans, something appears. It's a tiny reveal, a doorway. We like that feeling, and it shows up in everything we build.</p>

<h2>What's next</h2>

<p>We're just getting started. API access, bulk generation, barcodes, digital business cards — there's a long list of things we're excited to build. And we're building them in the open, with a public changelog and real conversations with the people who use our tool.</p>

<p>If you've been burned by a QR code tool before, give us a try. It's free to start, and we think you'll notice the difference immediately.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. QR 101 — Static vs Dynamic
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'static-vs-dynamic-qr-codes',
    title: 'Static vs dynamic QR codes: which one do you actually need?',
    excerpt:
      'One burns the URL straight into the pattern. The other lets you change where it goes — even after you\'ve printed 10,000 flyers. Here\'s when each one makes sense.',
    category: 'QR 101',
    date: 'February 28, 2026',
    isoDate: '2026-02-28',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&fit=crop&q=80',
    body: `
<p>If you've spent any time looking at QR code tools, you've seen the terms "static" and "dynamic" thrown around. Most explanations make it sound more complicated than it is. Let's fix that.</p>

<h2>Static QR codes: the simple version</h2>

<p>A static QR code encodes your data directly into the pattern — the URL, the phone number, the WiFi password, whatever it is. The information lives inside the dots themselves.</p>

<p>That means:</p>

<ul>
  <li>No internet connection needed to read the data (great for WiFi codes)</li>
  <li>It works forever, no matter what — no server, no subscription, no dependency</li>
  <li>You can't change where it points after you create it</li>
  <li>You can't track who scans it</li>
</ul>

<p>Static codes are perfect for things that won't change: your WiFi password on a cafe wall, a phone number on a business card, or a vCard with your contact details.</p>

<h2>Dynamic QR codes: the flexible version</h2>

<p>A dynamic QR code doesn't encode your destination directly. Instead, it encodes a short redirect URL — think of it like a smart link. When someone scans the code, they hit the redirect URL first, which sends them to your actual destination.</p>

<p>This tiny difference changes everything:</p>

<ul>
  <li><strong>Change the destination anytime.</strong> Printed 5,000 menus and need to update the link? Change it in your dashboard. No reprinting.</li>
  <li><strong>Track every scan.</strong> See when people scan, where they are, what device they're using, and what browser opened the link.</li>
  <li><strong>A/B test destinations.</strong> Point the same code to different URLs over time to see what converts better.</li>
  <li><strong>Shorter patterns.</strong> The redirect URL is shorter than most destination URLs, so the QR pattern has fewer dots. Fewer dots means easier scanning, especially at small sizes.</li>
</ul>

<h2>So which do you need?</h2>

<p>Here's the honest answer: if you're printing the code on something — a flyer, a sign, a product label, a menu — use a dynamic code. The ability to change the destination without reprinting is worth it every single time.</p>

<p>If you're creating a one-off code for personal use (sharing WiFi with guests, texting yourself a link), static is fine.</p>

<h3>Quick decision guide</h3>

<ul>
  <li><strong>Printing on physical materials?</strong> → Dynamic</li>
  <li><strong>Need to track scans?</strong> → Dynamic</li>
  <li><strong>Might need to update the link later?</strong> → Dynamic</li>
  <li><strong>WiFi password for your office?</strong> → Static is fine</li>
  <li><strong>Personal vCard on your own business card?</strong> → Static works</li>
</ul>

<h2>The catch with most tools</h2>

<p>Here's something most QR code tools don't tell you upfront: dynamic codes require a server to handle the redirect. That server costs money. So when you cancel your subscription with most providers, your dynamic codes stop working.</p>

<p>Your printed materials? Dead. Your restaurant menus? Broken links. That flyer campaign you spent thousands on? Gone.</p>

<p>At Qrius, your codes keep working even if you downgrade or cancel. We think holding your printed materials hostage is a terrible way to do business.</p>

<p>With 15 free dynamic codes on our free plan, you can get started without worrying about any of this. And if you need more, Pro is $9 a month — not $30, not $50.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. Design — 5 mistakes
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'qr-code-design-mistakes',
    title: '5 QR code design mistakes that kill your scan rate',
    excerpt:
      'Low contrast, tiny sizes, no call-to-action — these common mistakes make your QR codes harder to scan. Here\'s how to fix each one.',
    category: 'Design',
    date: 'February 25, 2026',
    isoDate: '2026-02-25',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&fit=crop&q=80',
    body: `
<p>You've probably walked past a QR code and thought, "I'm not scanning that." Maybe it was too small, blurry, or just looked untrustworthy. Good news: every one of those problems is fixable. Here are the five most common design mistakes — and what to do instead.</p>

<h2>1. Low contrast between dots and background</h2>

<p>QR scanners work by detecting the difference between dark modules (dots) and the light background. When that contrast is low — say, light gray dots on a white background, or dark blue on black — the scanner struggles.</p>

<p><strong>The fix:</strong> Keep your dots dark and your background light. Black on white is the gold standard, but you have room to play. Dark navy on cream? Great. Forest green on white? Works well. Just make sure there's a clear visual difference. A good rule: squint at your code. If the dots blur into the background, bump up the contrast.</p>

<h2>2. Making the code too small</h2>

<p>A QR code that's 1 cm wide on a poster across the room is useless. People need to be close enough for their phone camera to read the pattern, and the pattern needs to be large enough for the camera to resolve the individual dots.</p>

<p><strong>The fix:</strong> Use this rule of thumb — the scanning distance should be about 10 times the width of the code. A 3 cm code works from about 30 cm away (arm's length). A code on a banner people will see from 3 meters away? Make it at least 30 cm wide.</p>

<ul>
  <li><strong>Business card:</strong> At least 2 cm (0.8 in)</li>
  <li><strong>Flyer or menu:</strong> At least 3 cm (1.2 in)</li>
  <li><strong>Poster:</strong> At least 10 cm (4 in)</li>
  <li><strong>Banner or billboard:</strong> Scale based on viewing distance</li>
</ul>

<h2>3. No call-to-action frame</h2>

<p>A naked QR code sitting on a page is a mystery box. People don't scan things when they don't know what they'll get. "Is it a menu? A virus? A Rick Roll?" Without context, most people just... don't bother.</p>

<p><strong>The fix:</strong> Add a frame with a label. Something simple: "Scan for menu," "View details," "Get 20% off." It doesn't need to be clever — it needs to be clear. In our testing, codes with a call-to-action frame get scanned 30-40% more often than naked codes.</p>

<h2>4. Putting a logo that covers too much of the code</h2>

<p>Logos on QR codes look great. But QR codes have built-in error correction — essentially backup data that lets the code work even if part of it is damaged or obscured. Your logo is "damaging" the code on purpose, and there's a limit to how much the error correction can handle.</p>

<p><strong>The fix:</strong> Keep your logo under 20% of the total QR code area. Use a higher error correction level (H or Q) when adding a logo — this gives the code more redundancy to compensate. And always test your code after adding a logo. Scan it from different distances, in different lighting. If it doesn't scan reliably, shrink the logo.</p>

<h2>5. Forgetting about the quiet zone</h2>

<p>The "quiet zone" is the blank space around your QR code. It's not decorative — it's functional. Scanners use this space to find the edges of the code and distinguish it from surrounding content. Without enough quiet zone, your code becomes unreliable.</p>

<p><strong>The fix:</strong> Leave at least 4 modules of blank space around all four sides of the code. (A module is one "dot" in the code.) In practice, this means don't crowd your QR code with text, images, or borders right up against the edge. Give it room to breathe.</p>

<h2>The bottom line</h2>

<p>A beautiful QR code that doesn't scan is worse than an ugly one that does. Design matters — but scannability comes first. Start with high contrast, proper sizing, and a clear call-to-action. Then get creative with colors, patterns, and logos.</p>

<p>Qrius shows you a real-time scannability score as you design, so you always know if your creative choices are helping or hurting. It's the kind of guardrail we wish every tool had.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. How-to — Restaurant menus
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'qr-code-restaurant-menu',
    title: 'How to put a QR code on your restaurant menu (the right way)',
    excerpt:
      'Step-by-step guide from creation to table placement. Tips on sizing, what to link to, and the mistakes that make diners give up.',
    category: 'How-to',
    date: 'February 20, 2026',
    isoDate: '2026-02-20',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&fit=crop&q=80',
    body: `
<p>QR code menus went from "pandemic necessity" to "wait, this is actually better" surprisingly fast. No more passing sticky laminated menus between strangers. No reprinting when you change the daily special. No "sorry, we're out of menus right now."</p>

<p>But there's a right way and a wrong way to do this. Here's the right way.</p>

<h2>Step 1: Get your menu online first</h2>

<p>Before you create a QR code, you need somewhere for it to point. Your options:</p>

<ul>
  <li><strong>A PDF on your website</strong> — simple, but clunky on phones (pinch-zoom is not a great dining experience)</li>
  <li><strong>A mobile-friendly menu page</strong> — the best option. Tools like Square, Toast, or even a simple one-page website work well</li>
  <li><strong>A Google Doc or Canva link</strong> — works in a pinch, but looks unprofessional</li>
</ul>

<p>The golden rule: open your menu link on your phone and try to order from it. If you have to pinch, scroll sideways, or squint — fix that before you make the QR code.</p>

<h2>Step 2: Create a dynamic QR code</h2>

<p>Use a dynamic code, not a static one. Why? Because you will change your menu. Seasonal specials, price updates, new items — it happens. With a dynamic code, you update the link in your dashboard and every printed code automatically points to the new menu. No reprinting.</p>

<p>In Qrius, pick "URL" as your QR type, paste your menu link, and you're halfway done.</p>

<h2>Step 3: Add your branding</h2>

<p>A plain black-and-white QR code on a beautiful table setting looks out of place. Match the code to your restaurant's aesthetic:</p>

<ul>
  <li>Use your brand colors (dark tones for dots, light for background)</li>
  <li>Add your logo to the center</li>
  <li>Choose a dot pattern that matches your vibe — rounded dots for casual, square for upscale</li>
  <li>Add a frame with "Scan for menu" — don't assume people know what to do</li>
</ul>

<h2>Step 4: Size and placement</h2>

<p>This is where most restaurants mess up. Here's what works:</p>

<ul>
  <li><strong>Table tents:</strong> 3-4 cm QR code. Place it where diners can reach it without stretching — center of a small table, near the edge of a large one</li>
  <li><strong>Stickers on the table:</strong> 4-5 cm minimum. Make sure the surface is flat and the sticker is clean</li>
  <li><strong>Printed on paper placemats:</strong> 3 cm works fine since the code is right in front of the diner</li>
  <li><strong>Window or wall signs:</strong> At least 10 cm for comfortable scanning from a few feet away</li>
</ul>

<p>Always print at the highest resolution your printer can handle. A blurry QR code is a dead QR code.</p>

<h2>Step 5: Test before you deploy</h2>

<p>Print one. Scan it with three different phones (iPhone, Android, older model). Check that:</p>

<ul>
  <li>It scans in under 2 seconds</li>
  <li>It works in the lighting conditions of your restaurant (dim lighting is tougher)</li>
  <li>The menu page loads quickly on mobile data (not just WiFi)</li>
  <li>The menu is readable without zooming</li>
</ul>

<h2>Bonus: What else to link</h2>

<p>While you're at it, consider codes for:</p>

<ul>
  <li><strong>Google review page</strong> — a small "Leave a review" code on the check presenter</li>
  <li><strong>WiFi password</strong> — a WiFi QR code lets guests connect with one scan, no typing</li>
  <li><strong>Daily specials</strong> — a separate dynamic code you update every morning</li>
  <li><strong>Reservation page</strong> — on your window or door for walk-by traffic</li>
</ul>

<h2>Common mistakes to avoid</h2>

<ul>
  <li><strong>Linking to a PDF.</strong> PDFs are terrible on phones. Use a mobile-friendly page.</li>
  <li><strong>Using a static code.</strong> You'll be reprinting within a month.</li>
  <li><strong>Forgetting the call-to-action.</strong> "Scan for menu" gets 3x more scans than a naked code.</li>
  <li><strong>Printing too small.</strong> If a diner has to hover their phone 5 cm from the table, the code is too small.</li>
  <li><strong>Not testing in your actual restaurant.</strong> Lighting, angles, and surface reflections matter.</li>
</ul>

<p>A well-placed QR code menu saves you money on printing, speeds up service, and lets you update your menu anytime. It takes about 10 minutes to set up — and that includes making it look good.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. QR 101 — Codes that die
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'why-qr-codes-die-when-you-cancel',
    title: "Why your QR codes die when you cancel — and how to avoid it",
    excerpt:
      "Most QR code tools deactivate your codes the moment you stop paying. Here's why that happens, what it means for your printed materials, and how to protect yourself.",
    category: 'QR 101',
    date: 'February 15, 2026',
    isoDate: '2026-02-15',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&fit=crop&q=80',
    body: `
<p>Imagine you've printed 10,000 flyers for a marketing campaign. Each one has a QR code linking to your landing page. The campaign runs for three months, you get great results, and you decide to cancel your QR code subscription because you don't need it anymore.</p>

<p>A week later, someone scans one of those flyers. Instead of your landing page, they get an error. Or worse — a page selling them someone else's product.</p>

<p>This isn't a hypothetical. It happens every day.</p>

<h2>How dynamic QR codes actually work</h2>

<p>A dynamic QR code doesn't encode your destination URL directly. It encodes a redirect URL — a short link hosted on the QR code provider's servers. When someone scans, they hit that redirect, which forwards them to your actual destination.</p>

<p>This is what makes dynamic codes powerful: you can change the destination without reprinting. But it also means the code depends on the provider's server to work.</p>

<p>When you cancel your subscription, many providers shut off that redirect. Your code still scans — but the redirect goes nowhere. Or it goes to an error page. Or, in some truly egregious cases, the provider reuses your short URL for a different customer.</p>

<h2>Why providers do this</h2>

<p>Running redirect servers costs money. Every scan hits a server, uses bandwidth, and logs data. When you stop paying, you become a cost center with no revenue. Most providers solve this by simply turning off your codes.</p>

<p>From a business perspective, it's also a retention weapon. If your codes die when you leave, you're much less likely to leave. Your printed materials are essentially held hostage.</p>

<h2>How to protect yourself</h2>

<p>Here are a few things you can do:</p>

<h3>1. Check the provider's cancellation policy before you sign up</h3>

<p>Specifically, ask: "What happens to my QR codes if I cancel?" If the answer isn't crystal clear, that's your answer.</p>

<h3>2. Use a provider that keeps codes alive</h3>

<p>Some providers — including Qrius — keep your codes working even after you downgrade or cancel. You lose access to analytics and editing, but the redirect keeps functioning. Your printed materials keep working.</p>

<h3>3. Use your own domain for QR codes</h3>

<p>If you're on a Business plan that supports custom domains, point your QR codes through your own domain (e.g., qr.yourbrand.com). Even if you switch providers later, you control the domain and can redirect it wherever you want.</p>

<h3>4. Keep a record of your QR codes</h3>

<p>Know which codes are in circulation, what they link to, and where they're printed. If you do need to switch providers, you'll know exactly what needs to be migrated.</p>

<h2>The bigger picture</h2>

<p>This is a trust issue, and the QR code industry has a lot of trust to rebuild. Too many tools treat cancellation as an opportunity to punish rather than a natural part of the customer lifecycle.</p>

<p>When we built Qrius, we made a deliberate choice: your codes keep working, period. Because the moment you print a QR code on something, it's yours — not ours.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. Design — Color and scannability
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'qr-code-color-scannability',
    title: 'Does QR code color affect scannability?',
    excerpt:
      'Short answer: yes. But not the way you might think. Here\'s what actually matters when you\'re picking colors for your QR codes.',
    category: 'Design',
    date: 'February 10, 2026',
    isoDate: '2026-02-10',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&fit=crop&q=80',
    body: `
<p>You've probably heard that QR codes have to be black and white. That's not true — but there's a kernel of truth hiding in there. Let's sort out what actually matters.</p>

<h2>What scanners care about: contrast</h2>

<p>QR code scanners don't see "black" and "white." They see "dark" and "light." The scanner needs to reliably tell the difference between the dots (dark modules) and the background (light modules). That's it.</p>

<p>So the real rule isn't "use black and white." It's <strong>"keep high contrast between your dots and your background."</strong></p>

<h2>Colors that work well</h2>

<ul>
  <li><strong>Dark navy on white</strong> — classic, professional</li>
  <li><strong>Dark green on cream</strong> — warm, organic feel</li>
  <li><strong>Dark purple on light lavender</strong> — distinctive, scannable</li>
  <li><strong>Charcoal on pale yellow</strong> — high contrast, easy on the eyes</li>
  <li><strong>Black on any light pastel</strong> — nearly always works</li>
</ul>

<h2>Colors that cause problems</h2>

<ul>
  <li><strong>Yellow dots on white</strong> — not enough contrast, scanners struggle</li>
  <li><strong>Light gray on white</strong> — practically invisible to many cameras</li>
  <li><strong>Red on green (or vice versa)</strong> — poor contrast for colorblind users and some cameras</li>
  <li><strong>Dark dots on dark background</strong> — no contrast means no scan</li>
  <li><strong>Neon or very bright colors</strong> — can wash out in bright lighting</li>
</ul>

<h2>The inversion trap</h2>

<p>One mistake we see often: inverting the colors so the dots are light and the background is dark. Like white dots on a black background. Technically, some modern scanners can read inverted codes. But many can't — especially older phones, budget devices, and some built-in camera apps.</p>

<p>Our advice: keep dots darker than the background. Always. It's the most universally reliable approach.</p>

<h2>Gradients: beautiful but risky</h2>

<p>Gradient QR codes can look stunning — dots that fade from one color to another across the code. But gradients introduce a risk: the lighter end of the gradient might not have enough contrast against the background.</p>

<p>If you use a gradient, make sure even the lightest part of the gradient is still clearly darker than the background. Test the code from multiple distances and in different lighting conditions.</p>

<h2>How to test your colors</h2>

<p>The best test is the simplest one: scan it. But scan it in the conditions your audience will encounter:</p>

<ul>
  <li>Scan in bright sunlight (washes out subtle contrast)</li>
  <li>Scan in dim lighting (cameras compensate differently)</li>
  <li>Scan from the expected distance</li>
  <li>Scan with at least two different phones</li>
</ul>

<p>Qrius includes a real-time scannability score that checks contrast, pattern complexity, and error correction as you design. It catches problems before you print — which is a lot cheaper than finding out after.</p>

<h2>The takeaway</h2>

<p>Color your QR codes however you want. Match your brand, make them beautiful, get creative. Just keep the dots dark and the background light, maintain high contrast, and test before you print. Those three rules will keep your codes scanning reliably no matter what color palette you choose.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 7. How-to — Event check-in
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'qr-codes-for-event-check-in',
    title: 'How to use QR codes for event check-in',
    excerpt:
      'Ditch the clipboard and the printed guest list. Here\'s how to set up a smooth, professional check-in experience using QR codes.',
    category: 'How-to',
    date: 'February 5, 2026',
    isoDate: '2026-02-05',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&fit=crop&q=80',
    body: `
<p>There's something deeply unsatisfying about watching a line of guests wait while someone flips through a clipboard looking for their name. QR codes turn that 45-second fumble into a 2-second scan.</p>

<h2>The basic setup</h2>

<p>Here's the simplest version of QR-based event check-in:</p>

<ol>
  <li><strong>Create a unique QR code for your event.</strong> Link it to your registration page, event details page, or a simple confirmation form.</li>
  <li><strong>Include the code in confirmation emails.</strong> When someone registers, send them an email with the QR code or a link that generates a personalized one.</li>
  <li><strong>Scan at the door.</strong> Use any phone with a camera. The code opens the linked page, confirming the guest's registration.</li>
</ol>

<p>That's the minimum viable version, and it works surprisingly well for events under 200 people.</p>

<h2>Level up: track attendance</h2>

<p>With a dynamic QR code, every scan is logged. That means you automatically know:</p>

<ul>
  <li>How many people actually showed up (vs. registered)</li>
  <li>What time they arrived</li>
  <li>Whether they scanned from the event location (geo data)</li>
</ul>

<p>No manual headcount, no tally marks on a clipboard. Just check your analytics dashboard after the event.</p>

<h2>Ideas for different event types</h2>

<h3>Conferences and trade shows</h3>
<ul>
  <li>QR code on badges for session check-in</li>
  <li>Codes at each booth linking to exhibitor info or lead capture forms</li>
  <li>Session feedback forms via QR code on every table</li>
</ul>

<h3>Workshops and classes</h3>
<ul>
  <li>QR code linking to materials, slides, or handouts</li>
  <li>Post-session survey via QR — capture feedback while it's fresh</li>
</ul>

<h3>Social events and parties</h3>
<ul>
  <li>WiFi QR code at the entrance — guests connect without asking for the password</li>
  <li>Photo sharing: code links to a shared album where guests can upload pictures</li>
  <li>RSVP tracking for future events</li>
</ul>

<h3>Ticketed events</h3>
<ul>
  <li>Unique QR codes per ticket for fraud prevention</li>
  <li>VIP vs. general admission routing based on scan</li>
</ul>

<h2>Practical tips</h2>

<ul>
  <li><strong>Print backup codes.</strong> Have a few large, printed QR codes at the check-in table for walk-ins or people who lost their email.</li>
  <li><strong>Test in your venue's lighting.</strong> Conference halls, outdoor venues, and dimly lit bars all scan differently.</li>
  <li><strong>Make the code big enough.</strong> If people will scan from their own phone screen, the code needs to be at least 3 cm. If it's printed on a badge, 2.5 cm minimum.</li>
  <li><strong>Have a fallback.</strong> Technology fails sometimes. Keep a simple guest list on a phone or tablet as a backup.</li>
</ul>

<h2>What you'll need</h2>

<p>For a basic setup: one dynamic QR code and a registration page. That's it. You can be up and running in five minutes.</p>

<p>For a more polished experience: create separate codes for different ticket types, add your event branding to each code, and use the analytics to understand your attendance patterns over time.</p>

<p>Either way, your guests will appreciate not standing in a clipboard line.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 8. Industry — Real estate
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'qr-codes-for-real-estate',
    title: 'How real estate agents use QR codes in 2026',
    excerpt:
      'From yard signs to open house sign-in sheets, QR codes are quietly becoming the most useful tool in a real estate agent\'s toolkit.',
    category: 'Industry',
    date: 'January 30, 2026',
    isoDate: '2026-01-30',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&fit=crop&q=80',
    body: `
<p>Real estate has a unique problem: the product is physical, but the information is digital. A yard sign can tell you the price and the agent's number. But the floor plan, the photo gallery, the neighborhood walkability score, the school ratings? That's all online.</p>

<p>QR codes bridge that gap — and smart agents are using them in ways that go far beyond "scan to see the listing."</p>

<h2>On yard signs and flyer boxes</h2>

<p>This is the obvious one, but most agents do it wrong. They link to their general website or a static listing page that might change. Instead:</p>

<ul>
  <li><strong>Use a dynamic QR code</strong> so you can update the link when the listing status changes (active → pending → sold)</li>
  <li><strong>Link to a mobile-optimized listing page</strong> with photos, details, and a contact form — not a PDF</li>
  <li><strong>Add a frame label:</strong> "Scan for photos & details" gets way more scans than a naked code</li>
  <li><strong>Track scans</strong> to see how much foot traffic each listing generates</li>
</ul>

<p>One dynamic code per listing. Update it as the status changes. Never reprint the yard sign.</p>

<h2>Virtual tour links</h2>

<p>Virtual tours are standard now, but getting people to actually watch them is the challenge. A QR code on the yard sign, flyer, or business card lets someone go from "passing by" to "walking through the house" in one scan.</p>

<p>Link directly to the tour — not to a page where they have to find the tour button. Reduce friction to zero.</p>

<h2>Open house sign-in</h2>

<p>The paper sign-in sheet at an open house is a goldmine that most agents handle badly. Illegible handwriting, missing email addresses, and a stack of papers to transcribe later.</p>

<p>Replace it with a QR code that links to a digital sign-in form (Google Form, Typeform, or your CRM's intake form). Visitors scan, fill in their info on their own phone, and you get clean, typed data directly into your system.</p>

<p>Print the code large (at least 8 cm) on a small sign or tent card near the entrance: "Welcome! Scan to sign in."</p>

<h2>On business cards</h2>

<p>A vCard QR code on your business card lets prospects save your contact info with one scan — no typing, no lost cards. Include your name, phone, email, website, and photo.</p>

<p>The scan also tells you when someone saved your info, giving you a natural follow-up prompt: "Hey, I noticed you grabbed my contact info at the open house on Saturday. Can I help with anything?"</p>

<h2>Neighborhood info packets</h2>

<p>Create QR codes that link to curated information about the neighborhood: school ratings, walkability scores, nearby restaurants, commute times. Place these on flyers or info sheets at open houses.</p>

<p>This positions you as the local expert, not just a listing agent. And since these are dynamic codes, you can update the linked resources without reprinting.</p>

<h2>Tracking what works</h2>

<p>This is where QR codes go from "nice touch" to genuine business intelligence. With scan tracking, you can answer questions like:</p>

<ul>
  <li>Which listings get the most drive-by interest?</li>
  <li>What time of day do people scan your yard sign codes?</li>
  <li>How many open house visitors actually sign in digitally vs. skip it?</li>
  <li>Which marketing materials (flyers, postcards, business cards) drive the most scans?</li>
</ul>

<p>This data helps you allocate your marketing budget to what actually works — and show sellers concrete numbers about buyer interest in their property.</p>

<h2>Getting started</h2>

<p>Start with one dynamic QR code per active listing. Add your branding, include a clear call-to-action frame, and track the scans. That alone will put you ahead of most agents.</p>

<p>Then expand: vCard codes on business cards, sign-in codes at open houses, neighborhood info codes on flyers. Each one takes about two minutes to create and can be updated anytime.</p>

<p>The agents who are winning with QR codes aren't doing anything complicated. They're just connecting the physical and digital parts of their business — and tracking the results.</p>
    `,
  },
];

/** Look up a single post by slug */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

/** All unique categories (preserves display order) */
export const blogCategories = ['All', 'QR 101', 'How-to', 'Industry', 'Design', 'Product'] as const;

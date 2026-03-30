import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - 14DaysAccel Dev",
  description:
    "Privacy policy describing how 14DaysAccel Dev collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Last updated: March 18, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              1. Introduction
            </h2>
            <p>
              14DaysAccel (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;,
              or &quot;our&quot;) operates the 14DaysAccel Dev platform
              (&quot;Platform&quot;). This Privacy Policy describes how we
              collect, use, store, and protect your personal information when
              you use the Platform, including the Software Designer tool,
              project catalogue, token purchasing, and related services.
            </p>
            <p className="mt-3">
              By using the Platform, you consent to the collection and use of
              your information as described in this Privacy Policy. If you do
              not agree with this policy, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              2. Information We Collect
            </h2>
            <h3 className="mb-2 mt-4 text-sm font-semibold text-zinc-800">
              2.1 Information You Provide
            </h3>
            <ul className="list-inside list-disc space-y-1.5 pl-2">
              <li>
                <span className="font-medium">Account information:</span>{" "}
                email address, full name, and phone number when you create an
                account.
              </li>
              <li>
                <span className="font-medium">Payment information:</span>{" "}
                payment details processed through our third-party payment
                provider (Creem). We do not store your credit card
                numbers or bank account details on our servers.
              </li>
              <li>
                <span className="font-medium">Project inputs:</span> business
                descriptions, software requirements, goals, and other
                information you submit to the Software Designer tool.
              </li>
              <li>
                <span className="font-medium">Communications:</span> messages
                or enquiries you send to us through the Platform or external
                channels.
              </li>
            </ul>

            <h3 className="mb-2 mt-4 text-sm font-semibold text-zinc-800">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-inside list-disc space-y-1.5 pl-2">
              <li>
                <span className="font-medium">Usage data:</span> pages
                visited, features used, token consumption, and interaction
                patterns.
              </li>
              <li>
                <span className="font-medium">Device information:</span>{" "}
                browser type, operating system, device type, and screen
                resolution.
              </li>
              <li>
                <span className="font-medium">Log data:</span> IP address,
                access timestamps, referring URLs, and error logs.
              </li>
              <li>
                <span className="font-medium">Cookies:</span> session cookies
                for authentication and preference cookies to improve your
                experience. See Section 7 for details.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li>Provide, maintain, and improve the Platform and its features.</li>
              <li>Process transactions and manage your token balance.</li>
              <li>
                Generate AI-powered software plans and development prompts
                based on your inputs.
              </li>
              <li>
                Send transactional communications such as payment
                confirmations and account notifications.
              </li>
              <li>
                Respond to your enquiries, support requests, and feedback.
              </li>
              <li>
                Monitor and analyse usage trends to improve service quality and
                user experience.
              </li>
              <li>
                Detect, prevent, and address fraud, abuse, and security
                issues.
              </li>
              <li>Comply with legal obligations and enforce our Terms and Conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              4. Data Sharing and Disclosure
            </h2>
            <p>
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li>
                <span className="font-medium">Service providers:</span> we
                share data with trusted third-party providers that help us
                operate the Platform, including authentication services
                (Supabase), payment processing (Creem), hosting
                (Vercel), and AI model providers (OpenAI, Anthropic). These
                providers are contractually obligated to protect your data.
              </li>
              <li>
                <span className="font-medium">Legal requirements:</span> we
                may disclose your information if required by law, regulation,
                legal process, or governmental request.
              </li>
              <li>
                <span className="font-medium">Business transfers:</span> in
                the event of a merger, acquisition, or sale of assets, your
                information may be transferred as part of that transaction.
              </li>
              <li>
                <span className="font-medium">Protection of rights:</span> we
                may disclose information to protect the rights, property, or
                safety of 14DaysAccel, our users, or the public.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organisational measures to
              protect your personal information against unauthorised access,
              alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li>Encryption of data in transit using TLS/SSL.</li>
              <li>Secure authentication with session management.</li>
              <li>
                Row-level security policies on database tables to ensure users
                can only access their own data.
              </li>
              <li>
                Regular review of security practices and access controls.
              </li>
            </ul>
            <p className="mt-3">
              While we strive to protect your information, no method of
              electronic transmission or storage is completely secure. We
              cannot guarantee absolute security of your data.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              6. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as your account
              is active or as needed to provide services. We may also retain
              certain information as required by law, to resolve disputes, or
              to enforce our agreements. When data is no longer needed, it is
              securely deleted or anonymised.
            </p>
            <p className="mt-3">
              AI-generated plans and project data are retained in your account
              for your continued access. You may request deletion of your
              account and associated data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              7. Cookies and Tracking
            </h2>
            <p>
              The Platform uses cookies and similar technologies for the
              following purposes:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li>
                <span className="font-medium">Essential cookies:</span>{" "}
                required for authentication, session management, and core
                Platform functionality. These cannot be disabled.
              </li>
              <li>
                <span className="font-medium">Analytics cookies:</span> used
                to understand how users interact with the Platform and to
                improve our services. These may include third-party analytics
                tools.
              </li>
              <li>
                <span className="font-medium">Advertising cookies:</span> we
                may use advertising services (such as Google Ads) to promote
                the Platform. These services may place cookies on your device
                to measure ad effectiveness and deliver relevant
                advertisements.
              </li>
            </ul>
            <p className="mt-3">
              You can manage cookie preferences through your browser settings.
              Disabling certain cookies may affect Platform functionality.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              8. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have the following rights
              regarding your personal information:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li>
                <span className="font-medium">Access:</span> request a copy of
                the personal information we hold about you.
              </li>
              <li>
                <span className="font-medium">Correction:</span> request
                correction of inaccurate or incomplete personal information.
              </li>
              <li>
                <span className="font-medium">Deletion:</span> request
                deletion of your personal information, subject to legal
                retention requirements.
              </li>
              <li>
                <span className="font-medium">Data portability:</span> request
                a copy of your data in a structured, machine-readable format.
              </li>
              <li>
                <span className="font-medium">Objection:</span> object to the
                processing of your personal information for certain purposes.
              </li>
              <li>
                <span className="font-medium">Withdraw consent:</span>{" "}
                withdraw consent for data processing where consent is the legal
                basis.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us through the
              channels listed in Section 12.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              9. Children&apos;s Privacy
            </h2>
            <p>
              The Platform is not directed at individuals under the age of 16.
              We do not knowingly collect personal information from children
              under 16. If we become aware that we have collected personal
              information from a child under 16, we will take steps to delete
              such information promptly.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              10. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have
              different data protection laws. When we transfer data
              internationally, we take appropriate measures to ensure your
              information is protected in accordance with this Privacy Policy
              and applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated &quot;Last updated&quot;
              date. Your continued use of the Platform after any changes
              constitutes acceptance of the revised policy. We encourage you to
              review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              12. Contact Information
            </h2>
            <p>
              If you have questions or concerns about this Privacy Policy or
              our data practices, please contact us through our{" "}
              <a
                href="https://www.upwork.com/freelancers/14daysaccel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 underline hover:text-zinc-600"
              >
                Upwork profile
              </a>{" "}
              or through the contact methods available on the Platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

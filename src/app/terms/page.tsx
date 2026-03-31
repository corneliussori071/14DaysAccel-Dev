import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - 14DaysAccel Dev",
  description:
    "Terms and conditions governing the use of the 14DaysAccel Dev platform and services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Last updated: March 31, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the 14DaysAccel Dev platform
              (&quot;Platform&quot;), operated by 14DaysAccel
              (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;), you agree to be bound by these Terms and
              Conditions (&quot;Terms&quot;). If you do not agree to these
              Terms, you must not access or use the Platform.
            </p>
            <p className="mt-3">
              These Terms apply to all visitors, users, and others who access
              or use the Platform, including the Software Designer tool,
              project catalogue, token purchasing, and any related services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              2. Description of Services
            </h2>
            <p>
              14DaysAccel Dev provides an AI-accelerated software development
              platform that includes:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li>
                A Software Designer tool that generates structured software
                engineering plans and development prompts using artificial
                intelligence models.
              </li>
              <li>
                A project catalogue showcasing software systems available for
                customisation and deployment.
              </li>
              <li>
                Token-based billing for AI-powered plan generation services.
              </li>
              <li>
                Professional software development services for building
                production-ready systems.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              3. User Accounts
            </h2>
            <p>
              To access certain features of the Platform, you must create an
              account. You are responsible for maintaining the confidentiality
              of your account credentials and for all activities that occur
              under your account. You agree to provide accurate, current, and
              complete information during registration and to update such
              information to keep it accurate and complete.
            </p>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that
              violate these Terms, engage in fraudulent activity, or are
              otherwise deemed harmful to the Platform or its users.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              4. Tokens and Payments
            </h2>
            <p>
              The Platform uses a token-based system for accessing AI-powered
              services. Tokens may be purchased through subscription plans or
              one-time custom token packs. All prices are displayed in US
              Dollars (USD) and are subject to change with reasonable notice.
            </p>
            <p className="mt-3">
              New accounts may receive a complimentary allocation of tokens.
              These tokens are provided at our discretion and may be modified
              or discontinued at any time.
            </p>
            <p className="mt-3">
              Payment processing for token purchases and project source code
              purchases is handled by our designated payment processor, which
              acts as the merchant of record for all transactions made through
              the Platform. This means the payment processor processes your
              payment, issues the invoice, and handles applicable sales taxes
              and VAT based on your billing address. By making a purchase, you
              agree to the applicable payment processor&apos;s terms of service
              in addition to these Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              5. Refund Policy
            </h2>
            <h3 className="mb-2 mt-2 text-sm font-semibold text-zinc-800">
              5.1 Token Purchases
            </h3>
            <p>
              Due to the nature of digital services and AI-generated content,
              all token purchases are generally non-refundable once tokens have
              been used. Refund requests for unused tokens may be considered on
              a case-by-case basis by contacting our support team. We reserve
              the right to issue refunds at our sole discretion.
            </p>
            <h3 className="mb-2 mt-4 text-sm font-semibold text-zinc-800">
              5.2 Project Source Code Purchases
            </h3>
            <p>
              All project source code purchases are processed by our
              designated payment processor as the merchant of record. Due to
              the digital nature of source code deliverables, purchases are
              generally non-refundable once download access has been granted.
              Refund requests are handled in accordance with the payment
              processor&apos;s policies and applicable consumer protection
              laws. To request a refund, contact our support team and we will
              coordinate with the payment processor to review your request.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              6. Intellectual Property
            </h2>
            <p>
              The Platform, including its design, code, content, and branding,
              is the intellectual property of 14DaysAccel and is protected by
              applicable intellectual property laws.
            </p>
            <p className="mt-3">
              Software plans and outputs generated through the Software
              Designer tool using your tokens are provided for your use. You
              retain ownership of the input you provide (business descriptions,
              goals, requirements). The generated outputs are licensed to you
              for use in your own projects.
            </p>
            <p className="mt-3">
              Projects developed through our professional development services
              are subject to separate agreements. Source code ownership and
              licensing terms will be specified in the relevant project
              contract.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              7. Acceptable Use
            </h2>
            <p>You agree not to use the Platform to:</p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li>
                Violate any applicable local, national, or international law or
                regulation.
              </li>
              <li>
                Generate content that is illegal, harmful, threatening,
                abusive, harassing, defamatory, or otherwise objectionable.
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the
                Platform, other user accounts, or connected systems.
              </li>
              <li>
                Interfere with or disrupt the Platform&apos;s infrastructure or
                services.
              </li>
              <li>
                Use automated scripts or bots to access the Platform without
                prior written consent.
              </li>
              <li>
                Resell or redistribute tokens, generated content, or Platform
                access without authorisation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              8. AI-Generated Content Disclaimer
            </h2>
            <p>
              The Software Designer tool uses artificial intelligence to
              generate software plans, architecture recommendations, and
              development prompts. While we strive for accuracy and quality,
              AI-generated content is provided &quot;as is&quot; and may
              contain errors, inaccuracies, or omissions.
            </p>
            <p className="mt-3">
              You are responsible for reviewing, validating, and adapting any
              AI-generated content before using it in production systems. We do
              not guarantee that generated plans will meet specific business
              requirements, security standards, or regulatory compliance
              without professional review.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, 14DaysAccel
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to
              loss of profits, data, business opportunities, or goodwill,
              arising from your use of or inability to use the Platform.
            </p>
            <p className="mt-3">
              Our total liability for any claim arising from these Terms or
              your use of the Platform shall not exceed the amount you have
              paid to us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              10. Third-Party Services
            </h2>
            <p>
              The Platform may integrate with or link to third-party services,
              including payment processors, AI model providers, and external
              platforms. We are not responsible for the content, privacy
              practices, or terms of any third-party services. Your use of
              third-party services is at your own risk and subject to their
              respective terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              11. Modifications to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes
              will be effective upon posting to the Platform with an updated
              &quot;Last updated&quot; date. Your continued use of the Platform
              after any changes constitutes acceptance of the revised Terms. We
              encourage you to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              12. Termination
            </h2>
            <p>
              We may terminate or suspend your access to the Platform at any
              time, with or without cause, and with or without notice. Upon
              termination, your right to use the Platform ceases immediately.
              Any unused tokens at the time of termination may be forfeited
              unless otherwise required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              13. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              applicable laws, without regard to conflict of law principles.
              Any disputes arising from these Terms or your use of the Platform
              shall be resolved through good-faith negotiation before pursuing
              formal legal proceedings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              14. Contact Information
            </h2>
            <p>
              If you have questions about these Terms, please contact us
              through our{" "}
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

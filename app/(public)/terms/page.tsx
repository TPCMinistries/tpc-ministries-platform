import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | TPC Ministries',
  description: 'Terms of Service for TPC Ministries website and platform.',
}

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="bg-gradient-to-br from-tpc-navy to-tpc-navy/90 px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white md:text-5xl">
            Terms of Service
          </h1>
          <p className="text-lg text-white/70">
            Last updated: February 8, 2026
          </p>
        </div>
      </section>

      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-4xl prose prose-slate prose-lg">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using the TPC Ministries website (tpcmin.org) and services, you agree to be
            bound by these Terms of Service. If you do not agree to these terms, please do not use our
            services.
          </p>

          <h2>About TPC Ministries</h2>
          <p>
            TPC Ministries is a 501(c)(3) nonprofit religious organization dedicated to transforming lives
            through Christ across Kenya, South Africa, Grenada, and the United States. Our platform provides
            spiritual resources, community features, and ministry tools.
          </p>

          <h2>Account Registration</h2>
          <p>To access certain features, you may need to create an account. You agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Accept responsibility for all activity under your account</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>

          <h2>Acceptable Use</h2>
          <p>When using our platform, you agree not to:</p>
          <ul>
            <li>Use the services for any unlawful purpose</li>
            <li>Harass, abuse, or harm other members</li>
            <li>Post content that is hateful, threatening, or inappropriate</li>
            <li>Impersonate another person or entity</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated tools to scrape or collect data</li>
            <li>Interfere with the proper functioning of the platform</li>
            <li>Share false or misleading information</li>
          </ul>

          <h2>Content Guidelines</h2>
          <p>
            Our platform includes community features such as prayer requests, testimonies, journal entries,
            and group discussions. All user-generated content must:
          </p>
          <ul>
            <li>Be respectful and consistent with Christian values</li>
            <li>Not contain personal attacks or divisive content</li>
            <li>Not promote any commercial products or services</li>
            <li>Not violate any third-party intellectual property rights</li>
          </ul>
          <p>
            We reserve the right to remove content that violates these guidelines and to moderate
            community interactions at our discretion.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on tpcmin.org—including teachings, devotionals, assessments, written works,
            graphics, and logos—is the property of TPC Ministries or its content creators and is
            protected by copyright law. You may not reproduce, distribute, or create derivative works
            without our written permission.
          </p>
          <p>
            By submitting content (testimonies, prayer requests, etc.) to our platform, you grant TPC
            Ministries a non-exclusive license to use, display, and share that content within our
            ministry context.
          </p>

          <h2>Donations and Giving</h2>
          <p>
            All donations to TPC Ministries are tax-deductible to the extent permitted by law.
            By making a donation:
          </p>
          <ul>
            <li>You confirm that you are authorized to use the payment method provided</li>
            <li>You understand that donations are processed securely through Stripe</li>
            <li>Recurring donations will continue until you cancel them</li>
            <li>Refund requests may be submitted within 30 days by contacting us</li>
            <li>Tax receipts will be provided for all qualifying donations</li>
          </ul>

          <h2>Assessments and Results</h2>
          <p>
            Our spiritual assessments are provided for personal growth and self-discovery. Assessment
            results are intended as guidance and should not be considered professional counseling or
            psychological evaluation. Results are personalized but not diagnostic.
          </p>

          <h2>Mission Trips</h2>
          <p>
            Participation in mission trips is subject to additional terms, waivers, and requirements
            that will be provided during the application process. TPC Ministries reserves the right
            to accept or decline trip applications at our discretion.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            Our platform integrates with third-party services including:
          </p>
          <ul>
            <li><strong>Stripe</strong> for payment processing</li>
            <li><strong>YouTube</strong> for video content</li>
            <li><strong>Supabase</strong> for data storage and authentication</li>
          </ul>
          <p>
            Your use of these services is subject to their respective terms and privacy policies.
          </p>

          <h2>Disclaimer of Warranties</h2>
          <p>
            Our services are provided "as is" without warranties of any kind. While we strive to keep
            the platform available and functioning properly, we do not guarantee uninterrupted or
            error-free service.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            TPC Ministries shall not be liable for any indirect, incidental, special, or consequential
            damages arising from your use of our services. Our total liability shall not exceed the
            amount you have donated to us in the past 12 months.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms of Service from time to time. Continued use of the platform after
            changes are posted constitutes acceptance of the updated terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of New York, United States, without
            regard to conflict of law provisions.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about these Terms of Service, please contact us:
          </p>
          <ul>
            <li>Email: <a href="mailto:info@tpcmin.org" className="text-tpc-gold-accent hover:underline">info@tpcmin.org</a></li>
            <li>Website: <a href="/connect" className="text-tpc-gold-accent hover:underline">tpcmin.org/connect</a></li>
          </ul>
        </div>
      </section>
    </div>
  )
}

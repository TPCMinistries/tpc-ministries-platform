import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen,
  Download,
  CheckCircle,
  ArrowRight,
  Mail,
} from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string }>
}

async function getEbook(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .eq('type', 'ebook')
    .single()

  if (error) {
    return null
  }
  return data
}

async function verifyPurchase(sessionId: string, ebookId: string) {
  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session was for this ebook and is paid
    if (
      session.payment_status === 'paid' &&
      session.metadata?.type === 'ebook' &&
      session.metadata?.ebook_id === ebookId
    ) {
      return {
        verified: true,
        customerEmail: session.customer_email || session.customer_details?.email,
      }
    }
    return { verified: false, customerEmail: null }
  } catch (error) {
    console.error('Error verifying purchase:', error)
    return { verified: false, customerEmail: null }
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const ebook = await getEbook(id)

  if (!ebook) {
    return { title: 'Purchase Complete | TPC Ministries' }
  }

  return {
    title: `Download ${ebook.title} | TPC Ministries`,
    description: `Thank you for your purchase! Download your copy of "${ebook.title}".`,
  }
}

export default async function EbookSuccessPage({ params, searchParams }: Props) {
  const { id } = await params
  const { session_id } = await searchParams

  const ebook = await getEbook(id)

  if (!ebook) {
    notFound()
  }

  // Verify the purchase if session_id is provided
  let purchaseVerified = false
  let customerEmail: string | null = null

  if (session_id) {
    const result = await verifyPurchase(session_id, id)
    purchaseVerified = result.verified
    customerEmail = result.customerEmail
  }

  // If no session_id or purchase not verified, redirect to ebook page
  if (!session_id || !purchaseVerified) {
    redirect(`/ebooks/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Success Header */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-3xl text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
            Thank You for Your Purchase!
          </h1>
          <p className="text-xl text-stone-600 mb-8">
            Your copy of "{ebook.title}" is ready to download.
          </p>

          {/* Ebook Card */}
          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                {/* Cover */}
                <div className="relative aspect-[3/4] md:aspect-auto bg-gradient-to-br from-tpc-navy to-tpc-navy/80">
                  {ebook.thumbnail_url ? (
                    <Image
                      src={ebook.thumbnail_url}
                      alt={ebook.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="text-center">
                        <BookOpen className="h-16 w-16 text-tpc-gold/50 mx-auto mb-4" />
                        <p className="text-white font-serif text-lg">{ebook.title}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Info */}
                <div className="p-8 flex flex-col justify-center text-left">
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">
                    {ebook.title}
                  </h2>
                  <p className="text-stone-500 mb-6">
                    by {ebook.author || 'TPC Ministries'}
                  </p>

                  {ebook.file_url ? (
                    <a href={ebook.file_url} download>
                      <Button className="w-full bg-tpc-navy hover:bg-tpc-navy/90 text-white h-14 text-lg">
                        <Download className="mr-2 h-5 w-5" />
                        Download Your Ebook
                      </Button>
                    </a>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 text-sm">
                        The download file is being prepared. You'll receive an email at{' '}
                        <strong>{customerEmail}</strong> when it's ready.
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-stone-500 mt-4">
                    PDF format • Instant download • Lifetime access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Confirmation */}
          {customerEmail && (
            <div className="bg-stone-50 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-tpc-navy rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-tpc-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-stone-900 mb-1">
                    Confirmation Email Sent
                  </h3>
                  <p className="text-stone-600 text-sm">
                    A receipt and download link have been sent to{' '}
                    <strong>{customerEmail}</strong>. Check your inbox (and spam folder).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ebooks">
              <Button variant="outline" className="border-tpc-navy text-tpc-navy hover:bg-tpc-navy hover:text-white">
                Browse More Ebooks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/partner">
              <Button variant="outline" className="border-tpc-gold text-tpc-gold hover:bg-tpc-gold hover:text-tpc-navy">
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

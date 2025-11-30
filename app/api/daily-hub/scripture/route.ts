import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Default scriptures if database is empty
const defaultScriptures = [
  { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.', theme: 'Strength' },
  { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', theme: 'Hope' },
  { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.', theme: 'Provision' },
  { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', theme: 'Purpose' },
  { reference: 'Isaiah 40:31', text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', theme: 'Renewal' },
  { reference: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', theme: 'Trust' },
  { reference: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.', theme: 'Rest' },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Try to get today's scripture from database
    const { data: scripture, error } = await supabase
      .from('daily_scriptures')
      .select('*')
      .eq('date', today)
      .single()

    if (scripture) {
      return NextResponse.json(scripture)
    }

    // If no scripture for today, use a default based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const defaultScripture = defaultScriptures[dayOfYear % defaultScriptures.length]

    return NextResponse.json({
      date: today,
      ...defaultScripture,
      reflection: `How does this scripture speak to your life today?`
    })
  } catch (error) {
    console.error('Error fetching scripture:', error)

    // Return a default scripture on error
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const defaultScripture = defaultScriptures[dayOfYear % defaultScriptures.length]

    return NextResponse.json({
      date: new Date().toISOString().split('T')[0],
      ...defaultScripture,
      reflection: `How does this scripture speak to your life today?`
    })
  }
}
